import axios from "axios";

const getBackendUrl = () => {
  if (import.meta.env.VITE_ENV === "production") {
    return import.meta.env.VITE_REMOTE_API_URL;
  } else {
    return import.meta.env.VITE_LOCAL_API_URL;
  }
};

const api = axios.create({
  baseURL: getBackendUrl(),
  withCredentials: true,
});

export default api;
