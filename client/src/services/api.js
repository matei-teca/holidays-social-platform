import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:9001/api",
});

API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export const getPosts = () => API.get("/posts");
export const createPost = (newPost) => API.post("/posts", newPost);
export const likePost = (id) => API.patch(`/posts/${id}/like`);

export const getComments = (postId) => API.get(`/comments/${postId}`);
export const createComment = (data) => API.post(`/comments`, data);

export const register = (data) => API.post("/auth/register", data);
export const login = (data) => API.post("/auth/login", data);
