// client/src/components/CommentSection.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getComments, createComment } from "../services/api";
import "./styles/CommentSection.css";

const CommentSection = ({ postId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    getComments(postId).then((res) => setComments(res.data));
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // no need to stopPropagation here since input handles it
    try {
      const res = await createComment({ postId, text });
      setComments((c) => [res.data, ...c]);
      setText("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="comment-section" onClick={(e) => e.stopPropagation()}>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Write a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();    // prevent form auto-submit
              handleSubmit(e);       // manually submit
              e.stopPropagation();   // stop bubbling to PostCard
            }
          }}
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
