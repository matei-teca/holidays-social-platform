// client/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import socket from "../socket";  // ← import the same socket

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    () => JSON.parse(localStorage.getItem("user")) || null
  );

  // Whenever `user` is set (either at startup or login), attach the token & connect
  useEffect(() => {
    if (user?.token) {
      socket.auth = { token: user.token };
      socket.connect();
    }
    // if user logs out, socket.disconnect() is handled below
  }, [user]);

  const login = ({ token, username }) => {
    // decode JWT to get the user id
    const payload = JSON.parse(atob(token.split(".")[1]));
    const userData = { id: payload.id, username, token };

    // persist and update state
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);

    // ——— SOCKET.IO RE‑AUTH ———
    // 1) set the new auth token
    socket.auth = { token };
    // 2) (re)connect
    socket.connect();
  };

  const logout = () => {
    // clean up socket
    socket.disconnect();

    // clear user
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
