// client/src/pages/NewChat.jsx
import React, { useState, useEffect }    from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { getUsers, createConversation }  from "../services/api";
import { useAuth }                       from "../context/AuthContext";
import "./styles/NewChat.css";

const NewChat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  // grab convos + setter from layout
  const { conversations, setConversations } = useOutletContext();

  const [users, setUsers]           = useState([]);
  const [participantId, setParticipantId] = useState("");
  const [initialMessage, setInitialMessage] = useState("");

  // load users once
  useEffect(() => {
    getUsers()
      .then((res) => setUsers(res.data.filter((u) => u._id !== user.id)))
      .catch(console.error);
  }, [user.id]);

  // filter out anyone you already have a 1:1 with
  const available = users.filter((u) => {
    return !conversations.some(
      (c) =>
        c.participants.length === 2 &&
        c.participants.some((p) => p._id === u._id)
    );
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await createConversation({
        participantIds: [participantId],
        initialMessage: initialMessage.trim() || undefined,
      });
      // add it to ChatList instantly:
      setConversations((prev) => [res.data, ...prev]);
      navigate(`/chat/${res.data._id}`);
    } catch (err) {
      console.error("Chat creation failed", err);
      alert("Unable to start chat");
    }
  };

  return (
    <form className="new-chat-form" onSubmit={handleSubmit}>
      <h2>Start a New Chat</h2>

      {available.length > 0 ? (
      <>
      <label>
        Pick a user
        <select
          value={participantId}
          onChange={(e) => setParticipantId(e.target.value)}
          required
        >
          <option value="">— select —</option>
          {available.map((u) => (
            <option key={u._id} value={u._id}>
              {u.username}
            </option>
          ))}
        </select>
      </label>

      <label>
        Initial Message (optional)
        <textarea
          rows={3}
          value={initialMessage}
          onChange={(e) => setInitialMessage(e.target.value)}
        />
      </label>

      <button type="submit" disabled={!participantId}>
        Create Chat
      </button>
      
      </> ) : (
        <p className="no-more">
          You already have 1:1 chats with everyone.
        </p>
      )}

    </form>
  );
};

export default NewChat;
