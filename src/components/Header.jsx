import React, { useState, useEffect, useRef } from "react";
import { BellIcon, UserCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";

const Header = () => {
  const navigate = useNavigate();
  const [openNotifications, setOpenNotifications] = useState(false);
  const [openAdmin, setOpenAdmin] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notifRef = useRef(null);
  const adminRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    // Initialize Socket.IO
    socketRef.current = io("https://backend-6bli.onrender.com", {
      withCredentials: true,
    });

    // Join admin room
    const token = sessionStorage.getItem("token");
    const getIdFromToken = (jwt) => {
      try {
        if (!jwt) return null;
        const base64Url = jwt.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map(function (c) {
              return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join("")
        );
        const parsed = JSON.parse(jsonPayload);
        return parsed.id || parsed._id || null;
      } catch (e) {
        return null;
      }
    };
    const derivedId = sessionStorage.getItem("adminId") || getIdFromToken(token);
    if (derivedId && !sessionStorage.getItem("adminId")) {
      sessionStorage.setItem("adminId", derivedId);
    }
    socketRef.current.emit("join", derivedId || null, "admin");

    // Listen for new notifications
    socketRef.current.on("newNotification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    // Listen for deleted notifications
    socketRef.current.on("notificationDeleted", ({ id }) => {
      setNotifications((prev) => prev.filter((notif) => notif._id !== id));
    });

    // Fetch initial notifications
    fetchNotifications();

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("https://backend-6bli.onrender.com/admin/notifications", {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          'x-user-id': sessionStorage.getItem("adminId") || '',
        },
      });
      const data = await response.json();
      if (data.status === "success") {
        setNotifications(data.data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await fetch(`https://backend-6bli.onrender.com/notifications/${id}/read`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === id ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const deleteNotification = async (id) => {
    if (window.confirm("Are you sure you want to delete this notification?")) {
      try {
        const response = await fetch(`https://backend-6bli.onrender.com/notifications/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            'x-user-id': sessionStorage.getItem("adminId") || '',
          },
        });
        if (response.ok) {
          setNotifications((prev) => prev.filter((notif) => notif._id !== id));
        } else {
          console.error("Failed to delete notification");
        }
      } catch (error) {
        console.error("Error deleting notification:", error);
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setOpenNotifications(false);
      }
      if (adminRef.current && !adminRef.current.contains(event.target)) {
        setOpenAdmin(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("adminId");
    navigate("/admin/login");
    window.location.reload();
  };

  return (
    <header className="flex justify-between items-center bg-white shadow-md px-6 py-3 sticky top-0 z-50">
      <div
        className="text-2xl font-bold text-[#113a69] cursor-pointer ml-[-50px]"
        onClick={() => navigate("/")}
      >
        DASHBOARD
      </div>

      <div className="flex items-center gap-6">
        <div className="relative" ref={notifRef}>
          <BellIcon
            className="h-6 w-6 text-gray-800 cursor-pointer hover:text-[#113a69] transition-colors"
            onClick={() => setOpenNotifications(!openNotifications)}
          />
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#113a69] text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              {notifications.filter((n) => !n.read).length}
            </span>
          )}

          {openNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-[#113a69] border shadow-lg rounded-md overflow-hidden z-50">
              <h4 className="font-semibold text-gray-100 px-4 py-2 border-b">
                Notifications
              </h4>
              <ul className="max-h-60 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((note) => (
                    <li
                      key={note._id}
                      className={`px-4 py-2 hover:bg-gray-800 cursor-pointer text-sm text-gray-100 flex justify-between items-center ${note.read ? "opacity-50" : ""
                        }`}
                      onClick={() => !note.read && markAsRead(note._id)}
                    >
                      <div className="flex-1">
                        <span>{note.message}</span>
                        <span className="text-xs text-gray-400 block">
                          {new Date(note.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(note._id);
                        }}
                        className="text-gray-400 hover:text-red-500 text font-bold"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </li>
                  ))
                ) : (
                  <div className="px-4 py-2 text-sm text-gray-400">
                    No notifications
                  </div>
                )}
              </ul>
            </div>
          )}
        </div>

        <div className="relative" ref={adminRef}>
          <div
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 rounded-full px-2 py-1 transition-colors"
            onClick={() => setOpenAdmin(!openAdmin)}
          >
            <UserCircleIcon className="h-8 w-8 text-gray-600" />
            <span className="text-gray-700 font-medium text-sm">Admin</span>
          </div>

          {openAdmin && (
            <div className="absolute right-0 mt-2 w-40 bg-white border shadow-lg rounded-md overflow-hidden z-50">
              <button
                onClick={() => {
                  navigate("/setting");
                  setOpenAdmin(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
              >
                My Profile
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
