import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { BiSolidDashboard } from 'react-icons/bi';
import { ClipboardList } from 'lucide-react';
import { AiTwotoneCalendar } from 'react-icons/ai';
import { PiUsersThreeLight } from 'react-icons/pi';
import { PiChatsBold } from "react-icons/pi";
import {
  HomeIcon,
  UserGroupIcon,
  CalendarIcon,
  BriefcaseIcon,
  Cog6ToothIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import { FaUsers, FaUserTie } from "react-icons/fa";

const Sidebar = ({ isSidebarOpen, isSidebarCollapsed, setIsSidebarOpen }) => {
  const [openEmployees, setOpenEmployees] = useState(false);
  const location = useLocation();

  const menu = [
    { name: "Dashboard", icon: <HomeIcon className="h-8 w-8" />, path: "/" },
    { name: "Employees", icon: <ClipboardList className="h-8 w-8" />, path: "/employee" },
    { name: "Attendance", icon: <ClipboardDocumentListIcon className="h-8 w-8" />, path: "/attendance" },
    { name: "Leave Management", icon: <CalendarIcon className="h-8 w-8" />, path: "/leave" },
    { name: "Projects", icon: <BriefcaseIcon className="h-8 w-8" />, path: "/projects" },
    { name: "Departments", icon: <BuildingOfficeIcon className="h-8 w-8" />, path: "/departments" },
    { name: "Payroll", icon: <CurrencyDollarIcon className="h-8 w-8" />, path: "/payroll" },
    { name: "Employee performance", icon: <PiUsersThreeLight className="h-8 w-8" />, path: "/employee-p" },
    { name: "Chat", icon: <PiChatsBold className="h-7 w-7" />, path: "/chat" },
    { name: "Setting", icon: <Cog6ToothIcon className="h-8 w-8" />, path: "/setting" },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity duration-300 ease-in-out"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      <div
        className={`bg-white shadow-lg flex flex-col h-screen transition-all duration-300 ease-in-out z-50
          ${isSidebarCollapsed ? "w-16" : "w-64"}
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          fixed inset-y-0 left-0 md:sticky md:top-0 md:translate-x-0`}
      >
        <div className="p-3 border-b overflow-hidden h-[65px]">
          <img
            src={isSidebarCollapsed ? "https://admin-sigma-blue.vercel.app/assets/logo2-9Q67aAO5.png" : "/logo-brainart.jpg"}
            className="transition-all duration-300 ease-in-out object-contain h-[50px]"
            alt="Logo"
          />

        </div>
        <nav className="flex-1 overflow-y-auto mt-2">
          {menu.map((item, index) =>
            item.dropdown ? (
              <div key={index} className="border-b">
                <button
                  onClick={() => setOpenEmployees(!openEmployees)}
                  className={`flex items-center w-full px-4 py-3 transition-colors duration-200 ease-in-out
                    ${location.pathname.includes("/employees")
                      ? "bg-[#113a69] text-white"
                      : "text-gray-600 hover:bg-[#113a69] hover:text-white"
                    } ${isSidebarCollapsed ? "justify-center px-2" : "justify-between"}`}
                >
                  <span className="flex items-center gap-3 min-w-0">
                    {item.icon}
                    {!isSidebarCollapsed && (
                      <span className="truncate">{item.name}</span>
                    )}
                  </span>
                </button>
                {openEmployees && !isSidebarCollapsed && (
                  <div className="pl-12 bg-gray-50 transition-all duration-300 ease-in-out">
                    {item.dropdown.map((sub, i) => (
                      <Link
                        key={i}
                        to={sub.path}
                        className={`flex items-center gap-3 w-full px-4 py-2 text-sm transition-colors duration-200 ease-in-out
                          ${location.pathname === sub.path
                            ? "bg-[#113a69] text-white"
                            : "text-gray-600 hover:bg-[#113a69] hover:text-white"
                          }`}
                        onClick={() => setIsSidebarOpen(false)}
                      >
                        {sub.icon}
                        <span className="truncate">{sub.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={index}
                to={item.path}
                className={`flex items-center w-full px-4 py-3 transition-colors duration-200 ease-in-out
                  ${location.pathname === item.path
                    ? "bg-[#113a69] text-white"
                    : "text-gray-600 hover:bg-[#c0d1e5] hover:text-[#113a69]"
                  } ${isSidebarCollapsed ? "justify-center px-2" : "gap-3"}`}
                onClick={() => setIsSidebarOpen(false)}
              >
                {item.icon}
                {!isSidebarCollapsed && (
                  <span className="truncate">{item.name}</span>
                )}
              </Link>
            )
          )}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;