import { useState } from "react";

export default function Login({ go }) {
  // Predefined admin accounts
  const PREDEFINED_ADMINS = [
    { username: "admin", password: "admin123" },
    { username: "manager", password: "manager123" },
  ];

  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userType, setUserType] = useState("user");
  const [errors, setErrors] = useState({});
  const [registeredUsers, setRegisteredUsers] = useState([]);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!username.trim()) newErrors.username = "Username is required";
    if (username.length < 3)
      newErrors.username = "Username must be at least 3 characters";
    if (!email.trim()) newErrors.email = "Email is required";
    if (!validateEmail(email)) newErrors.email = "Please enter a valid email";
    if (!password) newErrors.password = "Password is required";
    if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (password !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Store user (in real app, this would go to backend)
    setRegisteredUsers([
      ...registeredUsers,
      { username, email, password, userType: "user" },
    ]);
    setErrors({});
    setUsername("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setIsSignUp(false);
    alert("Account created successfully! You can now log in.");
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!username.trim()) newErrors.username = "Username is required";
    if (!password) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Check if it's an admin login
    if (userType === "admin") {
      const adminExists = PREDEFINED_ADMINS.find(
        (admin) => admin.username === username && admin.password === password,
      );

      if (adminExists) {
        go("admin");
        setUsername("");
        setPassword("");
        setErrors({});
      } else {
        setErrors({ login: "Invalid admin credentials." });
      }
      return;
    }

    // Check if user exists (regular user)
    const userExists = registeredUsers.find(
      (u) => u.username === username && u.password === password,
    );

    if (userExists) {
      go("main");
      setUsername("");
      setPassword("");
      setErrors({});
    } else if (registeredUsers.length === 0) {
      // Demo mode if no users registered
      go("main");
      setUsername("");
      setPassword("");
      setErrors({});
    } else {
      setErrors({ login: "Invalid user credentials. Please sign up first." });
    }
  };

  const handleSubmit = isSignUp ? handleSignUp : handleLogin;

  return (
    <div className="container" style={{ maxWidth: "420px", marginTop: "40px" }}>
      <h1>🏢 BLINKING WAREHOUSE</h1>
      <p
        style={{ textAlign: "center", marginBottom: "30px", color: "#7f8c8d" }}
      >
        Secure Inventory Management System
      </p>

      {/* Mode Toggle */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "30px" }}>
        <button
          type="button"
          onClick={() => {
            setIsSignUp(false);
            setErrors({});
            setUserType("user");
          }}
          className={!isSignUp ? "primary-btn" : "secondary-btn"}
          style={{ flex: 1 }}
        >
          🔐 Login
        </button>
        <button
          type="button"
          onClick={() => {
            setIsSignUp(true);
            setErrors({});
            setUserType("user");
          }}
          className={isSignUp ? "primary-btn" : "secondary-btn"}
          style={{ flex: 1 }}
        >
          📝 Sign Up
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {!isSignUp && (
          <div className="form-group">
            <label>Login As</label>
            <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
              <button
                type="button"
                onClick={() => setUserType("user")}
                className={
                  userType === "user" ? "primary-btn" : "secondary-btn"
                }
                style={{ flex: 1 }}
              >
                👤 User
              </button>
              <button
                type="button"
                onClick={() => setUserType("admin")}
                className={
                  userType === "admin" ? "primary-btn" : "secondary-btn"
                }
                style={{ flex: 1 }}
              >
                ⚙️ Admin
              </button>
            </div>
          </div>
        )}

        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (errors.username) setErrors({ ...errors, username: "" });
            }}
            style={{
              borderColor: errors.username ? "#e74c3c" : "#e0e6ed",
            }}
          />
          {errors.username && (
            <p style={{ color: "#e74c3c", fontSize: "12px", marginTop: "4px" }}>
              {errors.username}
            </p>
          )}
        </div>

        {isSignUp && (
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: "" });
              }}
              style={{
                borderColor: errors.email ? "#e74c3c" : "#e0e6ed",
              }}
            />
            {errors.email && (
              <p
                style={{ color: "#e74c3c", fontSize: "12px", marginTop: "4px" }}
              >
                {errors.email}
              </p>
            )}
          </div>
        )}

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors({ ...errors, password: "" });
            }}
            style={{
              borderColor: errors.password ? "#e74c3c" : "#e0e6ed",
            }}
          />
          {errors.password && (
            <p style={{ color: "#e74c3c", fontSize: "12px", marginTop: "4px" }}>
              {errors.password}
            </p>
          )}
        </div>

        {isSignUp && (
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword)
                  setErrors({ ...errors, confirmPassword: "" });
              }}
              style={{
                borderColor: errors.confirmPassword ? "#e74c3c" : "#e0e6ed",
              }}
            />
            {errors.confirmPassword && (
              <p
                style={{ color: "#e74c3c", fontSize: "12px", marginTop: "4px" }}
              >
                {errors.confirmPassword}
              </p>
            )}
          </div>
        )}

        {errors.login && (
          <div
            style={{
              backgroundColor: "#fdeef0",
              border: "1px solid #e74c3c",
              color: "#e74c3c",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "20px",
              fontSize: "14px",
            }}
          >
            {errors.login}
          </div>
        )}

        <button type="submit" className="primary-btn">
          {isSignUp ? "📝 Create Account" : "🔐 Login"}
        </button>
      </form>

      <p
        style={{
          textAlign: "center",
          marginTop: "20px",
          fontSize: "13px",
          color: "#7f8c8d",
        }}
      >
        {isSignUp ? (
          <>Sign up to create a user account</>
        ) : userType === "admin" ? (
          <>Admin credentials required</>
        ) : (
          <>Create an account via Sign Up first</>
        )}
      </p>
    </div>
  );
}
