import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:9001/api",
});

export const getPosts = () => API.get("/posts");
