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
import { apiRequest } from "@/lib/queryClient";
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

  const { data: images, isLoading } = useQuery({
    queryKey: ["/api/admin/gallery"],
    meta: {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
      },
    },
  });

  const form = useForm<GalleryImageForm>({
    resolver: zodResolver(insertGalleryImageSchema),
    defaultValues: {
      title: "",
      description: "",
      url: "",
      category: "exterior",
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
      return apiRequest(`/api/admin/gallery/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });
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
      return apiRequest(`/api/admin/gallery/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });
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

  const onSubmit = (data: GalleryImageForm) => {
    if (editingImage) {
      updateMutation.mutate({ id: editingImage.id, data });
    } else if (selectedFile) {
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("category", data.category);
      uploadMutation.mutate(formData);
    } else {
      toast({
        title: "Error",
        description: "Please select an image to upload",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (image: any) => {
    setEditingImage(image);
    form.reset({
      title: image.title,
      description: image.description,
      url: image.url,
      category: image.category,
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
            <CardTitle>{editingImage ? "Edit Image" : "Upload New Image"}</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {!editingImage && (
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter image title" {...field} />
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

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter image description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <Button type="submit" disabled={uploadMutation.isPending || updateMutation.isPending}>
                    {editingImage ? "Update Image" : "Upload Image"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowForm(false);
                      setEditingImage(null);
                      setSelectedFile(null);
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
        {images?.map((image: any) => (
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