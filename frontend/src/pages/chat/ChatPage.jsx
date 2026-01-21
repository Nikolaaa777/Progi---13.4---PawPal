import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../../api/client";
import "../../styles/chat.css";

const ChatApp = () => {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const reservationId = searchParams.get("reservationId");

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadConversations();
    api.me().then(setCurrentUser).catch(console.error);
  }, []);

  useEffect(() => {
    if (reservationId) {
      // If coming from reservation, get or create conversation
      api
        .getOrCreateConversationFromReservation(parseInt(reservationId))
        .then((conversation) => {
          setSelectedConversation(conversation);
          loadConversationMessages(conversation.id);
        })
        .catch((err) => {
          setError(err.error || "Failed to load conversation");
        });
    }
  }, [reservationId]);

  useEffect(() => {
    if (selectedConversation) {
      loadConversationMessages(selectedConversation.id);
      // Poll for new messages every 3 seconds
      const interval = setInterval(() => {
        loadConversationMessages(selectedConversation.id);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedConversation]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await api.getConversations();
      setConversations(data);
      setLoading(false);
    } catch (err) {
      setError(err.error || "Failed to load conversations");
      setLoading(false);
    }
  };

  const loadConversationMessages = async (conversationId) => {
    try {
      const response = await api.getConversation(conversationId);
      setMessages(response.messages || []);
      if (!selectedConversation || selectedConversation.id !== conversationId) {
        setSelectedConversation(response.conversation);
      }
    } catch (err) {
      setError(err.error || "Failed to load messages");
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedConversation) return;

    try {
      await api.sendMessage({
        conversation_id: selectedConversation.id,
        content: messageInput.trim(),
      });
      setMessageInput("");
      // Reload messages
      loadConversationMessages(selectedConversation.id);
    } catch (err) {
      setError(err.error || "Failed to send message");
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("hr-HR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getOtherParticipantName = (conversation) => {
    if (!conversation.other_participant) return "Unknown";
    const { first_name, last_name, email } = conversation.other_participant;
    if (first_name || last_name) {
      return `${first_name || ""} ${last_name || ""}`.trim();
    }
    return email;
  };

  if (loading && conversations.length === 0) {
    return (
      <div className="chat-app">
        <div style={{ padding: "40px", textAlign: "center" }}>Učitavanje...</div>
      </div>
    );
  }

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
          {conversations.length === 0 ? (
            <li style={{ padding: "20px", textAlign: "center", color: "#6b7280" }}>
              Nema razgovora
            </li>
          ) : (
            conversations.map((conv) => (
              <li
                key={conv.id}
                className={selectedConversation?.id === conv.id ? "active" : ""}
                onClick={() => {
                  setSelectedConversation(conv);
                  loadConversationMessages(conv.id);
                }}
              >
                <div>
                  <strong>{getOtherParticipantName(conv)}</strong>
                  {conv.unread_count > 0 && (
                    <span className="unread-badge">{conv.unread_count}</span>
                  )}
                </div>
                {conv.last_message && (
                  <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
                    {conv.last_message.content.substring(0, 30)}
                    {conv.last_message.content.length > 30 ? "..." : ""}
                  </div>
                )}
              </li>
            ))
          )}
        </ul>
      </aside>

      {/* Chat area */}
      <main className="chat-content">
        {selectedConversation ? (
          <>
            <div className="chat-header">
              <h3>{getOtherParticipantName(selectedConversation)}</h3>
            </div>
            <div className="messages">
              {messages.map((msg) => {
                const isOwn = currentUser && msg.sender.id === currentUser.id;
                return (
                  <div
                    key={msg.id}
                    className={`message ${isOwn ? "right" : "left"} ${
                      msg.content.length > 50 ? "large" : "small"
                    }`}
                  >
                    <div className="message-content">{msg.content}</div>
                    <div className="message-time">{formatTime(msg.created_at)}</div>
                  </div>
                );
              })}
            </div>

            {/* Input */}
            <form className="chat-input" onSubmit={handleSendMessage}>
              <input
                type="text"
                placeholder="Upiši poruku..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
              />
              <button type="submit" className="send-btn">
                <img src="/send.png" alt="send" />
              </button>
            </form>
          </>
        ) : (
          <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
            Odaberi razgovor za početak
          </div>
        )}
        {error && (
          <div style={{ padding: "12px", background: "#fee2e2", color: "#991b1b", margin: "12px" }}>
            {error}
          </div>
        )}
      </main>
    </div>
  );
};

export default ChatApp;
