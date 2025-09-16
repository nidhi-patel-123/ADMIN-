import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

function formatMinutes(mins) {
  if (!mins || mins <= 0) return "—";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

function formatTime(value) {
  return value ? new Date(value).toLocaleTimeString() : "—";
}

function statusBadge(status) {
  const map = {
    present: "bg-green-100 text-green-700",
    working: "bg-blue-100 text-blue-700",
    absent: "bg-red-100 text-red-700",
  };
  return map[status] || "bg-gray-100 text-gray-700";
}

// Get week start (Monday) and end (Sunday) for a given date
function getWeekBounds(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const monday = new Date(d.setDate(diff));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { monday, sunday };
}

// Format week range for display
function formatWeekRange(monday, sunday) {
  const formatDate = (date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${formatDate(monday)} - ${formatDate(sunday)}`;
}

export default function AttendanceTable() {
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentWeek, setCurrentWeek] = useState(0); // 0 = current week, -1 = last week, etc.
  const [limit] = useState(10);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [todayMap, setTodayMap] = useState({});

  // Calculate current week bounds
  const weekBounds = useMemo(() => {
    const today = new Date();
    today.setDate(today.getDate() + (currentWeek * 7));
    return getWeekBounds(today);
  }, [currentWeek]);

  const totalWeeks = useMemo(() => {
    // Show last 12 weeks
    return 12;
  }, []);

  const fetchEmployees = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/admin/employees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAttendance = async () => {
    setLoading(true);
    setError("");
    try {
      const token = sessionStorage.getItem("token");
      const params = { page: 1, limit: 1000 }; // Get all records for the week
      if (from) params.from = from;
      if (to) params.to = to;
      if (employeeId) params.employeeId = employeeId;

      // Use week bounds if no custom date range
      if (!from && !to) {
        params.from = weekBounds.monday.toISOString().split('T')[0];
        params.to = weekBounds.sunday.toISOString().split('T')[0];
      }

      const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/admin/attendance`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecords(res.data.items || []);
      setTotal(res.data.total || 0);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load attendance");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWeek, employeeId, weekBounds]);

  const handleFilter = (e) => {
    e.preventDefault();
    setCurrentWeek(0); // Reset to current week when filtering
    fetchAttendance();
  };

  // Load today's attendance and map by employee id
  const fetchToday = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/admin/attendance`, {
        params: { from: dateStr, to: dateStr, page: 1, limit: 10000 },
        headers: { Authorization: `Bearer ${token}` },
      });
      const map = {};
      (res.data.items || []).forEach((r) => { map[r.employee?._id || r.employee] = r; });
      setTodayMap(map);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchToday();
  }, [employees.length]);

  const handleAttendanceToggle = async (empId, currentStatus) => {
    try {
      const token = sessionStorage.getItem("token");

      if (currentStatus === 'absent') {
        // Check in
        await axios.post(`${process.env.REACT_APP_BACKEND_URL}/admin/attendance/checkin`,
          { employeeId: empId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else if (currentStatus === 'working') {
        // Check out
        await axios.post(`${process.env.REACT_APP_BACKEND_URL}/admin/attendance/checkout`,
          { employeeId: empId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      await Promise.all([fetchToday(), fetchAttendance()]);
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to update attendance');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Employee Attendance</h2>
      </div>

      {/* Week Navigation */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            Week: {formatWeekRange(weekBounds.monday, weekBounds.sunday)}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentWeek(prev => Math.max(-totalWeeks + 1, prev - 1))}
              disabled={currentWeek <= -totalWeeks + 1}
              className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
            >
              Previous Week
            </button>
            <button
              onClick={() => setCurrentWeek(0)}
              className="px-3 py-1 bg-[#113a69] text-white rounded hover:bg-[#1b5393] "
            >
              Current Week
            </button>
            <button
              onClick={() => setCurrentWeek(prev => Math.min(0, prev + 1))}
              disabled={currentWeek >= 0}
              className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
            >
              Next Week
            </button>
          </div>
        </div>
      </div>

      {/* Today's Attendance - Quick Actions */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <div className="px-4 pt-4 pb-2 text-sm text-gray-700 font-medium">Today's Attendance - Quick Actions</div>
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50 text-left text-sm text-gray-700">
              <th className="px-4 py-3 border-b">Name</th>
              <th className="px-4 py-3 border-b">Check In</th>
              <th className="px-4 py-3 border-b">Check Out</th>
              <th className="px-4 py-3 border-b">Working Hours</th>
              <th className="px-4 py-3 border-b">Status</th>
              <th className="px-4 py-3 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">No employees found</td>
              </tr>
            ) : (
              employees.map((emp) => {
                const rec = todayMap[emp._id] || {};
                const status = rec.status || 'absent';
                return (
                  <tr key={emp._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 border-b">{emp.name}</td>
                    <td className="px-4 py-3 border-b">{formatTime(rec.checkIn)}</td>
                    <td className="px-4 py-3 border-b">{formatTime(rec.checkOut)}</td>
                    <td className="px-4 py-3 border-b">{formatMinutes(rec.workingMinutes)}</td>
                    <td className="px-4 py-3 border-b">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${statusBadge(status)}`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 border-b">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={status === 'working'}
                          onChange={() => handleAttendanceToggle(emp._id, status)}
                          disabled={status === 'present'}
                          className="sr-only peer"
                        />
                        <div className={`relative w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer transition-all ${
                          status === 'present'
                            ? 'bg-green-600 cursor-not-allowed'
                            : status === 'working'
                            ? 'bg-[#113a69]'
                            : 'bg-gray-200'
                        } ${status === 'present' ? '' : 'peer-checked:after:translate-x-full'} peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}>
                        </div>
                        <span className={`ml-3 text-sm font-medium ${
                          status === 'present' ? 'text-green-600' : 'text-gray-900'
                        }`}>
                          {status === 'absent' ? 'Check In' : status === 'working' ? 'Check Out' : 'Present'}
                        </span>
                      </label>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {/* Custom Date Range Filter */}
      <form onSubmit={handleFilter} className="bg-white p-4 rounded-lg shadow space-y-3 md:space-y-0 md:flex md:items-end md:gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">From</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">To</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">Employee</label>
          <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className="mt-1 w-full border rounded px-3 py-2">
            <option value="">All</option>
            {employees.map((emp) => (
              <option key={emp._id} value={emp._id}>{emp.name}</option>
            ))}
          </select>
        </div>
        <div>
          <button type="submit" className="w-full md:w-auto px-4 py-2 bg-[#113a69] text-white rounded hover:bg-[#1b5393]">Apply</button>
        </div>
      </form>
      {/* Weekly Attendance Records */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <div className="px-4 pt-4 pb-2 text-sm text-gray-700 font-medium">
          Weekly Attendance Records ({formatWeekRange(weekBounds.monday, weekBounds.sunday)})
        </div>
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50 text-left text-sm text-gray-700">
              <th className="px-4 py-3 border-b">Date</th>
              <th className="px-4 py-3 border-b">Name</th>
              <th className="px-4 py-3 border-b">Check In</th>
              <th className="px-4 py-3 border-b">Check Out</th>
              <th className="px-4 py-3 border-b">Working Hours</th>
              <th className="px-4 py-3 border-b">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">Loading...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-red-600">{error}</td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">No attendance found for this week</td>
              </tr>
            ) : (
              records.map((r) => (
                <tr key={r._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 border-b">{new Date(r.attendanceDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 border-b">{r.employee?.name || "—"}</td>
                  <td className="px-4 py-3 border-b">{formatTime(r.checkIn)}</td>
                  <td className="px-4 py-3 border-b">{formatTime(r.checkOut)}</td>
                  <td className="px-4 py-3 border-b">{formatMinutes(r.workingMinutes)}</td>
                  <td className="px-4 py-3 border-b">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusBadge(r.status)}`}>
                      {r.status ? r.status.charAt(0).toUpperCase() + r.status.slice(1) : "—"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
