// components/CreateSweet.jsx
import {
  AlertCircle,
  CheckCircle,
  DollarSign,
  Loader2,
  Package,
  Plus,
  Sparkles,
  Tag,
  Type,
  X
} from "lucide-react";
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
        // Reset form
        setForm({
          name: "",
          category: "",
          price: "",
          quantity: "",
        });
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

  const resetForm = () => {
    setForm({
      name: "",
      category: "",
      price: "",
      quantity: "",
    });
  };

  const hasData = form.name || form.category || form.price || form.quantity;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Create New Sweet</h2>
              <p className="text-green-100">Add a delicious treat to your inventory</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors duration-300"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleCreate} className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Name Field */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Type size={16} className="text-pink-500" />
              Sweet Name *
            </label>
            <input
              required
              className="w-full pl-4 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all duration-300 font-medium"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Enter sweet name..."
            />
          </div>

          {/* Category Field */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Tag size={16} className="text-purple-500" />
              Category *
            </label>
            <input
              required
              className="w-full pl-4 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all duration-300 font-medium"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="e.g., Chocolate, Candy, Gummy..."
            />
          </div>

          {/* Price Field */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <DollarSign size={16} className="text-green-500" />
              Price ($) *
            </label>
            <input
              required
              type="number"
              min="0"
              step="0.01"
              className="w-full pl-4 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all duration-300 font-medium"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="0.00"
            />
          </div>

          {/* Quantity Field */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Package size={16} className="text-blue-500" />
              Initial Stock *
            </label>
            <input
              required
              type="number"
              min="0"
              step="1"
              className="w-full pl-4 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all duration-300 font-medium"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              placeholder="0"
            />
          </div>
        </div>

        {/* Form Preview */}
        {hasData && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-green-600" />
              <span className="font-medium text-green-800 text-sm">Sweet Preview:</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Name:</span>
                <span className="ml-2 font-medium text-gray-800">
                  {form.name || "Not specified"}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Category:</span>
                <span className="ml-2 font-medium text-gray-800">
                  {form.category || "Not specified"}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Price:</span>
                <span className="ml-2 font-medium text-green-600">
                  ${form.price || "0.00"}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Stock:</span>
                <span className="ml-2 font-medium text-blue-600">
                  {form.quantity || "0"} items
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={resetForm}
            disabled={!hasData}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X size={18} />
            Clear Form
          </button>
          
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-300 font-medium"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={!isValid() || loading}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Plus size={18} />
            )}
            {loading ? "Creating Sweet..." : "Create Sweet"}
          </button>
        </div>

        {/* Validation Status */}
        <div className="mt-4 flex items-center justify-center gap-2 text-sm">
          {isValid() ? (
            <>
              <CheckCircle size={16} className="text-green-500" />
              <span className="text-green-600 font-medium">Ready to create!</span>
            </>
          ) : (
            <>
              <AlertCircle size={16} className="text-amber-500" />
              <span className="text-amber-600 font-medium">Please fill all required fields (*)</span>
            </>
          )}
        </div>

        {/* Required Fields Note */}
        <div className="mt-2 text-center">
          <p className="text-xs text-gray-500">
            Fields marked with * are required
          </p>
        </div>
      </form>
    </div>
  );
}