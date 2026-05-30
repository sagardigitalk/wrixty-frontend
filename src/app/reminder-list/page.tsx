"use client";

import React, { useState } from "react";
import { useMockDb, Reminder } from "../../context/MockDbContext";
import { Table, Column } from "../../components/common/Table";
import { Delete } from "@mui/icons-material";
import { useToast } from "../../context/ToastContext";
import { Button } from "../../components/common/Button";

export default function ReminderListPage() {
  const { reminders, deleteReminder } = useMockDb();
  const toast = useToast();

  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    await new Promise(res => setTimeout(res, 500));
    deleteReminder(id);
    toast.warning("Reminder deleted.");
    setIsDeleting(null);
  };

  const columns: Column<Reminder>[] = [
    { key: "id", header: "No", render: (_, __, i) => i + 1, sortable: false },
    { key: "title", header: "Title", render: (val) => val || "Reminder Lead Not Available" },
    { key: "name", header: "Assign To", render: (val) => val || "N/A" },
    { key: "phone_number", header: "Phone Number" },
    { key: "reminderDate", header: "Reminder Date" },
    {
      key: "actions",
      header: "Action",
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          <Button
            variant="danger"
            size="sm"
            className="p-1.5"
            onClick={() => handleDelete(row.id)}
            isLoading={isDeleting === row.id}
            title="Delete Reminder"
          >
            {isDeleting !== row.id && <Delete className="w-3.5 h-3.5" />}
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-zinc-950 p-6 border border-zinc-200 dark:border-zinc-900 rounded-md shadow-sm space-y-6">
        
        {/* Header and Date Range */}
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-4">
          <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">
            Reminder List
          </h2>
          <span className="text-xs font-semibold text-zinc-500 bg-zinc-100 dark:bg-zinc-900 px-3 py-2 rounded border border-zinc-200/50 dark:border-zinc-800">
            📅 May 30, 2026 - May 30, 2026
          </span>
        </div>

        {/* Table Element */}
        <Table data={reminders} columns={columns} selectable={false} />
      </div>
    </div>
  );
}
