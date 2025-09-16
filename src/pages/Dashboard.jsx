import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaEdit,
  FaTrash,
  FaUsers,
  FaBuilding,
  FaUserTie,
  FaSearch,
  FaEye,
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
import Header from "../components/Header";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/admin/departments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/admin/employees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch employees");
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
          (dept) => employees.filter((emp) => emp.department?.name === dept.name).length
        ),
        backgroundColor: [
          "rgb(6,57,112)",
          "#3E5567",
          "#488EC7",
          "rgba(36,153,196,255)",
          "rgb(61, 101, 133)",
        ],
      },
    ],
  };

  const statusData = {
    labels: ["Active", "On Leave", "Inactive"],
    datasets: [
      {
        data: [stats.active, stats.onLeave, stats.inactive],
        backgroundColor: ["#5591C0", "rgba(16,116,168,255)", "#074983"],
      },
    ],
  };

  const filteredDepartments = departments.filter(
    (d) =>
      d.head?.toLowerCase().includes(search.toLowerCase()) ||
      d.name?.toLowerCase().includes(search.toLowerCase())
  );

  const statCards = [
    { label: "Departments", value: stats.departments, icon: <FaBuilding size={45} className="p-2 rounded-full bg-white text-blue-900" />, color: "from-blue-50 to-blue-0 text-blue-900" },
    { label: "Employees", value: stats.employees, icon: <FaUsers size={45} className="p-2 rounded-full bg-white text-blue-900" />, color: "from-blue-50 to-blue-0 text-blue-900" },
    { label: "Active", value: stats.active, icon: <FaUserCheck size={45} className="p-2 rounded-full bg-white text-blue-900" />, color: "from-blue-50 to-blue-0 text-blue-900" },
    { label: "On Leave", value: stats.onLeave, icon: <FaUserClock size={45} className="p-2 rounded-full bg-white text-blue-900" />, color: "from-blue-50 to-blue-0 text-blue-900" },
    { label: "Inactive", value: stats.inactive, icon: <FaUserTimes size={45} className="p-2 rounded-full bg-white text-blue-900" />, color: "from-blue-50 to-blue-0 text-blue-900" },
  ];

  return (
    <>
      {/* <Header/> */}
    <div className="p-6 space-y-8 bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-[#113a69] tracking-tight font-serif">
            HR DASHBOARD
          </h1>
          <p className="text-gray-600 mt-1">All insights at one glance</p>
        </div>
       
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
        {statCards.map((stat, idx) => (
          <div
            key={idx}
            className={`flex flex-col items-start p-5 bg-gradient-to-r ${stat.color} rounded-md text-white shadow-md hover:scale-105 transform transition duration-500`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white bg-opacity-20 rounded-full text-[#113a69]">{stat.icon}</div>
              <p className="text-lg opacity-90 font-medium text-[#113a69]">{stat.label}</p>
            </div>
            <p className="text-3xl font-bold ml-4 text-[#113a69]">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 max-w-md relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search departments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 w-full border rounded-lg p-2 bg-white/70 backdrop-blur focus:ring-2 focus:ring-[#113a69] focus:outline-none"
          />
        </div>
      </div>

      {/* Departments */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-[#113a69]">Departments</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDepartments.map((dept) => (
            <div
              key={dept._id}
              className="bg-white/80 backdrop-blur p-6 shadow hover:shadow-xl transition border border-gray-200"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FaBuilding className="text-[#113a69]" />
                </div>
                <div className="flex gap-2">
                  <button className="text-[#113a69] hover:scale-110 transition">
                    {/* <FaEye /> */}
                  </button>
                  <button className="text-green-600 hover:scale-110 transition">
                    {/* <FaEdit /> */}
                  </button>
                  <button className="text-red-600 hover:scale-110 transition">
                    {/* <FaTrash /> */}
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-xl">{dept.name}</h3>
              <p className="text-gray-500 text-[14px] flex items-center gap-1">
                <FaUserTie /> {dept.head || "N/A"}
              </p>
              <p className="text-gray-500 text-[14px] text-sm flex items-center gap-1">
                <FaUsers /> {dept.employeeCount || 0} employees
              </p>
              <div className="w-full h-2 bg-gray-100 rounded-full mt-3">
                <div
                  className="h-2 bg-[#113a69] rounded-full transition-all"
                  style={{ width: `${(dept.employeeCount || 0) * 10}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-gray-800">Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/80 backdrop-blur p-6 rounded-xl shadow border">
            <h3 className="text-lg font-medium mb-4">Employees by Department</h3>
            <Bar
              data={departmentData}
              options={{ responsive: true, plugins: { legend: { display: false } } }}
            />
          </div>
          <div className="bg-white/80 backdrop-blur p-6 rounded-xl shadow border w-[600px] h-[650px]">
            <h3 className="text-lg font-medium mb-4">Employees by Status</h3>
            <Doughnut
              data={statusData}
              options={{ responsive: true, plugins: { legend: { position: "bottom" } } }}
            />
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Dashboard;
