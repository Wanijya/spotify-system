import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./Login.css"; // Reuse same styles

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${import.meta.env.VITE_AUTH_URL}/api/auth/forgot-password`,
        { email },
        {
          withCredentials: true,
        },
      );
      setIsSubmitted(true);
      toast.success("Reset link sent successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "An error occurred");
    }
  };

  if (isSubmitted) {
    return (
      <div className="login-page">
        <div className="login-card">
          <h1>Check Your Email</h1>
          <p style={{ color: "#b3b3b3" }}>
            We've sent a password reset link to {email}
          </p>
          <Link to="/login" className="login-submit">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Reset Your Password</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <button type="submit" className="login-submit">
            Send Reset Link
          </button>
        </form>
        <p className="login-footer">
          Remember your password? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
