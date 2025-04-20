// src/pages/Profile.jsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getProfile, updateProfile } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./styles/Profile.css";  // You can create this

const Profile = () => {
  const { username: routeUser } = useParams();
  const { user } = useAuth();
  const isSelf = user?.username === routeUser;

  const [profile, setProfile] = useState({
    username: "",
    avatarUrl: "",
    bio: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ avatarUrl: "", bio: "" });

  useEffect(() => {
    getProfile(routeUser).then(res => setProfile(res.data));
  }, [routeUser]);

  const handleSave = async () => {
    const res = await updateProfile(form);
    setProfile(res.data);
    setEditMode(false);
  };

  return (
    <div className="profile-page">
      <h1>@{profile.username}</h1>
      <img
        src={profile.avatarUrl || "/default-avatar.png"}
        alt="avatar"
        className="avatar"
      />

      {isSelf && !editMode && (
        <button onClick={() => {
          setForm({ avatarUrl: profile.avatarUrl, bio: profile.bio });
          setEditMode(true);
        }}>
          Edit Profile
        </button>
      )}

      {editMode ? (
        <div className="profile-form">
          <input
            name="avatarUrl"
            placeholder="Avatar URL"
            value={form.avatarUrl}
            onChange={e => setForm(f => ({ ...f, avatarUrl: e.target.value }))}
          />
          <textarea
            name="bio"
            placeholder="Your bio"
            value={form.bio}
            onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
          />
          <button onClick={handleSave}>Save</button>
          <button onClick={() => setEditMode(false)}>Cancel</button>
        </div>
      ) : (
        <p className="bio">{profile.bio || "No bio yet."}</p>
      )}
    </div>
  );
};

export default Profile;
