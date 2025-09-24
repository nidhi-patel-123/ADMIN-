import React, { useState, useEffect } from "react";
import { Download, Plus, Trash2, X } from "lucide-react";
import axios from "axios";

export default function LeaveRequest() {
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filter, setFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedLeaveId, setSelectedLeaveId] = useState(null);
  const [form, setForm] = useState({
    employee: "",
    type: "",
    from: "",
    to: "",
    days: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/admin/employees`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEmployees(response.data);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
      setError("Failed to fetch employees");
    }
  };

  // Fetch leaves
  const fetchLeaves = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/admin/leaves`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLeaves(response.data);
    } catch (err) {
      console.error("Failed to fetch leaves:", err);
      setError("Failed to fetch leaves");
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchEmployees();
    fetchLeaves();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/admin/leaves`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLeaves([response.data, ...leaves]);
      setForm({
        employee: "",
        type: "",
        from: "",
        to: "",
        days: "",
        description: "",
      });
      setShowForm(false);
    } catch (err) {
      console.error("Failed to create leave:", err);
      setError("Failed to create leave request");
    } finally {
      setLoading(false);
    }
  };

  // Handle status change
  const handleStatusChange = async (id, newStatus, reason = "") => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/admin/leaves/${id}/status`,
        { status: newStatus, rejectReason: reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLeaves(
        leaves.map((leave) => (leave._id === id ? response.data : leave))
      );
      if (newStatus === "Rejected") {
        setShowRejectModal(false);
        setRejectReason("");
        setSelectedLeaveId(null);
      }
    } catch (err) {
      console.error("Failed to update leave status:", err);
      setError("Failed to update leave status");
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      const token = sessionStorage.getItem("token");
      await axios.delete(
        `${process.env.REACT_APP_BACKEND_URL}/admin/leaves/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLeaves(leaves.filter((leave) => leave._id !== id));
    } catch (err) {
      console.error("Failed to delete leave:", err);
      setError("Failed to delete leave");
    }
  };

  // Handle reject button click
  const handleRejectClick = (id) => {
    setSelectedLeaveId(id);
    setShowRejectModal(true);
  };

  // Handle reject form submission
  const handleRejectSubmit = (e) => {
    e.preventDefault();
    if (selectedLeaveId && rejectReason.trim()) {
      handleStatusChange(selectedLeaveId, "Rejected", rejectReason);
    }
  };

  const filteredLeaves =
    filter === "All" ? leaves : leaves.filter((l) => l.status === filter);

  return (
    <>
      <div className="p-6 bg-gray-100 min-h-screen font-sans">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-[#113a69]">
              Leave Management
            </h1>
          </div>
          <p className="text-gray-600">
            Review, approve, and manage employee leave requests and records.
          </p>
        </div>
        <div className="p-6 bg-white shadow rounded-lg">
          {/* Header */}
          {/* <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Leave Management</h2>
            <div className="flex gap-3">
              <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-[#113a69] text-white px-4 py-2 rounded-md hover:bg-[#1b5393]"
          >
            <Plus size={16} /> Add Leave
          </button>
            </div>
          </div> */}

          {/* Add Leave Form */}
          {showForm && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium mb-4">
                Add New Leave Request
              </h3>
              {error && <p className="text-red-600 mb-4">{error}</p>}
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employee *
                  </label>
                  <select
                    value={form.employee}
                    onChange={(e) =>
                      setForm({ ...form, employee: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#113a69] focus:border-transparent"
                    required
                    disabled={loading}
                  >
                    <option value="">Select Employee</option>
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.name} - {emp.role} (₹
                        {emp.basicSalary?.toLocaleString() || "0"})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Leave Type *
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#113a69] focus:border-transparent"
                    required
                    disabled={loading}
                  >
                    <option value="">Select Type</option>
                    {[
                      "Vacation",
                      "Sick Leave",
                      "Personal",
                      "Unpaid Leave",
                      "Casual Leave",
                      "Annual Leave",
                    ].map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From *
                  </label>
                  <input
                    type="date"
                    value={form.from}
                    onChange={(e) => setForm({ ...form, from: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#113a69] focus:border-transparent"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To *
                  </label>
                  <input
                    type="date"
                    value={form.to}
                    onChange={(e) => setForm({ ...form, to: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#113a69] focus:border-transparent"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <input
                    type="string"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#113a69] focus:border-transparent"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="col-span-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#113a69] text-white px-4 py-2 rounded-md hover:bg-[#1b5393]"
                    disabled={loading}
                  >
                    {loading ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Reject Reason Modal */}
          {showRejectModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Reject Leave Request</h3>
                  <button
                    onClick={() => {
                      setShowRejectModal(false);
                      setRejectReason("");
                      setSelectedLeaveId(null);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={handleRejectSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Rejection *
                    </label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#113a69] focus:border-transparent"
                      rows="4"
                      required
                      placeholder="Enter the reason for rejecting this leave request"
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowRejectModal(false);
                        setRejectReason("");
                        setSelectedLeaveId(null);
                      }}
                      className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                      disabled={!rejectReason.trim()}
                    >
                      Reject
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-4 border-b mb-6">
            {["All", "Pending", "Approved", "Rejected"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`pb-2 px-2 text-sm font-medium ${
                  filter === tab
                    ? "border-b-2 border-[#113a69] text-[#113a69]"
                    : "text-gray-600"
                }`}
              >
                {tab} Requests
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">Employee</th>
                  <th className="p-2 border">Leave Type</th>
                  <th className="p-2 border">From</th>
                  <th className="p-2 border">To</th>
                  <th className="p-2 border">Days</th>
                  <th className="p-2 border">Description</th>
                  <th className="p-2 border">Status</th>
                  <th className="p-2 border">Reject Reason</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeaves.map((leave) => (
                  <tr key={leave._id} className="text-center">
                    <td className="p-2 border">
                      {leave.employee?.name || "N/A"}
                    </td>
                    <td className="p-2 border">
                      <span
                        className={`px-3 py-1 rounded-full text-xs ${
                          leave.type === "Vacation"
                            ? "bg-green-100 text-green-700"
                            : leave.type === "Sick Leave"
                            ? "bg-red-100 text-red-700"
                            : leave.type === "Unpaid Leave"
                            ? "bg-blue-100 text-[#113a69]"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {leave.type}
                      </span>
                    </td>
                    <td className="p-2 border">
                      {new Date(leave.from).toLocaleDateString()}
                    </td>
                    <td className="p-2 border">
                      {new Date(leave.to).toLocaleDateString()}
                    </td>
                    <td className="p-2 border">{leave.days}</td>
                    <td className="p-2 border">{leave.description}</td>
                    <td className="p-2 border">
                      <span
                        className={`px-3 py-1 rounded-full text-xs ${
                          leave.status === "Approved"
                            ? "bg-green-100 text-green-700"
                            : leave.status === "Rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-100 text-[#113a69]"
                        }`}
                      >
                        {leave.status}
                      </span>
                    </td>
                    <td className="p-2 border">
                      {leave.rejectReason || "NO REASION"}
                    </td>
                    <td className="p-2 border flex justify-center gap-2">
                      {leave.status === "Pending" && (
                        <>
                          <button
                            onClick={() =>
                              handleStatusChange(leave._id, "Approved")
                            }
                            className="bg-green-100 text-green-800 px-3 py-1 rounded-md text-xs font-medium hover:bg-green-200"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectClick(leave._id)}
                            className="bg-red-100 text-red-800 px-3 py-1 rounded-md text-xs font-medium hover:bg-red-200"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(leave._id)}
                        className="bg-gray-100 text-gray-800 px-3 py-1 rounded-md text-xs font-medium hover:bg-gray-200"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredLeaves.length === 0 && (
              <p className="text-center py-6 text-gray-500">
                No leave requests.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
