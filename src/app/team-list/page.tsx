"use client";

import React, { useState } from "react";
import { useMockDb, Team } from "../../context/MockDbContext";
import { Table, Column } from "../../components/common/Table";
import { Delete, Add, Edit } from "@mui/icons-material";
import { Modal } from "../../components/common/Modal";
import { Input } from "../../components/common/Input";
import { Select } from "../../components/common/Select";

export default function TeamListPage() {
  const { teams, users, addTeam, updateTeam, deleteTeam } = useMockDb();

  const [modalOpen, setModalOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);

  const [name, setName] = useState("");
  const [head, setHead] = useState("");
  const [members, setMembers] = useState<string[]>([]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    addTeam({
      name,
      head: head || users[0]?.name || "",
      member: members
    });
    setModalOpen(false);
    clear();
  };

  const openEdit = (team: Team) => {
    setActiveTeam(team);
    setName(team.name);
    setHead(team.head);
    setMembers(team.member);
    setEditOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTeam) return;
    updateTeam(activeTeam.id, {
      name,
      head,
      member: members
    });
    setEditOpen(false);
    clear();
  };

  const clear = () => {
    setName("");
    setHead("");
    setMembers([]);
  };

  const columns: Column<Team>[] = [
    { key: "id", header: "No", render: (_, __, i) => i + 1, sortable: false },
    { key: "name", header: "Team Name" },
    { key: "head", header: "Team Head" },
    { key: "member", header: "Members Count", render: (val) => val.length },
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
            onClick={() => deleteTeam(row.id)}
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
            Teams List
          </h2>
          <p className="text-xs text-zinc-500  font-semibold uppercase tracking-wider">
            Group agents under regional or target teams
          </p>
        </div>
        <button
          onClick={() => {
            clear();
            setModalOpen(true);
          }}
          className="flex items-center gap-1 py-1.5 px-3.5 bg-primary-teal hover:bg-primary-teal text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition-all"
        >
          <Add className="w-4 h-4" /> Create Team
        </button>
      </div>

      <Table data={teams} columns={columns} />

      {/* Add Team Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Sales Team">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Team Name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. West Coast Sales" />
          <Select
            label="Select Team Head"
            value={head}
            onChange={(e) => setHead(e.target.value)}
            options={users.map(u => ({ value: u.name, label: u.name }))}
          />
          <div className="space-y-2">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Select Team Members</span>
            <div className="grid grid-cols-2 gap-2 bg-zinc-50  border border-zinc-200  p-3 rounded-lg">
              {users.map(u => (
                <label key={u.id} className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={members.includes(u.name)}
                    onChange={(e) => {
                      if (e.target.checked) setMembers([...members, u.name]);
                      else setMembers(members.filter(m => m !== u.name));
                    }}
                    className="w-4 h-4 text-primary-teal rounded-lg"
                  />
                  {u.name}
                </label>
              ))}
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-primary-teal hover:bg-primary-teal text-white font-bold uppercase tracking-wider text-xs rounded-lg shadow transition-all"
          >
            Register Team
          </button>
        </form>
      </Modal>

      {/* Edit Team Modal */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Team Setup">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input label="Team Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Select
            label="Select Team Head"
            value={head}
            onChange={(e) => setHead(e.target.value)}
            options={users.map(u => ({ value: u.name, label: u.name }))}
          />
          <div className="space-y-2">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Select Team Members</span>
            <div className="grid grid-cols-2 gap-2 bg-zinc-50  border border-zinc-200  p-3 rounded-lg">
              {users.map(u => (
                <label key={u.id} className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={members.includes(u.name)}
                    onChange={(e) => {
                      if (e.target.checked) setMembers([...members, u.name]);
                      else setMembers(members.filter(m => m !== u.name));
                    }}
                    className="w-4 h-4 text-primary-teal rounded-lg"
                  />
                  {u.name}
                </label>
              ))}
            </div>
          </div>
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
