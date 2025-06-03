import React, { useState, useEffect } from 'react';
import { Plus, Trash, Check, X, Pencil } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { BACKEND_URL } from '@/utils/utils';

// API base URL
const API_BASE = `${BACKEND_URL}/api/admin/payment-methods`;

const defaultNewMethod = {
  name: '',
  details: '',
  description: '',
  processingFee: '',
  isActive: true,
  icon: '💳',
  image: null as File | null,
  paymentGuide: '',
  instructions: ''
};

const PaymentMethods: React.FC = () => {
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentMethod, setCurrentMethod] = useState<any>(null);
  const [newMethod, setNewMethod] = useState({ ...defaultNewMethod });

  // Fetch all payment methods
  useEffect(() => {
    fetch(API_BASE)
      .then(res => res.json())
      .then(data => setPaymentMethods(data))
      .catch(() => toast({ title: "Error", description: "Failed to load payment methods", variant: "destructive" }));
  }, []);

  // Filtered methods for search
  const filteredMethods = paymentMethods.filter(method =>
    method.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add new payment method
  const handleAddMethod = async () => {
    if (!newMethod.name.trim() || !newMethod.details.trim()) {
      toast({ title: "Validation Error", description: "Name and details are required", variant: "destructive" });
      return;
    }
    try {
      const formData = new FormData();
      formData.append('name', newMethod.name);
      formData.append('details', newMethod.details);
      if (newMethod.description) formData.append('description', newMethod.description);
      if (newMethod.paymentGuide) formData.append('paymentGuide', newMethod.paymentGuide);
      if (newMethod.instructions) formData.append('instructions', newMethod.instructions);
      if (newMethod.image) formData.append('image', newMethod.image);

      const res = await fetch(API_BASE, {
        method: "POST",
        body: formData
      });
      if (!res.ok) throw new Error();
      const { method } = await res.json();
      setPaymentMethods([...paymentMethods, method]);
      setNewMethod({ ...defaultNewMethod });
      setIsAddDialogOpen(false);
      toast({ title: "Success", description: "Payment method added" });
    } catch {
      toast({ title: "Error", description: "Failed to add payment method", variant: "destructive" });
    }
  };

  // Delete payment method
  const handleDeleteMethod = async () => {
    if (!currentMethod) return;
    try {
      await fetch(`${API_BASE}/${currentMethod._id}`, { method: "DELETE" });
      setPaymentMethods(paymentMethods.filter(m => m._id !== currentMethod._id));
      setIsDeleteDialogOpen(false);
      setCurrentMethod(null);
      toast({ title: "Success", description: "Payment method deleted" });
    } catch {
      toast({ title: "Error", description: "Failed to delete payment method", variant: "destructive" });
    }
  };

  // Toggle status
  const toggleMethodStatus = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/${id}/activate`, { method: "PATCH" });
      if (!res.ok) throw new Error();
      const { method } = await res.json();
      setPaymentMethods(paymentMethods.map(m => m._id === id ? method : m));
      toast({ title: "Success", description: `Payment method ${method.active ? 'activated' : 'deactivated'}` });
    } catch {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    }
  };

  // Toggle status (switch version)
  const handleSwitchStatus = async (id: string, checked: boolean) => {
    try {
      const res = await fetch(`${API_BASE}/${id}/activate`, { method: "PATCH" });
      if (!res.ok) throw new Error();
      const { method } = await res.json();
      setPaymentMethods(paymentMethods.map(m => m._id === id ? method : m));
      toast({ title: "Success", description: `Payment method ${method.active ? 'activated' : 'deactivated'}` });
    } catch {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    }
  };

  // Edit payment method
  const handleEditMethod = async () => {
    if (!currentMethod) return;
    try {
      const formData = new FormData();
      formData.append('name', currentMethod.name);
      formData.append('details', currentMethod.details);
      if (currentMethod.description) formData.append('description', currentMethod.description);
      if (currentMethod.paymentGuide) formData.append('paymentGuide', currentMethod.paymentGuide);
      if (currentMethod.instructions) formData.append('instructions', currentMethod.instructions);
      if (currentMethod.image && currentMethod.image instanceof File) formData.append('image', currentMethod.image);

      const res = await fetch(`${API_BASE}/${currentMethod._id}`, {
        method: "PUT",
        body: formData
      });
      if (!res.ok) throw new Error();
      const { method } = await res.json();
      setPaymentMethods(paymentMethods.map(m => m._id === method._id ? method : m));
      setIsEditDialogOpen(false);
      setCurrentMethod(null);
      toast({ title: "Success", description: "Payment method updated" });
    } catch {
      toast({ title: "Error", description: "Failed to update payment method", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Payment Methods</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Payment Method
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Payment Method</DialogTitle>
              <DialogDescription>
                Create a new payment method for customers to use during checkout.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Credit Card"
                  className="col-span-3"
                  value={newMethod.name}
                  onChange={e => setNewMethod({ ...newMethod, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="details" className="text-right">Details</Label>
                <Input
                  id="details"
                  placeholder="e.g. 2.5% processing fee"
                  className="col-span-3"
                  value={newMethod.details}
                  onChange={e => setNewMethod({ ...newMethod, details: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Description</Label>
                <Input
                  id="description"
                  placeholder="Optional description"
                  className="col-span-3"
                  value={newMethod.description}
                  onChange={e => setNewMethod({ ...newMethod, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="image" className="text-right">Image</Label>
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  className="col-span-3"
                  onChange={e => setNewMethod({ ...newMethod, image: e.target.files?.[0] || null })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="paymentGuide" className="text-right">Payment Guide</Label>
                <Input
                  id="paymentGuide"
                  placeholder="Optional payment guide"
                  className="col-span-3"
                  value={newMethod.paymentGuide}
                  onChange={e => setNewMethod({ ...newMethod, paymentGuide: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="instructions" className="text-right">Instructions</Label>
                <Input
                  id="instructions"
                  placeholder="Optional instructions"
                  className="col-span-3"
                  value={newMethod.instructions}
                  onChange={e => setNewMethod({ ...newMethod, instructions: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddMethod}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Payment Methods</CardTitle>
          <CardDescription>
            View and manage all available payment methods for your customers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-4">
            <Input
              placeholder="Search payment methods..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMethods.length > 0 ? (
                filteredMethods.map(method => (
                  <TableRow key={method._id}>
                    <TableCell>
                      <span className="font-medium">{method.name}</span>
                    </TableCell>
                    <TableCell>{method.details}</TableCell>
                    <TableCell>{method.description}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={!!method.active}
                          onCheckedChange={checked => handleSwitchStatus(method._id, checked)}
                          id={`switch-${method._id}`}
                        />
                        <span>{method.active ? 'Active' : 'Inactive'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setCurrentMethod({ ...method });
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setCurrentMethod(method);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No payment methods found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Payment Method</DialogTitle>
            <DialogDescription>
              Update the payment method details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">Name</Label>
              <Input
                id="edit-name"
                className="col-span-3"
                value={currentMethod?.name || ''}
                onChange={e => setCurrentMethod({ ...currentMethod, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-details" className="text-right">Details</Label>
              <Input
                id="edit-details"
                className="col-span-3"
                value={currentMethod?.details || ''}
                onChange={e => setCurrentMethod({ ...currentMethod, details: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">Description</Label>
              <Input
                id="edit-description"
                className="col-span-3"
                value={currentMethod?.description || ''}
                onChange={e => setCurrentMethod({ ...currentMethod, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-image" className="text-right">Image</Label>
              <input
                id="edit-image"
                type="file"
                accept="image/*"
                className="col-span-3"
                onChange={e => setCurrentMethod({ ...currentMethod, image: e.target.files?.[0] || null })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-paymentGuide" className="text-right">Payment Guide</Label>
              <Input
                id="edit-paymentGuide"
                placeholder="Optional payment guide"
                className="col-span-3"
                value={currentMethod?.paymentGuide || ''}
                onChange={e => setCurrentMethod({ ...currentMethod, paymentGuide: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-instructions" className="text-right">Instructions</Label>
              <Input
                id="edit-instructions"
                placeholder="Optional instructions"
                className="col-span-3"
                value={currentMethod?.instructions || ''}
                onChange={e => setCurrentMethod({ ...currentMethod, instructions: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditMethod}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Payment Method</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the {currentMethod?.name} payment method? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteMethod}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentMethods;
