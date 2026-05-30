"use client";

import React, { useState } from "react";
import { useMockDb, User } from "../../context/MockDbContext";
import { Table, Column } from "../../components/common/Table";
import { Delete, Add, Edit, SyncAlt } from "@mui/icons-material";
import { Modal } from "../../components/common/Modal";
import { Input } from "../../components/common/Input";
import { Select } from "../../components/common/Select";
import { Button } from "../../components/common/Button";
import { useRouter } from "next/navigation";

export default function UsersPage() {
  const { users, addUser, updateUser, deleteUser } = useMockDb();
  const router = useRouter();

  const [modalOpen, setModalOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [activeUser, setActiveUser] = useState<User | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [companyNo, setCompanyNo] = useState("");
  const [aadhar, setAadhar] = useState("");
  const [bankNo, setBankNo] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Agent");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    addUser({
      name,
      email,
      mobile_number: mobile,
      company_number: companyNo,
      aadhar_card: aadhar,
      bank_number: bankNo,
      roles: [role]
    });
    setModalOpen(false);
    clear();
  };

  const openEdit = (user: User) => {
    setActiveUser(user);
    setName(user.name);
    setEmail(user.email);
    setMobile(user.mobile_number);
    setCompanyNo(user.company_number);
    setAadhar(user.aadhar_card);
    setBankNo(user.bank_number);
    setRole(user.roles[0] || "Agent");
    setEditOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUser) return;
    updateUser(activeUser.id, {
      name,
      email,
      mobile_number: mobile,
      company_number: companyNo,
      aadhar_card: aadhar,
      bank_number: bankNo,
      roles: [role]
    });
    setEditOpen(false);
    clear();
  };

  const handleLoginAs = (user: User) => {
    localStorage.setItem("wrixty_authenticated", "true");
    localStorage.setItem("wrixty_authenticated_user", JSON.stringify({
      name: user.name,
      email: user.email,
      roles: user.roles
    }));
    // Redirecting via window.location to ensure layout re-renders with new auth context
    window.location.href = "/dashboard";
  };

  const clear = () => {
    setName("");
    setEmail("");
    setMobile("");
    setCompanyNo("");
    setAadhar("");
    setBankNo("");
    setPassword("");
    setRole("Agent");
  };

  const columns: Column<User>[] = [
    { key: "id", header: "No", render: (_, __, i) => i + 1, sortable: false },
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    { key: "company_number", header: "Company No" },
    { key: "roles", header: "Role", render: (val) => val.join(", ") },
    {
      key: "actions",
      header: "Action",
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => openEdit(row)}
            className="p-1.5 bg-green-600 hover:bg-green-500 text-white rounded transition-all shadow-sm"
            title="Edit User"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleLoginAs(row)}
            className="p-1.5 bg-teal-800 hover:bg-teal-700 text-white rounded transition-all shadow-sm"
            title="Login As This User"
          >
            <SyncAlt className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => deleteUser(row.id)}
            className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-red-500 hover:text-red-600 rounded transition-all ml-2"
            title="Delete User"
          >
            <Delete className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-50">
            Users & Staff
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">
            Manage call agents, managers, and bank details
          </p>
        </div>
        <button
          onClick={() => {
            clear();
            setModalOpen(true);
          }}
          className="flex items-center gap-1 py-1.5 px-3.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-md shadow-sm transition-all"
        >
          <Add className="w-4 h-4" /> Add User
        </button>
      </div>

      <Table data={users} columns={columns} />

      {/* Add User Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add User" sizeClass="max-w-4xl">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* Left Column */}
            <div className="space-y-4">
              <Input label="Name" placeholder="Enter Name" value={name} onChange={(e) => setName(e.target.value)} required />
              <Input label="Mobile Number" placeholder="Enter Mobile Number" value={mobile} onChange={(e) => setMobile(e.target.value)} required />
              <Input label="Aadhar Card" placeholder="Enter Aadhar Card" value={aadhar} onChange={(e) => setAadhar(e.target.value)} required />
              <Input label="Bank Number" placeholder="Enter Bank Number" value={bankNo} onChange={(e) => setBankNo(e.target.value)} required />
              <Input label="Confirm Password" placeholder="Enter Confirm Password" type="password" required />
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <Input label="Email" placeholder="Enter Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Input label="Company Number" placeholder="Enter Company Number" value={companyNo} onChange={(e) => setCompanyNo(e.target.value)} required />
              
              {/* Check Photo File Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                  Check Photo
                </label>
                <div className="flex items-center">
                  <label className="flex items-center justify-center px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-l cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-xs text-zinc-700 dark:text-zinc-300 border-r-0">
                    Choose File
                    <input type="file" className="hidden" />
                  </label>
                  <div className="flex-1 px-3 py-2 text-xs text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-r border-l-0">
                    No file chosen
                  </div>
                </div>
              </div>

              <Input label="Password" placeholder="Enter Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <Select
                label="Role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                options={[
                  { value: "Admin", label: "Admin" },
                  { value: "Staff", label: "Staff" }
                ]}
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              className="bg-teal-800 hover:bg-teal-700 focus:ring-teal-800 px-8"
            >
              Save
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit User Details">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Mobile Number" value={mobile} onChange={(e) => setMobile(e.target.value)} required />
            <Input label="Company Emp ID" value={companyNo} onChange={(e) => setCompanyNo(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Aadhar Card" value={aadhar} onChange={(e) => setAadhar(e.target.value)} required />
            <Input label="Bank A/C Number" value={bankNo} onChange={(e) => setBankNo(e.target.value)} required />
          </div>
          <Select
            label="Assigned Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            options={[
              { value: "Agent", label: "Sales Agent" },
              { value: "Manager", label: "Manager" },
              { value: "Superadmin", label: "Super Admin Owner" }
            ]}
          />
          <button
            type="submit"
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold uppercase tracking-wider text-xs rounded-md shadow transition-all"
          >
            Save Changes
          </button>
        </form>
      </Modal>
    </div>
  );
}
