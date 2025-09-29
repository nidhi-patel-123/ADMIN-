import React, { useState } from "react";
import "./chat.css";
import EmployeeList from "../components/chat/sidebarchat";
import ChatWindow from "../components/chat/chat";

function ChatLayout() {
  const [selectedChat, setSelectedChat] = useState({ id: null, name: "" });

  return (
    <div className="chat-layout">
      <EmployeeList 
        onSelectChat={(id, name) => setSelectedChat({ id, name })} 
      />

      <ChatWindow chatId={selectedChat.id} employeeName={selectedChat.name} />
    </div>
  );
}

export default ChatLayout;
