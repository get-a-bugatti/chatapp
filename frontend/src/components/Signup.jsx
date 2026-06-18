// Signup.jsx
import { useState } from "react";
import Input from "./Input";
import axios from "axios";

export default function Signup() {
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    email: "",
    password: "",
    avatar: null,
    coverImage: null,
  });
  
  const [error, setError] = useState(null);

  function handleChange(e) {
    const { name, type, files, value} = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const dataToSend = new FormData();

    Object.keys(formData).forEach((key) => {
      if (formData[key]) {
        dataToSend.append(key, formData[key]);
      }
    });


    try {
      const response = await axios.post("/api/v1/users/signup", dataToSend);

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      alert("Signup successful!");
    } catch (error) {
        const message = 
        error.response?.data?.message || // 1. Custom backend message
        error.message ||                 // 2. Axios generic message
        "An unexpected error occurred while submitting signup form.";   // 3. Last resort fallback

        console.error(error);
        setError(message);
    }
  }

  if (error) return <div>Error: {error}</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 shadow-xl rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-6">
          Create Account
        </h1>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
          Already have an account?{" "}
          <span className="text-blue-600 dark:text-blue-400 cursor-pointer hover:underline" onClick={() => navigate("/login")}>
            Log In
          </span>
        </p>

        <form onSubmit={(e) => handleSubmit(e)} className="space-y-5">
          <Input
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter username"
            required
          />

          <Input
            label="Full Name"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Enter full name"
            required
          />

          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email"
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

          <Input
            type="file"
            label="Avatar URL"
            name="avatar"
            accept=".jpg, .png, .jpeg, .webp"
            capture="user"
            onChange={handleChange}
            placeholder="Enter avatar URL"
            required
          />

          <Input
            type="file"
            label="Cover Image URL"
            capture="environment"
            name="coverImage"
            onChange={handleChange}
            placeholder="Optional cover image URL"
          />

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold transition"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}