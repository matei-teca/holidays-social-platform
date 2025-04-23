// src/components/Navbar.jsx
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./styles/Navbar.css";
import { HomeIcon } from '@heroicons/react/24/outline';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  // ref for the hamburger toggle + dropdown
  const menuRef = useRef(null);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/login");
  };

  // close menu if click happens outside of menuRef
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav>
      <div className="nav-left">
      <Link to="/" className="nav-home-icon" aria-label="Home">
        <HomeIcon className="h-5 w-5" />
      </Link>
      </div>

      {user ? (
        <>
          <span>Welcome, {user.username}!</span>

          {/* hamburger + dropdown wrapped in menuRef */}
          <div className="menu-container" ref={menuRef}>
            <button
              className="menu-toggle"
              aria-label="Toggle menu"
              onClick={() => setMenuOpen((o) => !o)}
            >
              ☰
            </button>

            <div className={`mobile-menu${menuOpen ? " open" : ""}`}>
              <Link
                to={`/profile/${user.username}`}
                onClick={() => setMenuOpen(false)}
              >
                My Profile
              </Link>
              <Link to="/events" onClick={() => setMenuOpen(false)}>
                Events
              </Link>
              {user && <Link to="/chat">Chat</Link>}
              <button onClick={handleLogout} className="logout-bttn">Logout</button>
            </div>
          </div>
        </>
      ) : (
        <div className="nav-right">
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
