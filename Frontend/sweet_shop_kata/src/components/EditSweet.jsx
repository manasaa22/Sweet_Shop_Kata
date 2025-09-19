// EditSweet.jsx
import { useState } from "react";

export default function EditSweet({ sweet, onClose, onUpdate }) {
  const [editSweet, setEditSweet] = useState({
    category: sweet.category || "",
    price: sweet.price || "",
    quantity: sweet.quantity || "",
  });

  const apiUrl = import.meta.env.VITE_BASE_API;
  const token = localStorage.getItem("token");

  const handleUpdateSweet = async (e) => {
    e.preventDefault();

    // ✅ Only send fields that are not empty/unchanged
    const updatedData = {};
    if (editSweet.category && editSweet.category !== sweet.category) {
      updatedData.category = editSweet.category;
    }
    if (editSweet.price && editSweet.price !== sweet.price) {
      updatedData.price = Number(editSweet.price);
    }
    if (editSweet.quantity && editSweet.quantity !== sweet.quantity) {
      updatedData.quantity = Number(editSweet.quantity);
    }

    try {
      const res = await fetch(`${apiUrl}/sweets/${sweet.id}`, {
        method: "PATCH", // ✅ use PATCH, not PUT
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      if (res.ok) {
        const updatedSweet = await res.json();
        onUpdate(updatedSweet); // refresh list in parent
        onClose(); // close modal
      } else {
        const data = await res.json();
        alert(data.detail || "Failed to update sweet");
      }
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert("Something went wrong while updating");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <form
        onSubmit={handleUpdateSweet}
        className="bg-white p-6 rounded-lg shadow-md w-96"
      >
        <h2 className="text-xl font-bold mb-4">Edit Sweet</h2>

        <div className="mb-3">
          <label className="block text-sm font-medium">Category</label>
          <input
            type="text"
            value={editSweet.category}
            onChange={(e) =>
              setEditSweet({ ...editSweet, category: e.target.value })
            }
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium">Price</label>
          <input
            type="number"
            value={editSweet.price}
            onChange={(e) =>
              setEditSweet({ ...editSweet, price: e.target.value })
            }
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium">Quantity</label>
          <input
            type="number"
            value={editSweet.quantity}
            onChange={(e) =>
              setEditSweet({ ...editSweet, quantity: e.target.value })
            }
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
