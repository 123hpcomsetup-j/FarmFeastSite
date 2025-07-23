import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  RefreshCw, 
  ExternalLink, 
  Search, 
  Globe, 
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react";

interface SitemapInfo {
  message: string;
  urls: number;
  lastGenerated: string;
}

export default function SitemapManagement() {
  const { toast } = useToast();
  const [sitemapInfo, setSitemapInfo] = useState<SitemapInfo | null>(null);

  // Regenerate sitemap mutation
  const regenerateSitemapMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/sitemap/regenerate", {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });
      return response.json();
    },
    onSuccess: (data: SitemapInfo) => {
      setSitemapInfo(data);
      toast({
        title: "Sitemap Regenerated",
        description: `Successfully generated sitemap with ${data.urls} URLs`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to regenerate sitemap",
        variant: "destructive",
      });
    },
  });

  const handleRegenerateSitemap = () => {
    regenerateSitemapMutation.mutate();
  };

  const openSitemap = () => {
    window.open('/sitemap.xml', '_blank');
  };

  const openRobotsTxt = () => {
    window.open('/robots.txt', '_blank');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Sitemap Management</h2>
        <p className="text-muted-foreground mt-1">
          Manage your website's sitemap and robots.txt for better SEO
        </p>
      </div>

      {/* Sitemap Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Sitemap Status
            </CardTitle>
            <CardDescription>
              Current status of your website sitemap
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sitemapInfo ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total URLs:</span>
                  <Badge variant="secondary">{sitemapInfo.urls}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Last Generated:</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(sitemapInfo.lastGenerated).toLocaleDateString()} at{' '}
                    {new Date(sitemapInfo.lastGenerated).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">Sitemap is up to date</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-600">Click regenerate to get sitemap info</span>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleRegenerateSitemap}
                disabled={regenerateSitemapMutation.isPending}
                size="sm"
              >
                {regenerateSitemapMutation.isPending ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Regenerate
              </Button>
              <Button 
                onClick={openSitemap}
                variant="outline"
                size="sm"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Sitemap
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Robots.txt
            </CardTitle>
            <CardDescription>
              Search engine crawling instructions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Allows all search engines</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Blocks admin and API routes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">References sitemap location</span>
              </div>
            </div>

            <Button 
              onClick={openRobotsTxt}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Robots.txt
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* SEO Information */}
      <Card>
        <CardHeader>
          <CardTitle>How Sitemap Works</CardTitle>
          <CardDescription>
            Understanding dynamic sitemap generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Your sitemap is automatically generated and includes all active pages, services, and gallery categories. 
                It updates dynamically when content is added or modified.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Included Pages:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Homepage (Priority: 1.0)</li>
                  <li>• Services page (Priority: 0.9)</li>
                  <li>• Gallery page (Priority: 0.8)</li>
                  <li>• Booking page (Priority: 0.9)</li>
                  <li>• Individual service pages (Priority: 0.7)</li>
                  <li>• Gallery category pages (Priority: 0.6)</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Auto-Updates When:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• New services are added/activated</li>
                  <li>• Gallery images are uploaded</li>
                  <li>• SEO settings are modified</li>
                  <li>• Content priorities change</li>
                  <li>• New categories are created</li>
                </ul>
              </div>
            </div>

            <div className="pt-4">
              <h4 className="font-semibold text-sm mb-2">For Search Engines:</h4>
              <p className="text-sm text-muted-foreground">
                The sitemap is automatically submitted to search engines via robots.txt and helps them 
                discover and index all your content efficiently. Higher priority pages are crawled more frequently.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}