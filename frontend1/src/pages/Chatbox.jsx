import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Chatbox.css";
import { apiUrl } from "../config/config";



const Chatbox = () => {
  const [userId, setUserId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();


  useEffect(() => {
    const checkLogin = async () => {
      
      try {
        const res = await fetch(`${apiUrl}/isLoggedIn`, {
          credentials: "include",
        });
        const data = await res.json();
        console.log("Login response:", data); // ✅ Check server response
        if (data.isAuthenticated) {
          console.log("User authenticated:", data.user_id);
          setUserId(data.user_id);
        } else {
          console.log("Not authenticated, redirecting...");
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
      
      if (!userId) {
        console.log("User is NULL");
        return;
      }
      console.log("User ID:", userId);  // Log the user ID here
  
      try {
        const res = await fetch(`${apiUrl}/conversations/${userId}`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          console.log("Fetched conversations:", data.conversations);  // Log the response
          setConversations(data.conversations);
        } else {
          const errorText = await res.text();
          console.error("Error fetching conversations:", errorText);
        }
      } catch (err) {
        console.error("Error fetching conversations:", err);
      }
    };
  
    fetchConversations();
  }, [userId]);
  
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChat) return;
      try {
        const res = await fetch(`${apiUrl}/messages/${selectedChat.conversation_id}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages);
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };

    fetchMessages();
  }, [selectedChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
        headers: {
          "Content-Type": "application/json",
        },
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

  return (
    <div className="chatbox-wrapper">
      <div className="chat-sidebar">
        <h3>Chats</h3>
        {conversations.length === 0 ? (
          <p className="no-chat">No chats</p>
        ) : (
          conversations.map((conv, idx) => {
            const otherUserId = conv.buyer_id === userId ? conv.seller_id : conv.buyer_id;
            const otherUsername = conv.buyer_id === userId ? conv.seller_name : conv.buyer_name;

            return (
              <div
                key={idx}
                className={`chat-item ${selectedChat?.conversation_id === conv.conversation_id ? "active" : ""}`}
                onClick={() =>
                  setSelectedChat({
                    user_id: otherUserId,
                    username: otherUsername,
                    conversation_id: conv.conversation_id,
                  })
                }
              >
                <div className="chat-username">{otherUsername}</div>
                <div className="chat-userid">User ID: {otherUserId}</div>
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
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`chat-message ${msg.sender_id === userId ? "me" : "friend"}`}
                >
                  {msg.message_text}
                </div>
              ))}
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
  );
};

export default Chatbox;
