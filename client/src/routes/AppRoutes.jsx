import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Profile from "../pages/Profile";
import PostPage from "../pages/PostPage";
import Events from "../pages/Events";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/profile/:username" element={<Profile />} />
    <Route path="/posts/:id" element={<PostPage />} />
    <Route path="/events" element={<Events />} />
    
  </Routes>
);

export default AppRoutes;
