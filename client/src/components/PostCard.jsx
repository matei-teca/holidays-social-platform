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
      console.error(err);
    }
  };

  return (
    <div className="post-card">
      <div className="post-card-header">
        <h3>{post.author}</h3>
        <span className="post-timestamp">
          {new Date(post.createdAt).toLocaleString()}
        </span>
      </div>

      <div className="post-card-body">
        <p className="holiday">{post.holiday}</p>
        <p>{post.content}</p>
        {post.image && (
          <img src={post.image} alt="post" className="post-image" />
        )}
      </div>

      <div className="post-card-footer">
        <div className="reactions">
          <button onClick={handleLike}>❤️ {likes}</button>
        </div>
      </div>

      <CommentSection postId={post._id} />
    </div>
  );
};

export default PostCard;
