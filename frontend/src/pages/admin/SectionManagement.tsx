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
import { BACKEND_URL } from '@/utils/utils';
import { DragDropContext, Droppable, Draggable, DropResult, DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd';

const API_BASE = `${BACKEND_URL}/api/admin`;

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
  const [addProductSearch, setAddProductSearch] = useState('');
  const [addProductSearchResults, setAddProductSearchResults] = useState<any[]>([]);

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
    let data = await res.json();
    // Sort products by createdAt descending
    data = data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
      // Instead of closing dialog, keep it open and reset product selection
      setSelectedProductId('');
      fetchSections();
      // Optionally, refresh the product search results
      handleAddProductSearch();
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

  // Add Product to Section Dialog: search handler
  const handleAddProductSearch = () => {
    if (!addProductSearch.trim()) {
      setAddProductSearchResults(
        products.filter(p =>
          !selectedSection?.products.some((sp: any) => sp._id === p._id)
        )
      );
      return;
    }
    const query = addProductSearch.trim().toLowerCase();
    setAddProductSearchResults(
      products.filter(p =>
        !selectedSection?.products.some((sp: any) => sp._id === p._id) &&
        (
          p.name.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query)) ||
          (p.category && p.category.toLowerCase().includes(query))
        )
      )
    );
  };

  // When dialog opens or selectedSection changes, reset search
  useEffect(() => {
    if (addProductDialogOpen && selectedSection) {
      setAddProductSearch('');
      setAddProductSearchResults(
        products.filter(p =>
          !selectedSection?.products.some((sp: any) => sp._id === p._id)
        )
      );
    }
  }, [addProductDialogOpen, selectedSection, products]);

  // Drag and drop handler for sections and products
  const handleDragEnd = async (result: DropResult) => {
    // Section drag
    if (result.type === 'section') {
      if (!result.destination) return;
      const reordered = Array.from(filteredSections);
      const [removed] = reordered.splice(result.source.index, 1);
      reordered.splice(result.destination.index, 0, removed);
      setFilteredSections(reordered);

      // Persist new order to backend
      try {
        await fetch(`${API_BASE}/sections/reorder`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sectionIds: reordered.map((s: any) => s._id) }),
        });
        fetchSections();
      } catch {}
    }
    // Product drag within a section
    if (result.type.startsWith('products-')) {
      const sectionId = result.type.replace('products-', '');
      const sectionIdx = filteredSections.findIndex(s => s._id === sectionId);
      if (sectionIdx === -1) return;
      const section = filteredSections[sectionIdx];
      const products = Array.from(section.products);
      const [removed] = products.splice(result.source.index, 1);
      products.splice(result.destination!.index, 0, removed);

      // Update UI immediately
      const updatedSections = [...filteredSections];
      updatedSections[sectionIdx] = { ...section, products };
      setFilteredSections(updatedSections);

      // Persist new product order to backend
      try {
        await fetch(`${API_BASE}/sections/${sectionId}/reorder-products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productIds: products.map((p: any) => p._id) }),
        });
        fetchSections();
      } catch {}
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

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="sections-droppable" direction="vertical" type="section">
          {(provided) => (
            <div
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {filteredSections.map((section, idx) => (
                <Draggable key={section._id} draggableId={section._id} index={idx}>
                  {(dragProvided, dragSnapshot) => (
                    <div
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      {...dragProvided.dragHandleProps}
                      style={{
                        ...dragProvided.draggableProps.style,
                        boxShadow: dragSnapshot.isDragging ? '0 4px 16px rgba(0,0,0,0.12)' : undefined,
                        background: dragSnapshot.isDragging ? '#f3f4f6' : undefined,
                      }}
                    >
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
                          <Droppable droppableId={`products-${section._id}`} direction="vertical" type={`products-${section._id}`}>
                            {(prodProvided) => (
                              <div
                                ref={prodProvided.innerRef}
                                {...prodProvided.droppableProps}
                                className="flex flex-wrap gap-2"
                              >
                                {section.products.length === 0 && (
                                  <span className="text-gray-400 text-sm">No products in this section.</span>
                                )}
                                {section.products.map((product: any, prodIdx: number) => (
                                  <Draggable key={product._id} draggableId={product._id} index={prodIdx}>
                                    {(prodDragProvided: DraggableProvided, prodDragSnapshot: DraggableStateSnapshot) => (
                                      <div
                                        ref={prodDragProvided.innerRef}
                                        {...prodDragProvided.draggableProps}
                                        {...prodDragProvided.dragHandleProps}
                                        style={{
                                          ...prodDragProvided.draggableProps.style,
                                          opacity: prodDragSnapshot.isDragging ? 0.7 : 1,
                                        }}
                                        className="flex items-center border rounded px-2 py-1 bg-gray-50"
                                      >
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
                                    )}
                                  </Draggable>
                                ))}
                                {prodProvided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

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
            <div className="flex gap-2">
              <Input
                placeholder="Search products by name, description, category..."
                value={addProductSearch}
                onChange={e => setAddProductSearch(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddProductSearch(); } }}
                className="flex-1"
              />
              <Button type="button" onClick={handleAddProductSearch}>
                Search
              </Button>
            </div>
            <select
              className="app-input"
              value={selectedProductId}
              onChange={e => setSelectedProductId(e.target.value)}
            >
              <option value="">Select Product</option>
              {addProductSearchResults.map((product: any) => (
                <option key={product._id} value={product._id}>
                  {product.name} | {product.category} | {product.description?.slice(0, 30)}
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