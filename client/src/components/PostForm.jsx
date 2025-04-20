import { useState } from "react";
import { createPost } from "../services/api";
import "./styles/PostForm.css";

const PostForm = ({ onPostCreated }) => {
  const [form, setForm] = useState({
    author: "",
    holiday: "",
    content: "",
    image: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await createPost(form);
      onPostCreated(response.data); // Update feed
      setForm({ author: "", holiday: "", content: "", image: "" });
    } catch (err) {
      console.error("Error creating post:", err);
    }
  };

  return (
    <form className="post-form" onSubmit={handleSubmit}>
      <input name="author" placeholder="Your Name" value={form.author} onChange={handleChange} required />
      <input name="holiday" placeholder="Holiday (e.g. Christmas)" value={form.holiday} onChange={handleChange} required />
      <textarea name="content" placeholder="What's on your mind?" value={form.content} onChange={handleChange} required />
      <input name="image" placeholder="Image URL (optional)" value={form.image} onChange={handleChange} />
      <button type="submit">Post 🎉</button>
    </form>
  );
};

export default PostForm;
