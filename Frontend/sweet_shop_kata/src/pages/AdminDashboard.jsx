// pages/AdminDashboard.jsx
import {
  AlertCircle,
  ArrowLeft,
  BarChart3,
  CheckCircle,
  DollarSign,
  Filter,
  Loader2,
  LogOut,
  Package,
  Pencil,
  PlusCircle,
  RotateCcw,
  Search,
  Settings,
  Star,
  Trash2,
  TrendingUp
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CreateSweet from "../components/CreateSweet";
import EditSweet from "../components/EditSweet";

export default function AdminDashboard() {
  const [sweets, setSweets] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [restockId, setRestockId] = useState(null);
  const [restockAmount, setRestockAmount] = useState("");
  const [restockLoading, setRestockLoading] = useState(false);

  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_BASE_API;
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  useEffect(() => {
    if (role !== "admin") {
      navigate("/dashboard");
      return;
    }
    fetchSweets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSweets = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this sweet?")) return;
    setDeleteLoading(id);
    try {
      const res = await fetch(`${apiUrl}/sweets/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        alert("Sweet deleted!");
        setSweets((prev) => prev.filter((s) => s.id !== id));
      } else {
        alert("Failed to delete sweet");
      }
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleRestock = async () => {
    setRestockLoading(true);
    try {
      const res = await fetch(
        `${apiUrl}/sweets/${restockId}/restock?amount=${restockAmount}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        alert("Sweet restocked!");
        setRestockId(null);
        setRestockAmount("");
        fetchSweets();
      } else {
        const data = await res.json();
        alert(data.detail || "Failed to restock");
      }
    } catch (err) {
      console.error("Restock error:", err);
    } finally {
      setRestockLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  // Calculate stats
  const totalSweets = sweets.length;
  const totalStock = sweets.reduce((sum, sweet) => sum + sweet.quantity, 0);
  const outOfStock = sweets.filter(sweet => sweet.quantity === 0).length;
  const avgPrice = sweets.length > 0 ? (sweets.reduce((sum, sweet) => sum + sweet.price, 0) / sweets.length).toFixed(2) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white shadow-2xl">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl hover:bg-white/30 transition-all duration-300"
              >
                <ArrowLeft size={20} />
                <span className="font-medium">Back to Shop</span>
              </button>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Settings className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                  <p className="text-indigo-100 text-lg">Manage your sweet inventory</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCreate((s) => !s)}
                className="flex items-center gap-2 bg-green-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-xl hover:bg-green-600 transition-all duration-300 font-medium shadow-lg"
              >
                <PlusCircle size={20} />
                <span>{showCreate ? "Close Form" : "Add New Sweet"}</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-xl hover:bg-red-600 transition-all duration-300 font-medium shadow-lg"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 font-medium">Total Sweets</p>
                <p className="text-3xl font-bold text-gray-800">{totalSweets}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Package className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 font-medium">Total Stock</p>
                <p className="text-3xl font-bold text-gray-800">{totalStock}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 font-medium">Out of Stock</p>
                <p className="text-3xl font-bold text-red-600">{outOfStock}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="text-red-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 font-medium">Avg Price</p>
                <p className="text-3xl font-bold text-gray-800">${avgPrice}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <DollarSign className="text-yellow-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Filters */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Filter className="text-white" size={20} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Filter & Search</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search sweets..."
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all duration-300"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <input
              type="text"
              placeholder="Category"
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all duration-300"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
            
            <input
              type="number"
              placeholder="Min Price ($)"
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all duration-300"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
            
            <input
              type="number"
              placeholder="Max Price ($)"
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all duration-300"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
            
            <button
              onClick={fetchSweets}
              disabled={loading}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <Search size={20} />
                  Apply Filters
                </>
              )}
            </button>
          </div>
        </div>

        {/* Create Sweet Section */}
        {showCreate && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
            <CreateSweet
              onSweetAdded={fetchSweets}
              token={token}
              apiUrl={apiUrl}
              onClose={() => setShowCreate(false)}
            />
          </div>
        )}

        {/* Enhanced Sweet Cards */}
                <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <BarChart3 className="text-indigo-600" size={28} />
            Sweet Inventory Management
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sweets.map((sweet) => (
            <div
              key={sweet.id}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-indigo-200 transform hover:-translate-y-2"
            >
              {/* Card Header */}
              <div className="bg-gradient-to-r from-indigo-400 to-purple-400 p-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 rounded-full -mr-10 -mt-10"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/20 rounded-full -ml-8 -mb-8"></div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-white mb-1 truncate">{sweet.name}</h3>
                  <div className="flex items-center gap-2">
                    <Star className="text-yellow-300 fill-current" size={16} />
                    <span className="text-indigo-100 text-sm font-medium">{sweet.category}</span>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6">
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="text-green-500" size={18} />
                      <span className="text-gray-600 font-medium">Price</span>
                    </div>
                    <span className="text-2xl font-bold text-green-600">${sweet.price}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="text-blue-500" size={18} />
                      <span className="text-gray-600 font-medium">Stock</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {sweet.quantity > 0 ? (
                        <>
                          <CheckCircle className="text-green-500" size={16} />
                          <span className="text-lg font-semibold text-gray-800">{sweet.quantity}</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="text-red-500" size={16} />
                          <span className="text-red-500 font-semibold">Out of Stock</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setEditingId(sweet.id)}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-2 rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 font-medium text-sm"
                  >
                    <Pencil size={16} />
                    Edit
                  </button>
                  
                  <button
                    onClick={() => setRestockId(sweet.id)}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-2 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 font-medium text-sm"
                  >
                    <RotateCcw size={16} />
                    Restock
                  </button>
                </div>
                
                <button
                  onClick={() => handleDelete(sweet.id)}
                  disabled={deleteLoading === sweet.id}
                  className="w-full mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-2 rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-300 font-medium text-sm disabled:opacity-50"
                >
                  {deleteLoading === sweet.id ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Delete Sweet
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {!loading && sweets.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="text-gray-400" size={40} />
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">No sweets found</h3>
            <p className="text-gray-600 mb-6">Get started by adding your first sweet to the inventory!</p>
            <button
              onClick={() => setShowCreate(true)}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-8 py-3 rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto"
            >
              <PlusCircle size={20} />
              Add Your First Sweet
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <Loader2 className="animate-spin text-indigo-500 mx-auto mb-4" size={48} />
            <h3 className="text-xl font-semibold text-gray-800">Loading sweet inventory...</h3>
          </div>
        )}
      </div>

      {/* Edit Sweet Modal */}
      {editingId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
          <div className="max-w-md w-full mx-4">
            <EditSweet
              sweet={sweets.find(s => s.id === editingId)}
              token={token}
              apiUrl={apiUrl}
              onCancel={() => setEditingId(null)}
              onSaved={() => {
                setEditingId(null);
                fetchSweets();
              }}
            />
          </div>
        </div>
      )}

      {/* Enhanced Restock Modal */}
      {restockId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <RotateCcw className="text-white" size={20} />
                </div>
                <h3 className="text-xl font-bold">Restock Sweet</h3>
              </div>
              <p className="text-yellow-100 mt-2">Add more items to your inventory</p>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity to Add
                </label>
                <input
                  type="number"
                  placeholder="Enter amount to add..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-4 focus:ring-yellow-100 outline-none transition-all duration-300 text-lg font-semibold"
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(e.target.value)}
                  min="1"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setRestockId(null);
                    setRestockAmount("");
                  }}
                  disabled={restockLoading}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-all duration-300 font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRestock}
                  disabled={!restockAmount || restockLoading}
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-3 rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {restockLoading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      Confirm Restock
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}