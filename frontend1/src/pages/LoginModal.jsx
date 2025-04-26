import React from "react";
import { useNavigate } from "react-router";

const LoginModal = ({ onClose }) => {
    const navigate = useNavigate();
  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <button style={styles.closeBtn} onClick={onClose}>×</button>
        <div style={{ textAlign: "center" }}>
          <h3>Help us become one of the safest places to buy and sell</h3>
          <br />
          <button style={styles.optionBtn} onClick={() => navigate("/dashboard")}>🟦 Continue with Google</button>
          <p><b>OR</b></p>
          <a href="/login" style={{ color: "#000" }}><b>Login with Email</b></a>
          <p style={{ fontSize: "0.8em", marginTop: 20 }}>
            All your personal details are safe with us. <br />
            By continuing, you accept our <a href="#">Terms</a> and <a href="#">Privacy Policy</a>.
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
  },
  modal: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "10px",
    width: "90%",
    maxWidth: "400px",
    position: "relative",
  },
  closeBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    border: "none",
    background: "none",
    fontSize: "24px",
    cursor: "pointer",
  },
  optionBtn: {
    width: "100%",
    padding: "10px",
    margin: "10px 0",
    backgroundColor: "#eee",
    border: "1px solid #ccc",
    cursor: "pointer",
  },
};

export default LoginModal;