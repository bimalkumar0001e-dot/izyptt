import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MoreHorizontal, Search, Plus, Edit, Eye, CheckCircle, XCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BACKEND_URL } from '@/utils/utils';

const API_BASE = `${BACKEND_URL}/api`;

const RestaurantManagement: React.FC = () => {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [pendingApplications, setPendingApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<any | null>(null);
  const [editRestaurant, setEditRestaurant] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [editLoading, setEditLoading] = useState(false);
  const [popularRestaurants, setPopularRestaurants] = useState<any[]>([]);
  const [showPopularDialog, setShowPopularDialog] = useState(false);

  // Fetch all restaurants, pending applications, and popular restaurants from backend
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [allRes, pendingRes, popularRes] = await Promise.all([
          fetch(`${API_BASE}/admin/restaurants`).then(r => r.json()),
          fetch(`${API_BASE}/admin/pending-restaurants`).then(r => r.json()),
          fetch(`${API_BASE}/admin/popular-restaurants`).then(r => r.json())
        ]);
        setRestaurants(allRes);
        setPendingApplications(pendingRes);
        setPopularRestaurants(popularRes);
      } catch (err) {
        setRestaurants([]);
        setPendingApplications([]);
        setPopularRestaurants([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handle edit form changes
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  // Save edited restaurant
  const handleEditSave = async () => {
    if (!editRestaurant) return;
    setEditLoading(true);
    try {
      // Prepare payload for both root and nested fields
      const payload: any = {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
      };
      // If you want to allow editing restaurantDetails.name, add this:
      if (editForm.restaurantDetailsName !== undefined) {
        payload.restaurantDetails = { name: editForm.restaurantDetailsName };
      }
      const res = await fetch(`${API_BASE}/admin/restaurants/${editRestaurant._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const updated = await res.json();
        setRestaurants(restaurants.map(r => r._id === updated._id ? updated : r));
        setEditRestaurant(null);
      }
    } finally {
      setEditLoading(false);
    }
  };

  // Toggle restaurant status (activate/deactivate)
  const handleToggleStatus = async (restaurant: any) => {
    const res = await fetch(`${API_BASE}/admin/restaurants/${restaurant._id}/activate`, { method: 'PATCH' });
    if (res.ok) {
      const updated = await res.json();
      setRestaurants(restaurants.map(r => r._id === restaurant._id ? { ...r, status: updated.message.includes('inactive') ? 'inactive' : 'active' } : r));
    }
  };

  // Toggle popular restaurant
  const handleTogglePopularRestaurant = async (restaurant: any) => {
    const isAlreadyPopular = !!restaurant.isPopular;
    if (!isAlreadyPopular && popularRestaurants.length >= 4) {
      setShowPopularDialog(true);
      return;
    }
    if (!isAlreadyPopular) {
      // Add to popular
      await fetch(`${API_BASE}/admin/popular-restaurants/add?restaurantId=${restaurant._id}`, { method: 'POST' });
    } else {
      // Remove from popular
      await fetch(`${API_BASE}/admin/popular-restaurants/remove?restaurantId=${restaurant._id}`, { method: 'POST' });
    }
    // Refresh popular restaurants
    const res = await fetch(`${API_BASE}/admin/popular-restaurants`);
    const data = await res.json();
    setPopularRestaurants(data);
    // Also update restaurants list to reflect isPopular
    setRestaurants(restaurants.map(r =>
      r._id === restaurant._id ? { ...r, isPopular: !isAlreadyPopular } : r
    ));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Restaurant Management</h1>
          <p className="text-gray-500">Manage all restaurant partners on the platform</p>
        </div>
        <div className="flex space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input placeholder="Search restaurants..." className="pl-8 w-[250px]" />
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-1">
                <Plus className="h-4 w-4" />
                <span>Add Restaurant</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Restaurant</DialogTitle>
                <DialogDescription>
                  Fill the details to add a new restaurant partner
                </DialogDescription>
              </DialogHeader>
              {/* Add restaurant form would go here */}
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="restaurant-name">Restaurant Name</label>
                  <Input id="restaurant-name" placeholder="Enter restaurant name" />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="owner-name">Owner Name</label>
                  <Input id="owner-name" placeholder="Enter owner name" />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="email">Email</label>
                  <Input id="email" type="email" placeholder="Enter email address" />
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <Button type="button" variant="outline">Cancel</Button>
                  <Button type="submit">Add Restaurant</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      {/* Popular Restaurants Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Popular Restaurants</CardTitle>
          <CardDescription>
            Select up to 4 restaurants to be displayed in the Popular Restaurants section on the Home page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {popularRestaurants.length > 0 ? (
              popularRestaurants.map((restaurant) => (
                <div key={restaurant._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={restaurant.restaurantDetails?.image} alt={restaurant.restaurantDetails?.name || restaurant.name} />
                      <AvatarFallback>{(restaurant.restaurantDetails?.name || restaurant.name)?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{restaurant.restaurantDetails?.name || restaurant.name}</span>
                  </div>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleTogglePopularRestaurant(restaurant)}
                  >
                    Remove
                  </Button>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-8 text-gray-500">
                No popular restaurants selected. Select up to 4 restaurants from the list below.
              </div>
            )}
          </div>
          <div className="mt-4 text-right text-sm text-gray-500">
            {popularRestaurants.length}/4 popular restaurants selected
          </div>
        </CardContent>
      </Card>
      <Tabs defaultValue="all" className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Restaurants</TabsTrigger>
          <TabsTrigger value="pending">
            Pending Approvals
            <Badge className="ml-2 bg-app-primary" variant="secondary">
              {pendingApplications.length}
            </Badge>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>All Restaurants</CardTitle>
              <CardDescription>
                A list of all restaurant partners registered on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Restaurant</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Popular</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {restaurants.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        No restaurants found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    restaurants.map((restaurant) => (
                      <TableRow key={restaurant._id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={restaurant.restaurantDetails?.image} alt={restaurant.name} />
                              <AvatarFallback>{restaurant.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{restaurant.restaurantDetails?.name || restaurant.name}</p>
                              <p className="text-xs text-gray-500">{restaurant.name}</p>
                              <p className="text-xs text-gray-400">ID: {restaurant._id}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{restaurant.email}</p>
                          <p className="text-xs text-gray-500">{restaurant.phone}</p>
                        </TableCell>
                        <TableCell>
                          {restaurant.restaurantDetails?.rating
                            ? `${restaurant.restaurantDetails.rating} / 5`
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {restaurant.totalOrders || 0}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              !restaurant.isApproved
                                ? 'outline'
                                : restaurant.status === 'active'
                                ? 'default'
                                : restaurant.status === 'inactive'
                                ? 'secondary'
                                : 'outline'
                            }
                          >
                            {!restaurant.isApproved
                              ? 'pending'
                              : restaurant.status === 'active'
                              ? 'active'
                              : restaurant.status === 'inactive'
                              ? 'inactive'
                              : restaurant.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {/* Popular toggle */}
                          <input
                            type="checkbox"
                            checked={!!restaurant.isPopular}
                            onChange={() => handleTogglePopularRestaurant(restaurant)}
                            disabled={!restaurant.isPopular && popularRestaurants.length >= 4}
                            aria-label="Popular restaurant"
                            style={{ width: 18, height: 18 }}
                          />
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
                              <DropdownMenuItem
                                onClick={() => setSelectedRestaurant(restaurant)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                <span>View Details</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditRestaurant(restaurant);
                                  setEditForm({
                                    name: restaurant.name,
                                    email: restaurant.email,
                                    phone: restaurant.phone,
                                    // Add more fields as needed
                                  });
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                              </DropdownMenuItem>
                              {restaurant.status === 'active' ? (
                                <DropdownMenuItem
                                  className="text-amber-600"
                                  onClick={() => handleToggleStatus(restaurant)}
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  <span>Deactivate</span>
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  className="text-green-600"
                                  onClick={() => handleToggleStatus(restaurant)}
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  <span>Activate</span>
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="pending" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Restaurant Applications</CardTitle>
              <CardDescription>
                New restaurant applications awaiting approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Restaurant</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Cuisine Type</TableHead>
                    <TableHead>Applied On</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingApplications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        No pending applications.
                      </TableCell>
                    </TableRow>
                  ) : (
                    pendingApplications.map((application) => (
                      <TableRow key={application._id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{application.restaurantDetails?.name || application.name}</p>
                            <p className="text-xs text-gray-500">{application.name}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{application.email}</p>
                          <p className="text-xs text-gray-500">{application.phone}</p>
                        </TableCell>
                        <TableCell>
                          {(application.restaurantDetails?.cuisineType || []).join(', ')}
                        </TableCell>
                        <TableCell>
                          {application.createdAt ? new Date(application.createdAt).toLocaleDateString() : ''}
                        </TableCell>
                        <TableCell>
                          {/* Show document links if available */}
                          {application.restaurantDetails?.documentUrls && application.restaurantDetails.documentUrls.length > 0 ? (
                            <Button variant="link" size="sm" className="p-0 h-auto text-sm">
                              View Documents ({application.restaurantDetails.documentUrls.length})
                            </Button>
                          ) : (
                            <span className="text-xs text-gray-400">No documents</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 border-green-600"
                              onClick={async () => {
                                await fetch(`${API_BASE}/admin/restaurants/${application._id}/approve`, { method: 'PATCH' });
                                setPendingApplications(pendingApplications.filter(a => a._id !== application._id));
                              }}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-600"
                              onClick={async () => {
                                // Optionally, implement reject logic here
                                // For now, just remove from UI
                                setPendingApplications(pendingApplications.filter(a => a._id !== application._id));
                              }}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {/* View Details Dialog */}
      <Dialog open={!!selectedRestaurant} onOpenChange={() => setSelectedRestaurant(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restaurant Details</DialogTitle>
          </DialogHeader>
          {selectedRestaurant && (
            <div className="space-y-2">
              <div><b>Name:</b> {selectedRestaurant.restaurantDetails?.name || selectedRestaurant.name}</div>
              <div><b>Email:</b> {selectedRestaurant.email}</div>
              <div><b>Phone:</b> {selectedRestaurant.phone}</div>
              <div><b>Status:</b> {selectedRestaurant.status}</div>
              <div><b>Rating:</b> {selectedRestaurant.restaurantDetails?.rating || 'N/A'}</div>
              <div><b>Address:</b> {selectedRestaurant.restaurantDetails?.address || 'N/A'}</div>
              {/* Add more fields as needed */}
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Edit Dialog */}
      <Dialog open={!!editRestaurant} onOpenChange={() => setEditRestaurant(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Restaurant</DialogTitle>
          </DialogHeader>
          {editRestaurant && (
            <form
              onSubmit={e => {
                e.preventDefault();
                handleEditSave();
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input
                  name="name"
                  value={editForm.name || ''}
                  onChange={handleEditChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  name="email"
                  value={editForm.email || ''}
                  onChange={handleEditChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <Input
                  name="phone"
                  value={editForm.phone || ''}
                  onChange={handleEditChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Restaurant Display Name</label>
                <Input
                  name="restaurantDetailsName"
                  value={editForm.restaurantDetailsName || editRestaurant?.restaurantDetails?.name || ''}
                  onChange={e => setEditForm({ ...editForm, restaurantDetailsName: e.target.value })}
                />
              </div>
              {/* Add more fields as needed */}
              <div className="flex justify-end space-x-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setEditRestaurant(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={editLoading}>
                  {editLoading ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
      {/* Dialog for when trying to add more than 4 popular restaurants */}
      <Dialog open={showPopularDialog} onOpenChange={setShowPopularDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Popular Restaurants Limit Reached</DialogTitle>
            <DialogDescription>
              You can only have up to 4 popular restaurants at a time. Please remove a restaurant before adding a new one.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end pt-4">
            <Button onClick={() => setShowPopularDialog(false)}>
              Okay
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RestaurantManagement;
