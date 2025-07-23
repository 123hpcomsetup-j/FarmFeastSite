import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Star, TrendingUp, Eye, Code, Save } from "lucide-react";
import type { ReviewSettings } from "@shared/schema";

interface ReviewFormData {
  reviewCount: number;
  averageRating: string;
  businessName: string;
  ratingScale: string;
  reviewsEnabled: boolean;
  showInSnippets: boolean;
}

export default function ReviewsManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<ReviewFormData>({
    reviewCount: 0,
    averageRating: "0.0",
    businessName: "Farm Feast Farm House",
    ratingScale: "5",
    reviewsEnabled: true,
    showInSnippets: true,
  });

  // Fetch review settings
  const { data: reviewSettings, isLoading } = useQuery<ReviewSettings>({
    queryKey: ["/api/admin/reviews"],
  });

  // Update form when data loads
  useEffect(() => {
    if (reviewSettings) {
      setFormData({
        reviewCount: reviewSettings.reviewCount || 0,
        averageRating: reviewSettings.averageRating || "0.0",
        businessName: reviewSettings.businessName || "Farm Feast Farm House",
        ratingScale: reviewSettings.ratingScale || "5",
        reviewsEnabled: reviewSettings.reviewsEnabled ?? true,
        showInSnippets: reviewSettings.showInSnippets ?? true,
      });
    }
  }, [reviewSettings]);

  // Update review settings mutation
  const updateReviewsMutation = useMutation({
    mutationFn: async (data: ReviewFormData) => {
      const response = await apiRequest("POST", "/api/admin/reviews", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Review settings updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update review settings",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate rating
    const rating = parseFloat(formData.averageRating);
    const scale = parseInt(formData.ratingScale);
    
    if (rating < 0 || rating > scale) {
      toast({
        title: "Invalid Rating",
        description: `Average rating must be between 0 and ${scale}`,
        variant: "destructive",
      });
      return;
    }

    if (formData.reviewCount < 0) {
      toast({
        title: "Invalid Count",
        description: "Review count must be 0 or greater",
        variant: "destructive",
      });
      return;
    }

    updateReviewsMutation.mutate(formData);
  };

  const generatePreview = () => {
    if (!formData.reviewsEnabled || !formData.showInSnippets) {
      return null;
    }

    const rating = parseFloat(formData.averageRating);
    const stars = "★".repeat(Math.floor(rating)) + "☆".repeat(parseInt(formData.ratingScale) - Math.floor(rating));
    
    return {
      stars,
      rating: formData.averageRating,
      count: formData.reviewCount,
      businessName: formData.businessName
    };
  };

  const preview = generatePreview();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading review settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">SEO Review Snippets</h2>
        <p className="text-muted-foreground mt-1">
          Manage review count and ratings that appear in search engine snippets to improve organic visibility.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Settings Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Review Settings
            </CardTitle>
            <CardDescription>
              Configure review data for search engine snippets and organic results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    placeholder="Farm Feast Farm House"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="reviewCount">Total Reviews</Label>
                    <Input
                      id="reviewCount"
                      type="number"
                      min="0"
                      value={formData.reviewCount}
                      onChange={(e) => setFormData({ ...formData, reviewCount: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="averageRating">Average Rating</Label>
                    <Input
                      id="averageRating"
                      type="number"
                      step="0.1"
                      min="0"
                      max={formData.ratingScale}
                      value={formData.averageRating}
                      onChange={(e) => setFormData({ ...formData, averageRating: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="ratingScale">Rating Scale (Max Stars)</Label>
                  <Input
                    id="ratingScale"
                    value={formData.ratingScale}
                    onChange={(e) => setFormData({ ...formData, ratingScale: e.target.value })}
                    placeholder="5"
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="reviewsEnabled">Enable Reviews</Label>
                      <p className="text-sm text-muted-foreground">
                        Show review data on your website
                      </p>
                    </div>
                    <Switch
                      id="reviewsEnabled"
                      checked={formData.reviewsEnabled}
                      onCheckedChange={(checked) => setFormData({ ...formData, reviewsEnabled: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="showInSnippets">SEO Snippets</Label>
                      <p className="text-sm text-muted-foreground">
                        Include in search engine meta tags
                      </p>
                    </div>
                    <Switch
                      id="showInSnippets"
                      checked={formData.showInSnippets}
                      onCheckedChange={(checked) => setFormData({ ...formData, showInSnippets: checked })}
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={updateReviewsMutation.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                {updateReviewsMutation.isPending ? "Saving..." : "Save Settings"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Preview and Analytics */}
        <div className="space-y-6">
          {/* Search Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-500" />
                Search Preview
              </CardTitle>
              <CardDescription>
                How your listing appears in search results
              </CardDescription>
            </CardHeader>
            <CardContent>
              {preview ? (
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg bg-white">
                    <div className="text-blue-600 text-lg font-medium hover:underline cursor-pointer">
                      {preview.businessName} - Luxury Farmhouse Rental
                    </div>
                    <div className="text-green-600 text-sm">
                      www.farmfeastfarmhouse.shop
                    </div>
                    <div className="text-gray-600 text-sm mt-1">
                      Experience luxury at Farm Feast Farm House. Book your perfect getaway with premium amenities...
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500 text-lg">{preview.stars}</span>
                        <span className="text-sm text-gray-600">
                          {preview.rating} ({preview.count} review{preview.count !== 1 ? 's' : ''})
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    ⚡ Search engines may use this data to show rich snippets
                  </div>
                </div>
              ) : (
                <div className="p-4 border rounded-lg bg-gray-50">
                  <p className="text-sm text-muted-foreground">
                    Review snippets disabled. Enable "SEO Snippets" to show preview.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Impact Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-green-900">SEO Rating</p>
                    <p className="text-sm text-green-700">
                      {preview ? "Rich snippets enabled" : "No snippets"}
                    </p>
                  </div>
                  <Badge variant={preview ? "default" : "secondary"}>
                    {preview ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-900">
                      {formData.averageRating}
                    </div>
                    <div className="text-sm text-blue-700">Avg. Rating</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-900">
                      {formData.reviewCount}
                    </div>
                    <div className="text-sm text-purple-700">Total Reviews</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technical Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5 text-gray-500" />
                Technical Info
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <strong>Schema.org:</strong> AggregateRating markup
                </div>
                <div>
                  <strong>Meta Tags:</strong> OpenGraph rating properties
                </div>
                <div>
                  <strong>JSON-LD:</strong> Structured data for search engines
                </div>
                <div className="text-xs text-muted-foreground mt-3">
                  These settings generate structured data that search engines use to create rich snippets with star ratings.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}