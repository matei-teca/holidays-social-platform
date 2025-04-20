import { useState } from "react";
import { likePost } from "../services/api";
import CommentSection from "./CommentSection";
import "./styles/PostCard.css";

const PostCard = ({ post }) => {
  const [likes, setLikes] = useState(post.likes || 0);

  const handleLike = async () => {
    try {
      const updated = await likePost(post._id);
      setLikes(updated.data.likes);
    } catch (err) {
      console.error("Failed to like post:", err);
    }
  };

  return (
    <div className="post-card">
      <h3>{post.author}</h3>
      <p><strong>{post.holiday}</strong></p>
      <p>{post.content}</p>
      {post.image && <img src={post.image} alt="post" className="post-image" />}
      <p className="post-timestamp">{new Date(post.createdAt).toLocaleString()}</p>

      <div className="reactions">
        <button onClick={handleLike}>❤️ {likes}</button>
      </div>

      <CommentSection postId={post._id} />
    </div>
  );
};

export default PostCard;
