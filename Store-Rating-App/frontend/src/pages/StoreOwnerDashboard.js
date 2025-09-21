import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaSignOutAlt, FaEye, FaEyeSlash, FaStore } from "react-icons/fa"; 
import Modal from "./Modal"; 
import "../css/StoreOwnerDashboard.css";

const StoreOwnerDashboard = () => {
  const [store, setStore] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [avgRating, setAvgRating] = useState(null);
  const [userName, setUserName] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUserName(payload.name);
      fetchStoreRatings(payload.id);
    }
  }, []);

  const fetchStoreRatings = async (ownerId) => {
    try {
      const resStores = await axios.get("http://localhost:4000/stores", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const ownedStore = resStores.data.find((s) => s.ownerId === ownerId);
      if (!ownedStore) {
        alert("No store found for this owner.");
        return;
      }

      setStore(ownedStore);

      const resRatings = await axios.get(
        `http://localhost:4000/stores/${ownedStore.id}/ratings`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRatings(resRatings.data.ratings);
      setAvgRating(resRatings.data.avgRating);
    } catch (err) {
      console.error("Failed to fetch store ratings:", err);
      alert(err.response?.data?.error || "Error fetching store ratings");
    }
  };

  const handleUpdatePassword = async () => {
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/;

    if (!passwordRegex.test(password)) {
      alert(
        "Password must be 8-16 characters, include at least one uppercase letter and one special character"
      );
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      await axios.put(
        "http://localhost:4000/auth/update-password",
        { newPassword: password },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Password updated successfully!");
      setPassword("");
      setConfirmPassword("");
      setShowPasswordModal(false);
    } catch (err) {
      console.error("Update password error:", err);
      alert(err.response?.data?.error || "Failed to update password");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const renderStars = (rating) => {
    if (rating === null || rating === undefined) return <>No rating</>;
    const numericRating = Number(rating);
    const roundedRating = Math.round(numericRating);
    return (
      <>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={roundedRating >= star ? "star filled" : "star"}
          >
            ★
          </span>
        ))}
        <span>({numericRating.toFixed(1)})</span>
      </>
    );
  };

  return (
    <div className="store-owner-dashboard">
      <div className="navbar">
        <div className="nav-left">
          <FaStore className="store-icon" style={{ color: "orange" }} />
          <span>{userName.toUpperCase()}</span>
        </div>
        <div className="nav-center">Welcome to Store Owner Dashboard</div>
        <div className="nav-right">
          <button onClick={() => setShowPasswordModal(true)} id="update-password-btn">
            Update Password
          </button>
          <button onClick={handleLogout}>
            <FaSignOutAlt style={{ marginRight: "5px" }} />
            Logout
          </button>
        </div>
      </div>

      {/* Password Modal */}
      <Modal
        show={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Update Password"
        onConfirm={handleUpdatePassword}
        confirmText="Save"
      >
        <p><strong>User:</strong> {userName}</p>

        <div className="password-input-container">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="modal-input"
          />
          <span
            className="eye-icon"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <div className="password-input-container">
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="modal-input"
          />
          <span
            className="eye-icon"
            onClick={() => setShowConfirm(!showConfirm)}
          >
            {showConfirm ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
      </Modal>

      {store && (
        <div className="store-info">
          <h3>
            <FaStore
              className="store-icon"
              style={{ color: "orange", marginRight: "8px" }}
            />
            {store.name}
          </h3>
          <p><strong>Email:</strong> {store.email}</p>
          <p><strong>Address:</strong> {store.address}</p>

          <div className="rating-row">
            <div className="rating-card">
              <span>Average Rating</span>
              <div className="avg-stars">
                {avgRating !== null ? renderStars(avgRating) : "N/A"}
              </div>
            </div>

            <div className="rating-card">
              <span>Total Ratings</span>
              <h4>{ratings.length}</h4>
            </div>
          </div>
        </div>
      )}

      {/* Ratings Table */}
      <div className="ratings-section">
        <h3>User Ratings</h3>
        {ratings.length ? (
          <table>
            <thead>
              <tr>
                <th>User Name</th>
                <th>User Email</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              {ratings.map((r) => (
                <tr key={r.userId}>
                  <td>{r.userName}</td>
                  <td>{r.userEmail}</td>
                  <td>{renderStars(r.rating)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No ratings yet.</p>
        )}
      </div>
    </div>
  );
};

export default StoreOwnerDashboard;
