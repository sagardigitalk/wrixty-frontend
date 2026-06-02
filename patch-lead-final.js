import fs from 'fs';

const filePath = 'c:\\Users\\LENOVO\\Desktop\\wixty\\wrixty-frontend\\src\\app\\lead-list\\page.tsx';

const content = `"use client";

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
import { Add, SwapHoriz, Assignment, Delete } from "@mui/icons-material";
import { FiEdit, FiTrash2, FiFileText } from "react-icons/fi";
import { LeadFormModal } from "../../components/leads/LeadFormModal";

interface SelectedProductRow {
  id?: string;
  productId: string;
  name: string;
  amount: number;
  quantity: number;
  subtotal: number;
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

  const loadLeadsData = async () => {
    setIsFetchingData(true);
    try {
      const leadsRes = await fetchLeads({
        page: 1,
        limit: 100,
        product: filterProduct !== 'all' ? filterProduct : undefined,
        assgin: filterAssignee !== 'all' ? filterAssignee : undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        reason_call: filterReason !== 'all' ? filterReason : undefined
      });
      const mappedLeads = leadsRes.data.map((l: any) => ({
        ...l,
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
      console.error(err);
    } finally {
      setIsFetchingData(false);
    }
  };

  React.useEffect(() => {
    const loadMasterData = async () => {
      try {
        const [usersRes, prodsRes, statusRes, reasonRes] = await Promise.all([
          fetchUsers({ page: 1, limit: 100 }),
          fetchProducts({ page: 1, limit: 100 }),
          fetchStatuses({ page: 1, limit: 100 }),
          fetchReasonToCalls({ page: 1, limit: 100 })
        ]);
        setUsers(usersRes.data);
        setProducts(prodsRes.data);
        setStatuses(statusRes.data);
        setReasonsOptions(reasonRes.data);
      } catch (err) {
        console.error("Error loading master data", err);
      }
    };
    loadMasterData();
    loadLeadsData();
  }, []);

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

  const deleteLead = async (id: string) => {
    try {
      await deleteLeadApi(id);
      setLeads(prev => prev.filter(l => l.id !== id));
      toast.success("Lead deleted successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete lead");
    }
  };

  const toast = useToast();
  const router = useRouter();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const [leadFormModalOpen, setLeadFormModalOpen] = useState(false);
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);

  const [isFetchingData, setIsFetchingData] = useState(false);
  const [isConvertingLead, setIsConvertingLead] = useState(false);
  const [isDeletingLead, setIsDeletingLead] = useState(false);

  const [noteText, setNoteText] = useState("");
  const [convertSelectedProducts, setConvertSelectedProducts] = useState<SelectedProductRow[]>([]);
  const [currentSelectedProductId, setCurrentSelectedProductId] = useState("");

  const [paymentType, setPaymentType] = useState<"COD" | "Prepaid">("COD");
  const [selectedCourier, setSelectedCourier] = useState("Delhivery");
  const [transactionId, setTransactionId] = useState("");

  const [filterProduct, setFilterProduct] = useState("all");
  const [filterAssignee, setFilterAssignee] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterReason, setFilterReason] = useState("all");

  const filteredLeads = React.useMemo(() => {
    return leads.filter(l => !l.isDeleted);
  }, [leads]);

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

  const handleBulkDelete = async () => {
    setIsDeletingLead(true);
    try {
      await Promise.all(selectedIds.map(id => deleteLeadApi(id)));
      setLeads(prev => prev.filter(l => !selectedIds.includes(l.id)));
      toast.warning(\`Deleted \${selectedIds.length} lead records.\`);
      setSelectedIds([]);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Bulk delete failed");
    } finally {
      setIsDeletingLead(false);
    }
  };

  const openEditModal = (lead: Lead) => {
    setActiveLead(lead);
    setLeadFormModalOpen(true);
  };

  const openConvertModal = (lead: Lead) => {
    setActiveLead(lead);
    setPaymentType("COD");
    setSelectedCourier(couriers[0]?.name || "Delhivery");
    setTransactionId("");
    
    if ((lead as any).products && Array.isArray((lead as any).products)) {
      setConvertSelectedProducts((lead as any).products.map((p: any) => ({
        productId: p.productId || p._id,
        name: p.name,
        amount: p.amount,
        quantity: p.quantity,
        subtotal: p.subtotal || (p.amount * p.quantity)
      })));
    } else {
      setConvertSelectedProducts([]);
    }
    setConvertModalOpen(true);
  };

  const handleConvertAddProduct = () => {
    if (!currentSelectedProductId) return;
    const prod = products.find(p => (p._id || p.id) === currentSelectedProductId);
    if (!prod) return;

    const existingIndex = convertSelectedProducts.findIndex(p => p.productId === currentSelectedProductId);
    if (existingIndex >= 0) {
      const updated = [...convertSelectedProducts];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].subtotal = updated[existingIndex].amount * updated[existingIndex].quantity;
      setConvertSelectedProducts(updated);
      toast.success("Product quantity incremented!");
    } else {
      setConvertSelectedProducts([
        ...convertSelectedProducts,
        { 
          productId: prod._id || prod.id, 
          name: prod.name, 
          amount: prod.amount, 
          quantity: 1, 
          subtotal: prod.amount 
        }
      ]);
      toast.success("Product added!");
    }
  };

  const handleConvertRemoveProduct = (productId: string) => {
    setConvertSelectedProducts(convertSelectedProducts.filter(p => p.productId !== productId));
  };

  const handleConvertQtyChange = (productId: string, qty: number) => {
    const safeQty = Math.max(1, qty);
    setConvertSelectedProducts(
      convertSelectedProducts.map(p => p.productId === productId ? { ...p, quantity: safeQty, subtotal: safeQty * p.amount } : p)
    );
  };

  const convertTotalAmount = convertSelectedProducts.reduce((sum, p) => sum + p.subtotal, 0);

  const handleConvertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLead) return;
    if (convertSelectedProducts.length === 0) {
      toast.warning("Please add at least one product to convert to order!");
      return;
    }
    
    setIsConvertingLead(true);
    try {
      await createOrderApi({
        leadId: activeLead.id,
        name: activeLead.name,
        phone_number: activeLead.phone_number,
        products: convertSelectedProducts,
        amount: convertTotalAmount,
        quantity: convertSelectedProducts.reduce((sum, p) => sum + p.quantity, 0),
        grandTotal: convertTotalAmount,
        paymentType,
        courier: selectedCourier,
        assginTo: (activeLead as any).assginId || activeLead.assgin,
        transactionId,
        status: "Dispatched"
      } as any);
      toast.success(\`Successfully converted \${activeLead.name} to order!\`);
      setConvertModalOpen(false);
      loadLeadsData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to convert to order");
    } finally {
      setIsConvertingLead(false);
    }
  };

  const columns: Column<Lead>[] = [
    { key: "id", header: "No", render: (_, __, i) => i + 1, sortable: false },
    { key: "name", header: "Customer Name", render: (val) => val || "-" },
    { key: "phone_number", header: "Phone Number" },
    { key: "product", header: "Product Name" },
    { key: "subtotal", header: "Total", render: (val) => \`₹\${val}\` },
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
            className={\`text-[11px] font-bold rounded-lg px-2 py-1 outline-none border cursor-pointer appearance-none transition-all \${
              val === "Inprogress" || val === "In-Progress"
                ? "bg-success/10 text-success border-success/20"
                : val === "Close" || val === "Closed"
                ? "bg-error/10 text-error border-error/20"
                : "bg-warning/10 text-warning border-warning/20"
            }\`}
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
      <LeadFormModal
        isOpen={leadFormModalOpen}
        onClose={() => setLeadFormModalOpen(false)}
        onSuccess={loadLeadsData}
        activeLead={activeLead}
        users={users}
        products={products}
        statusesOptions={statuses}
        reasonCallOptions={reasonsOptions}
      />
      
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-6">
          <h2 className="text-2xl font-bold text-text-primary">
            Lead List
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-text-secondary bg-background px-4 py-2 rounded-lg border border-border-ui/50">
              📅 May 30, 2026 - May 30, 2026
            </span>
            <Button
              onClick={() => { setActiveLead(null); setLeadFormModalOpen(true); }}
              variant="primary"
              className="rounded-lg px-6"
            >
              Add Lead
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pb-6">
          <div className="w-full sm:w-auto sm:flex-1 min-w-[160px]">
            <Select
              value={filterProduct}
              onChange={(e) => setFilterProduct(e.target.value)}
              options={[
                { value: "all", label: "Select Product" },
                ...products.map(p => ({ value: p._id || p.id, label: p.name }))
              ]}
            />
          </div>
          <div className="w-full sm:w-auto sm:flex-1 min-w-[160px]">
            <Select
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
              options={[
                { value: "all", label: "Select Assign" },
                ...users.map(u => ({ value: u._id || u.id, label: u.name }))
              ]}
            />
          </div>
          <div className="w-full sm:w-auto sm:flex-1 min-w-[160px]">
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              options={[
                { value: "all", label: "Select Status" },
                ...statuses.map(s => ({ value: s._id || s.id, label: s.name }))
              ]}
            />
          </div>
          <div className="w-full sm:w-auto sm:flex-1 min-w-[160px]">
            <Select
              value={filterReason}
              onChange={(e) => setFilterReason(e.target.value)}
              options={[
                { value: "all", label: "Reason Call" },
                ...reasonsOptions.map(r => ({ value: r._id || r.id, label: r.name }))
              ]}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              className="rounded-lg"
              onClick={loadLeadsData}
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
                setTimeout(() => loadLeadsData(), 0);
              }}
            >
              Clear Filter
            </Button>
            <Button
              variant="outline"
              className="rounded-lg"
            >
              Export
            </Button>
          </div>
        </div>

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

        <Table
          data={filteredLeads}
          columns={columns}
          selectable={true}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          isLoading={isFetchingData}
        />
      </div>

      <Modal isOpen={convertModalOpen} onClose={() => setConvertModalOpen(false)} title="Lead Convert To Order()" isLoading={isConvertingLead}>
        <form onSubmit={handleConvertSubmit} className="space-y-6 text-left max-w-4xl mx-auto">
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700">Payment Type</label>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm text-zinc-600 cursor-pointer">
                <input type="radio" name="paymentType" value="COD" checked={paymentType === 'COD'} onChange={() => setPaymentType('COD')} className="w-4 h-4 text-primary-teal" />
                COD Discount
              </label>
              <label className="flex items-center gap-2 text-sm text-zinc-600 cursor-pointer">
                <input type="radio" name="paymentType" value="Prepaid" checked={paymentType === 'Prepaid'} onChange={() => setPaymentType('Prepaid')} className="w-4 h-4 text-primary-teal" />
                Prepaid Discount
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Transaction ID"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="Enter Transaction ID"
            />
            <Select
              label="Select Courier"
              value={selectedCourier}
              onChange={(e) => setSelectedCourier(e.target.value)}
              options={couriers.map(c => ({ value: c.name, label: c.name }))}
            />
          </div>

          <div className="border-t border-zinc-150 pt-4 space-y-3">
            <h4 className="text-sm font-medium text-zinc-700">Select Products</h4>
            <div className="flex gap-2.5 items-end">
              <div className="flex-1">
                <Select
                  value={currentSelectedProductId}
                  onChange={(e) => setCurrentSelectedProductId(e.target.value)}
                  options={[
                    { value: "", label: "Select a Product" },
                    ...products.map(p => ({ value: p._id || p.id, label: \`\${p.name} (₹\${p.amount})\` }))
                  ]}
                />
              </div>
              <Button type="button" variant="success" onClick={handleConvertAddProduct}>
                Add Product
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-zinc-700">Selected Products</h4>
            <div className="border border-zinc-200 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 font-semibold text-zinc-600">
                    <th className="p-3">Product Name</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Quantity</th>
                    <th className="p-3">Subtotal</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-150">
                  {convertSelectedProducts.length > 0 ? (
                    convertSelectedProducts.map((row) => (
                      <tr key={row.productId}>
                        <td className="p-3 font-medium text-zinc-700">{row.name}</td>
                        <td className="p-3 text-zinc-600">{row.amount}</td>
                        <td className="p-3 w-32">
                          <input
                            type="number"
                            min="1"
                            value={row.quantity}
                            onChange={(e) => handleConvertQtyChange(row.productId, Number(e.target.value))}
                            className="w-full px-3 py-1.5 bg-white border border-zinc-200 rounded-md focus:ring-1 focus:ring-primary-teal outline-none"
                          />
                        </td>
                        <td className="p-3">
                          <input 
                            type="text" 
                            disabled 
                            value={row.subtotal} 
                            className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md outline-none" 
                          />
                        </td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleConvertRemoveProduct(row.productId)}
                            className="px-4 py-1.5 bg-[#d32f2f] text-white text-xs font-semibold rounded-md hover:bg-red-700 transition-colors"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-zinc-400 font-medium">
                        No products selected
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="border-t border-zinc-200 pt-4 mt-2">
            <div className="flex justify-end mb-4">
              <span className="text-lg text-zinc-700">
                Total Amount: {convertTotalAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setConvertModalOpen(false)}
                className="px-6 py-2 bg-[#b77051] text-white font-medium rounded-md hover:bg-[#a66245] transition-colors"
              >
                Close
              </button>
              <button 
                type="submit" 
                className="px-6 py-2 bg-[#335c5c] text-white font-medium rounded-md hover:bg-[#284a4a] transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </Modal>

      <Modal isOpen={noteModalOpen} onClose={() => setNoteModalOpen(false)} title="Lead Note">
        <form onSubmit={handleSaveNote} className="space-y-4">
          <Input label="Add Note" value={noteText} onChange={(e) => setNoteText(e.target.value)} />
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
`;

fs.writeFileSync(filePath, content);
console.log('Successfully wrote exact contents of lead-list/page.tsx');
