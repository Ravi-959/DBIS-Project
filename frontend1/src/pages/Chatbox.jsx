import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../css/Chatbox.css";
import { apiUrl } from "../config/config";

const Chatbox = () => {
  const { conversation_id } = useParams();
  const [userId, setUserId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [products, setProducts] = useState({});
  const [filter, setFilter] = useState("all");
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await fetch(`${apiUrl}/isLoggedIn`, { credentials: "include" });
        const data = await res.json();
        if (data.isAuthenticated) {
          setUserId(data.user_id);
        } else {
          navigate("/login");
        }
      } catch (err) {
        console.error("Login check error:", err);
        navigate("/login");
      }
    };
    checkLogin();
  }, [navigate]);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!userId) return;
      try {
        const res = await fetch(`${apiUrl}/conversations/${userId}`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setConversations(data.conversations);

          const productDetails = {};
          for (let conv of data.conversations) {
            const productRes = await fetch(`${apiUrl}/product/${conv.listing_id}`);
            const productData = await productRes.json();
            productDetails[conv.conversation_id] = productData.product.name;
          }
          setProducts(productDetails);
        } else {
          console.error("Error fetching conversations.");
        }
      } catch (err) {
        console.error("Error fetching conversations:", err);
      }
    };
    fetchConversations();
  }, [userId]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!conversation_id) return;
      try {
        const res = await fetch(`${apiUrl}/messages/${conversation_id}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages);
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };
    fetchMessages();
  }, [conversation_id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!selectedChat && conversation_id && conversations.length > 0) {
      const conv = conversations.find(c => c.conversation_id === Number(conversation_id));
      if (conv) {
        const otherUserId = conv.buyer_id === userId ? conv.seller_id : conv.buyer_id;
        const otherUsername = conv.buyer_id === userId ? conv.seller_name : conv.buyer_name;
        setSelectedChat({
          user_id: otherUserId,
          username: otherUsername,
          conversation_id: conv.conversation_id,
        });
      }
    }
  }, [conversation_id, conversations, selectedChat, userId]);

  const handleSend = async () => {
    if (!input.trim() || !selectedChat) return;

    const newMessage = {
      sender_id: userId,
      conversation_id: selectedChat.conversation_id,
      message_text: input,
    };

    try {
      const res = await fetch(`${apiUrl}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMessage),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
        setInput("");
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleChatSelection = (conv) => {
    const otherUserId = conv.buyer_id === userId ? conv.seller_id : conv.buyer_id;
    const otherUsername = conv.buyer_id === userId ? conv.seller_name : conv.buyer_name;
    setSelectedChat({
      user_id: otherUserId,
      username: otherUsername,
      conversation_id: conv.conversation_id,
    });
    navigate(`/chat/${conv.conversation_id}`);
  };

  const formatDate = (date) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isSameDay = (d1, d2) =>
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear();

    if (isSameDay(date, today)) return "Today";
    if (isSameDay(date, yesterday)) return "Yesterday";

    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderMessagesWithTimestamps = () => {
    let lastDate = null;
    return messages.map((msg, idx) => {
      const messageDate = new Date(msg.sent_at);
      const dateLabel = formatDate(messageDate);
      const showDate = dateLabel !== lastDate;
      lastDate = dateLabel;

      return (
        <div key={idx}>
          {showDate && <div className="chat-timestamp">{dateLabel}</div>}
          <div className={`chat-message ${msg.sender_id === userId ? "me" : "friend"}`}>
            {msg.message_text}
          </div>
        </div>
      );
    });
  };

  const filteredConversations = conversations.filter((conv) => {
    if (filter === "buyer") return conv.buyer_id === userId;
    if (filter === "seller") return conv.seller_id === userId;
    return true;
  });

  return (
    <>
      <Navbar />
      <div className="chatbox-wrapper">
        <div className="chat-sidebar">
          <h3>Chats</h3>
          <div className="chat-filter">
            <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>All</button>
            <button className={filter === "buyer" ? "active" : ""} onClick={() => setFilter("buyer")}>Buyer</button>
            <button className={filter === "seller" ? "active" : ""} onClick={() => setFilter("seller")}>Seller</button>
          </div>
          {filteredConversations.length === 0 ? (
            <p className="no-chat">No chats</p>
          ) : (
            filteredConversations.map((conv, idx) => {
              const otherUsername = conv.buyer_id === userId ? conv.seller_name : conv.buyer_name;
              const productName = products[conv.conversation_id];
              return (
                <div
                  key={idx}
                  className={`chat-item ${Number(conversation_id) === conv.conversation_id ? "active" : ""}`}
                  onClick={() => handleChatSelection(conv)}
                >
                  <div className="chat-product-name">{productName || "Product Name"}</div>
                  <div className="chat-other-user">{otherUsername || "User"}</div>
                </div>
              );
            })
          )}
        </div>

        <div className="chat-main">
          {selectedChat ? (
            <>
              <div className="chat-header">Chat with {selectedChat.username}</div>
              <div className="chat-messages">
                {renderMessagesWithTimestamps()}
                <div ref={messagesEndRef} />
              </div>
              <div className="chat-input">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <button onClick={handleSend}>Send</button>
              </div>
            </>
          ) : (
            <div className="chat-placeholder">Select a chat to start messaging</div>
          )}
        </div>
      </div>
    </>
  );
};

export default Chatbox;