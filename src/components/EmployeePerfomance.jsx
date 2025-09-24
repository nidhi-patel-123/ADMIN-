import React, { useEffect, useState } from 'react';
import {
  UserIcon,
  ChartBarIcon,
  TrophyIcon,
  ClipboardDocumentCheckIcon,
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  XMarkIcon,
  ChartPieIcon,
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const years = ['2020', '2021', '2022', '2023', '2024', '2025'];

function EmployeePerformance() {
  const [employees, setEmployees] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [selectedChartEmployee, setSelectedChartEmployee] = useState(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    presentDays: '',
    leaveDays: '',
    tasksCompleted: '',
    totalTasks: '',
    performance: '',
    achievements: '',
    month: '',
    year: '',
    attendanceScore: 0,
    leaveScore: 0,
    taskScore: 0,
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');

  // Fetch employee list for dropdown
  const fetchEmployeeList = async () => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        setError('Authentication token is missing. Please log in.');
        return;
      }
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/admin/employees`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEmployeeList(response.data);
    } catch (err) {
      console.error('Failed to fetch employee list:', err);
      setError(
        err.response?.status === 401
          ? 'Unauthorized: Invalid or expired token. Please log in again.'
          : 'Failed to fetch employee list for dropdown'
      );
    }
  };

  // Fetch performance data
  const fetchPerformances = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      if (!token) {
        setError('Authentication token is missing. Please log in.');
        return;
      }
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/admin/performances`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEmployees(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch performances:', err);
      setError(
        err.response?.status === 401
          ? 'Unauthorized: Invalid or expired token. Please log in again.'
          : 'Failed to fetch performance data'
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch employee details when employeeId, month, or year changes
  const fetchEmployeeDetails = async () => {
    if (formData.employeeId && formData.month && formData.year) {
      try {
        setLoading(true);
        const token = sessionStorage.getItem('token');
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/admin/employees/${formData.employeeId}/details?month=${formData.month}&year=${formData.year}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const { attendance, leave, tasks, performance } = response.data;
        setFormData((prev) => ({
          ...prev,
          presentDays: attendance.presentDays || 0,
          leaveDays: leave.leaveDays || 0,
          tasksCompleted: tasks.completedTasks || 0,
          totalTasks: tasks.totalTasks || 0,
          performance: performance.toFixed(2),
          attendanceScore: attendance.attendanceScore || 0,
          leaveScore: leave.leaveScore || 0,
          taskScore: tasks.taskScore || 0,
        }));
        setError(null);
      } catch (err) {
        console.error('Failed to fetch employee details:', err);
        setError('Failed to load employee details');
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchEmployeeList();
    fetchPerformances();
  }, []);

  useEffect(() => {
    fetchEmployeeDetails();
  }, [formData.employeeId, formData.month, formData.year]);

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
          filteredEmployees.reduce((sum, emp) => sum + emp.performance, 0) /
            totalEmployees
        )
      : 0;
  const topPerformer =
    totalEmployees > 0
      ? filteredEmployees.reduce((top, emp) =>
          emp.performance > top.performance ? emp : top
        )
      : null;

  const getTasksCompletedCategory = (performance) => {
    if (performance >= 0 && performance <= 30)
      return { label: 'Bad', color: 'bg-red-100 text-red-700' };
    if (performance > 30 && performance <= 60)
      return { label: 'Good', color: 'bg-yellow-100 text-yellow-700' };
    if (performance > 60 && performance <= 90)
      return { label: 'Perfect', color: 'bg-green-100 text-green-700' };
    if (performance > 90 && performance <= 100)
      return { label: 'Excellent', color: 'bg-blue-100 text-blue-700' };
    return { label: 'N/A', color: 'bg-gray-100 text-gray-700' };
  };

  const openModal = (employee = null) => {
    if (employee) {
      setEditingEmployee(employee);
      setFormData({
        employeeId: employee.employee?._id || '',
        presentDays: employee.presentDays || '',
        leaveDays: employee.leaveDays || '',
        tasksCompleted: employee.tasksCompleted || '',
        totalTasks: employee.totalTasks || '',
        performance: employee.performance.toString(),
        achievements: employee.achievements || '',
        month: employee.month || '',
        year: employee.year || '',
        attendanceScore: employee.attendanceScore || 0,
        leaveScore: employee.leaveScore || 0,
        taskScore: employee.taskScore || 0,
      });
    } else {
      setEditingEmployee(null);
      setFormData({
        employeeId: '',
        presentDays: '',
        leaveDays: '',
        tasksCompleted: '',
        totalTasks: '',
        performance: '',
        achievements: '',
        month: '',
        year: '',
        attendanceScore: 0,
        leaveScore: 0,
        taskScore: 0,
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

  const toggleChart = (employee) => {
    setSelectedChartEmployee(selectedChartEmployee?._id === employee._id ? null : employee);
  };

  const validate = () => {
    const errors = {};
    if (!formData.employeeId) errors.employeeId = 'Employee is required';
    if (!formData.month) errors.month = 'Month is required';
    if (!formData.year) errors.year = 'Year is required';
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

    const token = sessionStorage.getItem('token');
    if (!token) {
      setError('Authentication token is missing. Please log in.');
      setLoading(false);
      return;
    }

    const payload = {
      employeeId: formData.employeeId,
      achievements: formData.achievements.trim(),
      month: formData.month,
      year: formData.year,
    };

    try {
      if (editingEmployee) {
        const response = await axios.put(
          `${process.env.REACT_APP_BACKEND_URL}/admin/performances/${editingEmployee._id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEmployees((emps) =>
          emps.map((emp) => (emp._id === editingEmployee._id ? response.data : emp))
        );
      } else {
        const response = await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}/admin/performances`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEmployees([response.data, ...employees]);
      }
      closeModal();
      fetchPerformances();
    } catch (err) {
      console.error('Error saving performance:', err);
      setError(
        err.response?.status === 401
          ? 'Unauthorized: Invalid or expired token. Please log in again.'
          : err.response?.data?.message || 'Failed to save performance data'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee performance record?')) {
      setLoading(true);
      setError(null);
      const token = sessionStorage.getItem('token');
      if (!token) {
        setError('Authentication token is missing. Please log in.');
        setLoading(false);
        return;
      }
      try {
        await axios.delete(
          `${process.env.REACT_APP_BACKEND_URL}/admin/performances/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEmployees((emps) => emps.filter((emp) => emp._id !== id));
        if (selectedChartEmployee?._id === id) setSelectedChartEmployee(null);
      } catch (err) {
        console.error('Error deleting performance:', err);
        setError(
          err.response?.status === 401
            ? 'Unauthorized: Invalid or expired token. Please log in again.'
            : err.response?.data?.message || 'Failed to delete performance data'
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const renderEmployeeChart = (employee) => {
    const chartData = {
      labels: ['Attendance', 'Leave', 'Tasks'],
      datasets: [
        {
          label: 'Scores',
          data: [employee.attendanceScore, employee.leaveScore, employee.taskScore],
          backgroundColor: ['#4CAF50', '#2196F3', '#FFC107'],
          borderColor: ['#388E3C', '#1976D2', '#FFA000'],
          borderWidth: 1,
        },
      ],
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          title: { display: true, text: 'Score (%)', font: { size: 14 } },
          ticks: { stepSize: 20 },
        },
        x: {
          title: { display: true, text: 'Metrics', font: { size: 14 } },
        },
      },
      plugins: {
        legend: { position: 'top', labels: { font: { size: 12 } } },
        title: {
          display: true,
          text: `Performance Breakdown for ${employee.employee?.name || 'Employee'} (${employee.month} ${employee.year})`,
          font: { size: 16 },
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.dataset.label || '';
              const value = context.parsed.y;
              const metric = context.label;
              return `${label}: ${value.toFixed(2)}% (${metric})`;
            },
          },
        },
      },
    };

    return (
      <div className="h-64 mt-4">
        <Bar data={chartData} options={chartOptions} />
      </div>
    );
  };

  const modalChartData = {
    labels: ['Attendance', 'Leave', 'Tasks'],
    datasets: [
      {
        label: 'Scores',
        data: [formData.attendanceScore, formData.leaveScore, formData.taskScore],
        backgroundColor: ['#4CAF50', '#2196F3', '#FFC107'],
        borderColor: ['#388E3C', '#1976D2', '#FFA000'],
        borderWidth: 1,
      },
    ],
  };

  const modalChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: { display: true, text: 'Score (%)', font: { size: 12 } },
        ticks: { stepSize: 20, font: { size: 10 } },
      },
      x: {
        title: { display: true, text: 'Metrics', font: { size: 12 } },
        ticks: { font: { size: 10 } },
      },
    },
    plugins: {
      legend: { position: 'top', labels: { font: { size: 10 } } },
      title: {
        display: true,
        text: 'Performance Breakdown',
        font: { size: 14 },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            const metric = context.label;
            return `${label}: ${value.toFixed(2)}% (${metric})`;
          },
        },
      },
    },
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-100 min-h-screen font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#113a69]">Employee Performance</h1>
          <p className="text-gray-600 text-sm sm:text-base">Monitor, evaluate, and manage employee performance records and analytics</p>
        </div>
        <button
          onClick={() => openModal()}
          className="mt-4 sm:mt-0 inline-flex items-center gap-2 bg-[#113a69] hover:bg-[#1b5393] text-white font-semibold px-4 py-2 rounded-md shadow-md transition"
          disabled={loading}
        >
          <PlusIcon className="h-5 w-5" />
          Add Performance
        </button>
      </div>

      {error && <p className="text-red-600 mb-4 text-sm sm:text-base">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
        <div className="bg-white shadow-md rounded-xl p-4 sm:p-6 flex items-center gap-4 sm:gap-5 hover:shadow-lg transition-shadow">
          <UserIcon className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600" />
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">Total Employees</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{totalEmployees}</h2>
          </div>
        </div>
        <div className="bg-white shadow-md rounded-xl p-4 sm:p-6 flex items-center gap-4 sm:gap-5 hover:shadow-lg transition-shadow">
          <ChartBarIcon className="h-10 w-10 sm:h-12 sm:w-12 text-green-600" />
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">Average Performance</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{avgPerformance}%</h2>
          </div>
        </div>
        <div className="bg-white shadow-md rounded-xl p-4 sm:p-6 flex items-center gap-4 sm:gap-5 hover:shadow-lg transition-shadow">
          <TrophyIcon className="h-10 w-10 sm:h-12 sm:w-12 text-yellow-500" />
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">Top Performer</p>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{topPerformer ? topPerformer.employee?.name || 'N/A' : 'N/A'}</h2>
          </div>
        </div>
      </div>

      <section className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-1/2">
            <label htmlFor="filterMonth" className="block font-semibold text-sm sm:text-base mb-1">Month</label>
            <select
              id="filterMonth"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 border-gray-300 focus:ring-[#113a69]"
              disabled={loading}
            >
              <option value="">All Months</option>
              {months.map((month) => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>
          <div className="w-full sm:w-1/2">
            <label htmlFor="filterYear" className="block font-semibold text-sm sm:text-base mb-1">Year</label>
            <select
              id="filterYear"
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 border-gray-300 focus:ring-[#113a69]"
              disabled={loading}
            >
              <option value="">All Years</option>
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="bg-white shadow-md rounded-xl p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-[#113a69] mb-4 sm:mb-6 tracking-wide">Employee Performance Details</h2>
        {loading ? (
          <p className="text-center py-6 text-gray-500 text-sm sm:text-base">Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-700 uppercase text-xs sm:text-sm tracking-wide">
                  <th className="p-3 sm:p-4 border-b font-semibold">Name</th>
                  <th className="p-3 sm:p-4 border-b font-semibold">Role</th>
                  <th className="p-3 sm:p-4 border-b font-semibold">Month</th>
                  <th className="p-3 sm:p-4 border-b font-semibold">Year</th>
                  <th className="p-3 sm:p-4 border-b font-semibold">Task Category</th>
                  <th className="p-3 sm:p-4 border-b font-semibold">Performance</th>
                  <th className="p-3 sm:p-4 border-b font-semibold">Tasks Completed</th>
                  <th className="p-3 sm:p-4 border-b font-semibold">Achievements</th>
                  <th className="p-3 sm:p-4 border-b font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => {
                  const { label, color } = getTasksCompletedCategory(emp.performance);
                  return (
                    <React.Fragment key={emp._id}>
                      <tr className="hover:bg-gray-50 transition-colors cursor-default">
                        <td className="p-3 sm:p-4 border-b font-medium text-gray-900 text-sm sm:text-base">{emp.employee?.name || 'N/A'}</td>
                        <td className="p-3 sm:p-4 border-b text-gray-700 text-sm sm:text-base">{emp.employee?.role || 'N/A'}</td>
                        <td className="p-3 sm:p-4 border-b text-gray-700 text-sm sm:text-base">{emp.month}</td>
                        <td className="p-3 sm:p-4 border-b text-gray-700 text-sm sm:text-base">{emp.year}</td>
                        <td className="p-3 sm:p-4 border-b">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs sm:text-sm font-semibold ${color}`}>
                            {label}
                          </span>
                        </td>
                        <td className="p-3 sm:p-4 border-b">
                          <div className="flex items-center gap-2 text-green-600 font-semibold text-sm sm:text-base">
                            <ClipboardDocumentCheckIcon className="h-5 w-5" />
                            <span>{emp.performance.toFixed(2)}%</span>
                          </div>
                        </td>
                        <td className="p-3 sm:p-4 border-b text-gray-700 text-sm sm:text-base">{emp.tasksCompleted}/{emp.totalTasks}</td>
                        <td className="p-3 sm:p-4 border-b text-gray-600 italic text-sm sm:text-base">{emp.achievements || 'None'}</td>
                        <td className="p-3 sm:p-4 border-b text-center space-x-2 sm:space-x-3">
                          <button
                            onClick={() => openModal(emp)}
                            className="text-blue-600 hover:text-blue-800"
                            disabled={loading}
                            title="Edit Performance"
                          >
                            <PencilSquareIcon className="h-5 w-5 inline" />
                          </button>
                          <button
                            onClick={() => handleDelete(emp._id)}
                            className="text-red-600 hover:text-red-800"
                            disabled={loading}
                            title="Delete Performance"
                          >
                            <TrashIcon className="h-5 w-5 inline" />
                          </button>
                          {/* <button
                            onClick={() => toggleChart(emp)}
                            className="text-purple-600 hover:text-purple-800"
                            disabled={loading}
                            title="View Performance Chart"
                          >
                            <ChartPieIcon className="h-5 w-5 inline" />
                          </button> */}
                        </td>
                      </tr>
                      {selectedChartEmployee?._id === emp._id && (
                        <tr>
                          <td colSpan="9" className="p-3 sm:p-4 border-b bg-gray-50">
                            {renderEmployeeChart(emp)}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
                {filteredEmployees.length === 0 && !loading && (
                  <tr>
                    <td colSpan="9" className="p-6 text-center text-gray-500 italic text-sm sm:text-base">
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
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md sm:max-w-2xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <h3 id="modal-title" className="text-lg sm:text-xl font-bold mb-4 text-[#113a69]">
              {editingEmployee ? 'Edit Employee Performance' : 'Add Employee Performance'}
            </h3>
            {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}
            <form onSubmit={handleSubmit} noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label htmlFor="employeeId" className="block font-semibold text-sm sm:text-base mb-1">
                    Employee <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="employeeId"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleChange}
                    className={`w-full border rounded-md px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 ${
                      formErrors.employeeId
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-[#113a69]'
                    }`}
                    disabled={loading || (editingEmployee && true)}
                    required
                  >
                    <option value="">Select Employee</option>
                    {employeeList.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.name} - {emp.role} (₹{emp.basicSalary?.toLocaleString() || '0'})
                      </option>
                    ))}
                  </select>
                  {formErrors.employeeId && (
                    <p className="text-red-600 text-xs sm:text-sm mt-1">{formErrors.employeeId}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="month" className="block font-semibold text-sm sm:text-base mb-1">
                    Month <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="month"
                    name="month"
                    value={formData.month}
                    onChange={handleChange}
                    className={`w-full border rounded-md px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 ${
                      formErrors.month
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-[#113a69]'
                    }`}
                    disabled={loading}
                    required
                  >
                    <option value="">Select Month</option>
                    {months.map((month) => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                  {formErrors.month && (
                    <p className="text-red-600 text-xs sm:text-sm mt-1">{formErrors.month}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="year" className="block font-semibold text-sm sm:text-base mb-1">
                    Year <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="year"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className={`w-full border rounded-md px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 ${
                      formErrors.year
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-[#113a69]'
                    }`}
                    disabled={loading}
                    required
                  >
                    <option value="">Select Year</option>
                    {years.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  {formErrors.year && (
                    <p className="text-red-600 text-xs sm:text-sm mt-1">{formErrors.year}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="presentDays" className="block font-semibold text-sm sm:text-base mb-1">
                    Present Days
                  </label>
                  <input
                    type="number"
                    id="presentDays"
                    name="presentDays"
                    value={formData.presentDays}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm sm:text-base bg-gray-100 cursor-not-allowed"
                    disabled
                  />
                </div>
                <div>
                  <label htmlFor="leaveDays" className="block font-semibold text-sm sm:text-base mb-1">
                    Leave Days
                  </label>
                  <input
                    type="number"
                    id="leaveDays"
                    name="leaveDays"
                    value={formData.leaveDays}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm sm:text-base bg-gray-100 cursor-not-allowed"
                    disabled
                  />
                </div>
                <div>
                  <label htmlFor="tasksCompleted" className="block font-semibold text-sm sm:text-base mb-1">
                    Tasks Completed
                  </label>
                  <input
                    type="number"
                    id="tasksCompleted"
                    name="tasksCompleted"
                    value={formData.tasksCompleted}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm sm:text-base bg-gray-100 cursor-not-allowed"
                    disabled
                  />
                </div>
                <div>
                  <label htmlFor="totalTasks" className="block font-semibold text-sm sm:text-base mb-1">
                    Total Tasks
                  </label>
                  <input
                    type="number"
                    id="totalTasks"
                    name="totalTasks"
                    value={formData.totalTasks}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm sm:text-base bg-gray-100 cursor-not-allowed"
                    disabled
                  />
                </div>
                <div>
                  <label htmlFor="performance" className="block font-semibold text-sm sm:text-base mb-1">
                    Performance (%)
                  </label>
                  <input
                    type="number"
                    id="performance"
                    name="performance"
                    value={formData.performance}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm sm:text-base bg-gray-100 cursor-not-allowed"
                    disabled
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="achievements" className="block font-semibold text-sm sm:text-base mb-1">
                    Achievements
                  </label>
                  <textarea
                    id="achievements"
                    name="achievements"
                    rows="3"
                    value={formData.achievements}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#113a69] resize-none"
                    disabled={loading}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-sm sm:text-base mb-1">Performance Breakdown</label>
                  <div className="h-48 sm:h-64">
                    <Bar data={modalChartData} options={modalChartOptions} />
                  </div>
                </div>
              </div>
              <div className="mt-4 sm:mt-6 flex justify-end gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-3 sm:px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition text-sm sm:text-base"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 sm:px-5 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 transition text-sm sm:text-base"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : editingEmployee ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              disabled={loading}
            >
              <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeePerformance;