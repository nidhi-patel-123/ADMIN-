import React, { useState } from "react";
import { Link,useLocation } from "react-router-dom";
import { BiSolidDashboard } from 'react-icons/bi';
import { ClipboardList } from 'lucide-react';
import { AiTwotoneCalendar } from 'react-icons/ai';

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
  PlusIcon,
  ListBulletIcon,
} from "@heroicons/react/24/outline";

const Sidebar = () => {
  const [openEmployees, setOpenEmployees] = useState(false);
  //  const [openEmployees, setOpenEmployees] = useState(false);
  const location = useLocation();

  const menu = [
    { name: "Dashboard", icon: <HomeIcon className="h-8 w-8" />, path: "/" },
    { name: "Employees", icon: <ClipboardList className="h-8 w-8" />, path: "/employee" },
    { name: "Attendance", icon: <ClipboardDocumentListIcon className="h-8 w-8" />, path: "/attendance" },
    { name: "Leave Management", icon: <CalendarIcon className="h-8 w-8" />, path: "/leave" },
    { name: "Projects", icon: <BriefcaseIcon className="h-8 w-8" />, path: "/projects" },
    { name: "Departments", icon: <BuildingOfficeIcon className="h-8 w-8" />, path: "/departments" },
    { name: "Payroll", icon: <CurrencyDollarIcon className="h-8 w-8" />, path: "/payroll" },
    { name: "Calendar", icon: <AiTwotoneCalendar className="h-8 w-8" />, path: "/calendar" },
    { name: "Setting", icon: <Cog6ToothIcon className="h-8 w-8" />, path: "/setting" },
  ];

  return (
     <div className="w-64 bg-white shadow-lg flex flex-col h-screen sticky top-0">
      <div className="p-4 text-2xl font-bold text-[#113a69] tracking-wide border-b w-[500px] z-50">
        WELCOME TO HR
      </div>
      <nav className="flex-1 overflow-y-auto mt-2">
        {menu.map((item, index) =>
          item.dropdown ? (
            <div key={index} className="border-b">
              <button
                onClick={() => setOpenEmployees(!openEmployees)}
                className={`flex items-center justify-between w-full px-6 py-3 transition-colors ${
                  location.pathname.includes("/employees")
                    ? "bg-blue-[#113a69] text-white"
                    : "text-gray-600 hover:bg-[#113a69] hover:text-white"
                }`}
              >
                <span className="flex items-center gap-3">
                  {item.icon}
                  {item.name}
                </span>
              </button>
              {openEmployees && (
                <div className="pl-14 bg-gray-50 transition-all duration-300">
                  {item.dropdown.map((sub, i) => (
                    <Link
                      key={i}
                      to={sub.path}
                      className={`flex items-center gap-3 w-full px-4 py-2 text-sm transition-colors ${
                        location.pathname === sub.path
                          ? "bg-[#113a69] text-white"
                          : "text-gray-600 hover:bg-[#113a69] hover:text-white"
                      }`}
                    >
                      {sub.icon}
                      {sub.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Link
              key={index}
              to={item.path}
              className={`flex items-center gap-3 w-full px-6 py-3 text-left transition-colors ${
                location.pathname === item.path
                  ? "bg-[#113a69] text-white"
                  : "text-gray-600 hover:bg-[#c0d1e5] hover:text-[#113a69]"
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          )
        )}
      </nav>
    </div>
  );
};

export default Sidebar;
