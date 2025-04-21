import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { likePost, deletePost, joinPost } from "../services/api";
import { useAuth } from "../context/AuthContext";
import CommentSection from "./CommentSection";
import "./styles/PostCard.css";

const PostCard = ({ post, onDelete }) => {
  const { user } = useAuth();
  const navigate  = useNavigate();

  // Local UI state
  const [likes, setLikes]       = useState(post.likes || 0);
  const [joiners, setJoiners]   = useState(post.joiners || []);
  const isAuthor                 = user?.username === post.author;
  const hasJoined                = joiners.includes(user?.username);

  // Handlers
  const handleLike = async (e) => {
    e.stopPropagation();
    try {
      const updated = await likePost(post._id);
      setLikes(updated.data.likes);
    } catch (err) {
      console.error(err);
    }
  };

  const handleJoin = async (e) => {
    e.stopPropagation();
    try {
      const updated = await joinPost(post._id);
      setJoiners(updated.data.joiners);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this post?")) return;
    try {
      await deletePost(post._id);
      onDelete(post._id);
    } catch (err) {
      console.error(err);
    }
  };

  // Navigate to detail
  const goToDetail = () => navigate(`/posts/${post._id}`);

  return (
    <div
      className="post-card"
      onClick={goToDetail}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === "Enter" && goToDetail()}
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
        {post.image && (
          <img src={post.image} alt="" className="post-image" />
        )}
      </div>

      <div className="post-card-footer">
       <div className="footer-actions-left">
         <button onClick={handleLike}>❤️ {likes}</button>

         {post.joinable && (  
           <button className="join-btn" onClick={handleJoin}>
             {hasJoined ? "Leave" : "Join"} ({joiners.length})
           </button>
         )}
       </div>

       {isAuthor && (
         <button className="delete-btn" onClick={handleDelete}>
           🗑️
         </button>
       )}
     </div>

      <CommentSection postId={post._id} />
    </div>
  );
};

export default PostCard;
