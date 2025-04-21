// client/src/pages/Home.jsx
import { useState, useEffect } from "react";
import Feed from "../components/Feed";
import PostForm from "../components/PostForm";
import { getPosts } from "../services/api";
import "./styles/Home.css";

const Home = () => {
  const [newPosts,  setNewPosts]  = useState([]);
  const [feedPosts, setFeedPosts] = useState([]);

  useEffect(() => {
    getPosts().then((res) => setFeedPosts(res.data));
  }, []);

  const handleNewPost = (post) => {
    setNewPosts((prev) => [post, ...prev]);
  };

  const handleDelete = (id) => {
    // remove from both newPosts and feedPosts
    setNewPosts((arr) => arr.filter((p) => p._id !== id));
    setFeedPosts((arr) => arr.filter((p) => p._id !== id));
  };

  return (
    <div className="home-page container">
      <h1>Welcome to the hDays Social Platform 🎉</h1>
      <PostForm onPostCreated={handleNewPost} />
      <Feed
        newPosts={newPosts}
        feedPosts={feedPosts}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default Home;
