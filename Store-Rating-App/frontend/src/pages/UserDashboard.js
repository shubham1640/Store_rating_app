import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaUser, FaSignOutAlt, FaEye, FaEyeSlash } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import Modal from "./Modal"; 
import "../css/UserDashboard.css";

const UserDashboard = () => {
  const [stores, setStores] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [userName, setUserName] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [ratingMode, setRatingMode] = useState({}); // storeId => true if stars visible

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const res = await axios.get("http://localhost:4000/stores", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const payload = JSON.parse(atob(token.split(".")[1]));
      setUserName(payload.name);
      const userId = payload.id;

      const storesWithRatings = res.data.map((store) => {
        const userRating = store.ratings?.find((r) => r.userId === userId) || null;
        return {
          ...store,
          userRating,
          tempRating: userRating?.rating || 0,
          hoverRating: 0,
        };
      });

      setStores(storesWithRatings);
    } catch (err) {
      console.error("Failed to fetch stores:", err);
    }
  };

  const submitRating = async (storeId, rating) => {
    if (!rating || rating < 1 || rating > 5) {
      alert("Please select a rating between 1 and 5 stars");
      return;
    }
    try {
      await axios.post(
        `http://localhost:4000/ratings`,
        { storeId, rating },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRatingMode({ ...ratingMode, [storeId]: false });
      fetchStores();
    } catch (err) {
      console.error("Error submitting/updating rating:", err);
      alert("Failed to submit/update rating");
    }
  };

  const deleteRating = async (storeId) => {
    try {
      const store = stores.find((s) => s.id === storeId);
      const existingRating = store.userRating;
      if (!existingRating) return;

      await axios.delete(`http://localhost:4000/ratings/${storeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRatingMode({ ...ratingMode, [storeId]: false });
      fetchStores();
    } catch (err) {
      console.error("Error deleting rating:", err);
      alert("Failed to delete rating");
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

  const filteredStores = stores.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="user-dashboard">
      {/* Navbar */}
      <div className="navbar">
        <div className="nav-left">
          <FaUser className="user-icon" />
          <span>{userName.toUpperCase()}</span>
        </div>
        <div className="nav-center">Welcome to User Dashboard</div>
        <div className="nav-right">
          <button
            onClick={() => setShowPasswordModal(true)}
            id="update-password-btn"
          >
            Update Password
          </button>
          <button onClick={handleLogout}>
            <FaSignOutAlt style={{ marginRight: "5px" }} />
            Logout
          </button>
        </div>
      </div>

      {/* Modal for Password */}
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

      {/* Search */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by store name or address..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Stores List */}
      <div className="stores-list">
        {filteredStores.map((store) => {
          const hasUserRating = store.userRating?.rating > 0;
          const inRatingMode = ratingMode[store.id] || false;

          return (
            <div className="store-card" key={store.id}>
              <div className="store-text">
                <h3>{store.name}</h3>
                <p>{store.address}</p>
              </div>

              <div className="ratings">
                {/* Average Rating */}
                <div className="avg-rating">
                  Average Rating:{" "}
                  {Array.from({ length: 5 }, (_, i) => (
                    <span
                      key={i}
                      className={
                        i < Math.floor(store.overallRating || 0)
                          ? "star filled"
                          : "star"
                      }
                    >
                      ★
                    </span>
                  ))}
                  ({store.overallRating?.toFixed(1) || "N/A"})
                </div>

                {/* Your Rating & Actions */}
                <div className="your-rating-container">
                  {hasUserRating && !inRatingMode && (
                    <span className="your-rating-number">
                      Your Rating: {store.userRating.rating}
                    </span>
                  )}

                  {inRatingMode && (
                    <>
                      <div className="your-rating-stars">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const displayStar =
                            store.hoverRating > 0
                              ? star <= store.hoverRating
                              : star <= store.tempRating;
                          return (
                            <span
                              key={star}
                              className={displayStar ? "star filled" : "star"}
                              onMouseEnter={() =>
                                setStores((prev) =>
                                  prev.map((s) =>
                                    s.id === store.id
                                      ? { ...s, hoverRating: star }
                                      : s
                                  )
                                )
                              }
                              onMouseLeave={() =>
                                setStores((prev) =>
                                  prev.map((s) =>
                                    s.id === store.id
                                      ? { ...s, hoverRating: 0 }
                                      : s
                                  )
                                )
                              }
                              onClick={() =>
                                setStores((prev) =>
                                  prev.map((s) =>
                                    s.id === store.id
                                      ? { ...s, tempRating: star }
                                      : s
                                  )
                                )
                              }
                            >
                              ★
                            </span>
                          );
                        })}
                      </div>
                      <div className="rating-actions">
                        <button
                          onClick={() =>
                            submitRating(store.id, store.tempRating)
                          }
                        >
                          {hasUserRating ? "Modify" : "Submit"}
                        </button>
                        {hasUserRating && (
                          <MdDelete
                            className="delete-icon"
                            onClick={() => deleteRating(store.id)}
                          />
                        )}
                      </div>
                    </>
                  )}

                  {!inRatingMode && !hasUserRating && (
                    <button
                      onClick={() =>
                        setRatingMode({ ...ratingMode, [store.id]: true })
                      }
                      className="rating-btn"
                    >
                      Submit Rating
                    </button>
                  )}

                  {!inRatingMode && hasUserRating && (
                    <button
                      onClick={() =>
                        setRatingMode({ ...ratingMode, [store.id]: true })
                      }
                      className="rating-btn"
                    >
                      Modify Rating
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserDashboard;
