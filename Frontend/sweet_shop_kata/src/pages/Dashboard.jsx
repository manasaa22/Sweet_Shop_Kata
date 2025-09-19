import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [sweets, setSweets] = useState([]);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_BASE_API;
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role"); // get user role

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchSweets();
  }, []);

  const fetchSweets = async () => {
    const res = await fetch(`${apiUrl}/sweets`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setSweets(data);
  };

  const handlePurchase = async (id) => {
    const res = await fetch(`${apiUrl}/sweets/${id}/purchase`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      alert("Purchase successful!");
      setSweets((prev) =>
        prev.map((sweet) =>
          sweet.id === id ? { ...sweet, quantity: sweet.quantity - 1 } : sweet
        )
      );
    } else {
      alert("Failed to purchase sweet");
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
        <h2 className="text-2xl font-bold">
          Welcome {role === "admin" ? "Admin" : "Customer"}!
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

      {/* Available Sweets */}
      <h3 className="text-xl font-semibold mb-4">Available Sweets 🍭</h3>
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
            {role !== "admin" && (
              <button
                onClick={() => handlePurchase(sweet.id)}
                className="mt-2 bg-purple-500 text-white px-4 py-1 rounded hover:bg-purple-600"
              >
                Buy
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
