// Login.jsx
import { useState } from "react";
import Input from "../Input";
import api from "../../api/axios.js";
import {useSelector, useDispatch} from "react-redux";
import {resetResetToken} from "../../store/authSlice.js";
import {toast} from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function SetNewPassword() {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
    resetToken: useSelector((state) => state.auth.reset.token) || "",
    login: useSelector((state) => state.auth.reset.email) || "",
  });
  const [error, setError] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const response = await api.post(
        "/api/v1/users/set-new-password",
        formData
      );

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      toast.success(response.data.message);
      navigate("/login");
    } catch (error) {

      const message =
        error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred.";

        if (error.response?.status === 401) {
            dispatch(resetResetToken());
        }
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
          Set New Password
        </h1>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
          Enter Your New Password
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Password :"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter password.."
            required
          />

          <Input
            label="Confirm Password :"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Enter Password Again.."
            required
          />

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
          >
            Set New Password
          </button>
        </form>

      </div>
    </div>
  );
}