"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  ShoppingBag,
  Star,
  Package,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Edit,
  LogOut,
  RefreshCw,
  Trash2,
  Save,
  X,
  XCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { signOut } from "@/lib/supabase/auth";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Image from "next/image";
import { useCart } from "@/components/context/CartContext";
import { useFavorites } from "@/components/context/FavoritesContext";
import ProfileSetting from "@/components/dashboard/ProfileSetting";
import OrdersTab from "@/components/dashboard/OrdersTab";
import {
  requestOrderCancellation,
  withdrawCancellationRequest,
} from "@/lib/orders";
import { Database } from "@/types/database.types";

type Order = Database["public"]["Tables"]["orders"]["Row"];

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  address?: string;
  avatar_url?: string;
  profile_picture_url?: string;
  created_at: string;
}

interface UserReview {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  rating: number;
  comment: string;
  reviewImages: string[];
  createdAt: string;
  helpfulCount: number;
}

export default function UserDashboard() {
  const router = useRouter();
  const { clearCart } = useCart();
  const { clearFavorites } = useFavorites();
  const [activeTab, setActiveTab] = useState<
    "overview" | "orders" | "reviews" | "profile"
  >("overview");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ rating: number; comment: string }>(
    {
      rating: 0,
      comment: "",
    },
  );
  const [cancellingOrder, setCancellingOrder] = useState<string | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const loadUserData = async () => {
    try {
      setLoading(true);

      // Get current user
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (!authUser) {
        router.push("/login");
        return;
      }

      // Use auth user metadata directly (more reliable)
      const userProfile: UserProfile = {
        id: authUser.id,
        email: authUser.email || "",
        full_name:
          authUser.user_metadata?.full_name ||
          authUser.user_metadata?.display_name ||
          "",
        phone: authUser.user_metadata?.phone || "",
        address: authUser.user_metadata?.address || "",
        avatar_url: authUser.user_metadata?.avatar_url || "",
        profile_picture_url: authUser.user_metadata?.profile_picture_url || "",
        created_at: authUser.created_at || new Date().toISOString(),
      };

      setUser(userProfile);

      // Load user orders
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", authUser.id)
        .order("created_at", { ascending: false });

      if (!ordersError && ordersData) {
        setOrders(ordersData as Order[]);
      }

      // Load user reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("product_reviews")
        .select(
          `
          *,
          products!inner(title, cover_image)
        `,
        )
        .eq("user_id", authUser.id)
        .order("created_at", { ascending: false });

      if (!reviewsError && reviewsData) {
        const userReviews: UserReview[] = reviewsData.map((review) => ({
          id: review.id,
          productId: review.product_id,
          productName: review.products.title,
          productImage: review.products.cover_image,
          rating: review.rating,
          comment: review.comment || "",
          reviewImages: review.review_images || [],
          createdAt: review.created_at,
          helpfulCount: review.helpful_count,
        }));
        setReviews(userReviews);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      // Clear cart and favorites using context methods
      clearCart();
      clearFavorites();
      // Also clear localStorage as backup and prevent sync from restoring
      if (typeof window !== "undefined") {
        localStorage.removeItem("cart");
        localStorage.removeItem("favorites");
        // Force clear favorites in localStorage immediately
        localStorage.setItem("favorites", JSON.stringify([]));
      }
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  const handleEditReview = (review: UserReview) => {
    setEditingReview(review.id);
    setEditForm({
      rating: review.rating,
      comment: review.comment,
    });
  };

  const handleSaveReview = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from("product_reviews")
        .update({
          rating: editForm.rating,
          comment: editForm.comment,
          updated_at: new Date().toISOString(),
        })
        .eq("id", reviewId);

      if (error) throw error;

      toast.success("Review updated successfully!");
      setEditingReview(null);
      loadUserData();
    } catch (error) {
      console.error("Error updating review:", error);
      toast.error("Failed to update review");
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this review? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("product_reviews")
        .delete()
        .eq("id", reviewId);

      if (error) throw error;

      toast.success("Review deleted successfully!");
      loadUserData();
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Failed to delete review");
    }
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
    setEditForm({ rating: 0, comment: "" });
  };

  const handleCancellationRequest = async (orderId: string) => {
    if (!cancellationReason.trim()) {
      toast.error("Please provide a reason for cancellation");
      return;
    }

    if (!user) {
      toast.error("User not authenticated");
      return;
    }

    try {
      setCancellingOrder(orderId);
      const result = await requestOrderCancellation(
        orderId,
        cancellationReason,
        user.id,
      );

      if (result.success) {
        toast.success(result.message);
        setShowCancellationModal(false);
        setCancellationReason("");
        setCancellingOrder(null);
        // Reload orders to get updated status
        loadUserData();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error requesting cancellation:", error);
      toast.error("Failed to submit cancellation request");
    } finally {
      setCancellingOrder(null);
    }
  };

  const handleWithdrawCancellation = async (orderId: string) => {
    if (!user) {
      toast.error("User not authenticated");
      return;
    }

    try {
      const result = await withdrawCancellationRequest(orderId, user.id);

      if (result.success) {
        toast.success(result.message);
        // Reload orders to get updated status
        loadUserData();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error withdrawing cancellation:", error);
      toast.error("Failed to withdraw cancellation request");
    }
  };

  const openCancellationModal = (orderId: string) => {
    setCancellingOrder(orderId);
    setShowCancellationModal(true);
    setCancellationReason("");
  };

  const closeCancellationModal = () => {
    setShowCancellationModal(false);
    setCancellationReason("");
    setCancellingOrder(null);
  };

  const canCancelOrder = (order: Order) => {
    const orderDate = order.created_at
      ? new Date(order.created_at)
      : new Date();
    const now = new Date();
    const hoursSinceOrder =
      (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60);

    return (
      hoursSinceOrder <= 24 &&
      order.order_status === "pending" &&
      !order.cancellation_request
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            User not found
          </h1>
          <button
            onClick={() => router.push("/login")}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              {/* User Info */}
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden">
                  {user.profile_picture_url || user.avatar_url ? (
                    <Image
                      src={user.profile_picture_url || user.avatar_url || ""}
                      alt="Profile"
                      width={80}
                      height={80}
                      className="rounded-full object-cover"
                      onError={(e) => {
                        // Fallback to default avatar if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        if (target.parentElement) {
                          target.parentElement.innerHTML =
                            '<div class="w-full h-full flex items-center justify-center"><svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg></div>';
                        }
                      }}
                    />
                  ) : (
                    <User className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {user.full_name || "User"}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {user.email}
                </p>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {[
                  { id: "overview", label: "Overview", icon: Package },
                  { id: "orders", label: "My Orders", icon: ShoppingBag },
                  { id: "reviews", label: "My Reviews", icon: Star },
                  { id: "profile", label: "Profile Settings", icon: User },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Total Orders
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {orders.length}
                        </p>
                      </div>
                      <ShoppingBag className="w-8 h-8 text-green-500" />
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Reviews Written
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {reviews.length}
                        </p>
                      </div>
                      <Star className="w-8 h-8 text-yellow-500" />
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Member Since
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {new Date(user.created_at).getFullYear()}
                        </p>
                      </div>
                      <Calendar className="w-8 h-8 text-blue-500" />
                    </div>
                  </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Recent Orders
                  </h3>
                  {orders.length === 0 ? (
                    <p className="text-gray-600 dark:text-gray-400">
                      You haven&apos;t placed any orders yet.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {orders.slice(0, 3).map((order) => (
                        <div
                          key={order.id}
                          className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                Order #{order.id.slice(0, 8)}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {order.created_at
                                  ? new Date(
                                      order.created_at,
                                    ).toLocaleDateString()
                                  : "N/A"}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900 dark:text-white">
                                Rs {order.total_amount.toFixed(2)}
                              </p>
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  order.order_status === "delivered"
                                    ? "bg-green-100 text-green-800"
                                    : order.order_status === "shipped"
                                      ? "bg-blue-100 text-blue-800"
                                      : order.order_status === "processing"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : order.order_status === "cancelled"
                                          ? "bg-red-100 text-red-800"
                                          : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {order.order_status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  My Orders
                </h3>
                <OrdersTab
                  orders={orders}
                  canCancelOrder={canCancelOrder}
                  openCancellationModal={openCancellationModal}
                  handleWithdrawCancellation={handleWithdrawCancellation}
                />
              </motion.div>
            )}

            {/* Reviews Tab */}
            {activeTab === "reviews" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  My Reviews
                </h3>
                {reviews.length === 0 ? (
                  <div className="text-center py-12">
                    <Star className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No Reviews Yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Share your experience with products you&apos;ve purchased
                    </p>
                    <button
                      onClick={() => router.push("/products")}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Browse Products
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                      >
                        {editingReview === review.id ? (
                          // Edit Mode
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                Edit Review for {review.productName}
                              </h4>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleSaveReview(review.id)}
                                  className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                                >
                                  <Save className="w-4 h-4" />
                                  Save
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="flex items-center gap-1 px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                  Cancel
                                </button>
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Rating
                              </label>
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() =>
                                      setEditForm((prev) => ({
                                        ...prev,
                                        rating: star,
                                      }))
                                    }
                                    className={`${star <= editForm.rating ? "text-yellow-400" : "text-gray-300"}`}
                                  >
                                    <Star
                                      className={`w-5 h-5 ${star <= editForm.rating ? "fill-current" : ""}`}
                                    />
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Review
                              </label>
                              <textarea
                                value={editForm.comment}
                                onChange={(e) =>
                                  setEditForm((prev) => ({
                                    ...prev,
                                    comment: e.target.value,
                                  }))
                                }
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                            </div>
                          </div>
                        ) : (
                          // Display Mode
                          <>
                            <div className="flex gap-4">
                              <div className="relative w-20 h-20 flex-shrink-0">
                                <Image
                                  src={review.productImage}
                                  alt={review.productName}
                                  fill
                                  className="object-cover rounded"
                                />
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                                      {review.productName}
                                    </h4>
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                          <Star
                                            key={i}
                                            className={`w-4 h-4 ${
                                              i < review.rating
                                                ? "text-yellow-400 fill-current"
                                                : "text-gray-300"
                                            }`}
                                          />
                                        ))}
                                      </div>
                                      <span className="text-sm text-gray-600 dark:text-gray-400">
                                        {new Date(
                                          review.createdAt,
                                        ).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleEditReview(review)}
                                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                      title="Edit review"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteReview(review.id)
                                      }
                                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                      title="Delete review"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 mb-2">
                                  {review.comment}
                                </p>
                                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                  <span>{review.helpfulCount} helpful</span>
                                  {review.reviewImages.length > 0 && (
                                    <span>
                                      {review.reviewImages.length} images
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <ProfileSetting user={user} loadUserData={loadUserData} />
            )}
          </div>
        </div>
      </div>

      {/* Cancellation Request Modal */}
      {showCancellationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Request Order Cancellation
              </h3>
              <button
                onClick={closeCancellationModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reason for Cancellation
              </label>
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Please provide a reason for your cancellation request..."
              />
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Note:</strong> Orders can only be cancelled within 24
                hours of placement. Once submitted, your request will be
                processed within 24 hours.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={closeCancellationModal}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  cancellingOrder && handleCancellationRequest(cancellingOrder)
                }
                disabled={!cancellationReason.trim() || !cancellingOrder}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {cancellingOrder ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
