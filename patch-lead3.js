import fs from 'fs';

const filePath = 'c:\\Users\\LENOVO\\Desktop\\wixty\\wrixty-frontend\\src\\app\\lead-list\\page.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

const missingFuncs = `
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
  };
`;

content = content.replace(
  '// Columns matching screenshot exactly',
  missingFuncs + '\\n  // Columns matching screenshot exactly'
);

fs.writeFileSync(filePath, content);
