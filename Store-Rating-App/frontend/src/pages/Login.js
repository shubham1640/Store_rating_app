import React, { useState } from "react";
import axios from "../api/axiosConfig";
import { setToken } from "../utils/auth";
import { useNavigate, Link } from "react-router-dom";
import "../css/Login.css";

const Login = ({ setRole }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
     
      const response = await axios.post("/auth/login", { 
        email: email.toLowerCase(), 
        password 
      });

      const { token, user } = response.data;

      
      setToken(token);
      localStorage.setItem("role", user.role);
      setRole(user.role);

  
      if (user.role === "ADMIN") navigate("/admin-dashboard");
      else if (user.role === "STORE_OWNER") navigate("/store-owner-dashboard");
      else navigate("/user-dashboard");
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("Login failed. Try again.");
      }
    }
  };

  return (
    <div className="login-container">
    
      <h1 className="welcome-msg">Store Rating App</h1>

      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            className="login-input"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value.toLowerCase())}
            required
          />
        </div>
        <div className="password-field">
          <label>Password:</label>
          <div className="password-input-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              className="login-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {/* <span
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"}
            </span> */}
          </div>
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit">Login</button>
      </form>

      <p className="signup-link">
        Don't have an account? <Link to="/register">Register here</Link>
      </p>

    

    </div>
  );
};

export default Login;
