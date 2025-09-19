// components/EditSweet.jsx
import {
  AlertCircle,
  CheckCircle,
  DollarSign,
  Edit3,
  Loader2,
  Package,
  Save,
  Tag,
  X
} from "lucide-react";
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
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-4 text-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <Edit3 size={16} />
          </div>
          <div>
            <h3 className="font-bold text-lg">Edit Sweet</h3>
            <p className="text-blue-100 text-sm">Update "{sweet.name}" details</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="p-6">
        <div className="space-y-6">
          {/* Category Field */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Tag size={16} className="text-purple-500" />
              Category
            </label>
            <div className="relative">
              <input
                required
                className="w-full pl-4 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 font-medium"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="Enter category..."
              />
              {form.category !== sweet.category && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <AlertCircle size={18} className="text-orange-500" />
                </div>
              )}
            </div>
          </div>

          {/* Price Field */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <DollarSign size={16} className="text-green-500" />
              Price ($)
            </label>
            <div className="relative">
              <input
                required
                type="number"
                min="0"
                step="0.01"
                className="w-full pl-4 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 font-medium"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="0.00"
              />
              {Number(form.price) !== Number(sweet.price) && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <AlertCircle size={18} className="text-orange-500" />
                </div>
              )}
            </div>
          </div>

          {/* Quantity Field */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Package size={16} className="text-blue-500" />
              Stock Quantity
            </label>
            <div className="relative">
              <input
                required
                type="number"
                min="0"
                step="1"
                className="w-full pl-4 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 font-medium"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                placeholder="0"
              />
              {Number(form.quantity) !== Number(sweet.quantity) && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <AlertCircle size={18} className="text-orange-500" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Changes Preview */}
        {hasChanges() && (
          <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={16} className="text-orange-600" />
              <span className="font-medium text-orange-800 text-sm">Pending Changes:</span>
            </div>
            <div className="space-y-1 text-sm text-orange-700">
              {form.category !== sweet.category && (
                <div>• Category: "{sweet.category}" → "{form.category}"</div>
              )}
              {Number(form.price) !== Number(sweet.price) && (
                <div>• Price: ${sweet.price} → ${form.price}</div>
              )}
              {Number(form.quantity) !== Number(sweet.quantity) && (
                <div>• Quantity: {sweet.quantity} → {form.quantity}</div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 font-medium"
          >
            <X size={18} />
            Cancel
          </button>
          <button
            type="submit"
            disabled={!hasChanges() || !isValid() || loading}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Save size={18} />
            )}
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {/* Validation Status */}
        <div className="mt-4 flex items-center justify-center gap-2 text-sm">
          {isValid() ? (
            <>
              <CheckCircle size={16} className="text-green-500" />
              <span className="text-green-600 font-medium">Form is valid</span>
            </>
          ) : (
            <>
              <AlertCircle size={16} className="text-red-500" />
              <span className="text-red-600 font-medium">Please fill all required fields</span>
            </>
          )}
        </div>
      </form>
    </div>
  );
}