import React, { useState, useEffect, useRef } from "react";
import { BACKEND_URL } from "@/utils/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, Edit, Plus, Eye } from "lucide-react";

const API_BASE = `${BACKEND_URL}/api/admin`;

const ProductReviewManage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviewImages, setReviewImages] = useState<File[]>([]);
  const [editReview, setEditReview] = useState<any>(null);
  const [editReviewText, setEditReviewText] = useState("");
  const [editReviewImages, setEditReviewImages] = useState<File[]>([]);
  const [error, setError] = useState("");
  const editImageRef = useRef<HTMLInputElement>(null);

  // Search products by name
  useEffect(() => {
    if (!search.trim()) {
      setProducts([]);
      return;
    }
    const fetchProducts = async () => {
      const res = await fetch(`${API_BASE}/products`);
      const data = await res.json();
      setProducts(
        data.filter((p: any) =>
          p.name.toLowerCase().includes(search.toLowerCase())
        )
      );
    };
    fetchProducts();
  }, [search]);

  // Fetch reviews for selected product
  useEffect(() => {
    if (!selectedProduct) return;
    const fetchReviews = async () => {
      const res = await fetch(
        `${API_BASE}/product-reviews?productId=${selectedProduct._id}`
      );
      const data = await res.json();
      setReviews(data);
    };
    fetchReviews();
  }, [selectedProduct]);

  // Add review handler
  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!reviewText) {
      setError("Review text required");
      return;
    }
    if (reviewImages.length > 5) {
      setError("Maximum 5 images allowed");
      return;
    }
    const formData = new FormData();
    formData.append("product", selectedProduct._id);
    formData.append("reviewText", reviewText);
    reviewImages.forEach((img) => formData.append("images", img));
    const res = await fetch(`${API_BASE}/product-reviews`, {
      method: "POST",
      body: formData,
      credentials: "include"
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.message || "Failed to add review");
      return;
    }
    setAddDialogOpen(false);
    setReviewText("");
    setReviewImages([]);
    // Refresh reviews
    const res2 = await fetch(
      `${API_BASE}/product-reviews?productId=${selectedProduct._id}`
    );
    setReviews(await res2.json());
  };

  // Edit review handler
  const handleEditReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!editReviewText) {
      setError("Review text required");
      return;
    }
    if (editReviewImages.length > 5) {
      setError("Maximum 5 images allowed");
      return;
    }
    const formData = new FormData();
    formData.append("reviewText", editReviewText);
    editReviewImages.forEach((img) => formData.append("images", img));
    const res = await fetch(`${API_BASE}/product-reviews/${editReview._id}`, {
      method: "PUT",
      body: formData,
      credentials: "include"
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.message || "Failed to update review");
      return;
    }
    setEditDialogOpen(false);
    setEditReview(null);
    setEditReviewText("");
    setEditReviewImages([]);
    // Refresh reviews
    const res2 = await fetch(
      `${API_BASE}/product-reviews?productId=${selectedProduct._id}`
    );
    setReviews(await res2.json());
  };

  // Delete review handler
  const handleDeleteReview = async (id: string) => {
    if (!window.confirm("Delete this review?")) return;
    await fetch(`${API_BASE}/product-reviews/${id}`, {
      method: "DELETE",
      credentials: "include"
    });
    // Refresh reviews
    const res2 = await fetch(
      `${API_BASE}/product-reviews?productId=${selectedProduct._id}`
    );
    setReviews(await res2.json());
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Product Review Management</h1>
      <div className="mb-4 flex flex-col md:flex-row gap-4">
        <Input
          placeholder="Search product by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-96"
        />
        {products.length > 0 && (
          <div className="bg-white border rounded shadow p-2 max-h-48 overflow-y-auto w-full md:w-96">
            {products.map((p) => (
              <div
                key={p._id}
                className="cursor-pointer hover:bg-gray-100 px-2 py-1 flex items-center"
                onClick={() => {
                  setSelectedProduct(p);
                  setProducts([]);
                  setSearch(p.name);
                }}
              >
                <img src={p.image} alt={p.name} className="w-8 h-8 mr-2 rounded" />
                <span>{p.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {selectedProduct && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {selectedProduct.name}
              <span className="ml-2 text-gray-500 text-sm">({selectedProduct._id})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <img src={selectedProduct.image} alt={selectedProduct.name} className="w-20 h-20 rounded" />
              <div>
                <div className="font-semibold">{selectedProduct.name}</div>
                <div className="text-gray-500">{selectedProduct.description}</div>
                <div className="text-gray-500">Category: {selectedProduct.category}</div>
              </div>
              <Button className="ml-auto" onClick={() => setAddDialogOpen(true)}>
                <Plus className="mr-2" /> Add Review
              </Button>
            </div>
            <div>
              <h2 className="font-semibold mb-2">Reviews</h2>
              {reviews.length === 0 && <div className="text-gray-500">No reviews for this product.</div>}
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r._id} className="border rounded p-3 flex flex-col md:flex-row gap-4 items-start">
                    <div className="flex-1">
                      <div className="font-medium">{r.reviewText}</div>
                      <div className="flex gap-2 mt-2">
                        {r.images && r.images.map((img: string, idx: number) => (
                          <img key={idx} src={img} alt="review" className="w-16 h-16 object-cover rounded" />
                        ))}
                      </div>
                      <div className="text-xs text-gray-400 mt-2">
                        Created: {new Date(r.createdAt).toLocaleString()}
                        {r.updatedAt && r.updatedAt !== r.createdAt && (
                          <> | Updated: {new Date(r.updatedAt).toLocaleString()}</>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditReview(r);
                          setEditReviewText(r.reviewText);
                          setEditReviewImages([]);
                          setEditDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4 mr-1" /> Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteReview(r._id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Review Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Review</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddReview} encType="multipart/form-data">
            <div className="grid gap-4 py-2">
              <div>
                <label>Review Text</label>
                <Input
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  required
                />
              </div>
              <div>
                <label>Images (max 5)</label>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={e => {
                    const files = Array.from(e.target.files || []);
                    setReviewImages(files.slice(0, 5));
                  }}
                />
                {reviewImages.length > 0 && (
                  <div className="text-xs text-gray-500 mt-1">
                    {reviewImages.length} image(s) selected
                  </div>
                )}
              </div>
              {error && <div className="text-red-500 text-sm">{error}</div>}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Add Review</Button>
              </DialogFooter>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Review Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Review</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditReview} encType="multipart/form-data">
            <div className="grid gap-4 py-2">
              <div>
                <label>Review Text</label>
                <Input
                  value={editReviewText}
                  onChange={e => setEditReviewText(e.target.value)}
                  required
                />
              </div>
              <div>
                <label>Images (max 5, leave blank to keep existing)</label>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  ref={editImageRef}
                  onChange={e => {
                    const files = Array.from(e.target.files || []);
                    setEditReviewImages(files.slice(0, 5));
                  }}
                />
                {editReview && editReview.images && editReview.images.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {editReview.images.map((img: string, idx: number) => (
                      <img key={idx} src={img} alt="review" className="w-12 h-12 object-cover rounded" />
                    ))}
                  </div>
                )}
              </div>
              {error && <div className="text-red-500 text-sm">{error}</div>}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductReviewManage;
