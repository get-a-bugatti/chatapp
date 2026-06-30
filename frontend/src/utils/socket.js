import { io } from "socket.io-client";

const getBackendUrl = () => {
  if (import.meta.env.VITE_ENV === "production") {
    return import.meta.env.VITE_REMOTE_API_URL;
  } else {
    return import.meta.env.VITE_LOCAL_API_URL;
  }
};

const socket = io(getBackendUrl() || "/", {
  autoConnect: false,
  withCredentials: true,
});

export { socket };
