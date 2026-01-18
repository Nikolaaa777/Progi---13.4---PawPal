import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import "../../styles/chat.css";

const ChatPage = () => {
  const nav = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageContent, setMessageContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Fetch conversations on mount
  useEffect(() => {
    loadConversations();
    // Get current user on mount
    api.me()
      .then(user => setCurrentUser(user))
      .catch(() => setCurrentUser(null));
  }, []);

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
      // Poll for new messages every 3 seconds
      const interval = setInterval(() => {
        loadMessages(selectedConversation.id, true);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedConversation]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await api.getConversations();
      setConversations(data || []);
      if (data && data.length > 0 && !selectedConversation) {
        setSelectedConversation(data[0]);
      }
      setError(null);
    } catch (err) {
      console.error("Error loading conversations:", err);
      setError("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId, silent = false) => {
    try {
      const data = await api.getConversation(conversationId);
      if (data && data.messages) {
        setMessages(data.messages || []);
      }
      if (!silent && data && data.conversation) {
        setSelectedConversation(data.conversation);
      }
    } catch (err) {
      console.error("Error loading messages:", err);
      if (!silent) {
        setError("Failed to load messages");
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageContent.trim() || !selectedConversation) return;

    try {
      const newMessage = await api.sendMessage({
        conversation_id: selectedConversation.id,
        content: messageContent.trim(),
      });
      
      setMessages((prev) => [...prev, newMessage]);
      setMessageContent("");
      
      // Reload conversation to update last message
      await loadConversations();
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message");
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("hr-HR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMessageClass = (message) => {
    if (!currentUser || !message.sender) return "left";
    if (message.sender?.id?.toString() === currentUser?.id?.toString()) {
      return "right";
    }
    return "left";
  };

  const getOtherParticipantName = (conversation) => {
    if (!conversation) return "Unknown";
    const other = conversation.other_participant;
    if (other) {
      return `${other.first_name || ""} ${other.last_name || ""}`.trim() || other.email || "Unknown";
    }
    return "Unknown";
  };

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

        {loading && !conversations.length ? (
          <div style={{ padding: "20px", textAlign: "center" }}>Loading...</div>
        ) : error ? (
          <div style={{ padding: "20px", color: "red" }}>{error}</div>
        ) : (
          <ul className="chat-list">
            {conversations.length === 0 ? (
              <li style={{ padding: "20px", textAlign: "center" }}>
                Nema razgovora
              </li>
            ) : (
              conversations.map((conv) => (
                <li
                  key={conv.id}
                  className={selectedConversation?.id === conv.id ? "active" : ""}
                  onClick={() => setSelectedConversation(conv)}
                >
                  {getOtherParticipantName(conv)}
                  {conv.unread_count > 0 && (
                    <span
                      style={{
                        marginLeft: "8px",
                        backgroundColor: "#4CAF50",
                        color: "white",
                        borderRadius: "50%",
                        width: "20px",
                        height: "20px",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                      }}
                    >
                      {conv.unread_count}
                    </span>
                  )}
                </li>
              ))
            )}
          </ul>
        )}
      </aside>

      {/* Chat area */}
      <main className="chat-content">
        {selectedConversation ? (
          <>
            <div className="messages">
              {messages.length === 0 ? (
                <div style={{ padding: "20px", textAlign: "center", color: "#999" }}>
                  Nema poruka. Pošaljite prvu poruku!
                </div>
              ) : (
                messages.map((msg) => {
                  const msgClass = getMessageClass(msg);
                  const contentLength = msg.content?.length || 0;
                  const sizeClass =
                    contentLength > 100 ? "large" : contentLength > 50 ? "medium" : "small";
                  return (
                    <div
                      key={msg.id}
                      className={`message ${msgClass} ${sizeClass}`}
                    >
                      <div className="message-content">{msg.content}</div>
                      <div className="message-time">{formatTime(msg.created_at)}</div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input */}
            <form className="chat-input" onSubmit={handleSendMessage}>
              <input
                type="text"
                placeholder="Upiši poruku..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
              />
              <button type="submit" className="send-btn" disabled={!messageContent.trim()}>
                <img src="/send.png" alt="send" />
              </button>
            </form>
          </>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "#999",
            }}
          >
            Odaberite razgovor da počnete
          </div>
        )}
      </main>
    </div>
  );
};

export default ChatPage;
