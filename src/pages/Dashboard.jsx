import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaBuilding,
  FaUsers,
  FaUserCheck,
  FaUserClock,
  FaUserTimes,
} from "react-icons/fa";
import { Plus, Download } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import PerformanceChar from "../components/PerformanceChar"; // Updated import

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [performances, setPerformances] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedView, setSelectedView] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
    fetchPerformances();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/admin/departments`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDepartments(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch departments");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/admin/employees`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setEmployees(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  const fetchPerformances = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/admin/performances`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPerformances(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch performance data");
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    departments: departments.length,
    employees: employees.length,
    active: employees.filter((e) => e.status === "active").length,
    onLeave: employees.filter((e) => e.status === "on leave").length,
    inactive: employees.filter((e) => e.status === "inactive").length,
  };

  const departmentData = {
    labels: departments.map((d) => d.name),
    datasets: [
      {
        label: "Employees per Department",
        data: departments.map(
          (dept) =>
            employees.filter((emp) => emp.department?.name === dept.name).length
        ),
        backgroundColor: [
          "#203961",
          "#548cc3",
          "#5586a4",
          "#1c5986",
          "#80ABD5",
        ],
        borderRadius: 8,
      },
    ],
  };

  const statusData = {
    labels: ["Active", "On Leave", "Inactive"],
    datasets: [
      {
        data: [stats.active, stats.onLeave, stats.inactive],
        backgroundColor: ["#113a69", "#548cc3", "#80ABD5"],
        borderWidth: 0,
      },
    ],
  };

  const filteredDepartments = departments.filter(
    (d) =>
      d.head?.toLowerCase().includes(search.toLowerCase()) ||
      d.name?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredEmployees = (filterStatus = null) => {
    let filtered = filterStatus
      ? employees.filter((emp) => emp.status === filterStatus)
      : employees;

    if (search) {
      filtered = filtered.filter(
        (emp) =>
          emp.name?.toLowerCase().includes(search.toLowerCase()) ||
          emp.email?.toLowerCase().includes(search.toLowerCase()) ||
          emp.department?.name?.toLowerCase().includes(search.toLowerCase())
      );
    }

    return filtered;
  };

  const statCards = [
    {
      label: "Departments",
      value: stats.departments,
      icon: <FaBuilding size={24} />,
      color: "bg-[#fff] hover:bg-blue-50",
      onClick: () => {
        setSelectedView("departments");
        setShowDetails(true);
        setSearch("");
      },
    },
    {
      label: "Employees",
      value: stats.employees,
      icon: <FaUsers size={24} />,
      color: "bg-[#fff] hover:bg-blue-50",
      onClick: () => {
        setSelectedView("employees");
        setShowDetails(true);
        setSearch("");
      },
    },
    {
      label: "Active",
      value: stats.active,
      icon: <FaUserCheck size={24} />,
      color: "bg-[#fff] hover:bg-blue-50",
      onClick: () => {
        setSelectedView("active");
        setShowDetails(true);
        setSearch("");
      },
    },
    {
      label: "On Leave",
      value: stats.onLeave,
      icon: <FaUserClock size={24} />,
      color: "bg-[#fff] hover:bg-blue-50",
      onClick: () => {
        setSelectedView("onLeave");
        setShowDetails(true);
        setSearch("");
      },
    },
    {
      label: "Inactive",
      value: stats.inactive,
      icon: <FaUserTimes size={24} />,
      color: "bg-[#fff] hover:bg-blue-50",
      onClick: () => {
        setSelectedView("inactive");
        setShowDetails(true);
        setSearch("");
      },
    },
  ];

  const renderDepartmentDetails = () => (
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-semibold text-gray-800">Departments</h2>
        <input
          type="text"
          placeholder="Search by name or head..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-blue-50 text-blue-900">
              <th className="p-4 text-sm font-semibold">Department Name</th>
              <th className="p-4 text-sm font-semibold">Head</th>
              <th className="p-4 text-sm font-semibold">Employee Count</th>
              <th className="p-4 text-sm font-semibold">Employees</th>
            </tr>
          </thead>
          <tbody>
            {filteredDepartments.map((dept) => {
              const deptEmployees = employees.filter(
                (emp) => emp.department?.name === dept.name
              );
              return (
                <tr
                  key={dept._id}
                  className="border-b hover:bg-blue-50 transition-colors"
                >
                  <td className="p-4 text-sm text-gray-700">{dept.name}</td>
                  <td className="p-4 text-sm text-gray-700">
                    {dept.head || "N/A"}
                  </td>
                  <td className="p-4 text-sm text-gray-700">
                    {deptEmployees.length}
                  </td>
                  <td className="p-4 text-sm text-gray-700">
                    {deptEmployees.length > 0
                      ? deptEmployees.map((emp) => emp.name).join(", ")
                      : "No employees"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderEmployeeDetails = (filterStatus = null) => {
    const filtered = filteredEmployees(filterStatus);

    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            {filterStatus
              ? `${
                  filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)
                } Employees`
              : "All Employees"}
          </h2>
          <input
            type="text"
            placeholder="Search by name, email, or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-blue-50 text-blue-900">
                <th className="p-4 text-sm font-semibold">Name</th>
                <th className="p-4 text-sm font-semibold">Email</th>
                <th className="p-4 text-sm font-semibold">Department</th>
                <th className="p-4 text-sm font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((emp) => (
                  <tr
                    key={emp._id}
                    className="border-b hover:bg-blue-50 transition-colors"
                  >
                    <td className="p-4 text-sm text-gray-700">{emp.name}</td>
                    <td className="p-4 text-sm text-gray-700">
                      {emp.email || "N/A"}
                    </td>
                    <td className="p-4 text-sm text-gray-700">
                      {emp.department?.name || "N/A"}
                    </td>
                    <td className="p-4 text-sm text-gray-700 capitalize">
                      {emp.status}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="p-4 text-center text-sm text-gray-500"
                  >
                    No employees found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderDashboard = () => (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-[#113a69]">HR Dashboard</h1>
          </div>
          <p className="text-gray-600">All insights at one glance</p>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {loading && (
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
        {statCards.map((stat, idx) => (
          <div
            key={idx}
            className={`flex flex-col items-start p-4 sm:p-6 ${stat.color} rounded-md shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1`}
            onClick={stat.onClick}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-full text-blue-900">
                {stat.icon}
              </div>
              <p className="text-sm sm:text-base font-medium text-gray-800">
                {stat.label}
              </p>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-800">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">
          Analytics
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <h3 className="text-lg sm:text-xl font-medium text-gray-800 mb-4">
              Employees by Department
            </h3>
            <div className="h-64 sm:h-80">
              <Bar
                data={departmentData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { beginAtZero: true, ticks: { precision: 0 } },
                  },
                }}
              />
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <h3 className="text-lg sm:text-xl font-medium text-gray-800 mb-4">
              Employees by Status
            </h3>
            <div className="h-64 sm:h-80">
              <Doughnut
                data={statusData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: "bottom", labels: { boxWidth: 12 } },
                  },
                }}
              />
            </div>
          </div>
        </div>
          <PerformanceChar performances={performances} /> {/* Updated component */}
      </div>
    </>
  );

  return (
    <div className="p-4 sm:p-6 min-h-screen">
      {showDetails ? (
        <>
          <button
            className="mb-4 px-4 py-2 bg-[#113a69] text-white rounded-lg hover:bg-[#1b5393] transition-colors text-sm sm:text-base"
            onClick={() => {
              setShowDetails(false);
              setSearch("");
            }}
          >
            Back to Dashboard
          </button>
          {selectedView === "departments" && renderDepartmentDetails()}
          {selectedView === "employees" && renderEmployeeDetails()}
          {selectedView === "active" && renderEmployeeDetails("active")}
          {selectedView === "onLeave" && renderEmployeeDetails("on leave")}
          {selectedView === "inactive" && renderEmployeeDetails("inactive")}
        </>
      ) : (
        renderDashboard()
      )}
    </div>
  );
};

export default Dashboard;