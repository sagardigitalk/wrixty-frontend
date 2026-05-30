"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// Types
export interface Product {
  id: string;
  name: string;
  amount: number;
  cod_dicount: number;
  prepad_disocount: number;
}

export interface Status {
  id: string;
  name: string;
  color: string; // hex or tailwind class
}

export interface Team {
  id: string;
  name: string;
  head: string;
  member: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  mobile_number: string;
  company_number: string;
  aadhar_card: string;
  check_photo?: string;
  bank_number: string;
  roles: string[];
}

export interface Lead {
  id: string;
  name: string;
  phone_number: string;
  product: string; // name
  amount: number;
  quantity: number;
  subtotal: number;
  assgin: string; // User ID/Name
  date: string;
  time?: string;
  status: string; // e.g. New, Call Back
  status_two?: string; // sub-status
  reason_call?: string;
  note: string;
  isDeleted?: boolean;
  deleteDate?: string;
  reminderDate?: string;
}

export interface Order {
  id: string;
  leadId: string;
  name: string;
  phone_number: string;
  product: string;
  amount: number;
  quantity: number;
  subtotal: number;
  grandTotal: number;
  date: string;
  paymentType: "COD" | "Prepaid";
  courier: string;
  assginTo: string;
  transactionId: string;
  returnType?: string;
  repartOrderTotal?: number;
  status: string; // Converted, Dispatched, Delivered, Returned
}

export interface Courier {
  id: string;
  name: string;
}

export interface Task {
  id: string;
  date: string;
  assginUser: string;
  lead: string;
  phone_number: string;
  addedBy: string;
  message: string;
  status: "Pending" | "Completed";
}

export interface Reminder {
  id: string;
  title: string;
  leadId: string;
  name: string;
  phone_number: string;
  reminderDate: string;
  product: string;
  amount: number;
  quantity: number;
  subtotal: number;
}

export interface ReturnOrder {
  id: string;
  customerName: string;
  phone_number: string;
  assginTo: string;
  orderDate: string;
  returnDate: string;
  product: string;
  amount: number;
  quantity: number;
  subtotal: number;
  type: string; // return order type
}

interface MockDbContextType {
  products: Product[];
  statuses: Status[];
  teams: Team[];
  users: User[];
  leads: Lead[];
  orders: Order[];
  couriers: Courier[];
  tasks: Task[];
  reminders: Reminder[];
  returnOrders: ReturnOrder[];
  
  // CRUD Helpers
  addProduct: (p: Omit<Product, "id">) => void;
  updateProduct: (id: string, p: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  
  addStatus: (s: Omit<Status, "id">) => void;
  updateStatus: (id: string, s: Partial<Status>) => void;
  deleteStatus: (id: string) => void;
  
  addTeam: (t: Omit<Team, "id">) => void;
  updateTeam: (id: string, t: Partial<Team>) => void;
  deleteTeam: (id: string) => void;
  
  addUser: (u: Omit<User, "id">) => void;
  updateUser: (id: string, u: Partial<User>) => void;
  deleteUser: (id: string) => void;
  
  addLead: (l: Omit<Lead, "id" | "date" | "subtotal">) => void;
  updateLead: (id: string, l: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  restoreLead: (id: string) => void;
  
  convertToOrder: (leadId: string, details: { paymentType: "COD" | "Prepaid"; courier: string; transactionId: string; discountType?: string }) => void;
  deleteOrder: (id: string) => void;
  updateOrder: (id: string, o: Partial<Order>) => void;
  addOrder: (o: Omit<Order, "id">) => void;
  
  addCourier: (c: Omit<Courier, "id">) => void;
  updateCourier: (id: string, c: Partial<Courier>) => void;
  deleteCourier: (id: string) => void;
  
  addTask: (t: Omit<Task, "id" | "date" | "status">) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  
  addReminder: (r: Omit<Reminder, "id">) => void;
  deleteReminder: (id: string) => void;

  addReturnOrder: (r: Omit<ReturnOrder, "id">) => void;
  deleteReturnOrder: (id: string) => void;
}

const MockDbContext = createContext<MockDbContextType | undefined>(undefined);

export const MockDbProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [returnOrders, setReturnOrders] = useState<ReturnOrder[]>([]);

  // Load initial data or localStorage
  useEffect(() => {
    const getOrInit = <T,>(key: string, defaultVal: T): T => {
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error("Error parsing key " + key, e);
        }
      }
      localStorage.setItem(key, JSON.stringify(defaultVal));
      return defaultVal;
    };

    // 1. Initial Products
    const initialProducts: Product[] = [
      { id: "1", name: "Wrixty Ashwagandha Gold", amount: 1200, cod_dicount: 10, prepad_disocount: 15 },
      { id: "2", name: "Wrixty Triphala Digest", amount: 650, cod_dicount: 5, prepad_disocount: 10 },
      { id: "3", name: "Wrixty Brahmi Mind Focus", amount: 890, cod_dicount: 8, prepad_disocount: 12 },
      { id: "4", name: "Wrixty Neem Blood Purify", amount: 450, cod_dicount: 5, prepad_disocount: 8 },
      { id: "5", name: "Wrixty Shatavari Hormonal Balance", amount: 1100, cod_dicount: 10, prepad_disocount: 15 }
    ];
    setProducts(getOrInit("wrixty_products", initialProducts));

    // 2. Initial Statuses
    const initialStatuses: Status[] = [
      { id: "1", name: "New", color: "#3b82f6" }, // blue
      { id: "2", name: "In-Progress", color: "#f59e0b" }, // amber
      { id: "3", name: "Call Back", color: "#8b5cf6" }, // purple
      { id: "4", name: "Pending", color: "#6b7280" }, // gray
      { id: "5", name: "Delivered", color: "#10b981" }, // green
      { id: "6", name: "Returned", color: "#ef4444" }, // red
      { id: "7", name: "Cancelled", color: "#b91c1c" } // dark red
    ];
    setStatuses(getOrInit("wrixty_statuses", initialStatuses));

    // 3. Initial Users
    const initialUsers: User[] = [
      { id: "1", name: "Super Admin", email: "Superadmin@gmail.com", mobile_number: "9876543210", company_number: "WRIX-001", aadhar_card: "1234-5678-9012", bank_number: "SBI-902319082390", roles: ["Superadmin"] },
      { id: "2", name: "Aman Sharma", email: "aman@wrixty.com", mobile_number: "9000011111", company_number: "WRIX-002", aadhar_card: "9876-5432-1098", bank_number: "HDFC-29031023901", roles: ["Agent"] },
      { id: "3", name: "Priya Patel", email: "priya@wrixty.com", mobile_number: "9111122222", company_number: "WRIX-003", aadhar_card: "4567-8901-2345", bank_number: "ICICI-10293019230", roles: ["Agent"] },
      { id: "4", name: "Vikram Singh", email: "vikram@wrixty.com", mobile_number: "9222233333", company_number: "WRIX-004", aadhar_card: "7890-1234-5678", bank_number: "AXIS-403920193021", roles: ["Manager"] }
    ];
    setUsers(getOrInit("wrixty_users", initialUsers));

    // 4. Initial Teams
    const initialTeams: Team[] = [
      { id: "1", name: "North Sales Team", head: "Vikram Singh", member: ["Aman Sharma", "Priya Patel"] },
      { id: "2", name: "South Sales Team", head: "Super Admin", member: ["Priya Patel"] }
    ];
    setTeams(getOrInit("wrixty_teams", initialTeams));

    // 5. Initial Couriers
    const initialCouriers: Courier[] = [
      { id: "1", name: "Delhivery" },
      { id: "2", name: "BlueDart" },
      { id: "3", name: "XpressBees" },
      { id: "4", name: "DHL Express" }
    ];
    setCouriers(getOrInit("wrixty_couriers", initialCouriers));

    // 6. Initial Leads
    const initialLeads: Lead[] = [
      { id: "1", name: "Rajesh Kumar", phone_number: "9988776655", product: "Wrixty Ashwagandha Gold", amount: 1200, quantity: 2, subtotal: 2400, assgin: "Aman Sharma", date: "2026-05-29", time: "10:30", status: "New", note: "Interested in stress relief products." },
      { id: "2", name: "Suresh Gupta", phone_number: "8877665544", product: "Wrixty Triphala Digest", amount: 650, quantity: 1, subtotal: 650, assgin: "Priya Patel", date: "2026-05-29", time: "11:15", status: "Call Back", note: "Wants to consult with doctor first." },
      { id: "3", name: "Neha Sharma", phone_number: "7766554433", product: "Wrixty Shatavari Hormonal Balance", amount: 1100, quantity: 1, subtotal: 1100, assgin: "Aman Sharma", date: "2026-05-30", time: "09:00", status: "In-Progress", note: "Inquiring about hormonal balance pack." },
      { id: "4", name: "Ramesh Patel", phone_number: "9012345678", product: "Wrixty Brahmi Mind Focus", amount: 890, quantity: 3, subtotal: 2670, assgin: "Vikram Singh", date: "2026-05-28", time: "16:20", status: "Pending", note: "Asked for discount." }
    ];
    setLeads(getOrInit("wrixty_leads", initialLeads));

    // 7. Initial Orders
    const initialOrders: Order[] = [
      { id: "1", leadId: "4", name: "Ramesh Patel", phone_number: "9012345678", product: "Wrixty Brahmi Mind Focus", amount: 890, quantity: 3, subtotal: 2670, grandTotal: 2670, date: "2026-05-28", paymentType: "COD", courier: "Delhivery", assginTo: "Vikram Singh", transactionId: "TXN90283019", status: "Dispatched" }
    ];
    setOrders(getOrInit("wrixty_orders", initialOrders));

    // 8. Initial Tasks
    const initialTasks: Task[] = [
      { id: "1", date: "2026-05-30", assginUser: "Aman Sharma", lead: "Rajesh Kumar", phone_number: "9988776655", addedBy: "Super Admin", message: "Call regarding bulk order requirements", status: "Pending" },
      { id: "2", date: "2026-05-29", assginUser: "Priya Patel", lead: "Suresh Gupta", phone_number: "8877665544", addedBy: "Super Admin", message: "Confirm delivery details", status: "Completed" }
    ];
    setTasks(getOrInit("wrixty_tasks", initialTasks));

    // 9. Initial Reminders
    const initialReminders: Reminder[] = [
      { id: "1", title: "Follow-up for Ashwagandha pack", leadId: "1", name: "Rajesh Kumar", phone_number: "9988776655", reminderDate: "2026-05-31", product: "Wrixty Ashwagandha Gold", amount: 1200, quantity: 2, subtotal: 2400 }
    ];
    setReminders(getOrInit("wrixty_reminders", initialReminders));

    // 10. Initial Return Orders
    const initialReturnOrders: ReturnOrder[] = [
      { id: "1", customerName: "Anil Saxena", phone_number: "9123456780", assginTo: "Aman Sharma", orderDate: "2026-05-20", returnDate: "2026-05-25", product: "Wrixty Neem Blood Purify", amount: 450, quantity: 2, subtotal: 900, type: "Wrong Product Delivered" }
    ];
    setReturnOrders(getOrInit("wrixty_return_orders", initialReturnOrders));
  }, []);

  // Sync to localStorage helpers
  const save = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // Products CRUD
  const addProduct = (p: Omit<Product, "id">) => {
    const newProducts = [...products, { ...p, id: Date.now().toString() }];
    setProducts(newProducts);
    save("wrixty_products", newProducts);
  };
  const updateProduct = (id: string, updated: Partial<Product>) => {
    const newProducts = products.map(p => p.id === id ? { ...p, ...updated } : p);
    setProducts(newProducts);
    save("wrixty_products", newProducts);
  };
  const deleteProduct = (id: string) => {
    const newProducts = products.filter(p => p.id !== id);
    setProducts(newProducts);
    save("wrixty_products", newProducts);
  };

  // Status CRUD
  const addStatus = (s: Omit<Status, "id">) => {
    const newStatuses = [...statuses, { ...s, id: Date.now().toString() }];
    setStatuses(newStatuses);
    save("wrixty_statuses", newStatuses);
  };
  const updateStatus = (id: string, updated: Partial<Status>) => {
    const newStatuses = statuses.map(s => s.id === id ? { ...s, ...updated } : s);
    setStatuses(newStatuses);
    save("wrixty_statuses", newStatuses);
  };
  const deleteStatus = (id: string) => {
    const newStatuses = statuses.filter(s => s.id !== id);
    setStatuses(newStatuses);
    save("wrixty_statuses", newStatuses);
  };

  // Team CRUD
  const addTeam = (t: Omit<Team, "id">) => {
    const newTeams = [...teams, { ...t, id: Date.now().toString() }];
    setTeams(newTeams);
    save("wrixty_teams", newTeams);
  };
  const updateTeam = (id: string, updated: Partial<Team>) => {
    const newTeams = teams.map(t => t.id === id ? { ...t, ...updated } : t);
    setTeams(newTeams);
    save("wrixty_teams", newTeams);
  };
  const deleteTeam = (id: string) => {
    const newTeams = teams.filter(t => t.id !== id);
    setTeams(newTeams);
    save("wrixty_teams", newTeams);
  };

  // User CRUD
  const addUser = (u: Omit<User, "id">) => {
    const newUsers = [...users, { ...u, id: Date.now().toString() }];
    setUsers(newUsers);
    save("wrixty_users", newUsers);
  };
  const updateUser = (id: string, updated: Partial<User>) => {
    const newUsers = users.map(u => u.id === id ? { ...u, ...updated } : u);
    setUsers(newUsers);
    save("wrixty_users", newUsers);
  };
  const deleteUser = (id: string) => {
    const newUsers = users.filter(u => u.id !== id);
    setUsers(newUsers);
    save("wrixty_users", newUsers);
  };

  // Lead CRUD
  const addLead = (l: Omit<Lead, "id" | "date" | "subtotal">) => {
    const newLeads = [
      ...leads,
      {
        ...l,
        id: Date.now().toString(),
        date: new Date().toISOString().split("T")[0],
        time: new Date().toTimeString().split(" ")[0].substring(0, 5),
        subtotal: l.amount * l.quantity
      }
    ];
    setLeads(newLeads);
    save("wrixty_leads", newLeads);
  };
  const updateLead = (id: string, updated: Partial<Lead>) => {
    const newLeads = leads.map(l => {
      if (l.id === id) {
        const merged = { ...l, ...updated };
        if (updated.amount !== undefined || updated.quantity !== undefined) {
          merged.subtotal = merged.amount * merged.quantity;
        }
        return merged;
      }
      return l;
    });
    setLeads(newLeads);
    save("wrixty_leads", newLeads);
  };
  const deleteLead = (id: string) => {
    const newLeads = leads.map(l => l.id === id ? { ...l, isDeleted: true, deleteDate: new Date().toISOString().split("T")[0] } : l);
    setLeads(newLeads);
    save("wrixty_leads", newLeads);
  };
  const restoreLead = (id: string) => {
    const newLeads = leads.map(l => l.id === id ? { ...l, isDeleted: false, deleteDate: undefined } : l);
    setLeads(newLeads);
    save("wrixty_leads", newLeads);
  };

  // Order Converted
  const convertToOrder = (leadId: string, details: { paymentType: "COD" | "Prepaid"; courier: string; transactionId: string; discountType?: string }) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;
    
    // Update lead status
    const newLeads = leads.map(l => l.id === leadId ? { ...l, status: "Delivered" } : l);
    setLeads(newLeads);
    save("wrixty_leads", newLeads);

    // Calculate discount
    const discount = details.paymentType === "COD" ? 10 : 15; // standard example
    const discountAmt = (lead.subtotal * discount) / 100;
    const grandTotal = lead.subtotal - discountAmt;

    const newOrder: Order = {
      id: Date.now().toString(),
      leadId,
      name: lead.name,
      phone_number: lead.phone_number,
      product: lead.product,
      amount: lead.amount,
      quantity: lead.quantity,
      subtotal: lead.subtotal,
      grandTotal: grandTotal,
      date: new Date().toISOString().split("T")[0],
      paymentType: details.paymentType,
      courier: details.courier,
      assginTo: lead.assgin,
      transactionId: details.transactionId,
      status: "Dispatched"
    };

    const newOrders = [...orders, newOrder];
    setOrders(newOrders);
    save("wrixty_orders", newOrders);
  };
  
  const deleteOrder = (id: string) => {
    const newOrders = orders.filter(o => o.id !== id);
    setOrders(newOrders);
    save("wrixty_orders", newOrders);
  };

  const updateOrder = (id: string, updated: Partial<Order>) => {
    const newOrders = orders.map(o => o.id === id ? { ...o, ...updated } : o);
    setOrders(newOrders);
    save("wrixty_orders", newOrders);
  };

  const addOrder = (o: Omit<Order, "id">) => {
    const newOrders = [
      ...orders,
      {
        ...o,
        id: Date.now().toString(),
      }
    ];
    setOrders(newOrders);
    save("wrixty_orders", newOrders);
  };

  // Courier CRUD
  const addCourier = (c: Omit<Courier, "id">) => {
    const newCouriers = [...couriers, { ...c, id: Date.now().toString() }];
    setCouriers(newCouriers);
    save("wrixty_couriers", newCouriers);
  };
  const updateCourier = (id: string, updated: Partial<Courier>) => {
    const newCouriers = couriers.map(c => c.id === id ? { ...c, ...updated } : c);
    setCouriers(newCouriers);
    save("wrixty_couriers", newCouriers);
  };
  const deleteCourier = (id: string) => {
    const newCouriers = couriers.filter(c => c.id !== id);
    setCouriers(newCouriers);
    save("wrixty_couriers", newCouriers);
  };

  // Tasks CRUD
  const addTask = (t: Omit<Task, "id" | "date" | "status">) => {
    const newTasks = [
      ...tasks,
      {
        ...t,
        id: Date.now().toString(),
        date: new Date().toISOString().split("T")[0],
        status: "Pending" as const
      }
    ];
    setTasks(newTasks);
    save("wrixty_tasks", newTasks);
  };
  const toggleTask = (id: string) => {
    const newTasks = tasks.map(t => t.id === id ? { ...t, status: (t.status === "Pending" ? "Completed" : "Pending") as any } : t);
    setTasks(newTasks);
    save("wrixty_tasks", newTasks);
  };
  const deleteTask = (id: string) => {
    const newTasks = tasks.filter(t => t.id !== id);
    setTasks(newTasks);
    save("wrixty_tasks", newTasks);
  };

  // Reminders CRUD
  const addReminder = (r: Omit<Reminder, "id">) => {
    const newReminders = [...reminders, { ...r, id: Date.now().toString() }];
    setReminders(newReminders);
    save("wrixty_reminders", newReminders);
  };
  const deleteReminder = (id: string) => {
    const newReminders = reminders.filter(r => r.id !== id);
    setReminders(newReminders);
    save("wrixty_reminders", newReminders);
  };

  // Return Orders CRUD
  const addReturnOrder = (r: Omit<ReturnOrder, "id">) => {
    const newReturnOrders = [...returnOrders, { ...r, id: Date.now().toString() }];
    setReturnOrders(newReturnOrders);
    save("wrixty_return_orders", newReturnOrders);
  };
  const deleteReturnOrder = (id: string) => {
    const newReturnOrders = returnOrders.filter(r => r.id !== id);
    setReturnOrders(newReturnOrders);
    save("wrixty_return_orders", newReturnOrders);
  };

  return (
    <MockDbContext.Provider
      value={{
        products,
        statuses,
        teams,
        users,
        leads,
        orders,
        couriers,
        tasks,
        reminders,
        returnOrders,
        addProduct,
        updateProduct,
        deleteProduct,
        addStatus,
        updateStatus,
        deleteStatus,
        addTeam,
        updateTeam,
        deleteTeam,
        addUser,
        updateUser,
        deleteUser,
        addLead,
        updateLead,
        deleteLead,
        restoreLead,
        convertToOrder,
        deleteOrder,
        updateOrder,
        addOrder,
        addCourier,
        updateCourier,
        deleteCourier,
        addTask,
        toggleTask,
        deleteTask,
        addReminder,
        deleteReminder,
        addReturnOrder,
        deleteReturnOrder
      }}
    >
      {children}
    </MockDbContext.Provider>
  );
};

export const useMockDb = () => {
  const context = useContext(MockDbContext);
  if (!context) {
    throw new Error("useMockDb must be used within a MockDbProvider");
  }
  return context;
};
