import { useEffect, useMemo, useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await API.get("/users/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const list = res?.data?.users ?? res?.data ?? [];
      setUsers(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error(err);
      toast.error("Access denied or failed to fetch users.");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const makeAdmin = async (id) => {
    try {
      await API.put(
        `/users/make-admin/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("User promoted to admin successfully.");
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error("Failed to promote user.");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = useMemo(() => {
    return users
      .filter((u) => {
        if (!q) return true;
        const s = q.toLowerCase();
        return (
          (u.name && u.name.toLowerCase().includes(s)) ||
          (u.email && u.email.toLowerCase().includes(s))
        );
      })
      .filter((u) => (roleFilter ? u.role === roleFilter : true));
  }, [users, q, roleFilter]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-green-600 to-emerald-500 px-6 py-4 rounded-t-xl shadow-lg flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Admin • User Management</h1>
            <div className="text-sm opacity-90">
              Manage users & roles — Excel style
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchUsers}
              className="px-4 py-2 bg-white/20 hover:bg-white/25 rounded-md text-white"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur border border-white/10 rounded-b-xl p-6 mt-3">
          <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between mb-4">
            <div className="flex gap-3 items-center w-full md:w-auto">
              <input
                type="search"
                placeholder="Search name or email..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="px-3 py-2 rounded-md bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400 w-full md:w-80"
              />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 rounded-md bg-gray-50 text-gray-900"
              >
                <option value="">All roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="text-sm text-gray-300">
              Showing{" "}
              <span className="font-semibold text-white">
                {filtered.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-white">{users.length}</span>{" "}
              users
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse table-auto">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="px-4 py-2 border border-gray-200 text-left text-sm">
                    #
                  </th>
                  <th className="px-4 py-2 border border-gray-200 text-left text-sm">
                    Name
                  </th>
                  <th className="px-4 py-2 border border-gray-200 text-left text-sm">
                    Email
                  </th>
                  <th className="px-4 py-2 border border-gray-200 text-left text-sm">
                    Role
                  </th>
                  <th className="px-4 py-2 border border-gray-200 text-left text-sm">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-gray-400"
                    >
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((user, idx) => (
                    <tr
                      key={user._id || idx}
                      className={`${
                        idx % 2 === 0 ? "bg-white/80" : "bg-white/90"
                      } text-gray-900`}
                    >
                      <td className="px-4 py-3 border border-gray-200 text-sm">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-3 border border-gray-200 text-sm">
                        <div className="font-medium">{user.name || "—"}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          ID: {user._id?.slice?.(0, 8) ?? "—"}
                        </div>
                      </td>
                      <td className="px-4 py-3 border border-gray-200 text-sm">
                        {user.email || "—"}
                      </td>
                      <td className="px-4 py-3 border border-gray-200 text-sm capitalize">
                        {user.role || "user"}
                      </td>
                      <td className="px-4 py-3 border border-gray-200 text-sm">
                        {user.role === "admin" ? (
                          <span className="inline-flex items-center gap-2 px-3 py-1 rounded bg-green-100 text-green-800 font-semibold text-sm">
                            Admin
                          </span>
                        ) : (
                          <button
                            onClick={() => makeAdmin(user._id)}
                            className="px-3 py-1 rounded bg-yellow-400 hover:bg-yellow-500 text-black font-semibold text-sm"
                          >
                            Make Admin
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
