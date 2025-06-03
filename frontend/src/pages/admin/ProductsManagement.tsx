import React, { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription
} from '@/components/ui/card';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { MoreHorizontal, Search, Plus, Edit, Eye, Trash2, Check } from 'lucide-react';

const API_BASE = "http://localhost:5001/api/admin";

const ProductsManagement: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [popularProducts, setPopularProducts] = useState<any[]>([]);
  const [showPopularDialog, setShowPopularDialog] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    stock: '',
    restaurant: '',
    isAvailable: true,
    image: null as File | null,
    returnPolicy: '', // <-- Add this line
  });
  const [addError, setAddError] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [editError, setEditError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const editImageRef = useRef<HTMLInputElement>(null);

  // Fetch all products and popular products
  useEffect(() => {
    const fetchProducts = async () => {
      const res = await fetch(`${API_BASE}/products`);
      const data = await res.json();
      setProducts(data);
      setFilteredProducts(data);
      setPopularProducts(data.filter((p: any) => p.isPopular));
    };
    fetchProducts();
  }, []);

  // Search filter
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredProducts(products);
      return;
    }
    const filtered = products.filter(product => 
      product.name.toLowerCase().includes(query.toLowerCase()) || 
      product.description?.toLowerCase().includes(query.toLowerCase()) ||
      product.category?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  // Toggle popular status
  const handleTogglePopular = async (product: any) => {
    const isAlreadyPopular = !!product.isPopular;
    if (!isAlreadyPopular && popularProducts.length >= 4) {
      setShowPopularDialog(true);
      return;
    }
    if (!isAlreadyPopular) {
      // Add to popular
      await fetch(`${API_BASE}/popular-dishes/add?productId=${product._id}`, { method: 'POST' });
    } else {
      // Remove from popular
      await fetch(`${API_BASE}/popular-dishes/remove?productId=${product._id}`, { method: 'POST' });
    }
    // Refresh products
    const res = await fetch(`${API_BASE}/products`);
    const data = await res.json();
    setProducts(data);
    setFilteredProducts(data);
    setPopularProducts(data.filter((p: any) => p.isPopular));
  };

  // Add Product Handler
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    setIsAdding(true);
    try {
      // Validate required fields except restaurant
      if (!newProduct.name || !newProduct.price || !newProduct.category || !newProduct.description || !newProduct.stock || !newProduct.image || !newProduct.returnPolicy) {
        setAddError('Please fill all required fields. Restaurant ID is optional.');
        setIsAdding(false);
        return;
      }
      const formData = new FormData();
      formData.append('name', newProduct.name);
      formData.append('price', newProduct.price);
      formData.append('category', newProduct.category);
      formData.append('description', newProduct.description);
      formData.append('stock', newProduct.stock);
      if (newProduct.restaurant) formData.append('restaurant', newProduct.restaurant);
      formData.append('isAvailable', String(newProduct.isAvailable));
      formData.append('image', newProduct.image);
      formData.append('returnPolicy', newProduct.returnPolicy); // <-- Add this line
      const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setAddError(data.message || 'Failed to add product');
        setIsAdding(false);
        return;
      }
      // Refresh products
      const res2 = await fetch(`${API_BASE}/products`);
      const data2 = await res2.json();
      setProducts(data2);
      setFilteredProducts(data2);
      setPopularProducts(data2.filter((p: any) => p.isPopular));
      setAddDialogOpen(false);
      setNewProduct({
        name: '', price: '', category: '', description: '', stock: '', restaurant: '', isAvailable: true, image: null, returnPolicy: ''
      });
    } catch (err: any) {
      setAddError(err.message || 'Failed to add product');
    } finally {
      setIsAdding(false);
    }
  };

  // View Product Handler
  const handleViewProduct = async (productId: string) => {
    const res = await fetch(`${API_BASE}/products/${productId}`);
    const data = await res.json();
    setSelectedProduct(data);
    setViewDialogOpen(true);
  };

  // Edit Product Handler
  const handleEditProduct = async (productId: string) => {
    const res = await fetch(`${API_BASE}/products/${productId}`);
    const data = await res.json();
    setEditProduct({
      ...data,
      image: '', // Don't prefill file input
      returnPolicy: data.returnPolicy || '', // <-- Add this line
    });
    setEditDialogOpen(true);
    setEditError('');
  };

  const handleEditProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');
    setIsEditing(true);
    try {
      const formData = new FormData();
      formData.append('name', editProduct.name);
      formData.append('price', editProduct.price);
      formData.append('category', editProduct.category);
      formData.append('description', editProduct.description);
      formData.append('stock', editProduct.stock);
      // Only append restaurant if not empty
      if (editProduct.restaurant && editProduct.restaurant.trim() !== '') {
        formData.append('restaurant', editProduct.restaurant);
      }
      formData.append('isAvailable', String(editProduct.isAvailable));
      if (editImageRef.current?.files?.[0]) {
        formData.append('image', editImageRef.current.files[0]);
      }
      formData.append('returnPolicy', editProduct.returnPolicy);
      const res = await fetch(`${API_BASE}/products/${editProduct._id}`, {
        method: 'PUT',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update product');
      // Refresh products
      const res2 = await fetch(`${API_BASE}/products`);
      const data2 = await res2.json();
      setProducts(data2);
      setFilteredProducts(data2);
      setPopularProducts(data2.filter((p: any) => p.isPopular));
      setEditDialogOpen(false);
    } catch (err: any) {
      setEditError(err.message || 'Failed to update product');
    } finally {
      setIsEditing(false);
    }
  };

  // Delete Product Handler
  const handleDeleteProduct = async () => {
    if (!deleteProductId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`${API_BASE}/products/${deleteProductId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete product');
      // Refresh products
      const res2 = await fetch(`${API_BASE}/products`);
      const data2 = await res2.json();
      setProducts(data2);
      setFilteredProducts(data2);
      setPopularProducts(data2.filter((p: any) => p.isPopular));
      setDeleteDialogOpen(false);
      setDeleteProductId(null);
    } catch (err: any) {
      // Optionally show error
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Products Management</h1>
          <p className="text-gray-500">Manage all products in the system</p>
        </div>
        <div className="flex space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search products..."
              className="pl-8 w-[250px]"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-1">
                <Plus className="h-4 w-4" />
                <span>Add Product</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>
                  Fill the details to add a new product to the system
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddProduct} encType="multipart/form-data">
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label htmlFor="name">Product Name</label>
                    <Input
                      id="name"
                      value={newProduct.name}
                      onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                      placeholder="Enter product name"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="price">Price</label>
                    <Input
                      id="price"
                      type="number"
                      value={newProduct.price}
                      onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                      placeholder="Enter price"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="category">Category</label>
                    <Input
                      id="category"
                      value={newProduct.category}
                      onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                      placeholder="Enter category"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="description">Description</label>
                    <Input
                      id="description"
                      value={newProduct.description}
                      onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                      placeholder="Enter description"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="stock">Stock</label>
                    <Input
                      id="stock"
                      type="number"
                      value={newProduct.stock}
                      onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })}
                      placeholder="Enter stock"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="restaurant">Restaurant ID</label>
                    <Input
                      id="restaurant"
                      value={newProduct.restaurant}
                      onChange={e => setNewProduct({ ...newProduct, restaurant: e.target.value })}
                      placeholder="Enter restaurant ID"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="isAvailable">Available</label>
                    <select
                      id="isAvailable"
                      value={String(newProduct.isAvailable)}
                      onChange={e => setNewProduct({ ...newProduct, isAvailable: e.target.value === 'true' })}
                      className="app-input"
                    >
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="image">Image</label>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={e => setNewProduct({ ...newProduct, image: e.target.files?.[0] || null })}
                      required
                    />
                    {newProduct.image && <span className="text-xs text-gray-500 mt-1">{newProduct.image.name}</span>}
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="returnPolicy">Return Policy</label>
                    <Input
                      id="returnPolicy"
                      value={newProduct.returnPolicy}
                      onChange={e => setNewProduct({ ...newProduct, returnPolicy: e.target.value })}
                      placeholder="Enter return policy"
                      required
                    />
                  </div>
                  {addError && <div className="text-red-500 text-sm">{addError}</div>}
                  <div className="mt-4 flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={isAdding}>{isAdding ? 'Adding...' : 'Add Product'}</Button>
                  </div>
                  {addError && addError.includes('Restaurant ID') && (
                    <div className="text-gray-500 text-xs mt-1">Restaurant ID is optional. You may leave it blank.</div>
                  )}
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Popular Dishes</CardTitle>
          <CardDescription>
            Select up to 4 dishes to be displayed in the Popular Dishes section on the Home page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {popularProducts.length > 0 ? (
              popularProducts.map((product) => (
                <div key={product._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={product.image} alt={product.name} />
                      <AvatarFallback>{product.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{product.name}</span>
                  </div>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleTogglePopular(product)}
                  >
                    Remove
                  </Button>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-8 text-gray-500">
                No popular dishes selected. Select up to 4 dishes from the list below.
              </div>
            )}
          </div>
          <div className="mt-4 text-right text-sm text-gray-500">
            {popularProducts.length}/4 popular dishes selected
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>All Products</CardTitle>
          <CardDescription>
            A list of all products available on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Restaurant</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Return Policy</TableHead> {/* <-- Add this line */}
                <TableHead>Popular</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product._id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={product.image} alt={product.name} />
                        <AvatarFallback>{product.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-gray-500">ID: {product._id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{product.restaurant}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>₹{product.price}</TableCell>
                  <TableCell>{product.returnPolicy}</TableCell> {/* <-- Add this line */}
                  <TableCell>
                    <Switch 
                      checked={!!product.isPopular}
                      onCheckedChange={() => handleTogglePopular(product)}
                      aria-label="Popular status"
                      disabled={popularProducts.length >= 4 && !product.isPopular}
                    />
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.isAvailable ? 'default' : 'secondary'}>
                      {product.isAvailable ? 'available' : 'unavailable'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewProduct(product._id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          <span>View</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditProduct(product._id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => { setDeleteProductId(product._id); setDeleteDialogOpen(true); }}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Product Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-2">
              <div>
                <strong>Name:</strong> {selectedProduct.name}
              </div>
              <div>
                <strong>Description:</strong> {selectedProduct.description}
              </div>
              <div>
                <strong>Category:</strong> {selectedProduct.category}
              </div>
              <div>
                <strong>Price:</strong> ₹{selectedProduct.price}
              </div>
              <div>
                <strong>Stock:</strong> {selectedProduct.stock}
              </div>
              <div>
                <strong>Restaurant:</strong> {selectedProduct.restaurant}
              </div>
              <div>
                <strong>Status:</strong> {selectedProduct.isAvailable ? 'Available' : 'Unavailable'}
              </div>
              <div>
                <strong>Popular:</strong> {selectedProduct.isPopular ? 'Yes' : 'No'}
              </div>
              <div>
                <img src={selectedProduct.image} alt={selectedProduct.name} className="w-32 h-32 object-cover rounded" />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {editProduct && (
            <form onSubmit={handleEditProductSubmit} encType="multipart/form-data">
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="edit-name">Product Name</label>
                  <Input
                    id="edit-name"
                    value={editProduct.name}
                    onChange={e => setEditProduct({ ...editProduct, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="edit-price">Price</label>
                  <Input
                    id="edit-price"
                    type="number"
                    value={editProduct.price}
                    onChange={e => setEditProduct({ ...editProduct, price: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="edit-category">Category</label>
                  <Input
                    id="edit-category"
                    value={editProduct.category}
                    onChange={e => setEditProduct({ ...editProduct, category: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="edit-description">Description</label>
                  <Input
                    id="edit-description"
                    value={editProduct.description}
                    onChange={e => setEditProduct({ ...editProduct, description: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="edit-stock">Stock</label>
                  <Input
                    id="edit-stock"
                    type="number"
                    value={editProduct.stock}
                    onChange={e => setEditProduct({ ...editProduct, stock: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="edit-restaurant">Restaurant ID</label>
                  <Input
                    id="edit-restaurant"
                    value={editProduct.restaurant}
                    onChange={e => setEditProduct({ ...editProduct, restaurant: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="edit-isAvailable">Available</label>
                  <select
                    id="edit-isAvailable"
                    value={String(editProduct.isAvailable)}
                    onChange={e => setEditProduct({ ...editProduct, isAvailable: e.target.value === 'true' })}
                    className="app-input"
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <label htmlFor="edit-image">Image</label>
                  <Input
                    id="edit-image"
                    type="file"
                    accept="image/*"
                    ref={editImageRef}
                  />
                  {editProduct.image && typeof editProduct.image === 'string' && (
                    <span className="text-xs text-gray-500 mt-1">Current: {editProduct.image}</span>
                  )}
                </div>
                <div className="grid gap-2">
                  <label htmlFor="edit-returnPolicy">Return Policy</label>
                  <Input
                    id="edit-returnPolicy"
                    value={editProduct.returnPolicy}
                    onChange={e => setEditProduct({ ...editProduct, returnPolicy: e.target.value })}
                    placeholder="Enter return policy"
                    required
                  />
                </div>
                {editError && <div className="text-red-500 text-sm">{editError}</div>}
                <div className="mt-4 flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={isEditing}>{isEditing ? 'Saving...' : 'Save Changes'}</Button>
                </div>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Product Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to delete this product?</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteProduct} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for when trying to add more than 4 popular products */}
      <Dialog open={showPopularDialog} onOpenChange={setShowPopularDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Popular Dishes Limit Reached</DialogTitle>
            <DialogDescription>
              You can only have up to 4 popular dishes at a time. Please remove a dish before adding a new one.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowPopularDialog(false)}>
              <Check className="mr-2 h-4 w-4" />
              Okay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductsManagement;
