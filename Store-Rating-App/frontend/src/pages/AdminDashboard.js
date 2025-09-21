// AdminDashboard.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import Modal from "./Modal";
import "../css/AdminDashboard.css";
import "../css/Modal.css";
import { FaUser, FaUserTie, FaStore, FaStar, FaPlus, FaSignOutAlt } from "react-icons/fa";

const AdminDashboard = () => {
  const [userName, setUserName] = useState("");
  const [stats, setStats] = useState({ userCount: 0, storeCount: 0, ratingCount: 0 });
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [showAddStoreForm, setShowAddStoreForm] = useState(false);
  const [showStoresPanel, setShowStoresPanel] = useState(false);
  const [showUsersPanel, setShowUsersPanel] = useState(false);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    role: "USER",
  });
  const [newStore, setNewStore] = useState({ name: "", email: "", address: "", ownerId: "" });
  const [roleFilter, setRoleFilter] = useState("ALL");

  const [userError, setUserError] = useState("");
  const [storeError, setStoreError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const token = localStorage.getItem("token");

  // Get logged-in admin name
  useEffect(() => {
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUserName(payload.name);
    }
  }, [token]);

  // Fetch stats
  const fetchStats = async () => {
    try {
      const res = await axios.get("http://localhost:4000/users/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:4000/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  // Fetch all stores
  const fetchStores = async () => {
    try {
      const res = await axios.get("http://localhost:4000/stores", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStores(res.data);
    } catch (err) {
      console.error("Failed to fetch stores:", err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchStores();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const handleAddUser = async () => {
    const { name, email, password, confirmPassword, address, role } = newUser;

    if (!name || !email || !password || !confirmPassword || !address || !role) {
      setUserError("Fill all user fields");
      return;
    }
    if (name.length < 20 || name.length > 60) {
      setUserError("User name must be between 20 and 60 characters");
      return;
    }
    if (address.length > 400) {
      setUserError("Address cannot exceed 400 characters");
      return;
    }
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/;
    if (!passwordRegex.test(password)) {
      setUserError(
        "Password must be 8-16 characters, include 1 uppercase & 1 special char"
      );
      return;
    }
    if (password !== confirmPassword) {
      setUserError("Passwords do not match");
      return;
    }

    setUserError("");

    try {
      await axios.post("http://localhost:4000/auth/register", newUser, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("User added successfully!");
      setShowAddUserForm(false);
      setNewUser({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        address: "",
        role: "USER",
      });
      fetchUsers();
      fetchStats();
    } catch (err) {
      setUserError(err.response?.data?.error || "Failed to add user");
    }
  };

  const handleAddStore = async () => {
    const { name, email, address, ownerId } = newStore;

    if (!name || !email || !address || !ownerId) {
      setStoreError("Fill all store fields");
      return;
    }
    if (address.length > 400) {
      setStoreError("Address cannot exceed 400 characters");
      return;
    }

    setStoreError("");

    try {
      await axios.post("http://localhost:4000/stores", newStore, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Store added successfully!");
      setShowAddStoreForm(false);
      setNewStore({ name: "", email: "", address: "", ownerId: "" });
      fetchStores();
      fetchStats();
    } catch (err) {
      setStoreError(err.response?.data?.error || "Failed to add store");
    }
  };

  // Sort users by role
  const admins = users.filter((u) => u.role === "ADMIN");
  const storeOwners = users.filter((u) => u.role === "STORE_OWNER");
  const normalUsers = users.filter((u) => u.role === "USER");
  const availableStoreOwners = storeOwners.filter(
    (owner) => !stores.some((s) => s.ownerId?.toString() === owner.id?.toString())
  );

  const roleSortedUsers = [...admins, ...storeOwners, ...normalUsers];

  // Filters
  const filteredUsers = roleSortedUsers.filter((u) => {
    const matchQuery =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.address.toLowerCase().includes(searchQuery.toLowerCase());
    if (roleFilter === "ALL") return matchQuery;
    return matchQuery && u.role === roleFilter;
  });

  const filteredStores = stores.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderStars = (rating) => {
    if (rating === null || rating === undefined) return <span>N/A</span>;
    const rounded = Math.round(rating);
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rounded ? "star filled" : "star"}>
          ★
        </span>
      );
    }
    return (
      <span className="ratings-inline">
        {stars} <span className="rating-number">({Math.round(rating * 10) / 10})</span>
      </span>
    );
  };

  const openStoresPanel = () => {
    setShowStoresPanel(true);
    setShowUsersPanel(false);
  };
  const openUsersPanel = () => {
    setShowUsersPanel(true);
    setShowStoresPanel(false);
  };
  const closePanels = () => {
    setShowStoresPanel(false);
    setShowUsersPanel(false);
  };

  return (
    <div className="admin-dashboard">
      {/* NAVBAR */}
      <div className="navbar">
        <div className="nav-left">
          <FaUserTie className="admin-icon" />
          <span>{userName.toUpperCase()}</span>
        </div>
        <div className="nav-center">Welcome to Admin Dashboard</div>
        <div className="nav-right">
          <button onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="stats-container">
        <div className="stat-card">
          <FaUser className="stat-icon user-icon" />
          <div className="stat-info">
            <p className="stat-number">{stats.userCount}</p>
            <p className="stat-label">Users</p>
          </div>
        </div>
        <div className="stat-card">
          <FaStore className="stat-icon store-icon" />
          <div className="stat-info">
            <p className="stat-number">{stats.storeCount}</p>
            <p className="stat-label">Stores</p>
          </div>
        </div>
        <div className="stat-card">
          <FaStar className="stat-icon star-icon" />
          <div className="stat-info">
            <p className="stat-number">{stats.ratingCount}</p>
            <p className="stat-label">Ratings</p>
          </div>
        </div>
      </div>

      {/* MAIN ACTIONS */}
      {!showStoresPanel && !showUsersPanel && (
        <div className="manage-cards">
          <div className="manage-card">
            <h3>Manage Stores</h3>
            <button
              className="action-button add-btn"
              onClick={() => {
                setShowAddStoreForm(true);
                setStoreError("");
              }}
            >
              <FaPlus /> Add Store
            </button>
            <button className="action-button view-btn" onClick={openStoresPanel}>
              View All Stores
            </button>
          </div>
          <div className="manage-card">
            <h3>Manage Users</h3>
            <button
              className="action-button add-btn"
              onClick={() => {
                setShowAddUserForm(true);
                setUserError("");
              }}
            >
              <FaPlus /> Add User
            </button>
            <button className="action-button view-btn" onClick={openUsersPanel}>
              View All Users
            </button>
          </div>
        </div>
      )}

      {/* STORES PANEL */}
      {showStoresPanel && (
        <div className="panel">
          <div className="panel-header">
            <input
              type="text"
              placeholder="Search stores, email, address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="action-button view-btn" onClick={closePanels}>
              Close
            </button>
          </div>
          <div className="cards-container vertical">
            {filteredStores.map((store) => (
              <div className="card" key={store.id}>
                <h3>{store.name}</h3>
                <p>Email: {store.email}</p>
                <p>Address: {store.address}</p>
                <p>
                  Owner:{" "}
                  {users.find((u) => u.id === store.ownerId)?.name || "N/A"}
                </p>
                <div className="ratings">{renderStars(store.overallRating)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* USERS PANEL */}
      {showUsersPanel && (
        <div className="panel">
          <div className="panel-header">
            <input
              type="text"
              placeholder="Search users,email,address,roles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="ALL">Filter Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="STORE_OWNER">Store Owner</option>
              <option value="USER">User</option>
            </select>
            <button className="action-button view-btn" onClick={closePanels}>
              Close
            </button>
          </div>
          <div className="cards-container vertical">
            {filteredUsers.map((user) => {
              const ownedStore = stores.find(
                (s) => s.ownerId?.toString() === user.id?.toString()
              );
              const storeRating = ownedStore?.overallRating ?? null;
              return (
                <div className="card" key={user.id}>
                  <h3>
                    <span
                      className={`role-dot ${
                        user.role === "ADMIN"
                          ? "green"
                          : user.role === "STORE_OWNER"
                          ? "orange"
                          : "blue"
                      }`}
                    ></span>
                    {user.name.toUpperCase()}
                  </h3>
                  <p>Email: {user.email}</p>
                  <p>Address: {user.address}</p>
                  <p>Role: {user.role}</p>
                  {user.role === "STORE_OWNER" &&
                    (ownedStore ? (
                      <>
                        <p>Store: {ownedStore.name}</p>
                        <div className="ratings">{renderStars(storeRating)}</div>
                      </>
                    ) : (
                      <p style={{ color: "red" }}>No store assigned</p>
                    ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ADD USER MODAL */}
      <Modal
        show={showAddUserForm}
        onClose={() => setShowAddUserForm(false)}
        title="Add User"
        onConfirm={handleAddUser}
        confirmText="Add User"
      >
        {userError && <p style={{ color: "red" }}>{userError}</p>}
        <input
          type="text"
          placeholder="Name"
          value={newUser.name}
          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          value={newUser.email}
          onChange={(e) =>
            setNewUser({ ...newUser, email: e.target.value.toLowerCase() })
          }
        />
        <div className="input-group">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
          />
          <span
            className="eye-icon"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "🙈" : "👁️"}
          </span>
        </div>
        <div className="input-group">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={newUser.confirmPassword}
            onChange={(e) =>
              setNewUser({ ...newUser, confirmPassword: e.target.value })
            }
          />
          <span
            className="eye-icon"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? "🙈" : "👁️"}
          </span>
        </div>
        <input
          type="text"
          placeholder="Address"
          value={newUser.address}
          onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
        />
        <select
          value={newUser.role}
          onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
        >
          <option value="USER">USER</option>
          <option value="STORE_OWNER">STORE_OWNER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
      </Modal>

      {/* ADD STORE MODAL */}
      <Modal
        show={showAddStoreForm}
        onClose={() => setShowAddStoreForm(false)}
        title="Add Store"
        onConfirm={handleAddStore}
        confirmText="Add Store"
      >
        {storeError && <p style={{ color: "red" }}>{storeError}</p>}
        <input
          type="text"
          placeholder="Store Name"
          value={newStore.name}
          onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
        />
        <input
          type="email"
          placeholder="Store Email"
          value={newStore.email}
          onChange={(e) =>
            setNewStore({ ...newStore, email: e.target.value.toLowerCase() })
          }
        />
        <input
          type="text"
          placeholder="Address"
          value={newStore.address}
          onChange={(e) => setNewStore({ ...newStore, address: e.target.value })}
        />
        {availableStoreOwners.length > 0 ? (
          <select
            value={newStore.ownerId}
            onChange={(e) =>
              setNewStore({ ...newStore, ownerId: e.target.value })
            }
          >
            <option value="">Select Owner</option>
            {availableStoreOwners.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.email})
              </option>
            ))}
          </select>
        ) : (
          <p style={{ color: "red" }}>
            No available store owners. Add a store owner first.
          </p>
        )}
      </Modal>
    </div>
  );
};

export default AdminDashboard;
