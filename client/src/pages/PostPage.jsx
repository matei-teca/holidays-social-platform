import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getPost } from "../services/api";
import { joinPost } from "../services/api";
import CommentSection from "../components/CommentSection";
import "./styles/PostPage.css";

const PostPage = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState("");
  const user = JSON.parse(localStorage.getItem("user"))?.username;

  useEffect(() => {
    getPost(id)
      .then(res => setPost(res.data))
      .catch(() => setError("Failed to load post."));
  }, [id]);

  if (error) return <div className="post-page error">{error}</div>;
  if (!post) return <div className="post-page loading">Loading…</div>;

  const handleJoin = async () => {
    try {
      const updated = await joinPost(id);
      setPost(updated.data);
    } catch {
      console.error(err);
    }
  };

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
          {post.image && <img src={post.image} alt="" className="image" />}
        </div>

        <div className="post-page-footer">
          <button
            className="like-btn"
            onClick={async () => {
              try {
                const updated = await API.patch(`/posts/${id}/like`);
                setPost(updated.data);
              } catch {}
            }}
          >
            ❤️ {post.likes}
          </button>

        {post.joinable && (
          <button className="join-btn" onClick={handleJoin}>
            {post.joiners.includes(user) ? "Leave" : "Join"} ({post.joiners.length})
          </button>
        )}
        </div>
      </div>

      <CommentSection postId={id} />
    </div>
  );
};

export default PostPage;
