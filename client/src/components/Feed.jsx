import "./styles/Feed.css";
import PostCard from "./PostCard";

const mockPosts = [
  {
    id: 1,
    author: "Alice",
    holiday: "Christmas",
    content: "Wishing everyone a joyful Christmas! 🎄✨",
    image: "https://source.unsplash.com/600x300/?christmas",
    createdAt: new Date(),
  },
  {
    id: 2,
    author: "Bob",
    holiday: "New Year",
    content: "Can't wait for 2025! 🎆🥂",
    image: "https://source.unsplash.com/600x300/?newyear",
    createdAt: new Date(),
  },
  {
    id: 3,
    author: "Charlie",
    holiday: "Halloween",
    content: "Spooky vibes only! 👻🎃",
    image: "https://source.unsplash.com/600x300/?halloween",
    createdAt: new Date(),
  },
];

const Feed = () => {
  return (
    <div className="feed">
      {mockPosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};

export default Feed;
