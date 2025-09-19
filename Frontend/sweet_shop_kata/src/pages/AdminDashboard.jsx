import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [sweets, setSweets] = useState([]);
  const [newSweet, setNewSweet] = useState({
    name: "",
    category: "",
    price: "",
    quantity: "",
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchSweets();
  }, []);

  const fetchSweets = async () => {
    const res = await fetch("http://localhost:8000/api/sweets", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setSweets(data);
  };

  const handleAddSweet = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:8000/api/sweets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newSweet),
    });
    if (res.ok) {
      alert("Sweet added!");
      fetchSweets();
      setNewSweet({ name: "", category: "", price: "", quantity: "" });
    } else {
      alert("Failed to add sweet");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard 🛠️</h2>

      {/* Add Sweet Form */}
      <form
        onSubmit={handleAddSweet}
        className="bg-white shadow-md p-4 rounded-lg mb-6"
      >
        <h3 className="text-lg font-semibold mb-2">Add New Sweet</h3>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="Name"
            className="border p-2 rounded"
            value={newSweet.name}
            onChange={(e) =>
              setNewSweet({ ...newSweet, name: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Category"
            className="border p-2 rounded"
            value={newSweet.category}
            onChange={(e) =>
              setNewSweet({ ...newSweet, category: e.target.value })
            }
          />
          <input
            type="number"
            placeholder="Price"
            className="border p-2 rounded"
            value={newSweet.price}
            onChange={(e) =>
              setNewSweet({ ...newSweet, price: e.target.value })
            }
          />
          <input
            type="number"
            placeholder="Quantity"
            className="border p-2 rounded"
            value={newSweet.quantity}
            onChange={(e) =>
              setNewSweet({ ...newSweet, quantity: e.target.value })
            }
          />
        </div>
        <button
          type="submit"
          className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Add Sweet
        </button>
      </form>

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
          </div>
        ))}
      </div>
    </div>
  );
}
