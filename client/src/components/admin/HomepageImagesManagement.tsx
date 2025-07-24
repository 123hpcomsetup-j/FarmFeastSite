import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Edit, Image as ImageIcon, Filter, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { HomepageImage } from "@shared/schema";

const homepageImageSchema = z.object({
  section: z.string().min(1, "Section is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  imageUrl: z.string().url("Valid image URL is required"),
  altText: z.string().optional(),
  order: z.number().min(0, "Order must be positive").default(0),
  active: z.boolean().default(true),
});

type HomepageImageFormData = z.infer<typeof homepageImageSchema>;

const IMAGE_SECTIONS = [
  { value: "hero", label: "Hero Section" },
  { value: "amenities", label: "Amenities Section" },
  { value: "gallery", label: "Gallery Section" },
  { value: "services", label: "Services Section" },
  { value: "contact", label: "Contact Section" },
  { value: "about", label: "About Section" },
];

export default function HomepageImagesManagement() {
  const [editingImage, setEditingImage] = useState<HomepageImage | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sectionFilter, setSectionFilter] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: homepageImages = [], isLoading } = useQuery<HomepageImage[]>({
    queryKey: ["/api/homepage-images"],
  });

  const form = useForm<HomepageImageFormData>({
    resolver: zodResolver(homepageImageSchema),
    defaultValues: {
      section: "",
      title: "",
      description: "",
      imageUrl: "",
      altText: "",
      order: 0,
      active: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: HomepageImageFormData) => {
      return await apiRequest("POST", "/api/homepage-images", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/homepage-images"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Homepage image created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create homepage image",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<HomepageImageFormData> }) => {
      return await apiRequest("PUT", `/api/homepage-images/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/homepage-images"] });
      setEditingImage(null);
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Homepage image updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update homepage image",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/homepage-images/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/homepage-images"] });
      toast({
        title: "Success",
        description: "Homepage image deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete homepage image",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: HomepageImageFormData) => {
    if (editingImage) {
      updateMutation.mutate({ id: editingImage.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (image: HomepageImage) => {
    setEditingImage(image);
    form.reset({
      section: image.section,
      title: image.title,
      description: image.description || "",
      imageUrl: image.imageUrl,
      altText: image.altText || "",
      order: image.order,
      active: image.active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this homepage image?")) {
      deleteMutation.mutate(id);
    }
  };

  const filteredImages = homepageImages.filter(
    (image) => sectionFilter === "all" || image.section === sectionFilter
  );

  const groupedImages = filteredImages.reduce((acc, image) => {
    if (!acc[image.section]) {
      acc[image.section] = [];
    }
    acc[image.section].push(image);
    return acc;
  }, {} as Record<string, HomepageImage[]>);

  if (isLoading) {
    return <div className="text-center py-8">Loading homepage images...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Homepage Images</h2>
          <p className="text-gray-600">Manage images displayed on the homepage sections</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingImage(null);
              form.reset();
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Image
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingImage ? "Edit Homepage Image" : "Add New Homepage Image"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="section"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Section</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select section" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {IMAGE_SECTIONS.map((section) => (
                              <SelectItem key={section.value} value={section.value}>
                                {section.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="order"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Order</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Image title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://example.com/image.jpg" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="altText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alt Text</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Image description for accessibility" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Optional description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Display this image on the homepage
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {editingImage ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter */}
      <div className="flex items-center space-x-4">
        <Filter className="w-4 h-4" />
        <Select value={sectionFilter} onValueChange={setSectionFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sections</SelectItem>
            {IMAGE_SECTIONS.map((section) => (
              <SelectItem key={section.value} value={section.value}>
                {section.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Images by Section */}
      <div className="space-y-8">
        {Object.entries(groupedImages).map(([section, images]) => (
          <div key={section} className="space-y-4">
            <h3 className="text-lg font-semibold capitalize flex items-center">
              {IMAGE_SECTIONS.find(s => s.value === section)?.label || section}
              <Badge className="ml-2" variant="secondary">
                {images.length} image{images.length !== 1 ? 's' : ''}
              </Badge>
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {images
                .sort((a, b) => a.order - b.order)
                .map((image) => (
                  <Card key={image.id} className="overflow-hidden">
                    <div className="aspect-video relative">
                      <img
                        src={image.imageUrl}
                        alt={image.altText || image.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/api/placeholder/400/200";
                        }}
                      />
                      <div className="absolute top-2 right-2 flex space-x-1">
                        {!image.active && (
                          <Badge variant="secondary" className="text-xs">
                            Inactive
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          #{image.order}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <h4 className="font-medium truncate">{image.title}</h4>
                        {image.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {image.description}
                          </p>
                        )}
                        <div className="flex justify-between items-center pt-2">
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(image)}
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(image.imageUrl, '_blank')}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(image.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </div>

      {filteredImages.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No homepage images</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding your first homepage image.
          </p>
        </div>
      )}
    </div>
  );
}