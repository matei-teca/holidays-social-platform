import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./styles/Navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav>
      <div className="nav-left">
        <Link to="/">Home</Link>
      </div>
      <div className="nav-right">
        {user ? (
          <>
            <span>Welcome, {user.username}!</span>
            <button onClick={logout}>Logout</button>
            <Link to={`/profile/${user.username}`}>My Profile</Link>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );

};

export default Navbar;
