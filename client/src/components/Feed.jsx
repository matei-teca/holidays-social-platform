import React from "react";
import PostCard from "./PostCard";
import "./styles/Feed.css";

const Feed = ({ newPosts = [], feedPosts = [], onDelete }) => {
  const combined = [...newPosts, ...feedPosts];

  return (
    <div className="feed">
      {combined.length > 0 ? (
        combined.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            onDelete={onDelete}
          />
        ))
      ) : (
        <p>No posts yet. Be the first to share a holiday vibe! 🎉</p>
      )}
    </div>
  );
};

export default Feed;
