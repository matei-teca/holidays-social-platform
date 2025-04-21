import React from "react";
import "./styles/Footer.css";

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-container">
        <div className="footer-left">
          <p>&copy; {new Date().getFullYear()} hDays Social Platform</p>
        </div>
        <div className="footer-right">
          <a href="/events">Events</a>
          <a href="/profile">Profile</a>
          <a href="https://github.com/matei-teca/holidays-social-platform" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
