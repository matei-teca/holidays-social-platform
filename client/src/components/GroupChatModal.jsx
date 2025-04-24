import React, { useEffect, useState } from "react";
import { getUsers, createConversation } from "../services/api";
import { useAuth }                     from "../context/AuthContext";

export default function GroupChatModal({ onClose, onCreated }) {
  const { user } = useAuth();
  const [users, setUsers]         = useState([]);
  const [selected, setSelected]   = useState(new Set());
  const [name, setName]           = useState("");
  const [loading, setLoading]     = useState(false);

  useEffect(() => {
    getUsers().then((res) => {
      // filter out yourself
      setUsers(res.data.filter((u) => u.username !== user.username));
    });
  }, [user.username]);

  const toggle = (id) => {
    setSelected((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const submit = async () => {
    if (!name.trim() || selected.size === 0) {
      return alert("Please enter a group name and pick at least one user.");
    }
    setLoading(true);
    try {
      const convo = await createConversation({
        participantIds: Array.from(selected),
        name: name.trim(),
      });
      onCreated(convo.data);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to create group chat");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal group-chat-modal">
        <h2>New Group Chat</h2>

        <label>
          Group Name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Road Trip 2025"
          />
        </label>

        <div className="user-list">
          {users.map((u) => (
            <label key={u._id} className="user-item">
              <input
                type="checkbox"
                checked={selected.has(u._id)}
                onChange={() => toggle(u._id)}
              />
              {u.username}
            </label>
          ))}
        </div>

        <div className="modal-actions">
          <button onClick={onClose} disabled={loading}>Cancel</button>
          <button onClick={submit} disabled={loading}>
            {loading ? "Creating…" : "Create Group"}
          </button>
        </div>
      </div>
    </div>
  );
}
