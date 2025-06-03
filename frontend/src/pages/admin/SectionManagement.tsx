import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription
} from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MoreHorizontal, Plus, Trash2, Eye, X } from 'lucide-react';

const API_BASE = "http://localhost:5001/api/admin";

const SectionManagement: React.FC = () => {
  const [sections, setSections] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSections, setFilteredSections] = useState<any[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addSectionName, setAddSectionName] = useState('');
  const [addSectionDescription, setAddSectionDescription] = useState('');
  const [addSectionImage, setAddSectionImage] = useState<File | null>(null); // <-- new state
  const [addError, setAddError] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [selectedSection, setSelectedSection] = useState<any>(null);
  const [viewProductsDialogOpen, setViewProductsDialogOpen] = useState(false);
  const [addProductDialogOpen, setAddProductDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [removeSectionId, setRemoveSectionId] = useState<string | null>(null);
  const [isRemovingSection, setIsRemovingSection] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [updateSectionId, setUpdateSectionId] = useState<string | null>(null);
  const [updateSectionName, setUpdateSectionName] = useState('');
  const [updateSectionDescription, setUpdateSectionDescription] = useState('');
  const [updateSectionImage, setUpdateSectionImage] = useState<File | null>(null);
  const [updateSectionImagePreview, setUpdateSectionImagePreview] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');

  // Fetch all sections and all products
  useEffect(() => {
    fetchSections();
    fetchProducts();
  }, []);

  const fetchSections = async () => {
    const res = await fetch(`${API_BASE}/sections`);
    const data = await res.json();
    setSections(data);
    setFilteredSections(data);
  };

  const fetchProducts = async () => {
    const res = await fetch(`${API_BASE}/products`);
    const data = await res.json();
    setProducts(data);
  };

  // Search filter
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredSections(sections);
      return;
    }
    const filtered = sections.filter(section =>
      section.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredSections(filtered);
  };

  // Add Section Handler
  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    setIsAdding(true);
    try {
      if (!addSectionImage) {
        setAddError('Section image is required');
        setIsAdding(false);
        return;
      }
      const formData = new FormData();
      formData.append('name', addSectionName);
      formData.append('description', addSectionDescription);
      formData.append('image', addSectionImage);

      const res = await fetch(`${API_BASE}/sections`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add section');
      setAddDialogOpen(false);
      setAddSectionName('');
      setAddSectionDescription('');
      setAddSectionImage(null);
      fetchSections();
    } catch (err: any) {
      setAddError(err.message || 'Failed to add section');
    } finally {
      setIsAdding(false);
    }
  };

  // Remove Section Handler
  const handleRemoveSection = async () => {
    if (!removeSectionId) return;
    setIsRemovingSection(true);
    try {
      const res = await fetch(`${API_BASE}/sections/${removeSectionId}`, {
        method: 'DELETE',
      });
      await res.json();
      setRemoveSectionId(null);
      fetchSections();
    } catch (err) {
      // Optionally show error
    } finally {
      setIsRemovingSection(false);
    }
  };

  // Add Product to Section Handler
  const handleAddProductToSection = async () => {
    if (!selectedSection || !selectedProductId) return;
    setIsAddingProduct(true);
    try {
      const res = await fetch(`${API_BASE}/sections/add-product`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId: selectedSection._id,
          productId: selectedProductId,
        }),
      });
      await res.json();
      setAddProductDialogOpen(false);
      setSelectedProductId('');
      fetchSections();
    } catch (err) {
      // Optionally show error
    } finally {
      setIsAddingProduct(false);
    }
  };

  // Remove Product from Section Handler
  const handleRemoveProductFromSection = async (sectionId: string, productId: string) => {
    await fetch(`${API_BASE}/sections/remove-product`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sectionId, productId }),
    });
    fetchSections();
  };

  // View Products of Section
  const handleViewProducts = (section: any) => {
    setSelectedSection(section);
    setViewProductsDialogOpen(true);
  };

  // Open Add Product Dialog
  const openAddProductDialog = (section: any) => {
    setSelectedSection(section);
    setAddProductDialogOpen(true);
  };

  // Open Update Dialog
  const openUpdateDialog = (section: any) => {
    setUpdateSectionId(section._id);
    setUpdateSectionName(section.name);
    setUpdateSectionDescription(section.description);
    setUpdateSectionImagePreview(section.image || null);
    setUpdateSectionImage(null);
    setUpdateError('');
    setUpdateDialogOpen(true);
  };

  // Handle Update Section
  const handleUpdateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateError('');
    setIsUpdating(true);
    try {
      if (!updateSectionId) return;
      const formData = new FormData();
      formData.append('name', updateSectionName);
      formData.append('description', updateSectionDescription);
      if (updateSectionImage) {
        formData.append('image', updateSectionImage);
      }
      const token = localStorage.getItem('token'); // <-- get token from storage
      const res = await fetch(`${API_BASE}/sections/${updateSectionId}`, {
        method: 'PUT',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined, // <-- add header
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update section');
      setUpdateDialogOpen(false);
      setUpdateSectionId(null);
      setUpdateSectionName('');
      setUpdateSectionDescription('');
      setUpdateSectionImage(null);
      setUpdateSectionImagePreview(null);
      fetchSections();
    } catch (err: any) {
      setUpdateError(err.message || 'Failed to update section');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Section Management</h1>
          <p className="text-gray-500">Manage all sections and their products</p>
        </div>
        <div className="flex space-x-2">
          <Input
            placeholder="Search Section..."
            className="w-[250px]"
            value={searchQuery}
            onChange={handleSearch}
          />
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-1">
                <Plus className="h-4 w-4" />
                <span>Add Section</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Section</DialogTitle>
                <DialogDescription>
                  Enter a unique section name and description to create a new section.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddSection} encType="multipart/form-data">
                <div className="grid gap-4 py-4">
                  <Input
                    id="section-name"
                    value={addSectionName}
                    onChange={e => setAddSectionName(e.target.value)}
                    placeholder="Section Name"
                    required
                  />
                  <Input
                    id="section-description"
                    value={addSectionDescription}
                    onChange={e => setAddSectionDescription(e.target.value)}
                    placeholder="Section Description"
                    required
                  />
                  <Input
                    id="section-image"
                    type="file"
                    accept="image/*"
                    onChange={e => setAddSectionImage(e.target.files?.[0] || null)}
                    required
                  />
                  {addError && <div className="text-red-500 text-sm">{addError}</div>}
                  <div className="mt-4 flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={isAdding}>{isAdding ? 'Adding...' : 'Add Section'}</Button>
                  </div>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredSections.map(section => (
          <Card key={section._id}>
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle className="text-xl">{section.name}</CardTitle>
                <CardDescription>
                  {section.products.length} product{section.products.length !== 1 ? 's' : ''}
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={() => openAddProductDialog(section)}>
                  + Add Product
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleViewProducts(section)}>
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openUpdateDialog(section)}
                >
                  Update
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setRemoveSectionId(section._id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {section.products.length === 0 && (
                  <span className="text-gray-400 text-sm">No products in this section.</span>
                )}
                {section.products.map((product: any) => (
                  <div key={product._id} className="flex items-center border rounded px-2 py-1 bg-gray-50">
                    <Avatar className="w-6 h-6 mr-2">
                      <AvatarImage src={product.image} alt={product.name} />
                      <AvatarFallback>{product.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="mr-2">{product.name}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-red-500"
                      onClick={() => handleRemoveProductFromSection(section._id, product._id)}
                      title="Remove product"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Product to Section Dialog */}
      <Dialog open={addProductDialogOpen} onOpenChange={setAddProductDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Product to Section</DialogTitle>
            <DialogDescription>
              Select a product to add to <b>{selectedSection?.name}</b>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <select
              className="app-input"
              value={selectedProductId}
              onChange={e => setSelectedProductId(e.target.value)}
            >
              <option value="">Select Product</option>
              {products
                .filter(p =>
                  !selectedSection?.products.some((sp: any) => sp._id === p._id)
                )
                .map((product: any) => (
                  <option key={product._id} value={product._id}>
                    {product.name}
                  </option>
                ))}
            </select>
            <div className="mt-4 flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setAddProductDialogOpen(false)}>Cancel</Button>
              <Button
                type="button"
                disabled={!selectedProductId || isAddingProduct}
                onClick={handleAddProductToSection}
              >
                {isAddingProduct ? 'Adding...' : 'Add Product'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Products Dialog */}
      <Dialog open={viewProductsDialogOpen} onOpenChange={setViewProductsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Products in {selectedSection?.name}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2">
            {selectedSection?.products.length === 0 && (
              <span className="text-gray-400 text-sm">No products in this section.</span>
            )}
            {selectedSection?.products.map((product: any) => (
              <div key={product._id} className="flex items-center border rounded px-2 py-1 bg-gray-50">
                <Avatar className="w-6 h-6 mr-2">
                  <AvatarImage src={product.image} alt={product.name} />
                  <AvatarFallback>{product.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="mr-2">{product.name}</span>
                <Badge variant={product.isAvailable ? 'default' : 'secondary'}>
                  {product.isAvailable ? 'available' : 'unavailable'}
                </Badge>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove Section Dialog */}
      <Dialog open={!!removeSectionId} onOpenChange={open => !open && setRemoveSectionId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Section</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to remove this section?</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveSectionId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleRemoveSection} disabled={isRemovingSection}>
              {isRemovingSection ? 'Removing...' : 'Remove'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Section Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Section</DialogTitle>
            <DialogDescription>
              Update the section details below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateSection} encType="multipart/form-data">
            <div className="grid gap-4 py-4">
              <Input
                id="update-section-name"
                value={updateSectionName}
                onChange={e => setUpdateSectionName(e.target.value)}
                placeholder="Section Name"
                required
              />
              <Input
                id="update-section-description"
                value={updateSectionDescription}
                onChange={e => setUpdateSectionDescription(e.target.value)}
                placeholder="Section Description"
                required
              />
              <div>
                <label className="block mb-1 text-sm font-medium">Section Image</label>
                {updateSectionImagePreview && (
                  <img
                    src={updateSectionImagePreview}
                    alt="Section"
                    className="w-24 h-24 object-cover rounded mb-2 border"
                  />
                )}
                <Input
                  id="update-section-image"
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files?.[0] || null;
                    setUpdateSectionImage(file);
                    if (file) {
                      setUpdateSectionImagePreview(URL.createObjectURL(file));
                    }
                  }}
                />
              </div>
              {updateError && <div className="text-red-500 text-sm">{updateError}</div>}
              <div className="mt-4 flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setUpdateDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isUpdating}>{isUpdating ? 'Updating...' : 'Update Section'}</Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SectionManagement;