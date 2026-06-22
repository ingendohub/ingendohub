import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/public/axiosPublic";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const { data } = await api.post("/auth/login", {
        email,
        password,
      });

      if (data.success) {
        // ✅ Save token
        localStorage.setItem("token", data.token);

        // ✅ Save user (optional)
        localStorage.setItem("user", JSON.stringify(data.user));

        // 🔥 REDIRECT
        navigate("/dashboard");
      } else {
        alert(data.message);
      }

    } catch (error) {
      alert("Login failed");
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button type="submit">Login</button>
    </form>
  );
};

export default Login;
