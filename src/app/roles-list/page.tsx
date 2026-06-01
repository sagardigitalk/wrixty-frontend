"use client";

import React, { useState } from "react";
import { Table, Column } from "../../components/common/Table";
import { 
  Shield, 
  Settings, 
  Group, 
  AdminPanelSettings, 
  Person, 
  SupervisorAccount,
  Add,
  Save,
  CheckCircle,
  RadioButtonUnchecked,
  Delete,
  Edit
} from "@mui/icons-material";
import { Modal } from "../../components/common/Modal";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";

interface Role {
  id: string;
  name: string;
  permissions: Record<string, boolean>;
}

const MODULE_PERMISSIONS = [
  { module: "Users List", perms: ["User-add", "User-list", "User-edit", "User-delete"] },
  { module: "Team List", perms: ["Team-add", "Team-list", "Team-edit", "Team-delete"] },
  { module: "Roles List", perms: ["Roles-add", "Roles-list", "Roles-edit", "Roles-delete"] },
  { module: "Lead List", perms: ["Lead-add", "Lead-transfer", "Lead-list", "Lead-edit", "Lead-delete"] },
  { module: "Order List", perms: ["Order-edit", "Order-delete", "Repart-order"] },
  { module: "Activity-Log", perms: ["Activity-log"] },
  { module: "Lead-Try", perms: ["Lead-try"] },
  { module: "Reminder List", perms: ["Reminder-edit", "Reminder-list"] },
  { module: "Return Order List", perms: ["Return-order-list", "Return-order-add"] },
  { module: "Currier List", perms: ["Currier-add", "Currier-list", "Currier-edit", "Currier-delete"] },
];

export default function RolesListPage() {
  const [roles, setRoles] = useState<Role[]>([
    { id: "1", name: "Admin", permissions: {} },
    { id: "2", name: "Staff", permissions: {} },
    { id: "3", name: "Main Maneger", permissions: {} },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [activeRole, setActiveRole] = useState<Role | null>(null);

  const [name, setName] = useState("");
  const [selectedPerms, setSelectedPerms] = useState<Record<string, boolean>>({});

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setRoles([...roles, { id: Date.now().toString(), name, permissions: selectedPerms }]);
    setModalOpen(false);
    clear();
  };

  const openEdit = (role: Role) => {
    setActiveRole(role);
    setName(role.name);
    setSelectedPerms(role.permissions || {});
    setEditOpen(true);
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRole) return;
    setRoles(roles.map(r => r.id === activeRole.id ? { ...r, name, permissions: selectedPerms } : r));
    setEditOpen(false);
    clear();
  };

  const handleDelete = (id: string) => {
    setRoles(roles.filter(r => r.id !== id));
  };

  const clear = () => {
    setName("");
    setSelectedPerms({});
  };

  const togglePerm = (perm: string) => {
    setSelectedPerms(prev => ({
      ...prev,
      [perm]: !prev[perm]
    }));
  };

  const columns: Column<Role>[] = [
    { key: "id", header: "No", render: (_, __, i) => i + 1, sortable: false },
    {
      key: "name",
      header: "Role Name",
      render: (val) => (
        <div className="flex items-center gap-2">
          {val === "Admin" ? <AdminPanelSettings className="text-primary-teal w-4 h-4" /> : 
           val === "Main Maneger" ? <SupervisorAccount className="text-primary-teal w-4 h-4" /> :
           <Person className="text-primary-teal w-4 h-4" />}
          <span className="font-bold uppercase tracking-wide">{val}</span>
        </div>
      )
    },
    {
      key: "actions",
      header: "Action",
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => openEdit(row)}
            className="p-1.5 bg-primary-teal hover:bg-primary-teal text-white rounded-lg transition-all shadow-sm"
            title="Edit Role"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1.5 bg-rose-500 hover:bg-rose-400 text-white rounded-lg transition-all shadow-sm"
            title="Delete Role"
          >
            <Delete className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }
  ];

  const renderPermissionsTable = () => (
    <div className="mt-6 border border-zinc-200  rounded-lg overflow-hidden bg-white ">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-zinc-200  font-semibold text-zinc-600 ">
            <th className="p-4 w-1/4">Module</th>
            <th className="p-4 w-3/4">Permissions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 ">
          {MODULE_PERMISSIONS.map((mod, i) => (
            <tr key={i} className="hover:bg-zinc-50 ">
              <td className="p-4 font-semibold text-zinc-800  align-top">
                {mod.module}
              </td>
              <td className="p-4">
                <div className="flex flex-wrap gap-x-8 gap-y-3">
                  {mod.perms.map(perm => (
                    <label key={perm} className="flex items-center gap-2 cursor-pointer font-medium text-zinc-600  min-w-[120px]">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={!!selectedPerms[perm]}
                          onChange={() => togglePerm(perm)}
                          className="peer h-4 w-4 opacity-0 absolute cursor-pointer"
                        />
                        <div className="h-4 w-4 border border-zinc-300 rounded flex items-center justify-center peer-checked:bg-primary-teal peer-checked:border-primary-teal transition-all">
                          <CheckCircle className="text-white hidden peer-checked:block" style={{ fontSize: 12 }} />
                          <RadioButtonUnchecked className="text-zinc-300 block peer-checked:hidden" style={{ fontSize: 12 }} />
                        </div>
                      </div>
                      <span className="text-xs uppercase tracking-tight">{perm}</span>
                    </label>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6">
          <h2 className="text-xl font-bold text-zinc-800 ">
            Roles List
          </h2>
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => { 
                clear();
                setModalOpen(true); 
              }} 
              variant="primary"
            >
              Add Role
            </Button>
          </div>
        </div>

        {/* Table Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4">
          <div className="flex items-center gap-1.5">
            <Button variant="primary" size="sm" className="px-3 text-xs">Copy</Button>
            <Button variant="primary" size="sm" className="px-3 text-xs">Excel</Button>
            <Button variant="primary" size="sm" className="px-3 text-xs">CSV</Button>
            <Button variant="primary" size="sm" className="px-3 text-xs">PDF</Button>
          </div>
          <div className="text-xs text-zinc-500 flex items-center gap-1.5 font-medium">
            Search:
            <input
              type="text"
              placeholder=""
              className="bg-zinc-50  border border-zinc-200  rounded-lg py-1.5 px-2 text-xs focus:ring-1 focus:ring-primary-teal outline-none"
            />
          </div>
        </div>

        <Table data={roles} columns={columns} searchable={false} />
      </div>

      {/* Add Role Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Role" sizeClass="max-w-5xl">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Enter Name" />
          
          <h4 className="font-bold text-zinc-800  pt-4">Assign Permissions to Roles</h4>
          {renderPermissionsTable()}
          
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              variant="primary"
              className="px-8"
            >
              Save
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Role Modal */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Role" sizeClass="max-w-5xl">
        <form onSubmit={handleEdit} className="space-y-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Enter Name" />
          
          <h4 className="font-bold text-zinc-800  pt-4">Assign Permissions to Roles</h4>
          {renderPermissionsTable()}

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              variant="primary"
              className="px-8"
            >
              Save
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
