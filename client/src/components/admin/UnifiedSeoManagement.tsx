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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertSeoSettingsSchema } from "@shared/schema";
import { z } from "zod";
import { Plus, Edit, RefreshCw, Search, CheckCircle, AlertCircle, XCircle, Star } from "lucide-react";

type SeoForm = z.infer<typeof insertSeoSettingsSchema>;

export default function UnifiedSeoManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingPage, setEditingPage] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: seoPages = [], isLoading } = useQuery({
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
      schemaType: "WebPage",
      schemaData: {},
      priority: 50,
      changeFreq: "monthly",
      noindex: false,
      nofollow: false,
      reviewCount: 0,
      averageRating: "0.0",
      businessName: "Farm Feast Farm House",
      ratingScale: "5",
      reviewsEnabled: true,
      showInSnippets: true,
      reviewTitle: "",
      reviewDescription: "",
      reviewKeywords: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: SeoForm) => {
      return apiRequest("POST", "/api/admin/seo", data);
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/seo"] });
      queryClient.invalidateQueries({ queryKey: ["/api/seo", data.page] });
      queryClient.invalidateQueries({ queryKey: ["/api/seo"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reviews/seo"] });
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
      return apiRequest("PUT", `/api/admin/seo/${id}`, data);
    },
    onSuccess: (updatedData: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/seo"] });
      queryClient.invalidateQueries({ queryKey: ["/api/seo", updatedData.page] });
      queryClient.invalidateQueries({ queryKey: ["/api/seo"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reviews/seo"] });
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
      schemaType: page.schemaType || "WebPage",
      schemaData: page.schemaData || {},
      priority: page.priority || 50,
      changeFreq: page.changeFreq || "monthly",
      noindex: page.noindex || false,
      nofollow: page.nofollow || false,
      reviewCount: page.reviewCount || 0,
      averageRating: page.averageRating || "0.0",
      businessName: page.businessName || "Farm Feast Farm House",
      ratingScale: page.ratingScale || "5",
      reviewsEnabled: page.reviewsEnabled ?? true,
      showInSnippets: page.showInSnippets ?? true,
      reviewTitle: page.reviewTitle || "",
      reviewDescription: page.reviewDescription || "",
      reviewKeywords: page.reviewKeywords || "",
    });
    setShowForm(true);
  };

  const getSeoScore = (page: any) => {
    let score = 0;
    const checks = [
      { 
        condition: page.title && page.title.length >= 30 && page.title.length <= 60, 
        points: 20,
        name: "Title length (30-60 chars)"
      },
      { 
        condition: page.description && page.description.length >= 120 && page.description.length <= 160, 
        points: 20,
        name: "Meta description (120-160 chars)"
      },
      { 
        condition: page.keywords && page.keywords.split(',').filter((k: string) => k.trim()).length >= 3, 
        points: 15,
        name: "Keywords (min 3)"
      },
      { 
        condition: page.ogTitle && page.ogTitle.length > 0 && page.ogTitle.length <= 60, 
        points: 10,
        name: "Open Graph title"
      },
      { 
        condition: page.ogDescription && page.ogDescription.length > 0 && page.ogDescription.length <= 160, 
        points: 10,
        name: "Open Graph description"
      },
      { 
        condition: page.ogImage && page.ogImage.length > 0 && page.ogImage.startsWith('http'), 
        points: 10,
        name: "Open Graph image URL"
      },
      { 
        condition: page.reviewsEnabled && page.reviewCount > 0 && parseFloat(page.averageRating || "0") > 0, 
        points: 10,
        name: "Review data for rich snippets"
      },
      { 
        condition: page.canonicalUrl && page.canonicalUrl.length > 0 && page.canonicalUrl.startsWith('http'), 
        points: 5,
        name: "Canonical URL"
      },
    ];

    checks.forEach(check => {
      if (check.condition) score += check.points;
    });

    return { score, checks };
  };

  const getScoreBadge = (scoreData: { score: number; checks: any[] }) => {
    const { score } = scoreData;
    if (score >= 85) return <Badge className="bg-green-100 text-green-800">Excellent ({score}%)</Badge>;
    if (score >= 70) return <Badge className="bg-blue-100 text-blue-800">Good ({score}%)</Badge>;
    if (score >= 50) return <Badge className="bg-yellow-100 text-yellow-800">Fair ({score}%)</Badge>;
    if (score >= 30) return <Badge className="bg-orange-100 text-orange-800">Needs Work ({score}%)</Badge>;
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
          <h2 className="text-2xl font-bold text-gray-900">Unified SEO & Review Management</h2>
          <p className="text-gray-600">Manage SEO settings and review snippets for each page</p>
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

      {/* SEO Overview Dashboard */}
      {seoPages && seoPages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>SEO Overview Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {seoPages.map((page: any) => {
                const scoreData = getSeoScore(page);
                return (
                  <div key={page.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold capitalize">{page.page}</h3>
                      {getScoreBadge(scoreData)}
                    </div>
                    
                    <div className="space-y-2 text-sm mb-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className={`h-4 w-4 ${page.title ? 'text-green-500' : 'text-gray-300'}`} />
                        <span className={page.title ? 'text-gray-700' : 'text-gray-400'}>SEO Title</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className={`h-4 w-4 ${page.description ? 'text-green-500' : 'text-gray-300'}`} />
                        <span className={page.description ? 'text-gray-700' : 'text-gray-400'}>Description</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className={`h-4 w-4 ${page.reviewsEnabled && page.reviewCount > 0 ? 'text-yellow-500' : 'text-gray-300'}`} />
                        <span className={page.reviewsEnabled && page.reviewCount > 0 ? 'text-gray-700' : 'text-gray-400'}>
                          Reviews ({page.reviewCount || 0})
                        </span>
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(page)}
                      className="w-full"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit SEO & Reviews
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingPage ? "Edit SEO & Review Settings" : "Add Page SEO & Review Settings"}</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="basic">Basic SEO</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews & Snippets</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4">
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

                    <FormField
                      control={form.control}
                      name="keywords"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Keywords</FormLabel>
                          <FormControl>
                            <Input placeholder="farmhouse, booking, vacation, rural getaway" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormDescription>
                            Separate keywords with commas
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  <TabsContent value="reviews" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="businessName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Farm Feast Farm House" value={field.value || ""} />
                            </FormControl>
                            <FormDescription>Name shown in search results</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="reviewCount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Total Reviews</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="number" 
                                min="0"
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormDescription>Number of customer reviews</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="averageRating"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Average Rating</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="number" 
                                step="0.1"
                                min="0"
                                max="5"
                                onChange={(e) => field.onChange(e.target.value || "0.0")}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormDescription>Average rating (0-5 stars)</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="ratingScale"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rating Scale</FormLabel>
                            <FormControl>
                              <Select 
                                onValueChange={(value) => field.onChange(value)} 
                                value={field.value?.toString()}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select scale" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="5">5 Stars</SelectItem>
                                  <SelectItem value="10">10 Points</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormDescription>Maximum rating scale</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="reviewTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dynamic Review Title</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Customer Reviews for {businessName}" value={field.value || ""} />
                            </FormControl>
                            <FormDescription>Custom title when reviews are displayed</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="reviewDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dynamic Review Description</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="Read what our customers say about their experience..." value={field.value || ""} />
                            </FormControl>
                            <FormDescription>Description for review-focused pages</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="reviewKeywords"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Review Keywords</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="customer reviews, testimonials, ratings, feedback" value={field.value || ""} />
                            </FormControl>
                            <FormDescription>Keywords specific to reviews and testimonials</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex items-center space-x-4">
                      <FormField
                        control={form.control}
                        name="reviewsEnabled"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value || false}
                                onChange={field.onChange}
                                className="rounded"
                              />
                            </FormControl>
                            <FormLabel>Enable Reviews</FormLabel>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="showInSnippets"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value || false}
                                onChange={field.onChange}
                                className="rounded"
                              />
                            </FormControl>
                            <FormLabel>Show in Search Results</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Live Preview */}
                    <div className="border rounded p-4 bg-gray-50">
                      <h4 className="font-semibold mb-2">Search Result Preview</h4>
                      <div className="text-sm">
                        <div className="text-blue-600 text-lg">{form.watch("businessName") || "Your Business"}</div>
                        <div className="text-gray-600">★★★★☆ {form.watch("averageRating") || "0.0"} ({form.watch("reviewCount") || 0} reviews)</div>
                        <div className="text-gray-700 mt-1">{form.watch("description") || "Your page description..."}</div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="advanced" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="ogTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Open Graph Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Title for social media sharing" {...field} value={field.value || ""} />
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
                            <FormLabel>Open Graph Description</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Description for social media" {...field} value={field.value || ""} />
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
                            <FormLabel>Open Graph Image URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com/image.jpg" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="canonicalUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Canonical URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://farmfeastfarmhouse.com/page" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormDescription>Prevents duplicate content issues</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex gap-2">
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingPage ? "Update SEO & Review Settings" : "Create SEO & Review Settings"}
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

      {/* SEO Settings Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Page</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Reviews</TableHead>
                <TableHead>SEO Score</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {seoPages?.map((page: any) => {
                const scoreData = getSeoScore(page);
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
                    <TableCell>
                      <div className="text-sm">
                        {page.reviewsEnabled ? (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span>{page.averageRating || "0.0"}</span>
                            <span className="text-gray-500">({page.reviewCount || 0})</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">Disabled</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getScoreBadge(scoreData)}
                      <div className="text-xs text-gray-500 mt-1">
                        {scoreData.checks.filter(c => c.condition).length}/{scoreData.checks.length} checks
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(page)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}