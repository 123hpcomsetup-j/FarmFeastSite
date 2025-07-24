import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, getAdminQueryFn } from "@/lib/queryClient";
import { insertGalleryImageSchema } from "@shared/schema";
import { z } from "zod";
import { Plus, Edit, Trash2, RefreshCw, Upload, Image as ImageIcon } from "lucide-react";

type GalleryImageForm = z.infer<typeof insertGalleryImageSchema>;

export default function GalleryManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingImage, setEditingImage] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [inputMode, setInputMode] = useState<'upload' | 'url'>('upload');

  const { data: images, isLoading } = useQuery({
    queryKey: ["/api/admin/gallery"],
    queryFn: getAdminQueryFn,
  });

  const form = useForm<GalleryImageForm>({
    resolver: zodResolver(insertGalleryImageSchema.omit({ filename: true, uploadedAt: true })),
    defaultValues: {
      alt: "",
      category: "exterior",
      url: "",
      source: "upload",
      order: 0,
      active: true,
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/admin/gallery", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gallery"] });
      toast({ title: "Success", description: "Image uploaded successfully" });
      setShowForm(false);
      setSelectedFile(null);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: GalleryImageForm }) => {
      return apiRequest("PATCH", `/api/admin/gallery/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gallery"] });
      toast({ title: "Success", description: "Image updated successfully" });
      setEditingImage(null);
      setShowForm(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update image",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/admin/gallery/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gallery"] });
      toast({ title: "Success", description: "Image deleted successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete image",
        variant: "destructive",
      });
    },
  });

  const urlMutation = useMutation({
    mutationFn: async (data: GalleryImageForm) => {
      return apiRequest("POST", "/api/admin/gallery/url", { ...data, source: "url" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gallery"] });
      toast({ title: "Success", description: "Image added successfully" });
      setShowForm(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add image",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: GalleryImageForm) => {
    if (editingImage) {
      updateMutation.mutate({ id: editingImage.id, data });
    } else if (inputMode === 'url') {
      urlMutation.mutate(data);
    } else if (selectedFile) {
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("alt", data.alt);
      formData.append("category", data.category);
      formData.append("order", String(data.order || 0));
      uploadMutation.mutate(formData);
    } else {
      toast({
        title: "Error",
        description: inputMode === 'upload' ? "Please select an image to upload" : "Please provide an image URL",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (image: any) => {
    setEditingImage(image);
    setInputMode(image.source || 'upload');
    form.reset({
      alt: image.alt,
      category: image.category,
      url: image.url,
      source: image.source || 'upload',
      order: image.order || 0,
      active: image.active !== undefined ? image.active : true,
    });
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this image?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading gallery...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gallery Management</h2>
          <p className="text-gray-600">Upload and manage farmhouse images</p>
        </div>
        <Button 
          onClick={() => {
            setEditingImage(null);
            setSelectedFile(null);
            form.reset();
            setShowForm(!showForm);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Image
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingImage ? "Edit Image" : "Add New Image"}</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {!editingImage && (
                  <div className="flex items-center gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                    <span className="font-medium">Image Source:</span>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={inputMode === 'upload' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          setInputMode('upload');
                          form.setValue('source', 'upload');
                        }}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload File
                      </Button>
                      <Button
                        type="button"
                        variant={inputMode === 'url' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          setInputMode('url');
                          form.setValue('source', 'url');
                        }}
                      >
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Image URL
                      </Button>
                    </div>
                  </div>
                )}

                {!editingImage && inputMode === 'upload' && (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-gray-900">
                            Choose image to upload
                          </span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                          />
                        </label>
                        {selectedFile && (
                          <p className="mt-2 text-sm text-green-600">
                            Selected: {selectedFile.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {(inputMode === 'url' || editingImage?.source === 'url') && (
                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/image.jpg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="alt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alt Text</FormLabel>
                        <FormControl>
                          <Input placeholder="Describe the image" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="exterior">Exterior</SelectItem>
                            <SelectItem value="interior">Interior</SelectItem>
                            <SelectItem value="rooms">Rooms</SelectItem>
                            <SelectItem value="amenities">Amenities</SelectItem>
                            <SelectItem value="activities">Activities</SelectItem>
                            <SelectItem value="food">Food</SelectItem>
                            <SelectItem value="events">Events</SelectItem>
                            <SelectItem value="nature">Nature</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="order"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Order</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0" 
                            value={field.value || 0}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Active</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Show this image in gallery
                          </div>
                        </div>
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value || false}
                            onChange={field.onChange}
                            className="h-4 w-4"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={uploadMutation.isPending || updateMutation.isPending || urlMutation.isPending}>
                    {editingImage ? "Update Image" : (inputMode === 'upload' ? "Upload Image" : "Add Image")}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowForm(false);
                      setEditingImage(null);
                      setSelectedFile(null);
                      setInputMode('upload');
                      form.reset();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {(images || []).map((image: any) => (
          <Card key={image.id} className="overflow-hidden">
            <div className="aspect-square relative">
              <img
                src={image.url}
                alt={image.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder-image.svg";
                }}
              />
              <div className="absolute top-2 right-2 flex gap-1">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleEdit(image)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(image.id)}
                  className="h-8 w-8 p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-1 truncate">{image.title}</h3>
              <p className="text-xs text-gray-500 mb-2 capitalize">{image.category}</p>
              <p className="text-xs text-gray-600 line-clamp-2">{image.description}</p>
            </CardContent>
          </Card>
        )) || (
          <div className="col-span-full text-center py-12">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No images</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by uploading your first image.</p>
          </div>
        )}
      </div>
    </div>
  );
}