import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./styles/Navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/login");
  };

  return (
    <nav>
      <div className="nav-left">
        <Link to="/">Home</Link>
      </div>

      {user && (
        <>

          <span>Welcome, {user.username}!</span>

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
            <button onClick={handleLogout}>Logout</button>
          </div>
        </>
      )}

      {!user && (
        <div className="nav-right">
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
