// client/src/pages/PostPage.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getPost,
  likePost,
  joinPost,
  deletePost
} from "../services/api";
import { useAuth } from "../context/AuthContext";
import CommentSection from "../components/CommentSection";
import "./styles/PostPage.css";

const PostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState(null);
  const [likes, setLikes] = useState(0);
  const [joiners, setJoiners] = useState([]);

  // Fetch the post on mount
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getPost(id);
        setPost(res.data);
        setLikes(res.data.likes || 0);
        setJoiners(res.data.joiners || []);
      } catch (err) {
        console.error("Error loading post:", err);
      }
    };
    fetch();
  }, [id]);

  // Like handler
  const handleLike = async () => {
    try {
      const updated = await likePost(id);
      setLikes(updated.data.likes);
      setPost(updated.data);
    } catch (err) {
      console.error("Like failed:", err);
    }
  };

  // Join/Leave handler
  const handleJoin = async () => {
    try {
      const updated = await joinPost(id);
      setJoiners(updated.data.joiners);
      setPost(updated.data);
    } catch (err) {
      console.error("Join failed:", err);
    }
  };

  // Delete handler
  const handleDelete = async () => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await deletePost(id);
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  if (!post) return <p>Loading…</p>;

  const hasJoined = joiners.includes(user?.username);
  const isAuthor  = user?.username === post.author;

  return (
    <div className="post-page container">
      <div className="post-page-card">
        <div className="post-page-header">
          <h2 className="author">{post.author}</h2>
          <span className="timestamp">
            {new Date(post.createdAt).toLocaleString()}
          </span>
        </div>

        <div className="post-page-body">
          <p className="holiday">{post.holiday}</p>
          <p className="content">{post.content}</p>
          {post.image && (
            <img
              src={post.image}
              alt="Post"
              className="post-page-image"
            />
          )}
        </div>

        <div className="post-page-footer">
          <button className="like-btn" onClick={handleLike}>
            ❤️ {likes}
          </button>

          {post.joinable && (
            <button className="join-btn" onClick={handleJoin}>
              {hasJoined ? "Leave" : "Join"} ({joiners.length})
            </button>
          )}

          {isAuthor && (
            <button className="delete-btn" onClick={handleDelete}>
              Delete Post
            </button>
          )}
        </div>
      </div>

      <CommentSection postId={id} />
    </div>
  );
};

export default PostPage;
