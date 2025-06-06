import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Eye, Trash, Image, ToggleLeft, ToggleRight, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { BACKEND_URL } from '@/utils/utils';

const BannerManagement: React.FC = () => {
  const [banners, setBanners] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<any>(null);
  const [newBanner, setNewBanner] = useState({
    title: '',
    description: '',
    image: '', // This will now store the URL preview or be empty
    link: '',
    isActive: true,
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  
  // Fetch banners from backend on mount
  useEffect(() => {
    setLoading(true);
    fetch(`${BACKEND_URL}/api/admin/banners`, {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}` // Include auth token if needed
      }
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to fetch banners');
        }
        const data = await res.json();
        console.log('Fetched banners:', data); // Debug log
        
        // Map the data properly to match our component's expectations
        const bannersWithDates = data.map((banner: any) => ({
          ...banner,
          id: banner._id, // ensure we use _id as id
          title: banner.title || '',
          description: banner.description || '',
          startDate: banner.startDate ? new Date(banner.startDate) : new Date(),
          endDate: banner.endDate ? new Date(banner.endDate) : new Date()
        }));
        setBanners(bannersWithDates);
      })
      .catch((error) => {
        console.error('Error fetching banners:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to load banners from server.",
          variant: "destructive"
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredBanners = banners.filter(banner => 
    banner.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    banner.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      
      // Create a preview URL
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
      
      // Update the newBanner state (not used for submission, just for tracking state)
      setNewBanner({ ...newBanner, image: fileUrl });
    }
  };
  
  // Reset the file input when the dialog closes
  useEffect(() => {
    if (!isCreateDialogOpen) {
      setSelectedFile(null);
      setPreviewUrl('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [isCreateDialogOpen]);
  
  const handleCreateBanner = () => {
    if (!newBanner.title || (!selectedFile && !newBanner.image)) {
      toast({
        title: "Validation Error",
        description: "Title and image are required",
        variant: "destructive"
      });
      return;
    }
    
    // Create form data for multipart submission
    const formData = new FormData();
    formData.append('title', newBanner.title);
    formData.append('description', newBanner.description);
    
    // If there's a selected file, append it to the form data
    if (selectedFile) {
      formData.append('image', selectedFile);
    } else if (newBanner.image && newBanner.image.startsWith('http')) {
      // If it's a URL (fallback)
      formData.append('image', newBanner.image);
    } else {
      toast({
        title: "Validation Error",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }
    
    if (newBanner.link) formData.append('link', newBanner.link);
    formData.append('isActive', String(newBanner.isActive));
    
    fetch(`${BACKEND_URL}/api/admin/banners`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to create banner');
        }
        return res.json();
      })
      .then((data) => {
        // Add the new banner to the list
        const newBannerWithId = {
          ...newBanner,
          id: data.banner._id,
          _id: data.banner._id,
          // Use the image path returned from the server, not the preview URL
          image: data.banner.image
        };
        setBanners([...banners, newBannerWithId]);
        setIsCreateDialogOpen(false);

        // Reset the form
        setNewBanner({
          title: '',
          description: '',
          image: '',
          link: '',
          isActive: true,
          startDate: new Date(),
          endDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
        });
        setSelectedFile(null);
        setPreviewUrl('');

        toast({
          title: "Success",
          description: "Banner created successfully"
        });
      })
      .catch((error) => {
        console.error('Error creating banner:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to create banner",
          variant: "destructive"
        });
      });
  };
  
  const handleDeleteBanner = () => {
    if (!selectedBanner) return;
    
    fetch(`${BACKEND_URL}/api/admin/banners/${selectedBanner.id || selectedBanner._id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to delete banner');
        }
        return res.json();
      })
      .then(() => {
        setBanners(banners.filter(banner => 
          (banner.id !== selectedBanner.id) && (banner._id !== selectedBanner._id)
        ));
        setIsDeleteDialogOpen(false);
        setSelectedBanner(null);
        
        toast({
          title: "Banner Deleted",
          description: "The banner has been deleted successfully"
        });
      })
      .catch((error) => {
        console.error('Error deleting banner:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to delete banner",
          variant: "destructive"
        });
      });
  };
  
  const toggleBannerStatus = (id: string) => {
    const banner = banners.find(b => b.id === id || b._id === id);
    if (!banner) return;
    
    fetch(`${BACKEND_URL}/api/admin/banners/${id}/activate`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to update banner status');
        }
        return res.json();
      })
      .then((data) => {
        // Update the banner in the local state
        setBanners(banners.map(b => 
          (b.id === id || b._id === id) ? { ...b, isActive: !b.isActive } : b
        ));
        
        toast({
          title: data.banner.isActive ? "Banner Activated" : "Banner Deactivated",
          description: `"${banner.title}" has been ${data.banner.isActive ? 'activated' : 'deactivated'} successfully.`
        });
      })
      .catch((error) => {
        console.error('Error updating banner status:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to update banner status",
          variant: "destructive"
        });
      });
  };
  
  // Helper function to get complete image URL
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '';
    // Always use backend URL for non-absolute paths
    return imagePath.startsWith('http') ? imagePath : `${BACKEND_URL}${imagePath}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Banner Management</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create New Banner
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Banner</DialogTitle>
              <DialogDescription>
                Add a new promotional banner to display on your application.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input
                  id="title"
                  placeholder="Banner Title"
                  className="col-span-3"
                  value={newBanner.title}
                  onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Banner Description"
                  className="col-span-3"
                  value={newBanner.description}
                  onChange={(e) => setNewBanner({ ...newBanner, description: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="image" className="text-right pt-2">
                  Banner Image
                </Label>
                <div className="col-span-3 space-y-3">
                  <div className="flex items-center gap-3">
                    <Input
                      id="image"
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      className="col-span-3"
                      onChange={handleFileChange}
                    />
                    <Button 
                      type="button" 
                      variant="outline"
                      size="icon"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {previewUrl && (
                    <div className="border rounded overflow-hidden mt-2" style={{ maxWidth: '300px' }}>
                      <img 
                        src={previewUrl} 
                        alt="Banner preview" 
                        className="w-full h-auto object-contain"
                        style={{ maxHeight: '150px' }}
                      />
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Upload an image file (JPG, PNG) for your banner. Recommended size: 1200×400 pixels.
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="link" className="text-right">
                  Link
                </Label>
                <Input
                  id="link"
                  placeholder="/page-url or https://external-url.com"
                  className="col-span-3"
                  value={newBanner.link}
                  onChange={(e) => setNewBanner({ ...newBanner, link: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="startDate" className="text-right">
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  className="col-span-3"
                  value={newBanner.startDate.toISOString().split('T')[0]}
                  onChange={(e) => setNewBanner({ 
                    ...newBanner, 
                    startDate: new Date(e.target.value) 
                  })}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="endDate" className="text-right">
                  End Date
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  className="col-span-3"
                  value={newBanner.endDate.toISOString().split('T')[0]}
                  onChange={(e) => setNewBanner({ 
                    ...newBanner, 
                    endDate: new Date(e.target.value) 
                  })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateBanner}>
                Create Banner
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Banners</CardTitle>
          <CardDescription>
            Manage promotional banners that appear in your application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="Search banners by title or description"
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading banners...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Banner</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBanners.length > 0 ? (
                  filteredBanners.map((banner) => (
                    <TableRow key={banner.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 w-16 h-10 bg-gray-100 rounded overflow-hidden">
                            <img
                              src={getImageUrl(banner.image)}
                              alt={banner.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = 'https://via.placeholder.com/150x80?text=Image+Not+Found';
                              }}
                            />
                          </div>
                          <div>
                            <p className="font-medium">{banner.title}</p>
                            <p className="text-xs text-gray-500 line-clamp-1">{banner.description}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">{banner.link}</code>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={banner.isActive ? "default" : "secondary"}
                          className={banner.isActive ? "bg-green-100 text-green-800" : ""}
                        >
                          {banner.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedBanner(banner);
                              setIsViewDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleBannerStatus(banner.id)}
                          >
                            {banner.isActive ? (
                              <ToggleRight className="h-4 w-4 text-green-600" />
                            ) : (
                              <ToggleLeft className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500"
                            onClick={() => {
                              setSelectedBanner(banner);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                      No banners found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Banner</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the "{selectedBanner?.title}" banner? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteBanner}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Banner Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Banner Details</DialogTitle>
            <DialogDescription>
              Complete information about the selected banner.
            </DialogDescription>
          </DialogHeader>
          {selectedBanner && (
            <div className="grid gap-4 py-4">
              <div className="flex flex-col items-center gap-4">
                <div className="w-full h-48 bg-gray-100 rounded overflow-hidden">
                  <img 
                    src={getImageUrl(selectedBanner.image)}
                    alt={selectedBanner.title || 'Banner'}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://via.placeholder.com/800x400?text=Image+Not+Found';
                    }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-medium">Title</Label>
                <div className="col-span-3">{selectedBanner.title || 'N/A'}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-medium">Description</Label>
                <div className="col-span-3">{selectedBanner.description || 'N/A'}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-medium">Link</Label>
                <div className="col-span-3">
                  <code className="bg-gray-100 px-2 py-1 rounded">{selectedBanner.link || 'N/A'}</code>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-medium">Status</Label>
                <div className="col-span-3">
                  <Badge
                    variant={selectedBanner.isActive ? "default" : "secondary"}
                    className={selectedBanner.isActive ? "bg-green-100 text-green-800" : ""}
                  >
                    {selectedBanner.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-medium">Created At</Label>
                <div className="col-span-3">
                  {selectedBanner.createdAt ? new Date(selectedBanner.createdAt).toLocaleString() : 'N/A'}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-medium">Last Updated</Label>
                <div className="col-span-3">
                  {selectedBanner.updatedAt ? new Date(selectedBanner.updatedAt).toLocaleString() : 'N/A'}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BannerManagement;
