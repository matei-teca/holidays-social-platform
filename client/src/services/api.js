import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:9001/api",
});

export const getPosts = () => API.get("/posts");
export const createPost = (newPost) => API.post("/posts", newPost);
export const likePost = (id) => API.patch(`/posts/${id}/like`);

export const getComments = (postId) => API.get(`/comments/${postId}`);
export const createComment = (data) => API.post(`/comments`, data);
