import { useEffect, useState, useCallback } from "react";
import { getJoinableEvents, getJoinedEvents } from "../services/api";
import PostCard from "../components/PostCard";
import "./styles/Events.css";

const Events = () => {
  const [joinable, setJoinable] = useState([]);
  const [joined,   setJoined]   = useState([]);
  const [error,    setError]    = useState("");
  const [activeTab, setActiveTab] = useState("joinable"); // “joinable” or “joined”

  useEffect(() => {
    const fetch = async () => {
      try {
        const [jbleRes, jndRes] = await Promise.all([
          getJoinableEvents(),
          getJoinedEvents(),
        ]);
        setJoinable(jbleRes.data);
        setJoined(jndRes.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load events");
      }
    };
    fetch();
  }, []);

  const handleJoinToggle = useCallback((updatedPost, nowJoined) => {
     // show prompt immediately
     if (nowJoined) {
       alert(`You joined ${updatedPost.author}’s ${updatedPost.holiday} event`);
       setJoinable(j => j.filter(p => p._id !== updatedPost._id));
       setJoined(j => [updatedPost, ...j]);
     } else {
       alert(`You left ${updatedPost.author}’s ${updatedPost.holiday} event`);
       setJoined(j => j.filter(p => p._id !== updatedPost._id));
       setJoinable(j => [updatedPost, ...j]);
     }
   }, []);

  const renderList = (list, emptyMessage) =>
    list.length > 0 ? (
      <div className="events-grid">
        {list.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            onJoinToggle={handleJoinToggle}
          />
        ))}
      </div>
    ) : (
      <p className="events-empty">{emptyMessage}</p>
    );

  if (error) return <p className="events-error">{error}</p>;

  return (
      <div className={`events-page container ${activeTab}`}>
      <div className="tabs">
        <button
          className={activeTab === "joinable" ? "active" : ""}
          onClick={() => setActiveTab("joinable")}
        >
          Joinable Events
        </button>
        <button
          className={activeTab === "joined" ? "active" : ""}
          onClick={() => setActiveTab("joined")}
        >
          My Joined Events
        </button>
      </div>

      {activeTab === "joinable"
        ? renderList(joinable, "No new joinable events right now.")
        : renderList(joined,   "You haven’t joined any events yet.")}
    </div>
  );
};

export default Events;
