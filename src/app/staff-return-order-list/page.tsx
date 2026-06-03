"use client";

import React, { useState, useEffect } from "react";
import { CalendarToday } from "@mui/icons-material";
import { Table, Column } from "../../components/common/Table";
import { fetchStaffReturnStats } from "../../services/returnOrderService";
import { DateRangePicker } from "../../components/common/DateRangePicker";

interface StaffStat {
  id: string;
  name: string;
  date?: string;
  returns: number;
}

export default function StaffReturnOrderListPage() {
  const [staffStats, setStaffStats] = useState<StaffStat[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getTodayString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const [startDate, setStartDate] = useState<string | null>(getTodayString());
  const [endDate, setEndDate] = useState<string | null>(getTodayString());

  const loadData = async (overrideDates?: { start: string | null, end: string | null }) => {
    setIsLoading(true);
    try {
      const startToUse = overrideDates !== undefined ? overrideDates.start : startDate;
      const endToUse = overrideDates !== undefined ? overrideDates.end : endDate;

      const res = await fetchStaffReturnStats({
        startDate: startToUse || undefined,
        endDate: endToUse || undefined
      });
      // The API returns an array directly because it returns res.status(200).json(stats)
      // apiGet in api.ts returns the axios response, so res.data is the array
      const stats = Array.isArray(res?.data) ? res.data : (res?.data?.data || []);
      setStaffStats(stats);
    } catch(err) {
      console.error("Failed to fetch staff return order stats", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const columns: Column<StaffStat>[] = [
    { key: "id", header: "No", render: (_, __, i) => i + 1, sortable: false },
    { 
      key: "date" as any, 
      header: "Return Order Date", 
      render: (_, row) => {
        if (!row.date) return "-";
        const d = new Date(row.date);
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear()).slice(-2)}`;
      } 
    },
    { key: "name", header: "Staff Name", render: (val) => <span className="uppercase">{val}</span> },
    { key: "returns", header: "Return Order" },
  ];

  return (
    <div className="space-y-6">
      {/* White Card Container */}
      <div className="bg-white p-6 border border-zinc-200 rounded-lg shadow-sm space-y-6">
        
        {/* Header and Date Range */}
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
          <h2 className="text-xl font-bold text-zinc-800">
            Return Order Report List
          </h2>
          <div className="flex flex-col gap-1">
             <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Return Order Date :</span>
             <DateRangePicker 
               startDate={startDate} 
               endDate={endDate} 
               onChange={(start, end) => {
                 setStartDate(start);
                 setEndDate(end);
                 loadData({ start, end });
               }} 
             />
          </div>
        </div>

        <Table data={staffStats} columns={columns} selectable={false} isLoading={isLoading} />
      </div>
    </div>
  );
}
