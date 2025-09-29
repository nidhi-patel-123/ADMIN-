// ChatWindow.jsx (Admin)
import React, { useState, useEffect, useRef } from "react";
import {
  FaArrowLeft,
  FaVideo,
  FaPhoneAlt,
  FaEllipsisV,
  FaSmile,
  FaPaperclip,
  FaCamera,
} from "react-icons/fa";
import { IoSend } from "react-icons/io5";
import axios from "axios";
import io from "socket.io-client";
import "./ChatHeader.css";

function ChatWindow({ chatId, employeeName }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const chatBodyRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io("https://backend-6bli.onrender.com", {
      withCredentials: true,
    });

    const token = sessionStorage.getItem("token");
    const getIdFromToken = (jwt) => {
      try {
        if (!jwt) return null;
        const base64Url = jwt.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
        const parsed = JSON.parse(jsonPayload);
        return parsed.id || parsed._id || null;
      } catch (e) {
        return null;
      }
    };
    const derivedId = sessionStorage.getItem("adminId") || getIdFromToken(token);
    socketRef.current.emit("join", derivedId || null, "admin");

    socketRef.current.on("newMessage", (message) => {
      if (message.chatId === chatId) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [chatId]);

  useEffect(() => {
    if (chatId) {
      const fetchMessages = async () => {
        try {
          const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/msg/${chatId}`);
          setMessages(res.data);
        } catch (err) {
          console.error(err);
        }
      };
      fetchMessages();
    }
  }, [chatId]);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!text.trim() || !chatId) return;

    try {
      const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/msg/`, {
        chatId,
        sender: "admin",
        receiver: employeeName,
        message: text,
      });
      setMessages([...messages, res.data]);
      setText("");
      socketRef.current.emit("newMessage", res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : "?";
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-left">
          <FaArrowLeft className="icon" />
          <div className="profile-initial">{getInitial(employeeName)}</div>
          <span className="chat-name">{employeeName}</span>
        </div>
        <div className="chat-right">
          <FaVideo className="icon" />
          <FaPhoneAlt className="icon" />
          <FaEllipsisV className="icon" />
        </div>
      </div>

      <div className="chat-body" ref={chatBodyRef}>
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`chat-message ${msg.sender === "admin" ? "admin-msg" : "employee-msg"
              }`}
          >
            <div className="chat-initial">
              {getInitial(msg.sender === "admin" ? "Admin" : employeeName)}
            </div>
            <div className="chat-bubble">
              <b>{msg.sender === "admin" ? "Admin" : employeeName}</b>
              <p>{msg.message}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="chat-input">
        <div className="input-box">
          <FaSmile className="icon" />
          <input
            type="text"
            placeholder="Message"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
          />
          <FaPaperclip className="icon" />
          <FaCamera className="icon" />
        </div>
        <button className="send-btn" onClick={sendMessage}>
          <IoSend />
        </button>
      </div>
    </div>
  );
}

export default ChatWindow;