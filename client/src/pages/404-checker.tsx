import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  ExternalLink,
  RefreshCw,
  Globe,
  Clock,
  Link as LinkIcon
} from "lucide-react";
import FastNavbar from "@/components/FastNavbar";
import Footer from "@/components/Footer";

interface UrlCheck {
  url: string;
  status: 'checking' | 'success' | 'error' | 'warning';
  statusCode?: number;
  responseTime?: number;
  message?: string;
}

export default function NotFoundChecker() {
  const [baseUrl, setBaseUrl] = useState(window.location.origin);
  const [customUrls, setCustomUrls] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<UrlCheck[]>([]);
  const [scanComplete, setScanComplete] = useState(false);

  // Default URLs to check
  const defaultUrls = [
    '/',
    '/services',
    '/gallery',
    '/booking',
    '/booking-confirmation',
    '/privacy-policy',
    '/terms-conditions',
    '/sitemap.xml',
    '/robots.txt',
    '/api/services',
    '/api/gallery',
    '/api/coupons',
    // Common service pages
    '/services/pet-essentials',
    '/services/bbq-setup',
    '/services/bonfire-arrangement',
    '/services/box-cricket-sand-volleyball',
    '/services/carom-board-games',
    '/services/dj-music-system',
    '/services/indoor-games',
    '/services/swimming-pool-access',
    // Gallery categories
    '/gallery/farmhouse',
    '/gallery/activities',
    '/gallery/amenities',
    '/gallery/food',
  ];

  const checkUrl = async (url: string): Promise<UrlCheck> => {
    const startTime = Date.now();
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
    
    try {
      const response = await fetch(fullUrl, { 
        method: 'HEAD',
        mode: 'cors'
      });
      
      const responseTime = Date.now() - startTime;
      
      return {
        url,
        status: response.ok ? 'success' : 'error',
        statusCode: response.status,
        responseTime,
        message: response.ok ? 'OK' : `HTTP ${response.status} ${response.statusText}`
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        url,
        status: 'error',
        statusCode: 0,
        responseTime,
        message: error instanceof Error ? error.message : 'Network error'
      };
    }
  };

  const startScan = async () => {
    setIsScanning(true);
    setScanComplete(false);
    setProgress(0);
    setResults([]);

    // Combine default URLs with custom URLs
    const customUrlList = customUrls
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0);
    
    const allUrls = [...defaultUrls, ...customUrlList];
    
    // Initialize results
    const initialResults: UrlCheck[] = allUrls.map(url => ({
      url,
      status: 'checking'
    }));
    setResults(initialResults);

    // Check URLs one by one with progress updates
    for (let i = 0; i < allUrls.length; i++) {
      const url = allUrls[i];
      const result = await checkUrl(url);
      
      setResults(prev => {
        const newResults = [...prev];
        newResults[i] = result;
        return newResults;
      });
      
      setProgress(((i + 1) / allUrls.length) * 100);
    }

    setIsScanning(false);
    setScanComplete(true);
  };

  const getStatusIcon = (status: UrlCheck['status']) => {
    switch (status) {
      case 'checking':
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (check: UrlCheck) => {
    if (check.status === 'checking') {
      return <Badge variant="secondary">Checking...</Badge>;
    }
    
    if (check.statusCode === 200) {
      return <Badge className="bg-green-100 text-green-800">OK</Badge>;
    }
    
    if (check.statusCode === 404) {
      return <Badge variant="destructive">404 Not Found</Badge>;
    }
    
    if (check.statusCode && check.statusCode >= 400) {
      return <Badge variant="destructive">{check.statusCode}</Badge>;
    }
    
    if (check.statusCode === 0) {
      return <Badge variant="destructive">Network Error</Badge>;
    }
    
    return <Badge variant="secondary">{check.statusCode || 'Unknown'}</Badge>;
  };

  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  const totalCount = results.length;

  return (
    <div className="min-h-screen bg-background">
      <FastNavbar />
      <div className="bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">404 Error Checker</h1>
          <p className="text-gray-600">
            Scan your website for broken links and missing pages to ensure optimal user experience and SEO performance.
          </p>
        </div>

        {/* Configuration */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Scan Configuration
            </CardTitle>
            <CardDescription>
              Configure the base URL and add custom URLs to check
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="baseUrl" className="text-sm font-medium mb-2 block">
                Base URL
              </label>
              <Input
                id="baseUrl"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://your-website.com"
                disabled={isScanning}
              />
            </div>
            
            <div>
              <label htmlFor="customUrls" className="text-sm font-medium mb-2 block">
                Additional URLs to Check (one per line)
              </label>
              <textarea
                id="customUrls"
                value={customUrls}
                onChange={(e) => setCustomUrls(e.target.value)}
                placeholder="/custom-page&#10;/another-page&#10;https://external-link.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px] resize-vertical"
                disabled={isScanning}
              />
            </div>

            <Button
              onClick={startScan}
              disabled={isScanning}
              className="w-full"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  Scanning...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Start Scan
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Progress */}
        {isScanning && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Scanning Progress</span>
                <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </CardContent>
          </Card>
        )}

        {/* Summary */}
        {scanComplete && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Checked</p>
                    <p className="text-2xl font-bold">{totalCount}</p>
                  </div>
                  <LinkIcon className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Success</p>
                    <p className="text-2xl font-bold text-green-600">{successCount}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600">Errors</p>
                    <p className="text-2xl font-bold text-red-600">{errorCount}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Scan Results</CardTitle>
              <CardDescription>
                Detailed results for each URL checked
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {results.map((check, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {getStatusIcon(check.status)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">{check.url}</span>
                          {check.url.startsWith('http') && (
                            <ExternalLink className="h-3 w-3 text-gray-400" />
                          )}
                        </div>
                        {check.message && (
                          <p className="text-xs text-gray-500">{check.message}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {check.responseTime && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          {check.responseTime}ms
                        </div>
                      )}
                      {getStatusBadge(check)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Help Information */}
        {!isScanning && results.length === 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>How to use:</strong> Enter your website's base URL and click "Start Scan" to check for broken links. 
              The scanner will verify all major pages including services, gallery, booking pages, and API endpoints. 
              You can also add custom URLs to check specific pages or external links.
            </AlertDescription>
          </Alert>
        )}
      </div>
      </div>
      <Footer />
    </div>
  );
}