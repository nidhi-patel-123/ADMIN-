import React, { useState } from "react";
import { Download, Edit, Trash2, Plus, X } from "lucide-react";
import EmployeeAdd from "./EmployeeAdd"; // import add form

const initialEmployees = [
  {
    id: "EMP001",
    name: "Sarah Johnson",
    department: "Engineering",
    position: "Frontend Developer",
    status: "Active",
    joinDate: "May 1, 2023",
  },
  {
    id: "EMP004",
    name: "David Wilson",
    department: "Engineering",
    position: "Backend Developer",
    status: "Remote",
    joinDate: "April 5, 2023",
  },
];

export default function EmployeeList() {
  const [employees, setEmployees] = useState(initialEmployees);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All");
  const [status, setStatus] = useState("All");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);

  // Add Employee toggle
  const [showAddForm, setShowAddForm] = useState(false);

  const handleDelete = (id) => {
    setEmployees(employees.filter((emp) => emp.id !== id));
  };

  const handleExport = () => {
    const csv = [
      ["Employee", "ID", "Department", "Position", "Status", "Join Date"],
      ...employees.map((emp) => [
        emp.name,
        emp.id,
        emp.department,
        emp.position,
        emp.status,
        emp.joinDate,
      ]),
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "employees.csv";
    link.click();
  };

  const handleEditClick = (emp) => {
    setEditEmployee(emp);
    setShowModal(true);
  };

  const handleSave = () => {
    setEmployees(
      employees.map((emp) =>
        emp.id === editEmployee.id ? editEmployee : emp
      )
    );
    setShowModal(false);
  };

  const filteredEmployees = employees.filter((emp) => {
    return (
      emp.name.toLowerCase().includes(search.toLowerCase()) &&
      (department === "All" || emp.department === department) &&
      (status === "All" || emp.status === status)
    );
  });

  return (
    <div className="p-6 bg-white shadow rounded-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Employee Directory</h2>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300"
          >
            <Download size={18} /> Export
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus size={18} /> {showAddForm ? "Close Form" : "Add Employee"}
          </button>
        </div>
      </div>

      {/* Show Add Employee Form */}
      {showAddForm && (
        <EmployeeAdd employees={employees} setEmployees={setEmployees} />
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search employees..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm w-64"
        />
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="All">All Departments</option>
          {[...new Set(employees.map((e) => e.department))].map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Remote">Remote</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Employee</th>
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Department</th>
              <th className="p-2 border">Position</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Join Date</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((emp) => (
              <tr key={emp.id} className="text-center">
                <td className="p-2 border flex items-center gap-2">
                  {/* <img
                    src={emp.avatar}
                    alt={emp.name}
                    className="w-8 h-8 rounded-full"
                  /> */}
                  {emp.name}
                </td>
                <td className="p-2 border">{emp.id}</td>
                <td className="p-2 border">{emp.department}</td>
                <td className="p-2 border">{emp.position || emp.role}</td>
                <td className="p-2 border">
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      emp.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {emp.status}
                  </span>
                </td>
                <td className="p-2 border">{emp.joinDate || emp.joiningDate}</td>
                <td className="p-2 border flex justify-center gap-2">
                  <button
                    className="text-blue-600 hover:text-blue-800"
                    onClick={() => handleEditClick(emp)}
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(emp.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredEmployees.length === 0 && (
          <p className="text-center py-6 text-gray-500">No employees found.</p>
        )}
      </div>

      {/* Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Employee</h3>
              <button onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                value={editEmployee.name}
                onChange={(e) =>
                  setEditEmployee({ ...editEmployee, name: e.target.value })
                }
                className="border rounded-lg px-3 py-2 w-full"
              />
              <input
                type="text"
                value={editEmployee.position}
                onChange={(e) =>
                  setEditEmployee({ ...editEmployee, position: e.target.value })
                }
                className="border rounded-lg px-3 py-2 w-full"
              />
              <select
                value={editEmployee.department}
                onChange={(e) =>
                  setEditEmployee({ ...editEmployee, department: e.target.value })
                }
                className="border rounded-lg px-3 py-2 w-full"
              >
                <option>Engineering</option>
                <option>HR</option>
                <option>Marketing</option>
                <option>Finance</option>
              </select>
              <select
                value={editEmployee.status}
                onChange={(e) =>
                  setEditEmployee({ ...editEmployee, status: e.target.value })
                }
                className="border rounded-lg px-3 py-2 w-full"
              >
                <option value="Active">Active</option>
                <option value="Remote">Remote</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded-lg"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                onClick={handleSave}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
