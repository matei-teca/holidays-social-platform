import { useEffect, useState } from "react";
import PostCard from "./PostCard";
import { getPosts } from "../services/api";
import "./styles/Feed.css";

const Feed = ({ externalPosts = [] }) => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await getPosts();
        setPosts(response.data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };
    fetchPosts();
  }, []);

  const combinedPosts = [...externalPosts, ...posts];

  return (
    <div className="feed">
      {combinedPosts.length > 0 ? (
        combinedPosts.map((post) => <PostCard key={post._id || post.id} post={post} />)
      ) : (
        <p>No posts yet. Be the first to share a holiday vibe! 🎉</p>
      )}
    </div>
  );
};

export default Feed;
