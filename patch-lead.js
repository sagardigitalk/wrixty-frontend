import fs from 'fs';

const filePath = 'c:\\Users\\LENOVO\\Desktop\\wixty\\wrixty-frontend\\src\\app\\lead-list\\page.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Add LeadFormModal import
content = content.replace(
  'import { Add, SwapHoriz, Assignment } from "@mui/icons-material";',
  'import { Add, SwapHoriz, Assignment, Delete } from "@mui/icons-material";\nimport { LeadFormModal } from "../../components/leads/LeadFormModal";'
);

// 2. State replacements
content = content.replace(
  'const [editModalOpen, setEditModalOpen] = useState(false);',
  'const [leadFormModalOpen, setLeadFormModalOpen] = useState(false);'
);

// Remove old form states for edit
content = content.replace(
  `  // Form states for Edit
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("Open");
  const [statusTwo, setStatusTwo] = useState("CNR");
  const [noteText, setNoteText] = useState("");
  const [assignee, setAssignee] = useState("");
  const [reminder, setReminder] = useState("");`,
  `  // Note form state
  const [noteText, setNoteText] = useState("");
  
  // Convert Order product logic
  const [convertSelectedProducts, setConvertSelectedProducts] = useState<any[]>([]);
  const [currentSelectedProductId, setCurrentSelectedProductId] = useState("");`
);

// 3. Update loadMasterData to only fetch static stuff, and create loadLeads
content = content.replace(
  `  React.useEffect(() => {
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
  }, []);`,
  `  const loadLeadsData = async () => {
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
  }, []);`
);

// 4. Update convert modal logic and product add
content = content.replace(
  `  const openConvertModal = (lead: Lead) => {
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
  };`,
  `  const openConvertModal = (lead: Lead) => {
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
      });
      toast.success(\`Successfully converted \${activeLead.name} to order!\`);
      setConvertModalOpen(false);
      loadLeadsData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to convert to order");
    } finally {
      setIsConvertingLead(false);
    }
  };`
);

// 5. Update Edit Submit removal and edit logic
content = content.replace(
  `  const openEditModal = (lead: Lead) => {
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
      toast.info(\`Lead configuration updated.\`);
      setEditModalOpen(false);
    } catch (_) {
      // error toast already shown inside updateLead
    } finally {
      setIsUpdatingLead(false);
    }
  };`,
  `  const openEditModal = (lead: Lead) => {
    setActiveLead(lead);
    setLeadFormModalOpen(true);
  };`
);

// 6. Update local filtering to just rely on state
content = content.replace(
  `  // 1. Filtering logic
  const filteredLeads = React.useMemo(() => {
    return leads
      .filter(l => !l.isDeleted)
      .filter(l => filterProduct === "all" || l.product === filterProduct)
      .filter(l => filterAssignee === "all" || l.assgin === filterAssignee)
      .filter(l => filterStatus === "all" || l.status === filterStatus)
      .filter(l => filterReason === "all" || l.reason_call === filterReason);
  }, [leads, filterProduct, filterAssignee, filterStatus, filterReason]);`,
  `  // 1. Filtering logic
  const filteredLeads = React.useMemo(() => {
    return leads.filter(l => !l.isDeleted);
  }, [leads]);`
);

// 7. Apply Filter button
content = content.replace(
  `            <Button
              variant="primary"
              className="rounded-lg"
            >
              Apply Filter
            </Button>`,
  `            <Button
              variant="primary"
              className="rounded-lg"
              onClick={loadLeadsData}
            >
              Apply Filter
            </Button>`
);

content = content.replace(
  `            <Button
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
            </Button>`,
  `            <Button
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
            </Button>`
);

// 8. Change UI of Convert to Order Modal
content = content.replace(
  `      {/* Convert to Order Modal */}
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
      </Modal>`,
  `      {/* Convert to Order Modal */}
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
      </Modal>`
);

// 9. Remove Edit Modal
content = content.replace(
  `      {/* Edit Lead Modal */}
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
      </Modal>`,
  ``
);

// Add LeadFormModal
content = content.replace(
  `  return (
    <div className="space-y-6">`,
  `  return (
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
      />`
);

// Change Add Lead button action
content = content.replace(
  `onClick={() => router.push("/add-lead")}`,
  `onClick={() => { setActiveLead(null); setLeadFormModalOpen(true); }}`
);

fs.writeFileSync(filePath, content);
console.log('Successfully patched lead-list/page.tsx');
