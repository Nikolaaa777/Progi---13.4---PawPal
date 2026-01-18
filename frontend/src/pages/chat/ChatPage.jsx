import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/chat.css";

const ChatApp = () => {
  const nav = useNavigate();

  return (
    <div className="chat-app">
      {/* Sidebar */}
      <aside className="chat-sidebar">
        <div className="sidebar-header">
          <div className="back" onClick={() => nav("/")}>
            ←
          </div>
          <span className="title">Moji razgovori</span>
        </div>

        <ul className="chat-list">
          <li>Ivan Ivić</li>
          <li className="active">Ivan Ivić</li>
          <li>Ivan Ivić</li>
          <li>Ivan Ivić</li>
          <li>Ivan Ivić</li>
          <li>Ivan Ivić</li>
        </ul>
      </aside>

      {/* Chat area */}
      <main className="chat-content">
        <div className="messages">
          <div className="message left small"></div>
          <div className="message right small"></div>
          <div className="message left large"></div>
        </div>

        {/* Input */}
        <div className="chat-input">
          <input type="text" placeholder="Upiši poruku..." />
          <button className="send-btn">
            <img src="/send.png" alt="send" />
          </button>
        </div>
      </main>
    </div>
  );
};

export default ChatApp;
