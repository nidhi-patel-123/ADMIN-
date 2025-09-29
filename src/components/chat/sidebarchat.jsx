import React, { useState, useEffect } from "react";
import "./sidebarchat.css";
import axios from "axios";

function EmployeeList({ onSelectChat }) {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/chat`);
        setEmployees(res.data);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    fetchEmployees();
  }, []);

  // Get first letter for avatars
  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : "?";
  };

  // Handle chat deletion
  const handleDeleteChat = async (chatId) => {
    if (window.confirm("Are you sure you want to delete this chat?")) {
      try {
        await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/chat/${chatId}`);
        setEmployees(employees.filter((emp) => emp._id !== chatId));
      } catch (error) {
        console.error("Error deleting chat:", error);
        alert("Failed to delete chat.");
      }
    }
  };

  return (
    <div className="sidebars">
      {employees.map((emp) => (
        <div key={emp._id} className="name">
          <div
            className="employee-item"
            onClick={() => onSelectChat(emp._id, emp.employeeName)}
          >
            <div className="employee-initial">{getInitial(emp.employeeName)}</div>
            <div className="employee-info">
              <b>{emp.employeeName}</b>
              <p className="latest-msg">
                {emp.latestMessage?.message
                  ? emp.latestMessage.message.substr(0, 25) + "..."
                  : "No messages yet"}
              </p>
            </div>
          </div>
          <button
            className="delete-btn"
            onClick={() => handleDeleteChat(emp._id)}
            title="Delete Chat"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
              <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

export default EmployeeList;