import React, { useState, useEffect } from "react";
import { Modal } from "../common/Modal";
import { Input } from "../common/Input";
import { Select } from "../common/Select";
import { Button } from "../common/Button";
import { Delete } from "@mui/icons-material";
import { createLeadApi, updateLeadApi } from "../../services/leadService";
import { createOrderApi } from "../../services/orderService";
import { useToast } from "../../context/ToastContext";

interface SelectedProductRow {
  productId: string;
  name: string;
  amount: number;
  quantity: number;
  subtotal: number;
}

interface LeadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  activeLead?: any | null;
  users: any[];
  products: any[];
  statusesOptions: any[];
  reasonCallOptions: any[];
}

export const LeadFormModal: React.FC<LeadFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  activeLead,
  users,
  products,
  statusesOptions,
  reasonCallOptions
}) => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("");
  const [statusTwo, setStatusTwo] = useState("");
  const [noteText, setNoteText] = useState("");
  const [assignee, setAssignee] = useState("");
  const [orderStatus, setOrderStatus] = useState(false);
  const [reminder, setReminder] = useState("");

  // Product Selection Table States
  const [modalSelectedProducts, setModalSelectedProducts] = useState<SelectedProductRow[]>([]);
  const [currentSelectedProductId, setCurrentSelectedProductId] = useState("");

  // Convert to Order fields
  const [paymentType, setPaymentType] = useState<"COD" | "Prepaid">("COD");
  const [selectedCourier, setSelectedCourier] = useState("Delhivery");
  const [transactionId, setTransactionId] = useState("");
  const [couriers] = useState<any[]>([
    { id: "1", name: "Delhivery" },
    { id: "2", name: "BlueDart" },
    { id: "3", name: "XpressBees" },
    { id: "4", name: "DHL Express" }
  ]);

  useEffect(() => {
    if (isOpen) {
      if (activeLead) {
        // Edit Mode
        setName(activeLead.name || "");
        setPhone(activeLead.phone_number || "");
        setStatus(activeLead.statusId || activeLead.status || "");
        setStatusTwo(activeLead.reasonCallId || activeLead.reason_call || "");
        setNoteText(activeLead.note || "");
        setAssignee(activeLead.assginId || activeLead.assgin || "");
        setReminder(activeLead.reminderDate || activeLead.reminder || "");
        setOrderStatus(activeLead.orderStatus || false);

        if (activeLead.products && Array.isArray(activeLead.products)) {
          setModalSelectedProducts(activeLead.products.map((p: any) => ({
            productId: p.productId || p._id,
            name: p.name,
            amount: p.amount,
            quantity: p.quantity,
            subtotal: p.subtotal || (p.amount * p.quantity)
          })));
        } else {
          setModalSelectedProducts([]);
        }
      } else {
        // Add Mode
        setName("");
        setPhone("");
        setStatus(statusesOptions[0]?._id || statusesOptions[0]?.id || "");
        setStatusTwo(reasonCallOptions[0]?._id || reasonCallOptions[0]?.id || "");
        setNoteText("");
        setAssignee(users[0]?._id || users[0]?.id || "");
        setReminder("");
        setOrderStatus(false);
        setModalSelectedProducts([]);
      }
      setCurrentSelectedProductId(products[0]?._id || products[0]?.id || "");
    }
  }, [isOpen, activeLead, users, products, statusesOptions, reasonCallOptions]);

  const handleAddProduct = () => {
    if (!currentSelectedProductId) return;
    const prod = products.find(p => (p._id || p.id) === currentSelectedProductId);
    if (!prod) return;

    const existingIndex = modalSelectedProducts.findIndex(p => p.productId === currentSelectedProductId);
    if (existingIndex >= 0) {
      // Increment quantity instead of showing error
      const updated = [...modalSelectedProducts];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].subtotal = updated[existingIndex].amount * updated[existingIndex].quantity;
      setModalSelectedProducts(updated);
      toast.success("Product quantity incremented!");
    } else {
      setModalSelectedProducts([
        ...modalSelectedProducts,
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

  const handleRemoveProduct = (productId: string) => {
    setModalSelectedProducts(modalSelectedProducts.filter(p => p.productId !== productId));
  };

  const handleQtyChange = (productId: string, qty: number) => {
    const safeQty = Math.max(1, qty);
    setModalSelectedProducts(
      modalSelectedProducts.map(p => p.productId === productId ? { ...p, quantity: safeQty, subtotal: safeQty * p.amount } : p)
    );
  };

  const totalAmount = modalSelectedProducts.reduce((sum, p) => sum + p.subtotal, 0);
  const totalQuantity = modalSelectedProducts.reduce((sum, p) => sum + p.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modalSelectedProducts.length === 0) {
      toast.warning("Please add at least one product!");
      return;
    }

    setIsLoading(true);

    const leadPayload: any = {
      name,
      phone_number: phone,
      products: modalSelectedProducts.map(p => ({
        productId: p.productId,
        name: p.name,
        amount: p.amount,
        quantity: p.quantity,
        subtotal: p.subtotal
      })),
      assgin: assignee,
      status: status,
      reason_call: statusTwo,
      note: noteText,
      reminder: reminder,
      orderStatus: orderStatus
    };

    try {
      if (activeLead) {
        await updateLeadApi(activeLead.id, leadPayload);
        toast.success(`Lead updated successfully!`);
      } else {
        const createdLead = await createLeadApi(leadPayload);
        toast.success(`Lead created successfully!`);
        
        if (orderStatus) {
          try {
            await createOrderApi({
              leadId: (createdLead as any)._id,
              name,
              phone_number: phone,
              products: leadPayload.products,
              paymentType,
              courier: selectedCourier,
              assginTo: assignee,
              transactionId: transactionId || "TXN-AUTO",
              status: "Dispatched"
            });
            toast.success("Order created automatically!");
          } catch (orderErr: any) {
            toast.error("Lead saved but order creation failed: " + (orderErr.response?.data?.message || ""));
          }
        }
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save lead");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={activeLead ? "Edit Lead Details" : "Add New Lead"} isLoading={isLoading} sizeClass="max-w-5xl">
      <form onSubmit={handleSubmit} className="space-y-6 text-left max-w-4xl mx-auto max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
        <p className="text-xs text-zinc-500 font-medium">Fill out the details to {activeLead ? 'update the' : 'register a new'} lead in the system.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Enter Name" />
          <Input label="Phone Number" type="number" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="Enter Phone Number" />
          <Select
            label="Reason Call"
            value={statusTwo}
            onChange={(e) => setStatusTwo(e.target.value)}
            options={[
              { value: "", label: "Select Reason" },
              ...reasonCallOptions.map(r => ({ value: r._id || r.id, label: r.name }))
            ]}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: "", label: "Select Status" },
              ...statusesOptions.map(s => ({ value: s._id || s.id, label: s.name }))
            ]}
          />
          <Select
            label="Assign Staff"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            options={[
              { value: "", label: "Select User" },
              ...users.map(u => ({ value: u._id || u.id, label: u.name }))
            ]}
          />
          <Input label="Note" value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Enter Note" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 cursor-pointer mt-5">
            <input
              type="checkbox"
              checked={orderStatus}
              onChange={(e) => setOrderStatus(e.target.checked)}
              className="w-4 h-4 text-primary-teal rounded-lg border-zinc-300"
            />
            Convert to Order automatically
          </label>
          <Input label="Reminder" type="date" value={reminder} onChange={(e) => setReminder(e.target.value)} />
        </div>

        {orderStatus && !activeLead && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-zinc-50 rounded-lg border border-zinc-200">
            <Select
              label="Payment Type"
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value as "COD" | "Prepaid")}
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
              label="Transaction ID"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="e.g. TXN90283019"
            />
          </div>
        )}

        <div className="border-t border-zinc-150 pt-4 space-y-3">
          <h4 className="text-sm font-bold text-zinc-700">Select Products</h4>
          <div className="flex gap-2.5 items-end">
            <div className="flex-1">
              <Select
                value={currentSelectedProductId}
                onChange={(e) => setCurrentSelectedProductId(e.target.value)}
                options={[
                  { value: "", label: "Select a product" },
                  ...products.map(p => ({ value: p._id || p.id, label: `${p.name} (₹${p.amount})` }))
                ]}
              />
            </div>
            <Button type="button" variant="success" onClick={handleAddProduct}>
              Add Product
            </Button>
          </div>
        </div>

        <div className="space-y-3 text-left">
          <h4 className="text-sm font-bold text-zinc-700">Selected Products</h4>
          <div className="border border-zinc-200 rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 font-semibold text-zinc-500 uppercase">
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Quantity</th>
                  <th className="p-3">Subtotal</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-150">
                {modalSelectedProducts.length > 0 ? (
                  modalSelectedProducts.map((row) => (
                    <tr key={row.productId}>
                      <td className="p-3 font-medium text-zinc-800">{row.name}</td>
                      <td className="p-3 font-medium text-zinc-700">₹{row.amount}</td>
                      <td className="p-3 w-24">
                        <input
                          type="number"
                          min="1"
                          value={row.quantity}
                          onChange={(e) => handleQtyChange(row.productId, Number(e.target.value))}
                          className="w-16 px-2 py-1 bg-zinc-50 border border-zinc-200 rounded-lg focus:ring-1 focus:ring-primary-teal outline-none text-center"
                        />
                      </td>
                      <td className="p-3 font-black text-zinc-800">₹{row.subtotal}</td>
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveProduct(row.productId)}
                          className="p-1 hover:bg-red-50 text-red-500 hover:text-red-600 rounded-lg transition-colors"
                        >
                          <Delete className="w-4 h-4" />
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

        <div className="flex items-center justify-between border-t border-zinc-150 pt-4 mt-2">
          <span className="text-sm font-black text-zinc-700">
            Total Amount: ₹{totalAmount.toFixed(2)}
          </span>
          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isLoading}>
              Save Lead
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
