// Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "./Input";
import axios from "axios";
import { login as loginUser, logout as logoutUser } from "../store/authSlice.js"
import { socket } from "../utils/socket.js";

import { useSelector, useDispatch } from "react-redux";

export default function Login() {
  const [formData, setFormData] = useState({
    login: "",
    password: "",
  });
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  function handleChange(e) {
    const {name, value} = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
  
    try {
      const response = await axios.post(
        "/api/v1/users/login",
        formData
      );
  
      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      
      dispatch(loginUser(response.data.data));
      socket.connect();

      alert("Login successful!");
      navigate("/");
  
    } catch (error) {
      dispatch(logoutUser());

      const message = 
        error.response?.data?.message || 
        error.message ||                 
        "An unexpected error occurred.";


        // Use alert or state to throw errors,
        // so user can see.
        console.error(error);
        setError(message);      
    }
  }

  if (error) return <div>Error: {error}</div>

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 shadow-xl rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-6">
          Login
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email"
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
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
          >
            Login
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
          Don&apos;t have an account?{" "}
          <span className="text-blue-600 dark:text-blue-400 cursor-pointer hover:underline" onClick={() => navigate("/signup")}>
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
}