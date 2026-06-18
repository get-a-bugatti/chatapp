// App.jsx
import {Navbar} from "./components/index.js";
import { Outlet } from "react-router-dom";
import {useState, useEffect} from "react";
import {login as loginUser, logout as logoutUser} from "./store/authSlice.js";
import {useDispatch} from "react-redux";
import api from "./api/axios.js";
import { socket } from "./utils/socket.js";

export default function App() {

  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
  api.get("/api/v1/users/me")
    .then(response => {
      if (response.data?.data) {
        dispatch(loginUser(response.data.data));
        socket.connect();
        return true;
      } else {
        dispatch(logoutUser());
        return false;
      }
    })
    // add more .then()'s here to fetch and reduxStorify user-based items (posts, videos)
    .catch(err => {
      dispatch(logoutUser())
      console.log(err);
    })
    .finally(() => {
      setLoading(false);
    })
  }, [])

  return (
    loading ? null :
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />

      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}