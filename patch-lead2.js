import fs from 'fs';

const filePath = 'c:\\Users\\LENOVO\\Desktop\\wixty\\wrixty-frontend\\src\\app\\lead-list\\page.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// Fix handleSaveNote and add openEditModal, openConvertModal
content = content.replace(
  `  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLead) return;
    
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
  `  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLead) return;
    
    updateLead(activeLead.id, { note: noteText });
    toast.success("Note saved successfully!");
    setNoteModalOpen(false);
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

// We also need to add back the new Modal UI at the bottom
// Let's replace the Note modal with Note Modal + Convert Modal
content = content.replace(
  `      {/* Note Modal */}
      <Modal isOpen={noteModalOpen} onClose={() => setNoteModalOpen(false)} title="Lead Note">`,
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
      </Modal>

      {/* Note Modal */}
      <Modal isOpen={noteModalOpen} onClose={() => setNoteModalOpen(false)} title="Lead Note">`
);

fs.writeFileSync(filePath, content);
console.log('Successfully applied second patch to lead-list/page.tsx');
