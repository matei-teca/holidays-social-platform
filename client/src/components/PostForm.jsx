import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { createPost } from "../services/api";
import "./styles/PostForm.css";

const PostForm = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    author: user?.username || "",
    holiday: "",
    content: "",
    image: "",
    joinable: false,
  });

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleCheckbox = (e) =>
    setForm((f) => ({ ...f, joinable: e.target.checked }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await createPost(form);
      onPostCreated(res.data);
      setForm({ author: user?.username || "", holiday: "", content: "", image: "" });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form className="post-form" onSubmit={handleSubmit}>
      <input name="author" value={form.author} disabled />
      <input
        name="holiday"
        placeholder="Holiday (e.g. Christmas)"
        value={form.holiday}
        onChange={handleChange}
        required
      />
      <textarea
        name="content"
        placeholder="What's on your mind?"
        value={form.content}
        onChange={handleChange}
        required
      />
      <input
        name="image"
        placeholder="Image URL (optional)"
        value={form.image}
        onChange={handleChange}
      />
      <div className="post-form-row">
        <label className="joinable-checkbox">
          <input
            type="checkbox"
            name="joinable"
            checked={form.joinable}
            onChange={handleCheckbox}
          />
          <span>Joinable</span>
        </label>
      </div>

      <button type="submit">Post 🎉</button>
    </form>
  );
};

export default PostForm;
