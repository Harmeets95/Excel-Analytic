import { useNavigate, Link } from "react-router-dom";
import { useState, useContext } from "react";
import API from "../api";
import toast from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const ctx = useContext(AuthContext);
  const loginInContext = ctx?.login;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await API.post("/users/login", { email, password });
      const token = res?.data?.token;
      if (!token) throw new Error("No token returned from server");

      if (typeof loginInContext === "function") {
        loginInContext(token);
      } else {
        localStorage.setItem("token", token);
      }

      toast.success("Logged in successfully!");
      navigate("/upload-chart");
    } catch (error) {
      console.error(error);
      toast.error(
        "Login failed: " + (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-800 via-purple-800 to-fuchsia-800 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff1a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff1a_1px,transparent_1px)] bg-[size:40px_40px] opacity-10"></div>

      <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl p-8 w-full max-w-md text-white">
        <div className="flex items-center justify-center mb-6">
          <div className="w-12 h-12 bg-green-500/80 rounded-lg flex items-center justify-center font-bold text-xl shadow-lg">
            X
          </div>
        </div>
        <h2 className="text-3xl font-extrabold mb-2 text-center">
          Excel <span className="text-yellow-300">Analytics</span>
        </h2>
        <p className="text-center text-white/70 mb-8 text-sm">
          Sign in to upload spreadsheets & generate insights
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block mb-1 font-medium text-sm"> Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full p-3 rounded-lg bg-white/90 text-black focus:outline-none focus:ring-2 focus:ring-green-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block mb-1 font-medium text-sm">Password</label>
            <input
              type="password"
              placeholder="********"
              className="w-full p-3 rounded-lg bg-white/90 text-black focus:outline-none focus:ring-2 focus:ring-green-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 rounded-lg font-semibold transition duration-300 disabled:opacity-60 shadow-md cursor-pointer"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-white/80">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="text-yellow-300 hover:underline font-medium"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
