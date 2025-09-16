import React, { useState, useEffect } from "react";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaTimes,
  FaUsers,
  FaBuilding,
  FaUserTie,
  FaSearch,
  FaFilter,
  FaSort,
  FaEye
} from 'react-icons/fa';
import { MdDashboard, MdPersonAdd } from 'react-icons/md';
import axios from "axios";

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [form, setForm] = useState({ id: null, head: "", name: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(8);

  // Filter and sort
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/admin/departments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDepartments(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch departments");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/admin/employees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(response.data);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
    }
  };

  const filtered = departments.filter(
    (d) =>
      d.head.toLowerCase().includes(search.toLowerCase()) ||
      d.name.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];

    if (sortBy === "employeeCount") {
      aVal = a.employeeCount || 0;
      bVal = b.employeeCount || 0;
    }

    if (sortOrder === "asc") {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const totalPages = Math.ceil(sorted.length / perPage);
  const data = sorted.slice((page - 1) * perPage, page * perPage);

  const handleAddOrUpdate = async () => {
    if (!form.head || !form.name) {
      setError("Department name and head are required");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = sessionStorage.getItem("token");
      let response;
      if (form.id) {
        response = await axios.put(
          `${process.env.REACT_APP_BACKEND_URL}/admin/departments/${form.id}`,
          { name: form.name, head: form.head },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess("Department updated successfully!");
      } else {
        response = await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}/admin/departments`,
          { name: form.name, head: form.head },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess("Department created successfully!");
      }
      fetchDepartments();
      setTimeout(() => {
        setShowModal(false);
        setForm({ id: null, head: "", name: "", description: "" });
        setSuccess("");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (dept) => {
    setForm({ id: dept._id, head: dept.head, name: dept.name, description: dept.description || "" });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this department? This action cannot be undone.")) {
      setLoading(true);
      setError("");
      try {
        const token = sessionStorage.getItem("token");
        await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/admin/departments/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess("Department deleted successfully!");
        fetchDepartments();
        setTimeout(() => setSuccess(""), 3000);
      } catch (err) {
        setError(err.response?.data?.message || "Delete failed");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleViewDetails = (dept) => {
    setSelectedDepartment(dept);
    setShowDetailsModal(true);
  };

  const getDepartmentStats = () => {
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(emp => emp.status === 'active').length;
    const departmentsCount = departments.length;

    return { totalEmployees, activeEmployees, departmentsCount };
  };

  const getEmployeesByDepartment = (deptId) => {
    return employees.filter(emp => emp.department === deptId);
  };

  const getStatusColor = (status) => {
    const colors = {
      'active': 'bg-green-100 text-green-800',
      'on leave': 'bg-yellow-100 text-yellow-800',
      'inactive': 'bg-red-100 text-red-800'
    };
    return colors[status] || colors['active'];
  };

  const stats = getDepartmentStats();

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          {/* <div className="p-2 bg-blue-100 rounded-lg">
            <FaBuilding className="text-blue-600 text-xl" />
          </div> */}
          <h1 className="text-3xl font-bold text-[#113a69]">Department Management</h1>
        </div>
        <p className="text-gray-600">Manage organization's departments and team structures</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Departments</p>
              <p className="text-3xl font-bold text-gray-900">{stats.departmentsCount}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FaBuilding className="text-[#113a69] text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Employees</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalEmployees}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <FaUsers className="text-green-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Employees</p>
              <p className="text-3xl font-bold text-gray-900">{stats.activeEmployees}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <MdPersonAdd className="text-purple-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search departments..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#113a69] focus:border-transparent"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <FaSort className="text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#113a69]"
              >
                <option value="name">Name</option>
                <option value="head">Head</option>
                <option value="employeeCount">Employee Count</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </button>
            </div>
          </div>

          <button
            className="flex items-center gap-2 px-6 py-3 bg-[#113a69] text-white rounded-lg hover:bg-[#1b5393] transition-colors font-medium shadow-sm"
            onClick={() => {
              setForm({ id: null, head: "", name: "", description: "" });
              setShowModal(true);
            }}
            disabled={loading}
          >
            <FaPlus className="text-sm" />
            Add Department
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))
        ) : data.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 mb-4">
              <FaBuilding className="text-6xl mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No departments found</h3>
            <p className="text-gray-600">Get started by creating your first department</p>
          </div>
        ) : (
          data.map((dept) => (
            <div key={dept._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FaBuilding className="text-[#113a69]" />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewDetails(dept)}
                    className="p-2 text-[#113a69] hover:bg-blue-50 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <FaEye />
                  </button>
                  <button
                    onClick={() => handleEdit(dept)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(dept._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">{dept.name}</h3>

              <div className="flex items-center gap-2 mb-4">
                <FaUserTie className="text-gray-400 text-sm" />
                <span className="text-sm text-gray-600">{dept.head}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaUsers className="text-gray-400 text-sm" />
                  <span className="text-sm text-gray-600">
                    {dept.employeeCount || 0} employees
                  </span>
                </div>

                <div className="px-3 py-1 bg-blue-100 text-[#113a69] text-xs font-medium rounded-full">
                  Active
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mb-8">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
          >
            Previous
          </button>

          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  page === pageNum
                    ? "bg-[#113a69] text-white"
                    : "border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {pageNum}
              </button>
            ))}
          </div>

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Add/Edit Department Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {form.id ? "Edit Department" : "Add New Department"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleAddOrUpdate(); }} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department Name *
                </label>
                <input
                  type="text"
                  placeholder="Enter department name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department Head *
                </label>
                <input
                  type="text"
                  placeholder="Enter department head name"
                  value={form.head}
                  onChange={(e) => setForm({ ...form, head: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={loading}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-[#113a69] text-white rounded-lg hover:bg-[#1b5393] transition-colors font-medium disabled:opacity-50"
                >
                  {loading ? "Saving..." : (form.id ? "Update Department" : "Create Department")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Department Details Modal */}
      {showDetailsModal && selectedDepartment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Department Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Name:</span>
                      <p className="text-gray-900">{selectedDepartment.name}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Head:</span>
                      <p className="text-gray-900">{selectedDepartment.head}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Total Employees:</span>
                      <p className="text-gray-900">{selectedDepartment.employeeCount || 0}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        handleEdit(selectedDepartment);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#113a69] text-white rounded-lg hover:bg-[#1b5193] transition-colors"
                    >
                      <FaEdit />
                      Edit Department
                    </button>
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        handleDelete(selectedDepartment._id);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <FaTrash />
                      Delete Department
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Employees</h3>
                {(() => {
                  const deptEmployees = getEmployeesByDepartment(selectedDepartment._id);
                  return deptEmployees.length > 0 ? (
                    <div className="space-y-3">
                      {deptEmployees.map((emp) => (
                        <div key={emp._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-medium">{emp.name.charAt(0).toUpperCase()}</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{emp.name}</p>
                              <p className="text-sm text-gray-600">{emp.role}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(emp.status)}`}>
                            {emp.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No employees assigned to this department</p>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;