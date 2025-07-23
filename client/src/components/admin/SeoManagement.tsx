import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertSeoSettingsSchema } from "@shared/schema";
import { z } from "zod";
import { Plus, Edit, RefreshCw, Search, CheckCircle, AlertCircle, XCircle } from "lucide-react";

type SeoForm = z.infer<typeof insertSeoSettingsSchema>;

export default function SeoManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingPage, setEditingPage] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: seoPages, isLoading } = useQuery({
    queryKey: ["/api/admin/seo"],
    meta: {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
      },
    },
  });

  const form = useForm<SeoForm>({
    resolver: zodResolver(insertSeoSettingsSchema),
    defaultValues: {
      page: "",
      title: "",
      description: "",
      keywords: "",
      ogTitle: "",
      ogDescription: "",
      ogImage: "",
      canonicalUrl: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: SeoForm) => {
      return apiRequest("/api/admin/seo", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/seo"] });
      toast({ title: "Success", description: "SEO settings created successfully" });
      setShowForm(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create SEO settings",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: SeoForm }) => {
      return apiRequest(`/api/admin/seo/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/seo"] });
      toast({ title: "Success", description: "SEO settings updated successfully" });
      setEditingPage(null);
      setShowForm(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update SEO settings",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SeoForm) => {
    if (editingPage) {
      updateMutation.mutate({ id: editingPage.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (page: any) => {
    setEditingPage(page);
    form.reset({
      page: page.page,
      title: page.title,
      description: page.description,
      keywords: page.keywords,
      ogTitle: page.ogTitle,
      ogDescription: page.ogDescription,
      ogImage: page.ogImage,
      canonicalUrl: page.canonicalUrl,
    });
    setShowForm(true);
  };

  const getSeoScore = (page: any) => {
    let score = 0;
    const checks = [
      { condition: page.title && page.title.length >= 30 && page.title.length <= 60, points: 20 },
      { condition: page.description && page.description.length >= 120 && page.description.length <= 160, points: 20 },
      { condition: page.keywords && page.keywords.split(',').length >= 3, points: 15 },
      { condition: page.ogTitle && page.ogTitle.length > 0, points: 15 },
      { condition: page.ogDescription && page.ogDescription.length > 0, points: 15 },
      { condition: page.ogImage && page.ogImage.length > 0, points: 10 },
      { condition: page.canonicalUrl && page.canonicalUrl.length > 0, points: 5 },
    ];

    checks.forEach(check => {
      if (check.condition) score += check.points;
    });

    return score;
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-100 text-green-800">Excellent ({score}%)</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-100 text-yellow-800">Good ({score}%)</Badge>;
    if (score >= 40) return <Badge className="bg-orange-100 text-orange-800">Fair ({score}%)</Badge>;
    return <Badge className="bg-red-100 text-red-800">Poor ({score}%)</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading SEO settings...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">SEO Management</h2>
          <p className="text-gray-600">Optimize search engine visibility for each page</p>
        </div>
        <Button 
          onClick={() => {
            setEditingPage(null);
            form.reset();
            setShowForm(!showForm);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Page SEO
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingPage ? "Edit SEO Settings" : "Add Page SEO Settings"}</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="page"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Page</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a page" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="home">Home</SelectItem>
                          <SelectItem value="services">Services</SelectItem>
                          <SelectItem value="gallery">Gallery</SelectItem>
                          <SelectItem value="booking">Booking</SelectItem>
                          <SelectItem value="about">About</SelectItem>
                          <SelectItem value="contact">Contact</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Page Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Optimal length: 30-60 characters" {...field} />
                        </FormControl>
                        <FormDescription>
                          Current length: {field.value?.length || 0} characters
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Optimal length: 120-160 characters" {...field} />
                        </FormControl>
                        <FormDescription>
                          Current length: {field.value?.length || 0} characters
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="keywords"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Keywords</FormLabel>
                      <FormControl>
                        <Input placeholder="farmhouse, booking, vacation, rural getaway" {...field} />
                      </FormControl>
                      <FormDescription>
                        Separate keywords with commas
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-4">Open Graph (Social Media)</h3>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="ogTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>OG Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Title for social media sharing" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="ogDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>OG Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Description for social media sharing" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="ogImage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>OG Image URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/image.jpg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="canonicalUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Canonical URL (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://farmfeastfarmhouse.com/page" {...field} />
                      </FormControl>
                      <FormDescription>
                        Helps prevent duplicate content issues
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingPage ? "Update SEO Settings" : "Create SEO Settings"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowForm(false);
                      setEditingPage(null);
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

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Page</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>SEO Score</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {seoPages?.map((page: any) => {
                const score = getSeoScore(page);
                return (
                  <TableRow key={page.id}>
                    <TableCell className="font-medium capitalize">{page.page}</TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={page.title}>
                        {page.title || <span className="text-gray-400">No title</span>}
                      </div>
                      <div className="text-xs text-gray-500">
                        {page.title?.length || 0} characters
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={page.description}>
                        {page.description || <span className="text-gray-400">No description</span>}
                      </div>
                      <div className="text-xs text-gray-500">
                        {page.description?.length || 0} characters
                      </div>
                    </TableCell>
                    <TableCell>{getScoreBadge(score)}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(page)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              }) || (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No SEO settings found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}