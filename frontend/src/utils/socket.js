import { io } from "socket.io-client";

const getBackendUrl = () => {
  if (process.env.NODE_ENV === "production") {
    return "https://chatapp-git-feature-responsive-39b7da-redoxs-projects-b1ca2819.vercel.app";
  } else {
    return `http://${window.location.hostname}:8000`;
  }
};

const socket = io(getBackendUrl() || "/", {
  autoConnect: false,
  withCredentials: true,
});

export { socket };
