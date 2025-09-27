import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import Home from "./pages/Home";
import Chart from "./pages/Chart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UploadAndChart from "./pages/UploadAndChart";
import ParsedDataViewer from "./components/ParsedDataViewer";
import AdminPanel from "./pages/AdminPanel";
import { Toaster } from "react-hot-toast";

const App = () => {
  const { token, logout } = useContext(AuthContext);

  return (
    <Router>
      <nav className="bg-gradient-to-r from-indigo-700 via-purple-700 to-fuchsia-700 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-extrabold text-white tracking-wide">
              Excel<span className="text-yellow-300">Analytics</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-white font-medium">
            <Link to="/" className="hover:text-yellow-300 transition">
              Home
            </Link>
            <Link to="/chart" className="hover:text-yellow-300 transition">
              Chart
            </Link>
            <Link
              to="/upload-chart"
              className="hover:text-yellow-300 transition"
            >
              Upload
            </Link>
            <Link to="/parsed" className="hover:text-yellow-300 transition">
              Parsed Data
            </Link>
            <Link to="/admin" className="hover:text-yellow-300 transition">
              Admin
            </Link>

            {!token ? (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-md bg-white text-indigo-700 font-semibold shadow hover:bg-gray-100 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-md bg-yellow-400 text-black font-semibold shadow hover:bg-yellow-300 transition"
                >
                  Register
                </Link>
              </>
            ) : (
              <button
                onClick={logout}
                className="px-4 py-2 rounded-md bg-red-600 text-white font-semibold shadow hover:bg-red-700 transition"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </nav>

      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/chart" element={<Chart />} />
          <Route path="/register" element={<Register />} />
          <Route path="/upload-chart" element={<UploadAndChart />} />
          <Route path="/parsed" element={<ParsedDataViewer />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
