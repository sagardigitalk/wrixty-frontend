"use client";

import React, { useState } from "react";
import { useMockDb } from "../../context/MockDbContext";

export default function KanbanListPage() {
  const { leads, statuses, updateLead } = useMockDb();

  const activeLeads = React.useMemo(() => leads.filter(l => !l.isDeleted), [leads]);

  // Drag and Drop State
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    setDraggedLeadId(id);
    e.dataTransfer.effectAllowed = "move";
    // Optional: set drag image or data
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, statusName: string) => {
    e.preventDefault();
    if (draggedLeadId) {
      updateLead(draggedLeadId, { status: statusName });
    }
    setDraggedLeadId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="space-y-1">
        <h2 className="text-xl font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-50">
          Kanban Board
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">
          Quickly advance leads across stages visually via Drag & Drop
        </p>
      </div>

      {/* Board Scrollable container */}
      <div className="flex gap-4 overflow-x-auto pb-4 items-start select-none">
        {statuses.map((stage) => {
          const stageLeads = activeLeads.filter(l => l.status === stage.name);
          return (
            <div
              key={stage.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.name)}
              className="w-72 shrink-0 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-md p-4 space-y-4 shadow-sm"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    {stage.name}
                  </h4>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-zinc-50 dark:bg-zinc-900 text-zinc-500 rounded border border-zinc-200 dark:border-zinc-800">
                  {stageLeads.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="space-y-3 min-h-[150px] max-h-[70vh] overflow-y-auto pr-1">
                {stageLeads.length > 0 ? (
                  stageLeads.map((lead) => (
                    <div
                      key={lead.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead.id)}
                      className={`group relative p-3.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/80 rounded-md shadow-sm text-left transition-all cursor-grab active:cursor-grabbing hover:shadow-md hover:border-indigo-300/50 dark:hover:border-indigo-500/50 ${draggedLeadId === lead.id ? 'opacity-50 border-dashed' : ''}`}
                    >
                      {/* Default Visible Content */}
                      <div>
                        <h5 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wide">
                          {lead.name}
                        </h5>
                        <p className="text-[10px] text-zinc-500 font-semibold">
                          📞 {lead.phone_number}
                        </p>
                      </div>

                      {/* Hover Expanded Content */}
                      <div className="hidden group-hover:block pt-3 mt-3 space-y-2.5 border-t border-zinc-200 dark:border-zinc-800 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] px-1.5 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold rounded">
                            {lead.product}
                          </span>
                          <span className="text-[10px] font-black text-zinc-700 dark:text-zinc-300">
                            ₹{lead.subtotal}
                          </span>
                        </div>

                        {lead.note && (
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 line-clamp-3 bg-zinc-100 dark:bg-zinc-800/50 p-2 rounded">
                            {lead.note}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between text-[9px] font-semibold text-zinc-400 uppercase tracking-wider">
                          <span>Qty: {lead.quantity}</span>
                          <span>{lead.date}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full min-h-[100px] border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-md bg-zinc-50/50 dark:bg-zinc-900/50 text-[10px] text-zinc-400 dark:text-zinc-600 font-medium tracking-wide">
                    Drop leads here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
