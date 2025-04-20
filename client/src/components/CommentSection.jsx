import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";  // Import useAuth hook
import { getComments, createComment } from "../services/api";
import "./styles/CommentSection.css";

const CommentSection = ({ postId }) => {
  const { user } = useAuth();  // Get user data from AuthContext
  const [comments, setComments] = useState([]);
  const [form, setForm] = useState({ text: "" });

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getComments(postId);
        setComments(res.data);
      } catch (err) {
        console.error("Error loading comments", err);
      }
    };
    fetch();
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await createComment({ ...form, postId, author: user?.username });  // Use username from AuthContext
      setComments((prev) => [res.data, ...prev]);
      setForm({ text: "" });
    } catch (err) {
      console.error("Comment failed:", err);
    }
  };

  return (
    <div className="comment-section">
      <form onSubmit={handleSubmit}>
        <input
          name="text"
          placeholder="Write a comment..."
          value={form.text}
          onChange={(e) => setForm({ ...form, text: e.target.value })}
          required
        />
        <button type="submit">💬</button>
      </form>

      <ul>
        {comments.map((c) => (
          <li key={c._id}>
            <strong>{c.author}:</strong> {c.text}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CommentSection;
