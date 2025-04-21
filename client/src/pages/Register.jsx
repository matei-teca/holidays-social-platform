import { useState } from "react";
import { register as registerApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./styles/Register.css";

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await registerApi(form);
      login(res.data);
      navigate("/");
    } catch {
      alert("Registration failed");
    }
  };

  return (
    <form className="register-page" onSubmit={handleSubmit}>
      <h2>Register</h2>
      <input
        name="username"
        placeholder="Username"
        value={form.username}
        onChange={(e) =>
          setForm((f) => ({ ...f, username: e.target.value }))
        }
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={form.password}
        onChange={(e) =>
          setForm((f) => ({ ...f, password: e.target.value }))
        }
        required
      />
      <button type="submit">Register</button>
    </form>
  );
};

export default Register;
