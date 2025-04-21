import { useEffect, useState } from "react";
import PostCard from "./PostCard";
import { getPosts } from "../services/api";
import "./styles/Feed.css";

const Feed = ({ newPosts = [] }) => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    getPosts()
      .then((res) => setPosts(res.data))
      .catch((err) => console.error(err));
  }, []);

  const combined = [...newPosts, ...posts];

  return (
    <div className="feed">
      {combined.length > 0 ? (
        combined.map((post) => <PostCard key={post._id || post.id} post={post} />)
      ) : (
        <p>No posts yet. Be the first to share a holiday vibe! 🎉</p>
      )}
    </div>
  );
};

export default Feed;
