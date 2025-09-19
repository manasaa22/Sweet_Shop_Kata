import { useEffect, useState } from "react";

export default function CustomerDashboard() {
  const [sweets, setSweets] = useState([]);

  useEffect(() => {
    const fetchSweets = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/api/sweets", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSweets(data);
    };
    fetchSweets();
  }, []);

  const handlePurchase = async (id) => {
    const token = localStorage.getItem("token");
    const res = await fetch(
      `http://localhost:8000/api/sweets/${id}/purchase`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
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

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Available Sweets 🍭</h2>
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
            <button
              onClick={() => handlePurchase(sweet.id)}
              className="mt-2 bg-purple-500 text-white px-4 py-1 rounded hover:bg-purple-600"
            >
              Buy
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
