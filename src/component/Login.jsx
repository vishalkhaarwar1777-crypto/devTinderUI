
import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";
import { BASE_URL } from "../utils/constants";

function Login() {
  const [emailId, setEmailId] = useState("rohit@gmail.com");
  const [password, setPassword] = useState("Rohit@12345");
  const dispatch=useDispatch();
  const navigate = useNavigate();
  

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
       BASE_URL+ "/login",
        { emailId, password },
        { withCredentials: true }
      );
      alert(res.data.message || "Login successful!");
      dispatch(addUser(res.data.user));
       navigate("/");
    } catch (err) {
      alert(err.response?.data || "Login failed");
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-gray-950 p-4">
      <form onSubmit={handleLogin}
        className="w-full max-w-sm bg-gray-900 p-6 rounded-2xl border border-purple-500/30 shadow-xl shadow-purple-900/20 space-y-4">

        <h1 className="text-3xl font-bold text-center text-white">
          Dev<span className="text-purple-400">Tinder 💜</span>
        </h1>
        <p className="text-center text-gray-400 text-sm">
          Welcome back, developer!
        </p>

        <input
          type="email"
          placeholder="Email address"
          className="input w-full bg-gray-800 text-white"
          value={emailId}
          onChange={(e) => setEmailId(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="input w-full bg-gray-800 text-white"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="btn w-full bg-purple-600 text-white border-none hover:bg-purple-700">
          Login
        </button>

        <p className="text-center text-sm text-gray-400">
          New here?{" "}
          <Link to="/signup" className="text-purple-400 font-bold">
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
