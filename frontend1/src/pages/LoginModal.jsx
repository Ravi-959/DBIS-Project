import React from "react";
import { useNavigate } from "react-router";

const LoginModal = ({ onClose }) => {
  const navigate = useNavigate();
  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <button style={styles.closeBtn} onClick={onClose}>×</button>
        <div style={styles.content}>
          <h3 style={styles.heading}>
            Help us become one of the safest places to buy and sell
          </h3>

          {/* <button
            style={styles.optionBtn}
            onClick={() => navigate("/dashboard")}
          >
            <span style={{ marginRight: 8 }}>🔐</span> Continue with Google
          </button>

          <div style={styles.orSeparator}><span>OR</span></div> */}

          <a href="/login" style={styles.link}><b>Login with Email</b></a>
          <a href="/signup" style={styles.link}><b>Create an Account</b></a>

          <p style={styles.disclaimer}>
            All your personal details are safe with us. <br />
            {/* You accept our <a href="#">Terms</a> and <a href="#">Privacy Policy</a>. */}
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    padding: 16,
  },
  modal: {
    backgroundColor: "#ffffff",
    padding: "30px 24px",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "420px",
    position: "relative",
    boxShadow: "0 12px 28px rgba(0, 0, 0, 0.15)",
  },
  closeBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    border: "none",
    background: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: "#888",
  },
  content: {
    textAlign: "center",
  },
  heading: {
    fontSize: "1.2rem",
    fontWeight: 600,
    marginBottom: 24,
    color: "#333",
  },
  optionBtn: {
    width: "100%",
    padding: "12px",
    marginBottom: "16px",
    backgroundColor: "#f1f1f1",
    border: "1px solid #ccc",
    borderRadius: "8px",
    fontWeight: 500,
    cursor: "pointer",
    fontSize: "0.95rem",
    transition: "background-color 0.2s",
  },
  orSeparator: {
    margin: "12px 0",
    fontSize: "0.85rem",
    color: "#999",
  },
  link: {
    display: "block",
    color: "#007bff",
    textDecoration: "none",
    margin: "6px 0",
    fontSize: "0.95rem",
  },
  disclaimer: {
    fontSize: "0.8rem",
    color: "#666",
    marginTop: 20,
    lineHeight: 1.4,
  },
};

export default LoginModal;
