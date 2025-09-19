// pages/AdminDashboard.jsx
import { ArrowLeft, LogOut, Pencil, PlusCircle, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CreateSweet from "../components/CreateSweet";
import EditSweet from "../components/EditSweet";


export default function AdminDashboard() {
  const [sweets, setSweets] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_BASE_API;
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  useEffect(() => {
    if (role !== "admin") {
      navigate("/dashboard");
      return;
    }
    fetchSweets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSweets = async () => {
    try {
      const res = await fetch(`${apiUrl}/sweets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setSweets(data);
    } catch (err) {
      console.error("Error fetching sweets:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this sweet?")) return;
    try {
      const res = await fetch(`${apiUrl}/sweets/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        alert("Sweet deleted!");
        setSweets((prev) => prev.filter((s) => s.id !== id));
      } else {
        alert("Failed to delete sweet");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 bg-gray-200 px-3 py-2 rounded-lg hover:bg-gray-300 transition"
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>
          <h2 className="text-2xl font-bold">Admin Dashboard 🛠️</h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreate((s) => !s)}
            className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
          >
            <PlusCircle size={18} />
            <span>{showCreate ? "Close Create" : "Create New Sweet"}</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Create Sweet Section */}
      {showCreate && (
        <div className="mb-6">
          <CreateSweet
            onSweetAdded={fetchSweets}
            token={token}
            apiUrl={apiUrl}
            onClose={() => setShowCreate(false)}
          />

        </div>
      )}

      {/* Sweet List */}
      <h3 className="text-xl font-semibold mb-2">All Sweets</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sweets.map((sweet) =>
          editingId === sweet.id ? (
            <EditSweet
              key={sweet.id}
              sweet={sweet}
              token={token}
              apiUrl={apiUrl}
              onCancel={() => setEditingId(null)}
              // eslint-disable-next-line no-unused-vars
              onSaved={(updated) => {
                setEditingId(null);
                fetchSweets();
              }}
            />

          ) : (
            <div
              key={sweet.id}
              className="border rounded-lg p-4 shadow hover:shadow-lg transition"
            >
              <h3 className="text-lg font-semibold">{sweet.name}</h3>
              <p>Category: {sweet.category}</p>
              <p>Price: ${sweet.price}</p>
              <p>Stock: {sweet.quantity}</p>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setEditingId(sweet.id)}
                  className="flex items-center gap-1 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                >
                  <Pencil size={16} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(sweet.id)}
                  className="flex items-center gap-1 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
