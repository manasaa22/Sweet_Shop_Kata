// pages/Dashboard.jsx
import {
  AlertCircle,
  CheckCircle,
  DollarSign,
  Filter,
  Loader2,
  LogOut,
  Package,
  Search,
  Settings,
  ShoppingCart,
  Star
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [sweets, setSweets] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(null);

  const apiUrl = import.meta.env.VITE_BASE_API;
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  useEffect(() => {
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const handlePurchase = async (id, availableQty) => {
    const qty = prompt("Enter quantity to purchase:", "1");
    if (!qty || Number(qty) <= 0) return;

    if (Number(qty) > availableQty && availableQty > 0) {
      alert(`Only ${availableQty} items are available. Please enter a valid quantity.`);
      return;
    }

    setPurchaseLoading(id);
    try {
      for (let i = 0; i < Number(qty); i++) {
        const res = await fetch(`${apiUrl}/sweets/${id}/purchase`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const data = await res.json();
          alert(data.detail || "Purchase failed");
          return;
        }
      }
      alert("Purchase successful!");
      fetchSweets();
    } catch (err) {
      console.error("Purchase error:", err);
    } finally {
      setPurchaseLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white shadow-2xl">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                🍬
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Kata Sweet Shop</h1>
                <p className="text-pink-100 text-lg">
                  Welcome back, {role === "admin" ? "Admin" : "Sweet Lover"}!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {role === "admin" && (
                <button
                  onClick={() => navigate("/admin")}
                  className="flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl hover:bg-white/30 transition-all duration-300 font-medium"
                >
                  <Settings size={20} />
                  Admin Panel
                </button>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-xl hover:bg-red-600 transition-all duration-300 font-medium"
              >
                <LogOut size={20} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Enhanced Filters Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Filter className="text-white" size={20} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Find Your Perfect Sweet</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search sweets..."
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all duration-300"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <input
              type="text"
              placeholder="Category"
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all duration-300"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
            
            <input
              type="number"
              placeholder="Min Price ($)"
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all duration-300"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
            
            <input
              type="number"
              placeholder="Max Price ($)"
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all duration-300"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
            
            <button
              onClick={fetchSweets}
              disabled={loading}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <Search size={20} />
                  Search
                </>
              )}
            </button>
          </div>
        </div>

        {/* Sweet Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sweets.map((sweet) => (
            <div
              key={sweet.id}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-purple-200 transform hover:-translate-y-2"
            >
              {/* Card Header */}
              <div className="bg-gradient-to-r from-pink-400 to-purple-400 p-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 rounded-full -mr-10 -mt-10"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/20 rounded-full -ml-8 -mb-8"></div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-white mb-1 truncate">{sweet.name}</h3>
                  <div className="flex items-center gap-2">
                    <Star className="text-yellow-300 fill-current" size={16} />
                    <span className="text-pink-100 text-sm font-medium">{sweet.category}</span>
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

                {/* Purchase Button - Only for customers */}
                {role !== "admin" && (
                  <button
                    onClick={() => handlePurchase(sweet.id, sweet.quantity)}
                    disabled={sweet.quantity <= 0 || purchaseLoading === sweet.id}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {purchaseLoading === sweet.id ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <>
                        <ShoppingCart size={20} />
                        {sweet.quantity > 0 ? "Add to Cart" : "Out of Stock"}
                      </>
                    )}
                  </button>
                )}
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
            <p className="text-gray-600">Try adjusting your search filters to find more delicious treats!</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <Loader2 className="animate-spin text-purple-500 mx-auto mb-4" size={48} />
            <h3 className="text-xl font-semibold text-gray-800">Loading delicious sweets...</h3>
          </div>
        )}
      </div>
    </div>
  );
}