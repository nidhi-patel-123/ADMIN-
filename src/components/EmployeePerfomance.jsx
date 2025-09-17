import React, { useEffect, useState } from "react";
import {
  UserIcon,
  ChartBarIcon,
  TrophyIcon,
  ClipboardDocumentCheckIcon,
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const years = ["2020", "2021", "2022", "2023", "2024", "2025"];

function EmployeePerformance() {
  const [employees, setEmployees] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    employeeId: "",
    performance: "",
    tasksCompleted: "",
    achievements: "",
    month: "",
    year: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");

  // Fetch employee list for dropdown
  const fetchEmployeeList = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        setError("Authentication token is missing. Please log in.");
        return;
      }
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/admin/employees`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEmployeeList(response.data);
    } catch (err) {
      console.error("Failed to fetch employee list:", err);
      setError(
        err.response?.status === 401
          ? "Unauthorized: Invalid or expired token. Please log in again."
          : "Failed to fetch employee list for dropdown"
      );
    }
  };

  // Fetch performance data from backend
  const fetchPerformances = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      if (!token) {
        setError("Authentication token is missing. Please log in.");
        return;
      }
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/admin/employees/performance`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEmployees(response.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch performances:", err);
      setError(
        err.response?.status === 401
          ? "Unauthorized: Invalid or expired token. Please log in again."
          : "Failed to fetch performance data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeList();
    fetchPerformances();
  }, []);

  const filteredEmployees = employees.filter((emp) => {
    if (!filterMonth && !filterYear) return true;
    return (
      (!filterMonth || emp.month === filterMonth) &&
      (!filterYear || emp.year === filterYear)
    );
  });

  const totalEmployees = filteredEmployees.length;
  const avgPerformance =
    totalEmployees > 0
      ? Math.round(
        filteredEmployees.reduce((sum, emp) => sum + emp.performance, 0) / totalEmployees
      )
      : 0;
  const topPerformer =
    totalEmployees > 0
      ? filteredEmployees.reduce((top, emp) => (emp.performance > top.performance ? emp : top))
      : null;

  const getTasksCompletedCategory = (performance) => {
    if (performance >= 0 && performance <= 30) return { label: "Bad", color: "bg-red-100 text-red-700" };
    if (performance > 30 && performance <= 60) return { label: "Good", color: "bg-yellow-100 text-yellow-700" };
    if (performance > 60 && performance <= 90) return { label: "Perfect", color: "bg-green-100 text-green-700" };
    if (performance > 90 && performance <= 100) return { label: "Excellent", color: "bg-blue-100 text-blue-700" };
    return { label: "N/A", color: "bg-gray-100 text-gray-700" };
  };

  const openModal = (employee = null) => {
    if (employee) {
      setEditingEmployee(employee);
      setFormData({
        employeeId: employee.employee?._id || "",
        performance: employee.performance.toString(),
        tasksCompleted: employee.tasksCompleted.toString(),
        achievements: employee.achievements || "",
        month: employee.month || "",
        year: employee.year || "",
      });
    } else {
      setEditingEmployee(null);
      setFormData({
        employeeId: "",
        performance: "",
        tasksCompleted: "",
        achievements: "",
        month: "",
        year: "",
      });
    }
    setFormErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
    setFormErrors({});
  };

  const validate = () => {
    const errors = {};
    if (!formData.employeeId) errors.employeeId = "Employee is required";
    const perf = Number(formData.performance);
    if (!formData.performance.trim() || isNaN(perf) || perf < 0 || perf > 100)
      errors.performance = "Performance must be a number between 0 and 100";
    const tasks = Number(formData.tasksCompleted);
    if (!formData.tasksCompleted.trim() || isNaN(tasks) || tasks < 0 || tasks > 100)
      errors.tasksCompleted = "Tasks Completed must be a number between 0 and 100";
    if (!formData.month) errors.month = "Month is required";
    if (!formData.year) errors.year = "Year is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError(null);

    const token = sessionStorage.getItem("token");
    if (!token) {
      setError("Authentication token is missing. Please log in.");
      setLoading(false);
      return;
    }

    const payload = {
      employeeId: formData.employeeId,
      performance: Number(formData.performance),
      tasksCompleted: Number(formData.tasksCompleted),
      achievements: formData.achievements.trim(),
      month: formData.month,
      year: formData.year,
    };

    try {
      if (editingEmployee) {
        // Update performance
        const response = await axios.put(
          `${process.env.REACT_APP_BACKEND_URL}/admin/employees/performance/${editingEmployee._id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEmployees((emps) =>
          emps.map((emp) => (emp._id === editingEmployee._id ? response.data : emp))
        );
      } else {
        // Create new performance
        const response = await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}/admin/employees/performance`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEmployees([response.data, ...employees]);
      }
      closeModal();
    } catch (err) {
      console.error("Error saving performance:", err);
      setError(
        err.response?.status === 401
          ? "Unauthorized: Invalid or expired token. Please log in again."
          : err.response?.data?.message || "Failed to save performance data"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee performance record?")) {
      setLoading(true);
      setError(null);
      const token = sessionStorage.getItem("token");
      if (!token) {
        setError("Authentication token is missing. Please log in.");
        setLoading(false);
        return;
      }
      try {
        await axios.delete(
          `${process.env.REACT_APP_BACKEND_URL}/admin/employees/performance/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEmployees((emps) => emps.filter((emp) => emp._id !== id));
      } catch (err) {
        console.error("Error deleting performance:", err);
        setError(
          err.response?.status === 401
            ? "Unauthorized: Invalid or expired token. Please log in again."
            : err.response?.data?.message || "Failed to delete performance data"
        );
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen font-sans">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#113a69] tracking-wide">
          Employee Performance
        </h1>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 bg-[#113a69] hover:bg-[#1b5393] text-white font-semibold px-4 py-2 rounded-md shadow-md transition"
          disabled={loading}
        >
          <PlusIcon className="h-5 w-5" />
          Add Performance
        </button>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-white shadow-md rounded-xl p-6 flex items-center gap-5 hover:shadow-lg transition-shadow">
          <UserIcon className="h-12 w-12 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Total Employees
            </p>
            <h2 className="text-3xl font-bold text-gray-900">{totalEmployees}</h2>
          </div>
        </div>
        <div className="bg-white shadow-md rounded-xl p-6 flex items-center gap-5 hover:shadow-lg transition-shadow">
          <ChartBarIcon className="h-12 w-12 text-green-600" />
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Average Performance
            </p>
            <h2 className="text-3xl font-bold text-gray-900">{avgPerformance}%</h2>
          </div>
        </div>
        <div className="bg-white shadow-md rounded-xl p-6 flex items-center gap-5 hover:shadow-lg transition-shadow">
          <TrophyIcon className="h-12 w-12 text-yellow-500" />
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Top Performer
            </p>
            <h2 className="text-xl font-semibold text-gray-900">
              {topPerformer ? topPerformer.employee?.name || "N/A" : "N/A"}
            </h2>
          </div>
        </div>
      </div>

      <section className="bg-white shadow-md rounded-xl p-6 mb-6">
        <h2 className="text-2xl font-bold text-[#113a69] mb-6 tracking-wide">
          Filter Performance Records
        </h2>
        <div className="flex gap-4 mb-6">
          <div>
            <label htmlFor="filterMonth" className="block font-semibold mb-1">
              Month
            </label>
            <select
              id="filterMonth"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="">All Months</option>
              {months.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="filterYear" className="block font-semibold mb-1">
              Year
            </label>
            <select
              id="filterYear"
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="">All Years</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="bg-white shadow-md rounded-xl p-6">
        <h2 className="text-2xl font-bold text-[#113a69] mb-6 tracking-wide">
          Employee Performance Details
        </h2>
        {loading ? (
          <p className="text-center py-6 text-gray-500">Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-700 uppercase text-sm tracking-wide">
                  <th className="p-4 border-b font-semibold">Name</th>
                  <th className="p-4 border-b font-semibold">Role</th>
                  <th className="p-4 border-b font-semibold">Month</th>
                  <th className="p-4 border-b font-semibold">Year</th>
                  <th className="p-4 border-b font-semibold">Task Category</th>
                  <th className="p-4 border-b font-semibold">Performance</th>
                  <th className="p-4 border-b font-semibold">Tasks Completed</th>
                  <th className="p-4 border-b font-semibold">Achievements</th>
                  <th className="p-4 border-b font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => {
                  const { label, color } = getTasksCompletedCategory(emp.performance);
                  return (
                    <tr
                      key={emp._id}
                      className="hover:bg-gray-50 transition-colors cursor-default"
                    >
                      <td className="p-4 border-b font-medium text-gray-900">
                        {emp.employee?.name || "N/A"}
                      </td>
                      <td className="p-4 border-b text-gray-700">{emp.employee?.role || "N/A"}</td>
                      <td className="p-4 border-b text-gray-700">{emp.month}</td>
                      <td className="p-4 border-b text-gray-700">{emp.year}</td>
                      <td className="p-4 border-b">
                        <span className={`inline-block px-2 py-1 rounded-full text-sm font-semibold ${color}`}>
                          {label}
                        </span>
                      </td>
                      <td className="p-4 border-b">
                        <div className="flex items-center gap-2 text-green-600 font-semibold">
                          <ClipboardDocumentCheckIcon className="h-5 w-5" />
                          <span>{emp.performance}%</span>
                        </div>
                      </td>
                      <td className="p-4 border-b text-gray-700">{emp.tasksCompleted}%</td>
                      <td className="p-4 border-b text-gray-600 italic">{emp.achievements || "None"}</td>
                      <td className="p-4 border-b text-center space-x-3">
                        <button
                          onClick={() => openModal(emp)}
                          className="text-blue-600 hover:text-blue-800"
                          disabled={loading}
                        >
                          <PencilSquareIcon className="h-5 w-5 inline" />
                        </button>
                        <button
                          onClick={() => handleDelete(emp._id)}
                          className="text-red-600 hover:text-red-800"
                          disabled={loading}
                        >
                          <TrashIcon className="h-5 w-5 inline" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredEmployees.length === 0 && !loading && (
                  <tr>
                    <td colSpan="9" className="p-6 text-center text-gray-500 italic">
                      No employee performance data found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
            <h3 id="modal-title" className="text-xl font-bold mb-4">
              {editingEmployee ? "Edit Employee Performance" : "Add Employee Performance"}
            </h3>
            {error && <p className="text-red-600 mb-4">{error}</p>}
            <form onSubmit={handleSubmit} noValidate>
              <div className="space-y-4">
                <div>
                  <label htmlFor="employeeId" className="block font-semibold mb-1">
                    Employee <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="employeeId"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleChange}
                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 ${formErrors.employeeId
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                      }`}
                    disabled={loading || (editingEmployee && true)}
                    required
                  >
                    <option value="">Select Employee</option>
                    {employeeList.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.name} - {emp.role} (₹{emp.basicSalary?.toLocaleString() || "0"})
                      </option>
                    ))}
                  </select>
                  {formErrors.employeeId && (
                    <p className="text-red-600 text-sm mt-1">{formErrors.employeeId}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="month" className="block font-semibold mb-1">
                    Month <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="month"
                    name="month"
                    value={formData.month}
                    onChange={handleChange}
                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 ${formErrors.month
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                      }`}
                    disabled={loading}
                    required
                  >
                    <option value="">Select Month</option>
                    {months.map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                  {formErrors.month && (
                    <p className="text-red-600 text-sm mt-1">{formErrors.month}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="year" className="block font-semibold mb-1">
                    Year <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="year"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 ${formErrors.year
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                      }`}
                    disabled={loading}
                    required
                  >
                    <option value="">Select Year</option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  {formErrors.year && (
                    <p className="text-red-600 text-sm mt-1">{formErrors.year}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="performance" className="block font-semibold mb-1">
                    Performance (%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="performance"
                    name="performance"
                    min="0"
                    max="100"
                    value={formData.performance}
                    onChange={handleChange}
                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 ${formErrors.performance
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                      }`}
                    disabled={loading}
                    required
                  />
                  {formErrors.performance && (
                    <p className="text-red-600 text-sm mt-1">{formErrors.performance}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="tasksCompleted" className="block font-semibold mb-1">
                    Tasks Completed (%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="tasksCompleted"
                    name="tasksCompleted"
                    min="0"
                    max="100"
                    value={formData.tasksCompleted}
                    onChange={handleChange}
                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 ${formErrors.tasksCompleted
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                      }`}
                    disabled={loading}
                    required
                  />
                  {formErrors.tasksCompleted && (
                    <p className="text-red-600 text-sm mt-1">{formErrors.tasksCompleted}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="achievements" className="block font-semibold mb-1">
                    Achievements
                  </label>
                  <textarea
                    id="achievements"
                    name="achievements"
                    rows="2"
                    value={formData.achievements}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                  disabled={loading}
                >
                  {loading ? "Saving..." : editingEmployee ? "Update" : "Add"}
                </button>
              </div>
            </form>
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              disabled={loading}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeePerformance;