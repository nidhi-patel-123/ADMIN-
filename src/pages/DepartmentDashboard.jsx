import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus, FaTimes, FaUsers, FaBuilding, FaUserTie, FaSearch, FaSort, FaEye } from 'react-icons/fa';
import { MdPersonAdd } from 'react-icons/md';
import axios from "axios";

const DepartmentDashboard = () => {
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

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(8);
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
            console.error(err);
        }
    };

    const filtered = departments.filter(
        d => d.head.toLowerCase().includes(search.toLowerCase()) ||
            d.name.toLowerCase().includes(search.toLowerCase())
    );

    const sorted = [...filtered].sort((a, b) => {
        let aVal = a[sortBy];
        let bVal = b[sortBy];

        if (sortBy === "employeeCount") {
            aVal = a.employeeCount || 0;
            bVal = b.employeeCount || 0;
        }

        if (sortOrder === "asc") return aVal > bVal ? 1 : -1;
        else return aVal < bVal ? 1 : -1;
    });

    const totalPages = Math.ceil(sorted.length / perPage);
    const data = sorted.slice((page - 1) * perPage, page * perPage);

    const stats = {
        totalEmployees: employees.length,
        activeEmployees: employees.filter(emp => emp.status === 'active').length,
        departmentsCount: departments.length,
    };

    const getEmployeesByDepartment = (deptId) => employees.filter(emp => emp.department === deptId);

    const getStatusColor = (status) => ({
        'active': 'bg-green-100 text-green-800',
        'on leave': 'bg-yellow-100 text-yellow-800',
        'inactive': 'bg-red-100 text-red-800'
    }[status] || 'bg-gray-100 text-gray-800');

    return (
        <div className="p-6 space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Department Dashboard</h1>
                <p className="text-gray-600 mt-1">Manage departments and teams efficiently.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
                    <p className="text-sm text-gray-500">Total Departments</p>
                    <p className="text-2xl font-bold">{stats.departmentsCount}</p>
                    <div className="w-full h-2 bg-blue-100 rounded-full mt-3">
                        <div className="h-2 bg-blue-600 rounded-full" style={{ width: `${stats.departmentsCount * 10}%` }}></div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
                    <p className="text-sm text-gray-500">Total Employees</p>
                    <p className="text-2xl font-bold">{stats.totalEmployees}</p>
                    <div className="w-full h-2 bg-green-100 rounded-full mt-3">
                        <div className="h-2 bg-green-600 rounded-full" style={{ width: `${stats.totalEmployees * 5}%` }}></div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
                    <p className="text-sm text-gray-500">Active Employees</p>
                    <p className="text-2xl font-bold">{stats.activeEmployees}</p>
                    <div className="w-full h-2 bg-purple-100 rounded-full mt-3">
                        <div className="h-2 bg-purple-600 rounded-full" style={{ width: `${stats.activeEmployees * 10}%` }}></div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-1 max-w-md relative">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search departments..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-10 w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                </div>
                <button
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    onClick={() => setShowModal(true)}
                >
                    <FaPlus /> Add Department
                </button>
            </div>

            {/* Departments Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {data.map(dept => (
                    <div key={dept._id} className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition">
                        <div className="flex justify-between items-start mb-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <FaBuilding className="text-blue-600" />
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setSelectedDepartment(dept) || setShowDetailsModal(true)} className="text-blue-600"><FaEye /></button>
                                <button onClick={() => setForm({ ...dept }) || setShowModal(true)} className="text-green-600"><FaEdit /></button>
                                <button className="text-red-600"><FaTrash /></button>
                            </div>
                        </div>
                        <h3 className="font-semibold text-lg">{dept.name}</h3>
                        <p className="text-gray-500 text-sm flex items-center gap-1"><FaUserTie /> {dept.head}</p>
                        <p className="text-gray-500 text-sm flex items-center gap-1"><FaUsers /> {dept.employeeCount || 0} employees</p>

                        {/* Mini progress bar for employees */}
                        <div className="w-full h-2 bg-gray-100 rounded-full mt-3">
                            <div className="h-2 bg-blue-400 rounded-full" style={{ width: `${(dept.employeeCount || 0) * 10}%` }}></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DepartmentDashboard;
