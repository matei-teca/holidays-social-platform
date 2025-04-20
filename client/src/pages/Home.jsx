import { useState } from "react";
import Feed from "../components/Feed";
import PostForm from "../components/PostForm";

const Home = () => {
  const [posts, setPosts] = useState([]);

  const handleNewPost = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  return (
    <div>
      <h1 style={{ textAlign: "center", marginTop: "1rem" }}>
        Welcome to the Holiday Social Platform 🎉
      </h1>
      <PostForm onPostCreated={handleNewPost} />
      <Feed newPosts={posts} />
    </div>
  );
};

export default Home;
