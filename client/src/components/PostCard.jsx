import "./styles/PostCard.css";

const PostCard = ({ post }) => {
  return (
    <div className="post-card">
      <h3>{post.author}</h3>
      <p><strong>{post.holiday}</strong></p>
      <p>{post.content}</p>
      {post.image && <img src={post.image} alt="post" className="post-image" />}
      <p className="post-timestamp">{new Date(post.createdAt).toLocaleString()}</p>
    </div>
  );
};

export default PostCard;
