import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Input from "../components/Input";
import api from "../api/axios.js";
import { login as loginUser, logout as logoutUser } from "../store/authSlice.js";
import { socket } from "../utils/socket.js";
import { useDispatch } from "react-redux";

export default function Login() {
  const [formData, setFormData] = useState({
    login: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Hook used correctly below

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true); // Prevent double submission click storms
    setError(null);     // Clear errors on fresh login attempt
  
    try {
      const response = await api.post("/api/v1/users/login", formData);
  
      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      
      dispatch(loginUser(response.data.data));
      socket.connect();

      alert("Login successful!");
      navigate(from, {
        replace: true
      });
  
    } catch (error) {
      dispatch(logoutUser());

      const message = 
        error.response?.data?.message || 
        error.message ||                 
        "An unexpected error occurred.";

      console.error(error);
      setError(message);      
    } finally {
      setIsLoading(false); // Reset loading state when async task ends
    }
  }

  // REMOVED: "if (error) return..." layout breaker

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 shadow-xl rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-6">
          Login
        </h1>

        {/* Inline Error UI: Keeps form usable so the user can re-type details */}
        {error && (
          <div className="mb-5 p-3 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-xl text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email or Username"
            name="login"
            value={formData.login}
            onChange={handleChange}
            placeholder="Enter username or email"
            required
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter password"
            required
          />

          <button
            type="submit"
            disabled={isLoading} // Disables button while waiting for backend
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold transition"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
          Don&apos;t have an account?{" "}
          <span className="text-blue-600 dark:text-blue-400 cursor-pointer hover:underline" onClick={() => navigate("/signup")}>
            Sign Up
          </span>
        </p>

        <p className="text-center cursor-pointer text-sm text-blue-600 dark:text-blue-400 hover:underline font-semibold mt-4" onClick={() => navigate("/forgot-password")}>
          Forgot Password ?
        </p>
      </div>
    </div>
  );
}
