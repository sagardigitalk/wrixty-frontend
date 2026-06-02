import fs from 'fs';

const filePath = 'c:\\Users\\LENOVO\\Desktop\\wixty\\wrixty-frontend\\src\\app\\order-list\\page.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// Replace loadMasterData and local filtering
content = content.replace(
  `  React.useEffect(() => {
    const loadMasterData = async () => {
      try {
        setIsFetchingData(true);
        const [usersRes, prodsRes, ordersRes] = await Promise.all([
          fetchUsers({ page: 1, limit: 100 }),
          fetchProducts({ page: 1, limit: 100 }),
          fetchOrders({ page: 1, limit: 100 })
        ]);
        setUsers(usersRes.data);
        setProducts(prodsRes.data);
        // Map backend orders to frontend format
        const mapped = ordersRes.data.map((o: any) => ({
          id: o._id || o.id,
          leadId: o.leadId?._id || o.leadId || "",
          name: o.name,
          phone_number: o.phone_number,
          product: o.product || (o.products?.map((p: any) => p.name).join(", ") || ""),
          amount: o.amount || 0,
          quantity: o.quantity || 1,
          subtotal: o.amount || 0,
          grandTotal: o.grandTotal || o.amount || 0,
          date: o.createdAt ? new Date(o.createdAt).toISOString().split('T')[0] : "",
          paymentType: o.paymentType || "COD",
          courier: o.courier || "",
          assginTo: o.assginTo?.name || o.assginTo || "",
          transactionId: o.transactionId || "",
          status: o.status || "Dispatched"
        }));
        setOrders(mapped);
      } catch (err) {
        console.error(err);
      } finally {
        setIsFetchingData(false);
      }
    };
    loadMasterData();
  }, []);`,
  `  const loadOrdersData = async () => {
    setIsFetchingData(true);
    try {
      const ordersRes = await fetchOrders({
        page: 1,
        limit: 100,
        product: filterProduct !== 'all' ? filterProduct : undefined,
        assginTo: filterAssignee !== 'all' ? filterAssignee : undefined,
        courier: filterCourier !== 'all' ? filterCourier : undefined
      });
      const mapped = ordersRes.data.map((o: any) => ({
        id: o._id || o.id,
        leadId: o.leadId?._id || o.leadId || "",
        name: o.name,
        phone_number: o.phone_number,
        product: o.product || (o.products?.map((p: any) => p.name).join(", ") || ""),
        amount: o.amount || 0,
        quantity: o.quantity || 1,
        subtotal: o.amount || 0,
        grandTotal: o.grandTotal || o.amount || 0,
        date: o.createdAt ? new Date(o.createdAt).toISOString().split('T')[0] : "",
        paymentType: o.paymentType || "COD",
        courier: o.courier || "",
        assginTo: o.assginTo?.name || o.assginTo || "",
        transactionId: o.transactionId || "",
        status: o.status || "Dispatched"
      }));
      setOrders(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetchingData(false);
    }
  };

  React.useEffect(() => {
    const loadMasterData = async () => {
      try {
        const [usersRes, prodsRes] = await Promise.all([
          fetchUsers({ page: 1, limit: 100 }),
          fetchProducts({ page: 1, limit: 100 })
        ]);
        setUsers(usersRes.data);
        setProducts(prodsRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    loadMasterData();
    loadOrdersData();
  }, []);`
);

// Replace local filtering
content = content.replace(
  `  const filteredOrders = React.useMemo(() => {
    return orders
      .filter(o => !o.isDeleted)
      .filter(o => filterProduct === "all" || o.product === filterProduct)
      .filter(o => filterAssignee === "all" || o.assginTo === filterAssignee)
      .filter(o => filterCourier === "all" || o.courier === filterCourier);
  }, [orders, filterProduct, filterAssignee, filterCourier]);`,
  `  const filteredOrders = React.useMemo(() => {
    return orders.filter(o => !o.isDeleted);
  }, [orders]);`
);

// Change Apply Filter
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
              onClick={loadOrdersData}
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
                setFilterCourier("all");
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
                setFilterCourier("all");
                setTimeout(() => loadOrdersData(), 0);
              }}
            >
              Clear Filter
            </Button>`
);

fs.writeFileSync(filePath, content);
console.log('Successfully patched order-list/page.tsx');
