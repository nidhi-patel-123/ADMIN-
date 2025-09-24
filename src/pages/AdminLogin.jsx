import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserIcon, LockClosedIcon, UsersIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validations
    if (!email) {
      setError("Email field cannot be empty");
      toast.error("Please enter a valid email or password", {
        position: "top-right",
        autoClose: 3000,
      });
      setLoading(false);
      return;
    }
    if (!password) {
      setError("Password field cannot be empty");
      toast.error("Please enter a valid email or password", {
        position: "top-right",
        autoClose: 3000,
      });
      setLoading(false);
      return;
    }

    try {
      // Make API call to backend
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/admin/login`, {
        email,
        password,
      });

      // Store JWT token in sessionStorage
      sessionStorage.setItem("token", response.data.token);

      // Notify app about auth change (same-tab)
      window.dispatchEvent(new Event("auth-changed"));

      // Show success toast
      toast.success("Login successful!", {
        position: "top-right",
        autoClose: 2000,
      });

      // Redirect to dashboard
      navigate("/");
    } catch (err) {
      setLoading(false);
      if (err.response) {
        setError(err.response.data.message || "Login failed. Please try again.");
        toast.error("Please enter a valid email or password", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        setError("Server error. Please try again later.");
        toast.error("Server error. Please try again later.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-6xl">
        {/* Left Illustration */}
        <div className="hidden md:flex flex-1 items-center justify-center">
          <div className="relative">
            <img
              src="https://img.freepik.com/premium-vector/mobile-login-flat-design-vector-illustration_1288538-7525.jpg?w=1480"
              alt="workspace"
              className="max-w-2xl"
            />
          </div>
        </div>

        {/* Right Login Card */}
        <div className="w-full md:w-[480px] bg-white rounded-2xl shadow-lg p-10 relative h-[480px]">
          {/* Header */}
          <div className="flex items-center space-x-2 mb-6">
            <UsersIcon className="w-6 h-6 text-[#113a69] mt-10" />
            <h2 className="text-lg font-semibold text-gray-800 mt-10">
              Admin Dashboard Login
            </h2>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-red-500 text-sm font-semibold mb-2">{error}</p>
          )}

          {/* Welcome Text */}
          <h3 className="text-2xl font-bold text-gray-800">WELCOME BACK</h3>
          <p className="text-gray-500 mb-6">Access your admin dashboard</p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="relative">
              <UserIcon className="w-5 h-5 absolute left-3 top-3 text-[#113a69]" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#113a69]"
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div className="relative">
              <LockClosedIcon className="w-5 h-5 absolute left-3 top-3 text-[#113a69]" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#113a69]"
                disabled={loading}
                autoComplete="current-password"
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-3 top-2.5 text-[#113a69] focus:outline-none"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                disabled={loading}
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Button */}
            <button
              type="submit"
              className="w-full flex justify-center items-center space-x-2 bg-[#113a69] text-white py-2 rounded-lg hover:bg-[#1b5393] transition disabled:bg-blue-400"
              disabled={loading}
            >
              {loading ? (
                <span>Loading...</span>
              ) : (
                <>
                  <span>Login to Admin Dashboard</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default AdminLogin;