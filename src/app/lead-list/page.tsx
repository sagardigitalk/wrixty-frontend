"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchUsers } from "../../services/userService";
import { fetchProducts } from "../../services/productService";
import { fetchStatuses } from "../../services/statusService";
import { fetchLeads, updateLeadApi, deleteLeadApi } from "../../services/leadService";
import { createOrderApi } from "../../services/orderService";
import { fetchReasonToCalls } from "../../services/reasonToCallService";

export interface Lead {
  id: string;
  name: string;
  phone_number: string;
  product: string;
  amount: number;
  quantity: number;
  subtotal: number;
  assgin: string;
  date: string;
  time?: string;
  status: string;
  status_two?: string;
  reason_call?: string;
  note: string;
  isDeleted?: boolean;
  deleteDate?: string;
  reminderDate?: string;
}

import { useToast } from "../../context/ToastContext";
import { Table, Column } from "../../components/common/Table";
import { Modal } from "../../components/common/Modal";
import { Input } from "../../components/common/Input";
import { Select } from "../../components/common/Select";
import { Button } from "../../components/common/Button";
import { Add, SwapHoriz, Assignment } from "@mui/icons-material";
import { FiEdit, FiTrash2, FiFileText } from "react-icons/fi";

interface SelectedProductRow {
  id: string;
  name: string;
  amount: number;
  quantity: number;
}

