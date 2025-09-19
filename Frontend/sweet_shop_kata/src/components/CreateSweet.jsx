import { useState } from "react";

export default function CreateSweet({ onSweetAdded, apiUrl, token }) {
  const [newSweet, setNewSweet] = useState({
    name: "",
    category: "",
    price: "",
    quantity: "",
  });

  const handleAddSweet = async (e) => {
    e.preventDefault();
    const res = await fetch(`${apiUrl}/sweets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newSweet),
    });

    if (res.ok) {
      alert("Sweet added!");
      setNewSweet({ name: "", category: "", price: "", quantity: "" });
      onSweetAdded(); // refresh parent list
    } else {
      alert("Failed to add sweet");
    }
  };

  return (
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
  );
}
