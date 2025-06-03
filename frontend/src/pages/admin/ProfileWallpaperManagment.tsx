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
import { MoreHorizontal, Search, Plus, Eye, Trash2, Check } from 'lucide-react';

const API_BASE = "http://localhost:5001/api/admin"; // Ensure this matches your backend

interface Wallpaper {
  _id: string;
  name: string;
  image: string;
  isActive: boolean;
  createdAt: string;
}

const ProfileWallpaperManagment: React.FC = () => {
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [filteredWallpapers, setFilteredWallpapers] = useState<Wallpaper[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newWallpaper, setNewWallpaper] = useState<{ name: string; image: File | null }>({ name: '', image: null });
  const [addError, setAddError] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedWallpaper, setSelectedWallpaper] = useState<Wallpaper | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteWallpaperId, setDeleteWallpaperId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch all wallpapers
  useEffect(() => {
    fetchWallpapers();
  }, []);

  const fetchWallpapers = async () => {
    const res = await fetch(`${API_BASE}/profile-wallpapers`);
    const data = await res.json();
    // Fix image path if not absolute
    const wallpapersWithFullImage = data.map((w: any) => ({
      ...w,
      image: w.image?.startsWith('http')
        ? w.image
        : `http://localhost:5001${w.image}`
    }));
    setWallpapers(wallpapersWithFullImage);
    setFilteredWallpapers(wallpapersWithFullImage);
  };

  // Search filter
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredWallpapers(wallpapers);
      return;
    }
    const filtered = wallpapers.filter(wallpaper => 
      wallpaper.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredWallpapers(filtered);
  };

  // Add Wallpaper Handler
  const handleAddWallpaper = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    setIsAdding(true);
    try {
      if (!newWallpaper.name || !newWallpaper.image) {
        setAddError('Please fill all fields.');
        setIsAdding(false);
        return;
      }
      const formData = new FormData();
      formData.append('name', newWallpaper.name);
      formData.append('image', newWallpaper.image);
      const res = await fetch(`${API_BASE}/profile-wallpapers`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setAddError(data.message || 'Failed to add wallpaper');
        setIsAdding(false);
        return;
      }
      await fetchWallpapers();
      setAddDialogOpen(false);
      setNewWallpaper({ name: '', image: null });
    } catch (err: any) {
      setAddError(err.message || 'Failed to add wallpaper');
    } finally {
      setIsAdding(false);
    }
  };

  // View Wallpaper Handler
  const handleViewWallpaper = (wallpaper: Wallpaper) => {
    setSelectedWallpaper(wallpaper);
    setViewDialogOpen(true);
  };

  // Delete Wallpaper Handler
  const handleDeleteWallpaper = async () => {
    if (!deleteWallpaperId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`${API_BASE}/profile-wallpapers/${deleteWallpaperId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete wallpaper');
      await fetchWallpapers();
      setDeleteDialogOpen(false);
      setDeleteWallpaperId(null);
    } catch (err: any) {
      // Optionally show error
    } finally {
      setIsDeleting(false);
    }
  };

  // Prevent opening add dialog if a wallpaper exists
  const handleOpenAddDialog = () => {
    if (wallpapers.length > 0) {
      alert('Only one wallpaper allowed. Please remove the existing wallpaper before adding a new one.');
      return;
    }
    setAddDialogOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Profile Wallpaper Management</h1>
          <p className="text-gray-500">Manage all wallpapers in the system</p>
        </div>
        <div className="flex space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search wallpapers..."
              className="pl-8 w-[250px]"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          {/* Only allow add if no wallpaper exists */}
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="flex items-center space-x-1"
                onClick={handleOpenAddDialog}
                disabled={wallpapers.length > 0}
              >
                <Plus className="h-4 w-4" />
                <span>Add Wallpaper</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Wallpaper</DialogTitle>
                <DialogDescription>
                  Fill the details to add a new wallpaper to the system
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddWallpaper} encType="multipart/form-data">
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label htmlFor="name">Wallpaper Name</label>
                    <Input
                      id="name"
                      value={newWallpaper.name}
                      onChange={e => setNewWallpaper({ ...newWallpaper, name: e.target.value })}
                      placeholder="Enter wallpaper name"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="image">Image</label>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={e => setNewWallpaper({ ...newWallpaper, image: e.target.files?.[0] || null })}
                      required
                    />
                    {newWallpaper.image && <span className="text-xs text-gray-500 mt-1">{newWallpaper.image.name}</span>}
                  </div>
                  {addError && <div className="text-red-500 text-sm">{addError}</div>}
                  <div className="mt-4 flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={isAdding}>{isAdding ? 'Adding...' : 'Add Wallpaper'}</Button>
                  </div>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Wallpapers</CardTitle>
          <CardDescription>
            A list of all wallpapers available on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Wallpaper</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWallpapers.map((wallpaper) => (
                <TableRow key={wallpaper._id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={wallpaper.image} alt={wallpaper.name} />
                        <AvatarFallback>{wallpaper.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{wallpaper.name}</p>
                      <p className="text-xs text-gray-500">ID: {wallpaper._id}</p>
                    </div>
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
                        <DropdownMenuItem onClick={() => handleViewWallpaper(wallpaper)}>
                          <Eye className="mr-2 h-4 w-4" />
                          <span>View</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => { setDeleteWallpaperId(wallpaper._id); setDeleteDialogOpen(true); }}>
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

      {/* View Wallpaper Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Wallpaper Details</DialogTitle>
          </DialogHeader>
          {selectedWallpaper && (
            <div className="space-y-2">
              <div>
                <strong>Name:</strong> {selectedWallpaper.name}
              </div>
              <div>
                <strong>Status:</strong> {selectedWallpaper.isActive ? 'Active' : 'Inactive'}
              </div>
              <div>
                <strong>Uploaded At:</strong> {selectedWallpaper.createdAt ? new Date(selectedWallpaper.createdAt).toLocaleString() : '-'}
              </div>
              <div>
                <img src={selectedWallpaper.image} alt={selectedWallpaper.name} className="w-32 h-32 object-cover rounded" />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Wallpaper Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Wallpaper</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to delete this wallpaper?</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteWallpaper} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileWallpaperManagment;
