import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { likePost } from "../services/api";
import CommentSection from "./CommentSection";
import "./styles/PostCard.css";

const PostCard = ({ post }) => {
  const [likes, setLikes] = useState(post.likes || 0);
  const navigate = useNavigate();

  const handleLike = async (e) => {
    e.stopPropagation();            // prevent the card’s onClick
    try {
      const updated = await likePost(post._id);
      setLikes(updated.data.likes);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      className="post-card"
      onClick={() => navigate(`/posts/${post._id}`)}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === "Enter" && navigate(`/posts/${post._id}`)}
    >
      <div className="post-card-header">
        <h3>{post.author}</h3>
        <span className="post-timestamp">
          {new Date(post.createdAt).toLocaleString()}
        </span>
      </div>

      <div className="post-card-body">
        <p className="holiday">{post.holiday}</p>
        <p>{post.content}</p>
        {post.image && <img src={post.image} alt="" className="post-image" />}
      </div>

      <div className="post-card-footer">
        <button onClick={handleLike}>❤️ {likes}</button>
      </div>

      {/* Stop clicks inside comments from bubbling up */}
      <CommentSection postId={post._id} />
    </div>
  );
};

export default PostCard;
