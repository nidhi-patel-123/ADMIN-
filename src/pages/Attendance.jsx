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
  const formatDate = (date) =>
    date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${formatDate(monday)} - ${formatDate(sunday)}`;
}

// Calculate total hours (checkOut - checkIn, excluding breaks)
function calculateTotalHours(checkIn, checkOut, breakStart, breakEnd) {
  if (!checkIn || !checkOut) return "—";
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  let totalMs = end - start;

  // Subtract break time if both breakStart and breakEnd exist
  if (breakStart && breakEnd) {
    const breakStartTime = new Date(breakStart);
    const breakEndTime = new Date(breakEnd);
    const breakDurationMs = breakEndTime - breakStartTime;

    // Ensure break duration is valid and subtract from total time
    if (breakDurationMs > 0) {
      totalMs -= breakDurationMs;
    }
  }

  if (totalMs <= 0) return "—";
  const hours = Math.floor(totalMs / (1000 * 60 * 60));
  const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
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
    today.setDate(today.getDate() + currentWeek * 7);
    return getWeekBounds(today);
  }, [currentWeek]);

  const totalWeeks = useMemo(() => {
    // Show last 12 weeks
    return 12;
  }, []);

  const fetchEmployees = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/admin/employees`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
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
        params.from = weekBounds.monday.toISOString().split("T")[0];
        params.to = weekBounds.sunday.toISOString().split("T")[0];
      }

      const res = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/admin/attendance`,
        {
          params,
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRecords(res.data.items || []);
      setTotal(res.data.total || 0);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load attendance");
    } finally {
      setLoading(false);
    }
  };

  // Load today's attendance and map by employee id
  const fetchToday = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const res = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/admin/attendance`,
        {
          params: { from: dateStr, to: dateStr, page: 1, limit: 10000 },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const map = {};
      (res.data.items || []).forEach((r) => {
        map[r.employee?._id || r.employee] = r;
      });
      setTodayMap(map);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [currentWeek, employeeId, weekBounds]);

  useEffect(() => {
    fetchToday();
  }, [employees.length]);

  const handleAttendanceToggle = async (
    empId,
    currentStatus,
    isBreakToggle = false
  ) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      if (isBreakToggle) {
        const record = todayMap[empId];
        const onBreak = record?.breakStart && !record?.breakEnd;
        if (!record?.checkIn || record?.checkOut) {
          alert(
            "Employee must be checked in and not checked out to toggle break"
          );
          return;
        }
        if (!onBreak) {
          // Break in
          await axios.post(
            `${process.env.REACT_APP_BACKEND_URL}/admin/attendance/breakin`,
            { employeeId: empId },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } else {
          // Break out
          await axios.post(
            `${process.env.REACT_APP_BACKEND_URL}/admin/attendance/breakout`,
            { employeeId: empId },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      } else {
        if (currentStatus === "absent") {
          // Check in
          await axios.post(
            `${process.env.REACT_APP_BACKEND_URL}/admin/attendance/checkin`,
            { employeeId: empId },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } else if (currentStatus === "working") {
          // Check out
          await axios.post(
            `${process.env.REACT_APP_BACKEND_URL}/admin/attendance/checkout`,
            { employeeId: empId },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      }

      await Promise.all([fetchToday(), fetchAttendance()]);
    } catch (e) {
      alert(e.response?.data?.message || "Failed to update attendance");
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen font-sans space-y-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-[#113a69]">
            Employee Attendance
          </h1>
        </div>
        <p className="text-gray-600">
          Monitor, record, and manage employee attendance, check-ins, check-outs, and breaks.
        </p>
      </div>

      {/* Week Navigation */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            Week: {formatWeekRange(weekBounds.monday, weekBounds.sunday)}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() =>
                setCurrentWeek((prev) => Math.max(-totalWeeks + 1, prev - 1))
              }
              disabled={currentWeek <= -totalWeeks + 1}
              className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
            >
              Previous Week
            </button>
            <button
              onClick={() => setCurrentWeek(0)}
              className="px-3 py-1 bg-[#113a69] text-white rounded hover:bg-[#1b5393]"
            >
              Current Week
            </button>
            <button
              onClick={() => setCurrentWeek((prev) => Math.min(0, prev + 1))}
              disabled={currentWeek >= 0}
              className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
            >
              Next Week
            </button>
          </div>
        </div>
      </div>

      {/* Weekly Attendance Records */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <div className="px-4 pt-4 pb-2 text-sm text-gray-700 font-medium">
          Weekly Attendance Records (
          {formatWeekRange(weekBounds.monday, weekBounds.sunday)})
        </div>
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50 text-left text-sm text-gray-700">
              <th className="px-4 py-3 border-b">Name</th>
              <th className="px-4 py-3 border-b">Date</th>
              <th className="px-4 py-3 border-b">Check In</th>
              <th className="px-4 py-3 border-b">Check Out</th>
              <th className="px-4 py-3 border-b">Break In</th>
              <th className="px-4 py-3 border-b">Break Out</th>
              <th className="px-4 py-3 border-b">Total Hours</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-red-600">
                  {error}
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                  No attendance found for this week
                </td>
              </tr>
            ) : (
              records.map((r) => (
                <tr key={r._id} className="hover:bg-gray-50">
                   <td className="px-4 py-3 border-b font-bold">
                    {r.employee?.name || "—"}
                  </td>
                  <td className="px-4 py-3 border-b">
                    {new Date(r.attendanceDate).toLocaleDateString()}
                  </td>
                 
                  <td className="px-4 py-3 border-b">
                    {formatTime(r.checkIn)}
                  </td>
                  <td className="px-4 py-3 border-b">
                    {formatTime(r.checkOut)}
                  </td>
                  <td className="px-4 py-3 border-b">
                    {formatTime(r.breakStart)}
                  </td>
                  <td className="px-4 py-3 border-b">
                    {formatTime(r.breakEnd)}
                  </td>
                  <td className="px-4 py-3 border-b">
                    {calculateTotalHours(
                      r.checkIn,
                      r.checkOut,
                      r.breakStart,
                      r.breakEnd
                    )}
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
