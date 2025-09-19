import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CreateSweet from "../components/CreateSweet";
import EditSweet from "../components/EditSweet";
export default function AdminDashboard() {
  const [sweets, setSweets] = useState([]);
  const [editingSweet, setEditingSweet] = useState(null);

  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_BASE_API;
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  useEffect(() => {
    if (role !== "admin") navigate("/dashboard");
    fetchSweets();
  }, []);

  const fetchSweets = async () => {
    const res = await fetch(`${apiUrl}/sweets`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setSweets(data);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this sweet?")) return;
    const res = await fetch(`${apiUrl}/sweets/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      alert("Sweet deleted!");
      fetchSweets();
    } else {
      alert("Failed to delete sweet");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard 🛠️</h2>

      {/* Create New Sweet */}
      <CreateSweet onSweetAdded={fetchSweets} apiUrl={apiUrl} token={token} />

      {/* Edit Sweet (conditional) */}
      {editingSweet && (
        <EditSweet
          sweet={editingSweet}
          onClose={() => setEditingSweet(null)}
          onUpdate={(updated) => {
            setSweets((prev) =>
              prev.map((s) => (s.id === updated.id ? updated : s))
            );
          }}
        />
      )}

      {/* Sweet List */}
      <h3 className="text-xl font-semibold mb-2">All Sweets</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sweets.map((sweet) => (
          <div
            key={sweet.id}
            className="border rounded-lg p-4 shadow hover:shadow-lg"
          >
            <h3 className="text-lg font-semibold">{sweet.name}</h3>
            <p>Category: {sweet.category}</p>
            <p>Price: ${sweet.price}</p>
            <p>Stock: {sweet.quantity}</p>

            <div className="mt-2 flex gap-2">
              <button
                onClick={() => setEditingSweet(sweet)}
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(sweet.id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
