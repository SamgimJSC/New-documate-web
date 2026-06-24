import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000",
  withCredentials: true,
});

client.interceptors.response.use((response) => {
  if (response.data && typeof response.data === "object" && "data" in response.data) {
    response.data = response.data.data;
  }
  return response;
});

export default client;
