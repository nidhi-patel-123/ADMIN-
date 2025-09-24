import React, { useState, useEffect } from "react";
import { Download, Edit, Trash2, Plus, X } from "lucide-react";
import axios from "axios";
import EmployeeAdd from "../components/EmployeeAdd";

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/admin/departments`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDepartments(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch departments");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/admin/employees`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setEmployees(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch employees");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      setLoading(true);
      setError("");
      try {
        const token = sessionStorage.getItem("token");
        await axios.delete(
          `${process.env.REACT_APP_BACKEND_URL}/admin/employees/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        fetchEmployees();
      } catch (err) {
        setError(err.response?.data?.message || "Delete failed");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleExport = () => {
    const csv = [
      [
        "Employee",
        "Department",
        "Role",
        "Basic Salary",
        "Mobile",
        "Email",
        "Gender",
        "Status",
        "Address",
        "Join Date",
      ],
      ...employees.map((emp) => [
        emp.name,
        emp.department.name,
        emp.role,
        emp.basicSalary || 0,
        emp.mobile,
        emp.email,
        emp.gender,
        emp.status,
        emp.address,
        new Date(emp.joiningDate).toLocaleDateString(),
      ]),
    ]
      .map((e) => e.map((cell) => `"${cell}"`).join(",")) // Wrap cells in quotes to handle commas
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "employees.csv";
    link.click();
  };

  const handleEditClick = (emp) => {
    setEditEmployee({
      ...emp,
      department: emp.department._id,
      joiningDate: new Date(emp.joiningDate).toISOString().split("T")[0],
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    for (let key in editEmployee) {
      if (key !== "password" && !editEmployee[key]) {
        setError(`${key.charAt(0).toUpperCase() + key.slice(1)} is required`);
        return;
      }
    }
    setLoading(true);
    setError("");
    try {
      const token = sessionStorage.getItem("token");
      const updates = { ...editEmployee };
      if (!updates.password) {
        delete updates.password;
      }
      await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/admin/employees/${editEmployee._id}`,
        updates,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchEmployees();
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    return (
      emp.name.toLowerCase().includes(search.toLowerCase()) &&
      (departmentFilter === "All" ||
        emp.department.name === departmentFilter) &&
      (statusFilter === "All" || emp.status === statusFilter)
    );
  });

  return (
    // <div className="p-6 bg-white shadow rounded-lg">
    //   <div className="flex justify-between items-center mb-6">
    //     <h2 className="text-xl font-semibold text-gray-800">Employee Directory</h2>
    //     <div className="flex gap-3">

    //       <button
    //         onClick={() => setShowAddForm(!showAddForm)}
    //         className="flex items-center gap-2 bg-[#113a69] text-white px-4 py-2 rounded-lg hover:bg-[#1b5393] transition-colors"
    //         disabled={loading}
    //       >
    //         <Plus size={18} /> {showAddForm ? "Close Form" : "Add Employee"}
    //       </button>
    //     </div>
    //   </div>
    <div className="p-6 bg-gray-100 font-sans">
      <div className="flex justify-between items-center mb-8">
        <div className="">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-[#113a69]">
              Employee Directory
            </h1>
          </div>
          <p className="text-gray-600">
            View, search, and manage all employees. Filter by department or
            status, and add or edit employee details.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-[#113a69] text-white px-4 py-2 rounded-lg hover:bg-[#1b5393] transition-colors"
          disabled={loading}
        >
          <Plus size={18} /> {showAddForm ? "Close Form" : "Add Employee"}
        </button>
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {showAddForm && (
        <EmployeeAdd
          onSuccess={() => {
            fetchEmployees();
            setShowAddForm(false);
          }}
        />
      )}

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search employees..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-[#113a69]"
        />
        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#113a69]"
        >
          <option value="All">All Departments</option>
          {departments.map((dept) => (
            <option key={dept._id} value={dept.name}>
              {dept.name}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:[#113a69]"
        >
          <option value="All">All Status</option>
          <option value="active">Active</option>
          <option value="on leave">On Leave</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 bg-white rounded-lg shadow-sm">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="p-3 text-left text-sm text-gray-700 border-b font-bold">
                Employee
              </th>
              <th className="p-3 text-left text-sm font-bold text-gray-700 border-b">
                Department
              </th>
              <th className="p-3 text-left text-sm font-bold text-gray-700 border-b">
                Role
              </th>
              <th className="p-3 text-left text-sm font-bold text-gray-700 border-b">
                Basic Salary
              </th>
              <th className="p-3 text-left text-sm font-bold text-gray-700 border-b">
                Mobile
              </th>
              <th className="p-3 text-left text-sm font-bold text-gray-700 border-b">
                Email
              </th>
              <th className="p-3 text-left text-sm font-bold text-gray-700 border-b">
                Gender
              </th>
              <th className="p-3 text-left text-sm font-bold text-gray-700 border-b">
                Status
              </th>
              <th className="p-3 text-left text-sm font-bold text-gray-700 border-b">
                Joining Date
              </th>
              <th className="p-3 text-left text-sm font-bold text-gray-700 border-b">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="10" className="text-center p-4 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan="10" className="text-center p-4 text-gray-500">
                  No employees found
                </td>
              </tr>
            ) : (
              filteredEmployees.map((emp, index) => (
                <tr
                  key={emp._id}
                  className={`border-b hover:bg-gray-50 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td className="p-3 text-gray-800 font-bold">{emp.name}</td>
                  <td className="p-3 text-gray-800">{emp.department.name}</td>
                  <td className="p-3 text-gray-800">{emp.role}</td>
                  <td className="p-3 text-gray-800">
                    ₹{emp.basicSalary?.toLocaleString() || "0"}
                  </td>
                  <td className="p-3 text-gray-800">{emp.mobile}</td>
                  <td
                    className="p-3 text-gray-800 max-w-[200px] truncate"
                    title={emp.email}
                  >
                    {emp.email}
                  </td>
                  <td className="p-3 text-gray-800">{emp.gender}</td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        emp.status === "active"
                          ? "bg-green-100 text-green-700"
                          : emp.status === "on leave"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {emp.status}
                    </span>
                  </td>
                  <td
                    className="p-3 text-gray-800 max-w-[200px] truncate"
                    title={emp.joiningDate}
                  >
                    {new Date(emp.joiningDate).toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    <button
                      className="text-[#113a69] hover:text-blue-800 transition-colors"
                      onClick={() => handleEditClick(emp)}
                      disabled={loading}
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800 transition-colors"
                      onClick={() => handleDelete(emp._id)}
                      disabled={loading}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && editEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white shadow rounded-b-lg p-6 space-y-6 w-96 max-h-[80vh] overflow-y-auto z-50">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Edit Employee</h2>
              <button onClick={() => setShowModal(false)} disabled={loading}>
                <X size={20} />
              </button>
            </div>
            {error && <p className="text-red-500">{error}</p>}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block mb-1 font-medium">Name*</label>
                <input
                  type="text"
                  value={editEmployee.name}
                  onChange={(e) =>
                    setEditEmployee({ ...editEmployee, name: e.target.value })
                  }
                  placeholder="Enter The Name..."
                  className="w-full border p-2 rounded"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Role*</label>
                <input
                  type="text"
                  value={editEmployee.role}
                  onChange={(e) =>
                    setEditEmployee({ ...editEmployee, role: e.target.value })
                  }
                  placeholder="Enter The Role..."
                  className="w-full border p-2 rounded"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Basic Salary*</label>
                <input
                  type="number"
                  value={editEmployee.basicSalary || ""}
                  onChange={(e) =>
                    setEditEmployee({
                      ...editEmployee,
                      basicSalary: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="Enter Basic Salary..."
                  className="w-full border p-2 rounded"
                  required
                  min="0"
                  step="0.01"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Department*</label>
                <select
                  value={editEmployee.department}
                  onChange={(e) =>
                    setEditEmployee({
                      ...editEmployee,
                      department: e.target.value,
                    })
                  }
                  className="w-full border p-2 rounded"
                  required
                  disabled={loading || departments.length === 0}
                >
                  {departments.length === 0 ? (
                    <option value="">No departments available</option>
                  ) : (
                    departments.map((dept) => (
                      <option key={dept._id} value={dept._id}>
                        {dept.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Mobile*</label>
                <input
                  type="text"
                  value={editEmployee.mobile}
                  onChange={(e) =>
                    setEditEmployee({ ...editEmployee, mobile: e.target.value })
                  }
                  placeholder="Enter The Mobile..."
                  className="w-full border p-2 rounded"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Joining Date*</label>
                <input
                  type="date"
                  value={editEmployee.joiningDate}
                  onChange={(e) =>
                    setEditEmployee({
                      ...editEmployee,
                      joiningDate: e.target.value,
                    })
                  }
                  className="w-full border p-2 rounded"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Email*</label>
                <input
                  type="email"
                  value={editEmployee.email}
                  onChange={(e) =>
                    setEditEmployee({ ...editEmployee, email: e.target.value })
                  }
                  placeholder="Enter The Email..."
                  className="w-full border p-2 rounded"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Gender*</label>
                <select
                  value={editEmployee.gender}
                  onChange={(e) =>
                    setEditEmployee({ ...editEmployee, gender: e.target.value })
                  }
                  className="w-full border p-2 rounded"
                  required
                  disabled={loading}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium">
                  Employee Status*
                </label>
                <select
                  value={editEmployee.status}
                  onChange={(e) =>
                    setEditEmployee({ ...editEmployee, status: e.target.value })
                  }
                  className="w-full border p-2 rounded"
                  required
                  disabled={loading}
                >
                  <option value="">Select Employee Status</option>
                  <option value="active">Active</option>
                  <option value="on leave">On Leave</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Password</label>
                <input
                  type="password"
                  onChange={(e) =>
                    setEditEmployee({
                      ...editEmployee,
                      password: e.target.value,
                    })
                  }
                  placeholder="********"
                  className="w-full border p-2 rounded"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Address*</label>
                <input
                  type="text"
                  value={editEmployee.address}
                  onChange={(e) =>
                    setEditEmployee({
                      ...editEmployee,
                      address: e.target.value,
                    })
                  }
                  placeholder="Enter The Address..."
                  className="w-full border p-2 rounded"
                  required
                  disabled={loading}
                />
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="bg-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-400"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="bg-blue-900 text-white px-6 py-2 rounded hover:bg-blue-800"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
