// components/EditSweet.jsx
import { useState } from "react";

export default function EditSweet({ sweet, apiUrl, token, onCancel, onSaved }) {
  const [form, setForm] = useState({
    category: sweet.category ?? "",
    price: sweet.price ?? "",
    quantity: sweet.quantity ?? "",
  });
  const [loading, setLoading] = useState(false);

  const hasChanges = () =>
    form.category !== sweet.category ||
    Number(form.price) !== Number(sweet.price) ||
    Number(form.quantity) !== Number(sweet.quantity);

  const isValid = () => {
    if (!form.category.trim()) return false;
    if (form.price === "" || Number(form.price) <= 0) return false;
    if (form.quantity === "" || Number(form.quantity) < 0) return false;
    return true;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!isValid()) {
      alert("Please fill required fields with valid values.");
      return;
    }
    if (!hasChanges()) {
      alert("No changes to save.");
      return;
    }

    const updatedData = {};
    if (form.category !== sweet.category) updatedData.category = form.category.trim();
    if (Number(form.price) !== Number(sweet.price)) updatedData.price = Number(form.price);
    if (Number(form.quantity) !== Number(sweet.quantity)) updatedData.quantity = Number(form.quantity);

    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/sweets/${sweet.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      if (res.ok) {
        const updated = await res.json();
        onSaved(updated);
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.detail || "Failed to update sweet");
      }
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      console.error("Update error:", err);
      alert("Something went wrong while updating sweet");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="border rounded-lg p-4 bg-gray-50">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
        <div>
          <label className="block text-sm text-gray-600">Category</label>
          <input
            required
            className="border p-2 rounded w-full"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600">Price</label>
          <input
            required
            type="number"
            min="0"
            step="0.01"
            className="border p-2 rounded w-full"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600">Quantity</label>
          <input
            required
            type="number"
            min="0"
            step="1"
            className="border p-2 rounded w-full"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
          />
        </div>
      </div>

      <div className="mt-3 flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!hasChanges() || !isValid() || loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
