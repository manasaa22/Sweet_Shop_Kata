import { useState } from "react";

export default function CreateSweet({ onSweetAdded, apiUrl, token, onClose }) {
  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    quantity: "",
  });
  const [loading, setLoading] = useState(false);

  const isValid = () => {
    if (!form.name.trim()) return false;
    if (!form.category.trim()) return false;
    if (form.price === "" || Number(form.price) <= 0) return false;
    if (form.quantity === "" || Number(form.quantity) < 0) return false;
    return true;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!isValid()) {
      alert("Please fill required fields with valid values.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/sweets/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name.trim(),
          category: form.category.trim(),
          price: Number(form.price),
          quantity: Number(form.quantity),
        }),
      });

      if (res.ok) {
        const created = await res.json();
        onSweetAdded(created); // ✅ refresh parent
        onClose?.(); // ✅ close form if parent passed onClose
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.detail || "Failed to create sweet");
      }
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert("Something went wrong while creating sweet");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleCreate} className="border rounded-lg p-4 bg-gray-50">
      <h2 className="text-lg font-semibold mb-2">Create New Sweet</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
        <div>
          <label className="block text-sm text-gray-600">Name</label>
          <input
            required
            className="border p-2 rounded w-full"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

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
          onClick={onClose}
          className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!isValid() || loading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create"}
        </button>
      </div>
    </form>
  );
}
