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
export const getPost = (id) => API.get(`/posts/${id}`);
export const createPost = (newPost) => API.post("/posts", newPost);
export const deletePost      = (id) => API.delete(`/posts/${id}`);
export const likePost = (id) => API.patch(`/posts/${id}/like`);
export const joinPost  = (id) => API.patch(`/posts/${id}/join`);

export const getComments = (postId) => API.get(`/comments/${postId}`);
export const createComment = (data) => API.post(`/comments`, data);

export const register = (data) => API.post("/auth/register", data);
export const login = (data) => API.post("/auth/login", data);

export const getProfile    = (username) => API.get(`/users/${username}`);
export const updateProfile = (data)     => API.put(`/users`, data);

export const getJoinableEvents = () => API.get("/events/joinable");
export const getJoinedEvents   = () => API.get("/events/joined");

export const getUsers = () => API.get("/users");
export const getConversations = () => API.get("/conversations");
export const getConversation  = (id) => API.get(`/conversations/${id}`);
export const createConversation = (data) => API.post("/conversations", data);

export const getNotifications = () => API.get("/notifications");
export const markNotificationRead = (id) => API.patch(`/notifications/${id}/read`);

export const uploadPublicKey = (publicKey) =>
  API.put("/users", { publicKey });;