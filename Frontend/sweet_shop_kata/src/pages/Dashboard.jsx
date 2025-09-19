// pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [sweets, setSweets] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const apiUrl = import.meta.env.VITE_BASE_API;
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  useEffect(() => {
    fetchSweets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSweets = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append("name", search);
      if (category) params.append("category", category);
      if (minPrice) params.append("min_price", minPrice);
      if (maxPrice) params.append("max_price", maxPrice);

      const res = await fetch(`${apiUrl}/sweets/search?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setSweets(data);
    } catch (err) {
      console.error("Error fetching sweets:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const handlePurchase = async (id, availableQty) => {
    const qty = prompt("Enter quantity to purchase:", "1");
    if (!qty || Number(qty) <= 0) return;

    if (Number(qty) > availableQty) {
      alert(`Only ${availableQty} items are available. Please enter less than or equal to quantity.`);
      return;
    }

    try {
      for (let i = 0; i < Number(qty); i++) {
        const res = await fetch(`${apiUrl}/sweets/${id}/purchase`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const data = await res.json();
          alert(data.detail || "Purchase failed");
          return;
        }
      }
      alert("Purchase successful!");
      fetchSweets();
    } catch (err) {
      console.error("Purchase error:", err);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          Welcome to Kata Sweet Shop 🍬 {role === "admin" ? "Admin" : "Customer"}!
        </h2>

        <div className="flex gap-4">
          {role === "admin" && (
            <button
              onClick={() => navigate("/admin")}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Admin Dashboard
            </button>
          )}
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search by name..."
          className="border p-2 rounded"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          type="text"
          placeholder="Category"
          className="border p-2 rounded"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <input
          type="number"
          placeholder="Min Price"
          className="border p-2 rounded w-28"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />
        <input
          type="number"
          placeholder="Max Price"
          className="border p-2 rounded w-28"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
        <button
          onClick={fetchSweets}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Apply Filters
        </button>
      </div>

      {/* Sweet List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sweets.map((sweet) => (
          <div
            key={sweet.id}
            className="border rounded-lg p-4 shadow hover:shadow-lg transition"
          >
            <h3 className="text-lg font-semibold">{sweet.name}</h3>
            <p>Category: {sweet.category}</p>
            <p>Price: ${sweet.price}</p>
            <p>Stock: {sweet.quantity}</p>

            {/* Only show Buy for non-admins */}
            {role !== "admin" && (
              <button
                onClick={() => handlePurchase(sweet.id, sweet.quantity)}
                disabled={sweet.quantity <= 0}
                className="mt-3 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 disabled:opacity-50"
              >
                {sweet.quantity > 0 ? "Buy" : "Out of Stock"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
