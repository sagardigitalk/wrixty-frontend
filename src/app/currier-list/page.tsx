"use client";

import React, { useState } from "react";
import { useMockDb, Courier } from "../../context/MockDbContext";
import { Table, Column } from "../../components/common/Table";
import { Delete, Add, Edit } from "@mui/icons-material";
import { Modal } from "../../components/common/Modal";
import { Input } from "../../components/common/Input";

export default function CourierListPage() {
  const { couriers, addCourier, updateCourier, deleteCourier } = useMockDb();

  const [modalOpen, setModalOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [activeCourier, setActiveCourier] = useState<Courier | null>(null);
  const [name, setName] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    addCourier({ name });
    setModalOpen(false);
    setName("");
  };

  const openEdit = (courier: Courier) => {
    setActiveCourier(courier);
    setName(courier.name);
    setEditOpen(true);
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCourier) return;
    updateCourier(activeCourier.id, { name });
    setEditOpen(false);
    setName("");
  };

  const columns: Column<Courier>[] = [
    { key: "id", header: "No", render: (_, __, i) => i + 1, sortable: false },
    { key: "name", header: "Name" },
    {
      key: "actions",
      header: "Action",
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => openEdit(row)}
            className="p-1 hover:bg-zinc-100  text-zinc-400 hover:text-primary-teal rounded-lg transition-all"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => deleteCourier(row.id)}
            className="p-1 hover:bg-zinc-100  text-zinc-400 hover:text-red-500 rounded-lg transition-all"
          >
            <Delete className="w-4 h-4" />
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
          <h2 className="text-xl font-black uppercase tracking-wider text-zinc-900 ">
            Courier List
          </h2>
          <p className="text-xs text-zinc-500  font-semibold uppercase tracking-wider">
            Manage dispatch delivery partners
          </p>
        </div>
        <button
          onClick={() => {
            setName("");
            setModalOpen(true);
          }}
          className="flex items-center gap-1 py-1.5 px-3.5 bg-primary-teal hover:bg-primary-teal text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition-all"
        >
          <Add className="w-4 h-4" /> Add Courier
        </button>
      </div>

      <Table data={couriers} columns={columns} />

      {/* Add Courier Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Courier Partner">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Courier Name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. FedEx India" />
          <button
            type="submit"
            className="w-full py-2 bg-primary-teal hover:bg-primary-teal text-white font-bold uppercase tracking-wider text-xs rounded-lg shadow transition-all"
          >
            Register Courier
          </button>
        </form>
      </Modal>

      {/* Edit Courier Modal */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Courier Partner">
        <form onSubmit={handleEdit} className="space-y-4">
          <Input label="Courier Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <button
            type="submit"
            className="w-full py-2 bg-primary-teal hover:bg-primary-teal text-white font-bold uppercase tracking-wider text-xs rounded-lg shadow transition-all"
          >
            Save Changes
          </button>
        </form>
      </Modal>
    </div>
  );
}
