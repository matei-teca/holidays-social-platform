import { useState } from "react";
import Feed from "../components/Feed";
import PostForm from "../components/PostForm";
import "./styles/Home.css";

const Home = () => {
  const [newPosts, setNewPosts] = useState([]);

  const handleNewPost = (p) => setNewPosts((prev) => [p, ...prev]);

  return (
    <div className="home-page container">
      <h1>Welcome to the hDays Social Platform 🎉</h1>
      <PostForm onPostCreated={handleNewPost} />
      <Feed newPosts={newPosts} />
    </div>
  );
};

export default Home;
