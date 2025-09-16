import React, { useState, useEffect } from "react";
import axios from "axios";

const EmployeeAdd = ({ onSuccess }) => {
  const [form, setForm] = useState({
    name: "",
    role: "",
    department: "",
    mobile: "",
    email: "",
    joiningDate: "",
    gender: "",
    status: "",
    password: "",
    address: "",
    basicSalary: "",
  });
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch departments on mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/admin/departments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDepartments(response.data);
        if (response.data.length > 0) {
          setForm((prev) => ({ ...prev, department: response.data[0]._id }));
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch departments");
        console.error(err);
      }
    };
    fetchDepartments();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    for (let key in form) {
      if (!form[key]) {
        setError(`${key.charAt(0).toUpperCase() + key.slice(1)} is required`);
        return;
      }
    }
    setLoading(true);
    setError("");
    try {
      const token = sessionStorage.getItem("token");
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/admin/employees`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add employee");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    onSuccess(); // Closes form and refreshes list
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow rounded-b-lg p-6 space-y-6 mb-10"
    >
      <h2 className="text-lg font-semibold">New Entry</h2>
      {error && <p className="text-red-500">{error}</p>}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block mb-1 font-medium">Name*</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
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
            name="role"
            value={form.role}
            onChange={handleChange}
            placeholder="Enter The Role..."
            className="w-full border p-2 rounded"
            required
            disabled={loading}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Department*</label>
          <select
            name="department"
            value={form.department}
            onChange={handleChange}
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
            name="mobile"
            value={form.mobile}
            onChange={handleChange}
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
            name="joiningDate"
            value={form.joiningDate}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
            disabled={loading}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Email*</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter The Email..."
            className="w-full border p-2 rounded"
            required
            disabled={loading}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Gender*</label>
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
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
          <label className="block mb-1 font-medium">Employee Status*</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
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
          <label className="block mb-1 font-medium">Password*</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="********"
            className="w-full border p-2 rounded"
            required
            disabled={loading}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Address*</label>
          <input
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Enter The Address..."
            className="w-full border p-2 rounded"
            required
            disabled={loading}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Basic Salary*</label>
          <input
            type="number"
            name="basicSalary"
            value={form.basicSalary}
            onChange={handleChange}
            placeholder="Enter Basic Salary..."
            className="w-full border p-2 rounded"
            required
            min="0"
            step="0.01"
            disabled={loading}
          />
        </div>
      </div>
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={handleCancel}
          className="bg-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-400"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-blue-900 text-white px-6 py-2 rounded hover:bg-blue-800"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </div>
    </form>
  );
};

export default EmployeeAdd;