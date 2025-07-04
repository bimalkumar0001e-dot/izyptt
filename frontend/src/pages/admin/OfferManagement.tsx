import React, { useState, useEffect } from 'react';
import { PlusCircle, Search, Edit, Trash, ToggleLeft, ToggleRight, Eye, Globe2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Offer } from '@/types/product';
import { showToast } from '@/utils/toast';
import axios from 'axios';
import { BACKEND_URL } from '@/utils/utils';

const API_BASE = `${BACKEND_URL}/api`;

// Simple Modal implementation
const Modal: React.FC<{ open: boolean, onClose: () => void, children: React.ReactNode }> = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg p-6 min-w-[350px] max-w-lg relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={onClose}>✕</button>
        {children}
      </div>
    </div>
  );
};

const initialOfferState = {
  id: '',
  title: '',
  code: '',
  description: '',
  discountType: 'flat',
  discountValue: 0,
  minOrderValue: 0,
  maxDiscount: 0,
  validFrom: '',
  validTo: '',
  isActive: true,
  limitedTo: null,
  perCustomerLimit: 1,
};

const ManageOffers: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal state
  const [modalType, setModalType] = useState<'create' | 'edit' | 'view' | null>(null);
  const [modalOffer, setModalOffer] = useState<any>(null);
  const [modalImage, setModalImage] = useState<File | null>(null);

  // Fetch offers from backend on mount
  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = () => {
    setIsLoading(true);
    axios.get(`${API_BASE}/admin/offers`)
      .then(response => {
        const formattedOffers = response.data.map((offer: any) => ({
          ...offer,
          validFrom: new Date(offer.validFrom),
          validTo: new Date(offer.validTo),
          createdAt: new Date(offer.createdAt),
          updatedAt: new Date(offer.updatedAt)
        }));
        setOffers(formattedOffers);
      })
      .catch(error => {
        showToast('Failed to fetch offers', 'error');
        setOffers([]);
      })
      .finally(() => setIsLoading(false));
  };

  const filteredOffers = searchQuery 
    ? offers.filter(offer => 
        offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offer.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offer.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : offers;

  const openCreateModal = () => {
    setModalType('create');
    setModalOffer({ ...initialOfferState, validFrom: '', validTo: '' });
    setModalImage(null);
  };

  const openEditModal = (offer: any) => {
    setModalType('edit');
    setModalOffer({
      ...offer,
      validFrom: offer.validFrom ? new Date(offer.validFrom).toISOString().slice(0, 10) : '',
      validTo: offer.validTo ? new Date(offer.validTo).toISOString().slice(0, 10) : '',
    });
    setModalImage(null);
  };

  const openViewModal = (offer: any) => {
    setModalType('view');
    setModalOffer(offer);
  };

  const closeModal = () => {
    setModalType(null);
    setModalOffer(null);
  };

  // Create or Edit Offer
  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData();
      Object.entries(modalOffer).forEach(([key, value]) => {
        if (value !== undefined && value !== null) formData.append(key, value as any);
      });
      if (modalImage) {
        formData.append('image', modalImage);
      }
      if (modalType === 'create') {
        await axios.post(`${API_BASE}/admin/offers`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showToast('Offer created successfully', 'success');
      } else if (modalType === 'edit') {
        await axios.put(`${API_BASE}/admin/offers/${modalOffer.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showToast('Offer updated successfully', 'success');
      }
      fetchOffers();
      closeModal();
    } catch (err) {
      showToast('Failed to save offer', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleOfferStatus = (id: string) => {
    const offer = offers.find(o => o.id === id);
    if (!offer) return;
    setIsLoading(true);
    axios.patch(`${API_BASE}/admin/offers/${id}/activate`)
      .then(() => {
        setOffers(offers.map(offer => 
          offer.id === id ? { ...offer, isActive: !offer.isActive } : offer
        ));
        showToast(`Offer "${offer.title}" ${!offer.isActive ? 'activated' : 'deactivated'} successfully`, 'success');
      })
      .catch(() => showToast('Failed to update offer status', 'error'))
      .finally(() => setIsLoading(false));
  };

  const toggleOfferPublic = (id: string) => {
    const offer = offers.find(o => o.id === id);
    if (!offer) return;
    setIsLoading(true);
    // Use FormData to send only isPublic
    const formData = new FormData();
    formData.append('isPublic', (!offer.isPublic).toString());
    axios
      .put(`${API_BASE}/admin/offers/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      .then(res => {
        setOffers(offers.map(o =>
          o.id === id ? { ...o, isPublic: !o.isPublic } : o
        ));
        showToast(
          `Offer "${offer.title}" is now ${!offer.isPublic ? 'public' : 'private'}`,
          'success'
        );
      })
      .catch(() => showToast('Failed to update public status', 'error'))
      .finally(() => setIsLoading(false));
  };

  const deleteOffer = (id: string) => {
    const offer = offers.find(o => o.id === id);
    if (!offer) return;
    if (window.confirm(`Are you sure you want to delete the offer "${offer.title}"?`)) {
      setIsLoading(true);
      axios.delete(`${API_BASE}/admin/offers/${id}`)
        .then(() => {
          setOffers(offers.filter(offer => offer.id !== id));
          showToast(`Offer "${offer.title}" deleted successfully`, 'success');
        })
        .catch(() => showToast('Failed to delete offer', 'error'))
        .finally(() => setIsLoading(false));
    }
  };

  // Modal form fields handler
  const handleModalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'file') {
      const file = (e.target as HTMLInputElement).files?.[0] || null;
      setModalImage(file);
      return;
    }
    setModalOffer((prev: any) => ({
      ...prev,
      [name]: ['discountValue', 'minOrderValue', 'maxDiscount', 'perCustomerLimit', 'limitedTo'].includes(name)
        ? (value === '' ? '' : Number(value))
        : value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Promotions and Offers</h1>
        <Button onClick={openCreateModal}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Offer
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Manage Offers</CardTitle>
          <CardDescription>Create, edit, activate or deactivate offers.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="Search offers by title, code or description"
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Public</TableHead> {/* New column */}
                  <TableHead>Usage</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4 text-gray-500">
                      Loading offers...
                    </TableCell>
                  </TableRow>
                ) : filteredOffers.length > 0 ? (
                  filteredOffers.map((offer) => (
                    <TableRow key={offer.id}>
                      <TableCell className="font-medium">{offer.title}</TableCell>
                      <TableCell>
                        <code className="px-2 py-1 bg-gray-100 rounded">{offer.code}</code>
                      </TableCell>
                      <TableCell>
                        {offer.discountType === 'percentage' 
                          ? `${offer.discountValue}%` 
                          : `₹${offer.discountValue}`
                        }
                        {offer.minOrderValue > 0 && (
                          <span className="text-xs text-gray-500 block">
                            Min: ₹{offer.minOrderValue}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {offer.validTo.toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <span 
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            offer.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {offer.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <button
                          title={offer.isPublic ? "Public" : "Private"}
                          className="flex items-center"
                          onClick={() => toggleOfferPublic(offer.id)}
                          type="button"
                        >
                          {offer.isPublic ? (
                            <ToggleRight className="h-5 w-5 text-blue-600" />
                          ) : (
                            <ToggleLeft className="h-5 w-5 text-gray-400" />
                          )}
                          <span className={`ml-1 text-xs ${offer.isPublic ? 'text-blue-700' : 'text-gray-400'}`}>
                            {offer.isPublic ? 'Public' : 'Private'}
                          </span>
                        </button>
                      </TableCell>
                      <TableCell>{offer.usageCount}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => openViewModal(offer)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => openEditModal(offer)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => toggleOfferStatus(offer.id)}
                          >
                            {offer.isActive 
                              ? <ToggleRight className="h-4 w-4 text-green-600" />
                              : <ToggleLeft className="h-4 w-4 text-gray-400" />
                            }
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => deleteOffer(offer.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4 text-gray-500">
                      No offers found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <Modal open={modalType === 'create' || modalType === 'edit'} onClose={closeModal}>
        <form onSubmit={handleModalSubmit} className="space-y-4">
          <h2 className="text-lg font-semibold mb-2">{modalType === 'create' ? 'Create Offer' : 'Edit Offer'}</h2>
          {/* Image upload */}
          <div>
            <label className="block font-medium mb-1">Offer Image<span className="text-red-500">*</span></label>
            <input
              type="file"
              accept="image/*"
              name="image"
              onChange={handleModalChange}
              required={modalType === 'create'}
            />
            {/* Preview */}
            {(modalImage || modalOffer?.image) && (
              <div className="mt-2">
                <img
                  src={
                    modalImage
                      ? URL.createObjectURL(modalImage)
                      : modalOffer?.image?.startsWith('/uploads')
                        ? `${BACKEND_URL}${modalOffer.image}`
                        : modalOffer?.image
                  }
                  alt="Offer"
                  className="w-24 h-24 object-cover rounded border"
                />
              </div>
            )}
          </div>
          <Input name="id" value={modalOffer?.id || ''} onChange={handleModalChange} placeholder="Offer ID (unique, e.g. offer1)" required />
          <Input name="title" value={modalOffer?.title || ''} onChange={handleModalChange} placeholder="Title" required />
          <Input name="code" value={modalOffer?.code || ''} onChange={handleModalChange} placeholder="Code" required />
          <textarea name="description" value={modalOffer?.description || ''} onChange={handleModalChange} placeholder="Description" className="w-full border rounded p-2" required />
          <div className="flex gap-2">
            <select name="discountType" value={modalOffer?.discountType || 'flat'} onChange={handleModalChange} className="border rounded p-2" required>
              <option value="flat">Flat</option>
              <option value="percentage">Percentage</option>
            </select>
            <Input name="discountValue" type="number" value={modalOffer?.discountValue || ''} onChange={handleModalChange} placeholder="Discount Value" required />
          </div>
          <Input name="minOrderValue" type="number" value={modalOffer?.minOrderValue || ''} onChange={handleModalChange} placeholder="Min Order Value" />
          <Input name="maxDiscount" type="number" value={modalOffer?.maxDiscount || ''} onChange={handleModalChange} placeholder="Max Discount (for %)" />
          <div className="flex gap-2">
            <label className="flex-1">
              Valid From
              <Input name="validFrom" type="date" value={modalOffer?.validFrom || ''} onChange={handleModalChange} required />
            </label>
            <label className="flex-1">
              Valid To
              <Input name="validTo" type="date" value={modalOffer?.validTo || ''} onChange={handleModalChange} required />
            </label>
          </div>
          <Input name="limitedTo" type="number" value={modalOffer?.limitedTo || ''} onChange={handleModalChange} placeholder="Total Usage Limit (optional)" />
          <Input name="perCustomerLimit" type="number" value={modalOffer?.perCustomerLimit || ''} onChange={handleModalChange} placeholder="Per Customer Limit" />
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input type="checkbox" name="isActive" checked={modalOffer?.isActive ?? true} onChange={e => setModalOffer((prev: any) => ({ ...prev, isActive: e.target.checked }))} />
              <span>Active</span>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" name="isPublic" checked={modalOffer?.isPublic ?? false} onChange={e => setModalOffer((prev: any) => ({ ...prev, isPublic: e.target.checked }))} />
              <span>Public</span>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>{modalType === 'create' ? 'Create' : 'Update'}</Button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal open={modalType === 'view'} onClose={closeModal}>
        <div>
          <h2 className="text-lg font-semibold mb-2">Offer Details</h2>
          <div className="space-y-2">
            <div><b>Title:</b> {modalOffer?.title}</div>
            <div><b>Code:</b> <code>{modalOffer?.code}</code></div>
            <div><b>Description:</b> {modalOffer?.description}</div>
            <div><b>Discount:</b> {modalOffer?.discountType === 'percentage' ? `${modalOffer?.discountValue}%` : `₹${modalOffer?.discountValue}`}</div>
            <div><b>Min Order Value:</b> ₹{modalOffer?.minOrderValue}</div>
            <div><b>Max Discount:</b> {modalOffer?.maxDiscount ? `₹${modalOffer?.maxDiscount}` : '-'}</div>
            <div><b>Valid From:</b> {modalOffer?.validFrom ? new Date(modalOffer.validFrom).toLocaleDateString() : '-'}</div>
            <div><b>Valid To:</b> {modalOffer?.validTo ? new Date(modalOffer.validTo).toLocaleDateString() : '-'}</div>
            <div><b>Status:</b> {modalOffer?.isActive ? 'Active' : 'Inactive'}</div>
            <div><b>Usage Count:</b> {modalOffer?.usageCount}</div>
            <div><b>Usage Limit:</b> {modalOffer?.limitedTo ?? 'Unlimited'}</div>
            <div><b>Per Customer Limit:</b> {modalOffer?.perCustomerLimit}</div>
            <div><b>Created At:</b> {modalOffer?.createdAt ? new Date(modalOffer.createdAt).toLocaleString() : '-'}</div>
            <div><b>Updated At:</b> {modalOffer?.updatedAt ? new Date(modalOffer.updatedAt).toLocaleString() : '-'}</div>
          </div>
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={closeModal}>Close</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ManageOffers;
