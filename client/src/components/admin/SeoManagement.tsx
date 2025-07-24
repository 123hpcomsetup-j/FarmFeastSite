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
import { insertSeoSettingsSchema, insertReviewSettingsSchema } from "@shared/schema";
import { z } from "zod";
import { Plus, Edit, RefreshCw, Search, CheckCircle, AlertCircle, XCircle } from "lucide-react";

type SeoForm = z.infer<typeof insertSeoSettingsSchema>;
type ReviewForm = z.infer<typeof insertReviewSettingsSchema>;

export default function SeoManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingPage, setEditingPage] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'seo' | 'reviews'>('seo');

  const { data: seoPages, isLoading } = useQuery({
    queryKey: ["/api/admin/seo"],
    meta: {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
      },
    },
  });

  const { data: reviewSettings, isLoading: reviewLoading } = useQuery({
    queryKey: ["/api/admin/reviews/settings"],
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

  const reviewForm = useForm<ReviewForm>({
    resolver: zodResolver(insertReviewSettingsSchema),
    defaultValues: {
      reviewCount: 0,
      averageRating: 0,
      businessName: "",
      ratingScale: 5,
      reviewsEnabled: true,
      showInSnippets: true,
    },
  });

  const updateReviewMutation = useMutation({
    mutationFn: async (data: ReviewForm) => {
      return apiRequest("PUT", "/api/admin/reviews/settings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reviews/seo"] });
      toast({ title: "Success", description: "Review settings updated successfully" });
      setShowReviewForm(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update review settings",
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
    });
    setShowForm(true);
  };

  const getSeoScore = (page: any) => {
    let score = 0;
    const checks = [
      { 
        condition: page.title && page.title.length >= 30 && page.title.length <= 60, 
        points: 25,
        name: "Title length (30-60 chars)"
      },
      { 
        condition: page.description && page.description.length >= 120 && page.description.length <= 160, 
        points: 25,
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

  const getSeoRecommendations = (scoreData: { score: number; checks: any[] }) => {
    const failedChecks = scoreData.checks.filter(check => !check.condition);
    if (failedChecks.length === 0) return [];
    
    return failedChecks.map(check => ({
      issue: check.name,
      points: check.points,
      priority: check.points >= 20 ? 'high' : check.points >= 10 ? 'medium' : 'low'
    }));
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
          <h2 className="text-2xl font-bold text-gray-900">SEO & Review Management</h2>
          <p className="text-gray-600">Optimize search visibility and manage review snippets</p>
          <div className="flex gap-2 mt-3">
            <Button 
              variant={activeTab === 'seo' ? 'default' : 'outline'}
              onClick={() => setActiveTab('seo')}
              size="sm"
              className="flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              SEO Settings
            </Button>
            <Button 
              variant={activeTab === 'reviews' ? 'default' : 'outline'}
              onClick={() => setActiveTab('reviews')}
              size="sm"
              className="flex items-center gap-2"
            >
              ⭐ Review Snippets
            </Button>
          </div>
        </div>
        {activeTab === 'seo' && (
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
        )}
        
        {activeTab === 'reviews' && (
          <Button 
            onClick={() => {
              if (reviewSettings) {
                reviewForm.reset({
                  reviewCount: reviewSettings.reviewCount || 0,
                  averageRating: reviewSettings.averageRating || 0,
                  businessName: reviewSettings.businessName || "",
                  ratingScale: reviewSettings.ratingScale || 5,
                  reviewsEnabled: reviewSettings.reviewsEnabled ?? true,
                  showInSnippets: reviewSettings.showInSnippets ?? true,
                });
              }
              setShowReviewForm(!showReviewForm);
            }}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit Review Settings
          </Button>
        )}
      </div>

      {/* Review Settings Tab */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          {reviewSettings && !showReviewForm && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  ⭐ Review Display Settings
                  <Badge variant={reviewSettings.showInSnippets ? "default" : "secondary"}>
                    {reviewSettings.showInSnippets ? "Enabled" : "Disabled"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900">Business Information</h3>
                    <div className="text-sm text-gray-600">
                      <p><strong>Business Name:</strong> {reviewSettings.businessName || "Not set"}</p>
                      <p><strong>Review Count:</strong> {reviewSettings.reviewCount || 0} reviews</p>
                      <p><strong>Average Rating:</strong> {reviewSettings.averageRating || 0}/{reviewSettings.ratingScale || 5} stars</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900">Display Settings</h3>
                    <div className="text-sm text-gray-600">
                      <p><strong>Reviews Enabled:</strong> 
                        <Badge variant={reviewSettings.reviewsEnabled ? "default" : "secondary"} className="ml-2">
                          {reviewSettings.reviewsEnabled ? "Yes" : "No"}
                        </Badge>
                      </p>
                      <p><strong>Show in Search:</strong>
                        <Badge variant={reviewSettings.showInSnippets ? "default" : "secondary"} className="ml-2">
                          {reviewSettings.showInSnippets ? "Yes" : "No"}
                        </Badge>
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900">Search Preview</h3>
                    <div className="border rounded p-3 bg-gray-50 text-sm">
                      <div className="text-blue-600 text-lg">{reviewSettings.businessName || "Your Business"}</div>
                      <div className="text-gray-600">★★★★☆ {reviewSettings.averageRating || 0} ({reviewSettings.reviewCount || 0} reviews)</div>
                      <div className="text-gray-700 mt-1">Premium farmhouse rental with luxury amenities...</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Review Settings Form */}
          {showReviewForm && (
            <Card>
              <CardHeader>
                <CardTitle>Edit Review Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...reviewForm}>
                  <form onSubmit={reviewForm.handleSubmit((data) => updateReviewMutation.mutate(data))} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={reviewForm.control}
                        name="businessName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Farm Feast Farm House" />
                            </FormControl>
                            <FormDescription>Name displayed in search results</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={reviewForm.control}
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
                            <FormDescription>Total number of reviews</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={reviewForm.control}
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
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormDescription>Average rating (0-5 stars)</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={reviewForm.control}
                        name="ratingScale"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rating Scale</FormLabel>
                            <FormControl>
                              <Select 
                                onValueChange={(value) => field.onChange(parseInt(value))} 
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

                    <div className="flex items-center space-x-4">
                      <FormField
                        control={reviewForm.control}
                        name="reviewsEnabled"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="rounded"
                              />
                            </FormControl>
                            <FormLabel>Enable Reviews</FormLabel>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={reviewForm.control}
                        name="showInSnippets"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="rounded"
                              />
                            </FormControl>
                            <FormLabel>Show in Search Results</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        type="submit" 
                        disabled={updateReviewMutation.isPending}
                        className="flex items-center gap-2"
                      >
                        {updateReviewMutation.isPending && <RefreshCw className="h-4 w-4 animate-spin" />}
                        Update Review Settings
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setShowReviewForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* SEO Overview Dashboard */}
      {activeTab === 'seo' && seoPages && seoPages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>SEO Overview Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {seoPages.map((page: any) => {
                const scoreData = getSeoScore(page);
                const recommendations = getSeoRecommendations(scoreData);
                return (
                  <div key={page.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold capitalize">{page.page}</h3>
                      {getScoreBadge(scoreData)}
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className={`h-4 w-4 ${page.title ? 'text-green-500' : 'text-gray-300'}`} />
                        <span className={page.title ? 'text-gray-700' : 'text-gray-400'}>Title</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className={`h-4 w-4 ${page.description ? 'text-green-500' : 'text-gray-300'}`} />
                        <span className={page.description ? 'text-gray-700' : 'text-gray-400'}>Description</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className={`h-4 w-4 ${page.keywords ? 'text-green-500' : 'text-gray-300'}`} />
                        <span className={page.keywords ? 'text-gray-700' : 'text-gray-400'}>Keywords</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className={`h-4 w-4 ${page.ogImage ? 'text-green-500' : 'text-gray-300'}`} />
                        <span className={page.ogImage ? 'text-gray-700' : 'text-gray-400'}>OG Image</span>
                      </div>
                      {recommendations.length > 0 && (
                        <div className="mt-3 pt-2 border-t">
                          <div className="text-xs font-medium text-red-600">
                            {recommendations.length} issue{recommendations.length > 1 ? 's' : ''}
                          </div>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3"
                      onClick={() => handleEdit(page)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit SEO
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'seo' && showForm && (
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
                const scoreData = getSeoScore(page);
                const recommendations = getSeoRecommendations(scoreData);
                return (
                  <TableRow key={page.id}>
                    <TableCell className="font-medium capitalize">{page.page}</TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={page.title}>
                        {page.title || <span className="text-gray-400">No title</span>}
                      </div>
                      <div className="text-xs text-gray-500">
                        {page.title?.length || 0} characters
                        {page.title && (
                          <span className={page.title.length >= 30 && page.title.length <= 60 ? "text-green-600" : "text-red-600"}>
                            {page.title.length < 30 ? " (too short)" : page.title.length > 60 ? " (too long)" : " (optimal)"}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={page.description}>
                        {page.description || <span className="text-gray-400">No description</span>}
                      </div>
                      <div className="text-xs text-gray-500">
                        {page.description?.length || 0} characters
                        {page.description && (
                          <span className={page.description.length >= 120 && page.description.length <= 160 ? "text-green-600" : "text-red-600"}>
                            {page.description.length < 120 ? " (too short)" : page.description.length > 160 ? " (too long)" : " (optimal)"}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        {getScoreBadge(scoreData)}
                        {recommendations.length > 0 && (
                          <div className="text-xs">
                            <div className="font-medium text-gray-700">Issues to fix:</div>
                            {recommendations.slice(0, 2).map((rec, idx) => (
                              <div key={idx} className={`${rec.priority === 'high' ? 'text-red-600' : rec.priority === 'medium' ? 'text-orange-600' : 'text-yellow-600'}`}>
                                • {rec.issue}
                              </div>
                            ))}
                            {recommendations.length > 2 && (
                              <div className="text-gray-500">+{recommendations.length - 2} more</div>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
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