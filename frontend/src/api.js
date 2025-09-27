import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:4000/api",
});

export const setAuthToken = (token) => {
  API.interceptors.request.use((req) => {
    req.headers.Authorization = `Bearer ${token}`;
    return req;
  });
};

export default API;
