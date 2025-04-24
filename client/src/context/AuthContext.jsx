// client/src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { uploadPublicKey } from "../services/api";       // ← import this
import { publicKey }       from "../crypto/keys";        // ← your generated key
import socket              from "../socket";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user")) || null
  );

  // Whenever we establish a user (on login or page reload), upload the public key
  useEffect(() => {
    if (user?.token) {
      // 1) send publicKey to your backend
      uploadPublicKey(publicKey).catch((err) =>
        console.error("Failed to upload public key:", err)
      );

      // 2) re-auth Socket.IO
      socket.auth = { token: user.token };
      socket.connect();
    }
  }, [user]);

  const login = ({ token, username }) => {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const userData = { id: payload.id, username, token };
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    // no need to separately uploadPublicKey() or socket.connect() here—
    // the useEffect above will fire when `user` changes.
  };

  const logout = () => {
    socket.disconnect();
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
