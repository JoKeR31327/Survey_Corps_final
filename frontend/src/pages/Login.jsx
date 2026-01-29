import { useState } from "react";
import { apiRequest } from "../api/client";
import { USER_API } from "../api/config";
import { setToken } from "../utils/storage";

export default function Login({ go }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    const newErrors = {};

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

    try {
      await apiRequest(`${USER_API}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      setErrors({});
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setIsSignUp(false);
      alert("Account created successfully! You can now log in.");
    } catch (err) {
      setErrors({ signup: err.message || "Sign up failed" });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!email.trim()) newErrors.email = "Email is required";
    if (!validateEmail(email)) newErrors.email = "Please enter a valid email";
    if (!password) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const data = await apiRequest(`${USER_API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      setToken(data.token);
      go("main");
      setEmail("");
      setPassword("");
      setErrors({});
    } catch (err) {
      setErrors({ login: err.message || "Invalid credentials" });
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
          }}
          className={isSignUp ? "primary-btn" : "secondary-btn"}
          style={{ flex: 1 }}
        >
          📝 Sign Up
        </button>
      </div>

      <form onSubmit={handleSubmit}>
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

        {errors.signup && (
          <p style={{ color: "#e74c3c", fontSize: "12px", marginTop: "4px" }}>
            {errors.signup}
          </p>
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
        ) : (
          <>Create an account via Sign Up first</>
        )}
      </p>
    </div>
  );
}
