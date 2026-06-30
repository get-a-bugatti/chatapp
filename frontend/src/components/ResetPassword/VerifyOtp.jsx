// Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../Input";
import api from "../../api/axios.js";
import {useDispatch, useSelector} from "react-redux";
import {setResetToken} from "../../store/authSlice.js";
import {toast} from "react-hot-toast";

export default function VerifyOtp() {
  const [formData, setFormData] = useState({
    otp: "",
    login: useSelector((state) => state.auth.reset.email) ||""
  });
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();

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
        "/api/v1/users/verify-otp",
        formData
      );

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      const resetToken = response.data?.data?.resetToken;

      if (!resetToken) {
        setError("No reset token received.");
      }

      dispatch(setResetToken(resetToken));

      toast.success(response.data.message);
      navigate("/set-new-password");

    } catch (error) {

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
          Forgot Password
        </h1>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
          Enter OTP Key you received, and the email/username associated with your account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">


          <Input
            label="OTP key :"
            name="otp"
            value={formData.otp}
            onChange={handleChange}
            placeholder="Enter OTP key.."
            required
          />

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
          >
            Verify OTP
          </button>
        </form>

      </div>
    </div>
  );
}