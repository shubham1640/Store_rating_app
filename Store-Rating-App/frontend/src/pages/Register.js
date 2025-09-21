import React, { useState } from "react";
import api from "../api/axiosConfig";
import "../css/Register.css";
import { Link } from "react-router-dom";
import { FaInfoCircle } from "react-icons/fa";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); 


  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [infoVisible, setInfoVisible] = useState({
    name: false,
    email: false,
    address: false,
    password: false,
  });

  const handleChange = (e) => {
    let value = e.target.value;
    if (e.target.name === "email") {
      value = value.toLowerCase(); 
    }
    setForm({ ...form, [e.target.name]: value });
  };

  const toggleInfo = (field) => {
    setInfoVisible({ ...infoVisible, [field]: true });
    setTimeout(() => {
      setInfoVisible((prev) => ({ ...prev, [field]: false }));
    }, 2000);
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage(""); 
    }, 2000);
  };

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      showMessage("Please fill in all required fields.", "error");
      return;
    }

    if (form.name.length < 20 || form.name.length > 60) {
      showMessage("Name should have 20 to 60 characters.", "error");
      return;
    }

    if (form.address.length > 400) {
      showMessage("Address cannot exceed 400 characters.", "error");
      return;
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(form.email)) {
      showMessage("Please enter a valid email address.", "error");
      return;
    }

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/;
    if (!passwordRegex.test(form.password)) {
      showMessage(
        "Password must be 8-16 characters, include at least one uppercase letter and one special character.",
        "error"
      );
      return;
    }

    if (form.password !== form.confirmPassword) {
      showMessage("Passwords do not match.", "error");
      return;
    }

    try {
      await api.post("/auth/register", { ...form, role: "USER" });
      showMessage("Registered successfully! Please login.", "success");
      setForm({
        name: "",
        email: "",
        address: "",
        password: "",
        confirmPassword: "",
      });
    } catch (err) {
      if (err.response?.data?.error === "Email already registered") {
        showMessage(
          "This email is already registered. Please login or use another email.",
          "error"
        );
      } else {
        showMessage(
          err.response?.data?.error || "Registration failed. Try again.",
          "error"
        );
      }
    }
  };

  return (
    <div className="register-container">
      <h2>Register</h2>

      {/* Name */}
      <div className="input-group">
        <input
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
        />
        <FaInfoCircle
          className="info-icon"
          onClick={() => toggleInfo("name")}
        />
        {infoVisible.name && (
          <div className="info-tooltip">
            Name should have 20 to 60 characters.
          </div>
        )}
      </div>

      {/* Email */}
      <div className="input-group">
        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />
        <FaInfoCircle
          className="info-icon"
          onClick={() => toggleInfo("email")}
        />
        {infoVisible.email && (
          <div className="info-tooltip">Must be a valid email address.</div>
        )}
      </div>

      {/* Address */}
      <div className="input-group">
        <input
          name="address"
          placeholder="Address"
          value={form.address}
          onChange={handleChange}
        />
        <FaInfoCircle
          className="info-icon"
          onClick={() => toggleInfo("address")}
        />
        {infoVisible.address && (
          <div className="info-tooltip">Maximum 400 characters.</div>
        )}
      </div>

      {/* Password */}
      <div className="input-group">
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
        />
        <span
          className="eye-icon"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? "🙈" : "👁️"}
        </span>
        <FaInfoCircle
          className="info-icon"
          onClick={() => toggleInfo("password")}
        />
        {infoVisible.password && (
          <div className="info-tooltip">
            8-16 characters, at least 1 uppercase letter and 1 special character.
          </div>
        )}
      </div>

     
      <div className="input-group">
        <input
          type={showConfirmPassword ? "text" : "password"}
          name="confirmPassword"
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChange={handleChange}
        />
        <span
          className="eye-icon"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          {showConfirmPassword ? "🙈" : "👁️"}
        </span>
      </div>

      <button onClick={handleRegister}>Register</button>

      <p className="login-link">
        Already have an account? <Link to="/">Login</Link>
      </p>

      <div className="message-container">
        {message && (
          <p
            className={`message ${
              messageType === "error" ? "error" : "success"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default Register;
