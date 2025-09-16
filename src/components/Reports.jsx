import React, { useState } from "react";
// For file export
import * as XLSX from "xlsx";

const Reports = () => {
  const [reports, setReports] = useState([
    { id: 1, name: "Joan Dyer", department: "Web Development", status: "Present", date: "2025-09-01" },
    { id: 2, name: "Ryan Randall", department: "Accounts", status: "Leave", date: "2025-09-01" },
    { id: 3, name: "Phil Glover", department: "Support", status: "Present", date: "2025-09-01" },
    { id: 4, name: "Victor Rampling", department: "App Development", status: "Absent", date: "2025-09-01" },
    { id: 5, name: "Sally Graham", department: "Recruiter", status: "Present", date: "2025-09-01" },
  ]);

  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const filtered = reports.filter((r) => {
    return (
      r.name.toLowerCase().includes(search.toLowerCase()) &&
      (filterDept === "All" || r.department === filterDept) &&
      (filterStatus === "All" || r.status === filterStatus)
    );
  });

  // Export to Excel
  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filtered);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reports");
    XLSX.writeFile(workbook, "Reports.xlsx");
  };

  // Export to CSV
  const exportCSV = () => {
    const worksheet = XLSX.utils.json_to_sheet(filtered);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Reports.csv";
    a.click();
  };

  // Export to PDF (simple print to PDF)
  const exportPDF = () => {
    window.print();
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Reports</h1>
        <div className="flex gap-2">
          <button
            className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700"
            onClick={exportExcel}
          >
            Export Excel
          </button>
          <button
            className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
            onClick={exportCSV}
          >
            Export CSV
          </button>
          <button
            className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700"
            onClick={exportPDF}
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Search Employee..."
          className="border rounded p-2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border rounded p-2"
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
        >
          <option value="All">All Departments</option>
          <option value="Web Development">Web Development</option>
          <option value="Accounts">Accounts</option>
          <option value="Support">Support</option>
          <option value="App Development">App Development</option>
          <option value="Recruiter">Recruiter</option>
        </select>

        <select
          className="border rounded p-2"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="All">All Status</option>
          <option value="Present">Present</option>
          <option value="Leave">Leave</option>
          <option value="Absent">Absent</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow rounded">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b bg-gray-100">
              <th className="p-2">#</th>
              <th className="p-2">Employee</th>
              <th className="p-2">Department</th>
              <th className="p-2">Status</th>
              <th className="p-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={r.id} className="border-b">
                <td className="p-2">{i + 1}</td>
                <td className="p-2 font-semibold">{r.name}</td>
                <td className="p-2">{r.department}</td>
                <td
                  className={`p-2 font-bold ${
                    r.status === "Present"
                      ? "text-green-600"
                      : r.status === "Leave"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {r.status}
                </td>
                <td className="p-2">{r.date}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center p-4">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;
