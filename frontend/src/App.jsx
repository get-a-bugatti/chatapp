// App.jsx
import {Navbar} from "./components/index.js";
import { Outlet, useLoaderData } from "react-router-dom";
import {useState, useEffect} from "react";
import {login as loginUser, logout as logoutUser} from "./store/authSlice.js";
import {useDispatch} from "react-redux";
import api from "./api/axios.js";
import { socket } from "./utils/socket.js";
import { Toaster } from "react-hot-toast";


export async function AppLoader() {
  try {

    const response = await api.get("/api/v1/users/me");
    return response.data.data;
  } catch (error) {
    if (error.response?.status === 401) {
      return null;
    }
    
    throw error;
  }
}

export default function App() {

  const dispatch = useDispatch();
  const user = useLoaderData();

  useEffect(() => {

      if (user) {
        dispatch(loginUser(user));
        socket.connect();

      } else {
        
        dispatch(logoutUser());
      }
      
      return () => socket.disconnect();
  }, [user, dispatch])

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />

      <main className="p-6">
          <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
          }}
          />
          <Outlet />
      </main>
    </div>
  );
}