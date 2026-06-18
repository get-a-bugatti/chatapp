import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { logout as logoutUser } from "../store/authSlice.js";
import { socket } from "../utils/socket.js";

export default function Navbar() {

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const authStatus = useSelector(
    (state) => state.auth.status
  );

  async function handleLogout() {
    dispatch(logoutUser());
    socket.disconnect();

    const response = await axios.get("/api/v1/users/logout");
    navigate("/login");
  }

  return (
    <nav className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">

      {/* Left Side */}
      <div className="flex items-center gap-6">

        {authStatus && (
          <>
            <NavLink
              to="/users/all"
              className={({ isActive }) =>
                isActive
                  ? "text-blue-400"
                  : "text-zinc-300"
              }
            >
              Users
            </NavLink>

            <NavLink
              to="/global"
              className={({ isActive }) =>
                isActive
                  ? "text-blue-400"
                  : "text-zinc-300"
              }
            >
              Global Chat
            </NavLink>

            <NavLink
              to="/private"
              className={({ isActive }) =>
                isActive
                  ? "text-blue-400"
                  : "hidden"
              }
            >
              Private Chat
            </NavLink>
          </>
        )}
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">

        {!authStatus ? (
          <>
            <NavLink
              to="/login"
              className={({ isActive }) =>
                isActive
                  ? "text-blue-400"
                  : "text-zinc-300"
              }
            >
              Login
            </NavLink>

            <NavLink
              to="/signup"
              className={({ isActive }) =>
                isActive
                  ? "text-blue-400"
                  : "text-zinc-300"
              }
            >
              Signup
            </NavLink>
          </>
        ) : (
          <button
            onClick={handleLogout}
            className="
              rounded
              bg-red-500
              px-4
              py-2
              hover:bg-red-600
              cursor-pointer
            "
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}