export default function LeadListPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [couriers] = useState<any[]>([
    { id: "1", name: "Delhivery" },
    { id: "2", name: "BlueDart" },
    { id: "3", name: "XpressBees" },
    { id: "4", name: "DHL Express" }
  ]);
  const [reasonsOptions, setReasonsOptions] = useState<any[]>([]);

  React.useEffect(() => {
    const loadMasterData = async () => {
      try {
        setIsFetchingData(true);
        const [usersRes, prodsRes, statusRes, leadsRes, reasonRes] = await Promise.all([
          fetchUsers({ page: 1, limit: 100 }),
          fetchProducts({ page: 1, limit: 100 }),
          fetchStatuses({ page: 1, limit: 100 }),
          fetchLeads({ page: 1, limit: 100 }),
          fetchReasonToCalls({ page: 1, limit: 100 })
        ]);
        setUsers(usersRes.data);
        setProducts(prodsRes.data);
        setStatuses(statusRes.data);
        setReasonsOptions(reasonRes.data);
        
        // Map backend leads to frontend format (handle populated refs)
        const mappedLeads = leadsRes.data.map((l: any) => ({
          id: l._id || l.id,
          name: l.name,
          phone_number: l.phone_number,
          product: l.product || (l.products?.map((p: any) => p.name).join(", ") || ""),
          amount: l.amount || 0,
          quantity: l.quantity || 1,
          subtotal: (l.amount || 0),
          assgin: l.assgin?.name || l.assgin || "",
          assginId: l.assgin?._id || l.assgin || "",
          date: l.createdAt ? new Date(l.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          time: l.createdAt ? new Date(l.createdAt).toTimeString().split(' ')[0].substring(0, 5) : "",
          status: l.status?.name || l.status || "Open",
          statusId: l.status?._id || l.status || "",
          reason_call: l.reason_call?.name || l.reason_call || "",
          reasonCallId: l.reason_call?._id || l.reason_call || "",
          note: l.note || "",
          reminderDate: l.reminder || "",
          products: l.products || []
        }));
        setLeads(mappedLeads);
      } catch (err) {
        console.error("Error loading master data", err);
      } finally {
        setIsFetchingData(false);
      }
    };
    loadMasterData();
  }, []);

  // Update lead: call API then sync local state
  const updateLead = async (id: string, updated: Partial<Lead>) => {
    try {
      await updateLeadApi(id, updated);
      setLeads(prev => prev.map(l => {
        if (l.id === id) {
          const merged = { ...l, ...updated };
          if (updated.amount !== undefined || updated.quantity !== undefined) {
            merged.subtotal = merged.amount * merged.quantity;
          }
          return merged;
        }
        return l;
      }));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update lead");
    }
  };

  // Delete lead: soft delete via API then remove from local state
  const deleteLead = async (id: string) => {
    try {
      await deleteLeadApi(id);
      setLeads(prev => prev.filter(l => l.id !== id));
      toast.success("Lead deleted successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete lead");
    }
  };

  // Convert lead to order via API
  const convertToOrder = async (lead: Lead, details: { paymentType: "COD" | "Prepaid"; courier: string; transactionId: string }) => {
    try {
      await createOrderApi({
        leadId: lead.id,
        name: lead.name,
        phone_number: lead.phone_number,
        products: (lead as any).products || [],
        product: lead.product,
        amount: lead.amount,
        quantity: lead.quantity,
        grandTotal: lead.subtotal,
        paymentType: details.paymentType,
        courier: details.courier,
        assginTo: (lead as any).assginId || lead.assgin,
        transactionId: details.transactionId,
        status: "Dispatched"
      });
      toast.success(`Successfully converted ${lead.name} to order!`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to convert to order");
    }
  };
  const toast = useToast();

  const router = useRouter();

  // Selected Leads for bulk options
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Modals state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);

  // Loading states
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [isUpdatingLead, setIsUpdatingLead] = useState(false);
  const [isConvertingLead, setIsConvertingLead] = useState(false);
  const [isDeletingLead, setIsDeletingLead] = useState(false);

  // Form states for Edit
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("Open");
  const [statusTwo, setStatusTwo] = useState("CNR");
  const [noteText, setNoteText] = useState("");
  const [assignee, setAssignee] = useState("");
  const [reminder, setReminder] = useState("");

  // Form states for Convert to Order
  const [paymentType, setPaymentType] = useState<"COD" | "Prepaid">("COD");
  const [selectedCourier, setSelectedCourier] = useState("");
  const [transactionId, setTransactionId] = useState("");

  // Filters State
  const [filterProduct, setFilterProduct] = useState("all");
  const [filterAssignee, setFilterAssignee] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterReason, setFilterReason] = useState("all");

  // 1. Filtering logic
  const filteredLeads = React.useMemo(() => {
    return leads
      .filter(l => !l.isDeleted)
      .filter(l => filterProduct === "all" || l.product === filterProduct)
      .filter(l => filterAssignee === "all" || l.assgin === filterAssignee)
      .filter(l => filterStatus === "all" || l.status === filterStatus)
      .filter(l => filterReason === "all" || l.reason_call === filterReason);
  }, [leads, filterProduct, filterAssignee, filterStatus, filterReason]);



  const openNoteModal = (lead: Lead) => {
    setActiveLead(lead);
    setNoteText(lead.note || "");
    setNoteModalOpen(true);
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLead) return;
    
    updateLead(activeLead.id, { note: noteText });
    toast.success("Note saved successfully!");
    setNoteModalOpen(false);
  };

  const openEditModal = (lead: Lead) => {
    setActiveLead(lead);
    setName(lead.name);
    setPhone(lead.phone_number);
    setStatus(lead.status);
    setStatusTwo(lead.reason_call || "CNR");
    setNoteText(lead.note);
    setAssignee(lead.assgin);
    setReminder(lead.reminderDate || "");
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLead) return;

    setIsUpdatingLead(true);
    try {
      await updateLead(activeLead.id, {
        name,
        phone_number: phone,
        assgin: assignee,
        status,
        reason_call: statusTwo,
        note: noteText,
        reminder: reminder
      });
      toast.info(`Lead configuration updated.`);
      setEditModalOpen(false);
    } catch (_) {
      // error toast already shown inside updateLead
    } finally {
      setIsUpdatingLead(false);
    }
  };

  const openConvertModal = (lead: Lead) => {
    setActiveLead(lead);
    setPaymentType("COD");
    setSelectedCourier(couriers[0]?.name || "Shiprocket");
    setTransactionId("");
    setConvertModalOpen(true);
  };

  const handleConvertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLead) return;
    
    setIsConvertingLead(true);
    await convertToOrder(activeLead, {
      paymentType,
      courier: selectedCourier,
      transactionId
    });
    setIsConvertingLead(false);
    setConvertModalOpen(false);
  };

  const handleBulkDelete = async () => {
    setIsDeletingLead(true);
    try {
      await Promise.all(selectedIds.map(id => deleteLeadApi(id)));
      setLeads(prev => prev.filter(l => !selectedIds.includes(l.id)));
      toast.warning(`Deleted ${selectedIds.length} lead records.`);
      setSelectedIds([]);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Bulk delete failed");
    } finally {
      setIsDeletingLead(false);
    }
  };

  // Columns matching screenshot exactly
  const columns: Column<Lead>[] = [
    { key: "id", header: "No", render: (_, __, i) => i + 1, sortable: false },
    { key: "name", header: "Customer Name", render: (val) => val || "-" },
    { key: "phone_number", header: "Phone Number" },
    { key: "product", header: "Product Name" },
    { key: "subtotal", header: "Total", render: (val) => `₹${val}` },
    { key: "assgin", header: "Assign By" },
    { key: "date", header: "Date" },
    {
      key: "status",
      header: "Status",
      render: (val, row) => {
        return (
          <select
            value={val}
            onChange={(e) => updateLead(row.id, { status: e.target.value as string })}
            className={`text-[11px] font-bold rounded-lg px-2 py-1 outline-none border cursor-pointer appearance-none transition-all ${
              val === "Inprogress" || val === "In-Progress"
                ? "bg-success/10 text-success border-success/20"
                : val === "Close" || val === "Closed"
                ? "bg-error/10 text-error border-error/20"
                : "bg-warning/10 text-warning border-warning/20"
            }`}
          >
            {statuses.map(s => (
              <option key={s.id} value={s.name}>{s.name}</option>
            ))}
          </select>
        );
      }
    },
    {
      key: "reason_call",
      header: "Reason Call",
      render: (val, row) => (
        <select
          value={(row as any).reasonCallId || val || ""}
          onChange={(e) => updateLead(row.id, { reason_call: e.target.value as string })}
          className="px-2.5 py-1.5 bg-background text-text-secondary rounded-lg font-semibold text-xs border border-border-ui/50 outline-none cursor-pointer appearance-none hover:border-primary-teal transition-all"
        >
          <option value="">{val || "Select"}</option>
          {reasonsOptions.map(r => (
            <option key={r._id || r.id} value={r._id || r.id}>{r.name}</option>
          ))}
        </select>
      )
    },
    {
      key: "convert",
      header: "Convert Order",
      sortable: false,
      render: (_, row) => (
        <Button
          onClick={() => openConvertModal(row)}
          variant="primary"
          size="sm"
          className="text-[11px] whitespace-nowrap px-4"
        >
          Convert To Order
        </Button>
      )
    },
    {
      key: "note",
      header: "Note",
      sortable: false,
      render: (_, row) => (
        <button
          onClick={() => openNoteModal(row)}
          className="p-2 text-text-secondary hover:text-primary-teal hover:bg-primary-teal/5 rounded-lg transition-all inline-flex items-center justify-center"
          title={row.note || "No note"}
        >
          <FiFileText className="w-5 h-5" />
        </button>
      )
    },
    {
      key: "actions",
      header: "Action",
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => openEditModal(row)}
            className="p-2 text-text-secondary hover:text-primary-teal hover:bg-primary-teal/5 rounded-lg transition-all inline-flex items-center justify-center"
            title="Edit Lead"
          >
            <FiEdit className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={() => deleteLead(row.id)}
            className="p-2 text-text-secondary hover:text-error hover:bg-error/5 rounded-lg transition-all inline-flex items-center justify-center"
            title="Delete Lead"
          >
            <FiTrash2 className="w-4.5 h-4.5" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Lead List Main White Card matching screenshots */}
      <div className="space-y-6">
        
        {/* Card Header title and Add button */}
        <div className="flex items-center justify-between pb-6">
          <h2 className="text-2xl font-bold text-text-primary">
            Lead List
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-text-secondary bg-background px-4 py-2 rounded-lg border border-border-ui/50">
              📅 May 30, 2026 - May 30, 2026
            </span>
            <Button
              onClick={() => router.push("/add-lead")}
              variant="primary"
              className="rounded-lg px-6"
            >
              Add Lead
            </Button>
          </div>
        </div>

        {/* Inline Filters & Action Buttons exactly matching first screenshot layout */}
        <div className="flex flex-wrap items-center gap-3 pb-6">
          <div className="w-full sm:w-auto sm:flex-1 min-w-[160px]">
            <Select
              value={filterProduct}
              onChange={(e) => setFilterProduct(e.target.value)}
              options={[
                { value: "all", label: "Select Product" },
                ...products.map(p => ({ value: p.name, label: p.name }))
              ]}
            />
          </div>
          <div className="w-full sm:w-auto sm:flex-1 min-w-[160px]">
            <Select
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
              options={[
                { value: "all", label: "Select Assign" },
                ...users.map(u => ({ value: u.name, label: u.name }))
              ]}
            />
          </div>
          <div className="w-full sm:w-auto sm:flex-1 min-w-[160px]">
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              options={[
                { value: "all", label: "Select Status" },
                ...statuses.map(s => ({ value: s.name, label: s.name }))
              ]}
            />
          </div>
          <div className="w-full sm:w-auto sm:flex-1 min-w-[160px]">
            <Select
              value={filterReason}
              onChange={(e) => setFilterReason(e.target.value)}
              options={[
                { value: "all", label: "Select Reason Call" },
                { value: "CNR", label: "CNR" },
                { value: "Wrong Number", label: "Wrong Number" },
                { value: "Switch Off", label: "Switch Off" },
                { value: "Disconnected", label: "Disconnected" }
              ]}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              className="rounded-lg"
            >
              Apply Filter
            </Button>
            <Button
              variant="outline"
              className="rounded-lg"
              onClick={() => {
                setFilterProduct("all");
                setFilterAssignee("all");
                setFilterStatus("all");
                setFilterReason("all");
              }}
            >
              Clear Filter
            </Button>
            <Button
              variant="primary"
              className="rounded-lg"
            >
              Assign Lead
            </Button>
            <Button
              variant="outline"
              className="rounded-lg"
            >
              Export
            </Button>
          </div>
        </div>

        {/* Bulk Action Panel - only visible when items selected */}
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between p-4 bg-gradient-subtle border border-primary-teal/20 rounded-lg animate-fade-in">
            <span className="text-sm font-bold text-primary-teal">
              {selectedIds.length} leads selected
            </span>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="bg-card-bg border-primary-teal/20 text-primary-teal rounded-lg"
              >
                <SwapHoriz className="w-4 h-4 mr-2" /> Bulk Assign
              </Button>
              <Button
                variant="danger"
                size="sm"
                className="rounded-lg"
                onClick={handleBulkDelete}
                isLoading={isDeletingLead}
              >
                <FiTrash2 className="w-4 h-4 mr-2" /> Bulk Delete
              </Button>
            </div>
          </div>
        )}

        {/* Table Element */}
        <Table
          data={filteredLeads}
          columns={columns}
          selectable={true}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          isLoading={isFetchingData}
        />
      </div>



      {/* Edit Lead Modal */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Lead Details" isLoading={isUpdatingLead}>
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input label="Customer Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Assign Staff"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              options={users.map(u => ({ value: u.name, label: u.name }))}
            />
            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={statuses.map(s => ({ value: s.name, label: s.name }))}
            />
          </div>
          <Input label="Reason Call" value={statusTwo} onChange={(e) => setStatusTwo(e.target.value)} />
          <Input label="Note" value={noteText} onChange={(e) => setNoteText(e.target.value)} />
          <Input label="Reminder" type="date" value={reminder} onChange={(e) => setReminder(e.target.value)} />
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isUpdatingLead}
          >
            Save Changes
          </Button>
        </form>
      </Modal>

      {/* Convert to Order Modal */}
      <Modal isOpen={convertModalOpen} onClose={() => setConvertModalOpen(false)} title="Convert Lead to Order" isLoading={isConvertingLead}>
        <form onSubmit={handleConvertSubmit} className="space-y-4">
          <p className="text-xs text-zinc-500 font-medium">
            You are converting <span className="font-bold text-zinc-700 ">{activeLead?.name || "Customer"}</span>'s lead into a final dispatched order.
          </p>
          <Select
            label="Payment Type"
            value={paymentType}
            onChange={(e) => setPaymentType(e.target.value as any)}
            options={[
              { value: "COD", label: "Cash on Delivery (COD)" },
              { value: "Prepaid", label: "Prepaid Online" }
            ]}
          />
          <Select
            label="Courier Partner"
            value={selectedCourier}
            onChange={(e) => setSelectedCourier(e.target.value)}
            options={couriers.map(c => ({ value: c.name, label: c.name }))}
          />
          <Input
            label="Transaction / Tracking ID"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            required
            placeholder="e.g. TXN90283019"
          />
          <Button
            type="submit"
            variant="success"
            fullWidth
            isLoading={isConvertingLead}
          >
            Approve & Dispatch Order
          </Button>
        </form>
      </Modal>

      {/* Note Modal */}
      <Modal isOpen={noteModalOpen} onClose={() => setNoteModalOpen(false)} title="Lead Note">
        <form onSubmit={handleSaveNote} className="space-y-4">
          <p className="text-xs text-zinc-500 font-medium">
            Adding a note for <span className="font-bold text-zinc-700 ">{activeLead?.name || "Customer"}</span>
          </p>
          <div className="space-y-1 text-left">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Note Details</label>
            <textarea
              className="w-full bg-white  border border-zinc-200  rounded-lg p-2 text-sm text-zinc-900  focus:ring-1 focus:ring-primary-teal outline-none"
              rows={4}
              placeholder="Write your note here..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            fullWidth
          >
            Save Note
          </Button>
        </form>
      </Modal>
    </div>
  );
}
