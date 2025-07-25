import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, Users, Eye, Clock, Globe, Smartphone, Monitor, Tablet, MapPin, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { authUtils } from '@/lib/auth';

interface AnalyticsOverview {
  totalVisitors: number;
  uniqueVisitors: number;
  totalPageViews: number;
  averageSessionDuration: number;
  topPages: { page: string; views: number }[];
  deviceBreakdown: { device: string; count: number }[];
  visitorsByHour: { hour: number; visitors: number }[];
}

interface RealtimeData {
  activeVisitors: number;
  sessionsLast30Min: Array<{
    id: number;
    sessionId: string;
    fingerprint: string;
    ipAddress: string;
    userAgent: string;
    country: string;
    city: string;
    device: string;
    browser: string;
    os: string;
    referrer: string;
    landingPage: string;
    isActive: boolean;
    lastActiveAt: string;
    createdAt: string;
  }>;
  currentPageViews: { page: string; visitors: number }[];
}

function getDeviceIcon(device: string) {
  switch (device?.toLowerCase()) {
    case 'mobile': return <Smartphone className="h-4 w-4" />;
    case 'tablet': return <Tablet className="h-4 w-4" />;
    case 'desktop': return <Monitor className="h-4 w-4" />;
    default: return <Globe className="h-4 w-4" />;
  }
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('30');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Analytics overview query
  const { data: overview, isLoading: overviewLoading, refetch: refetchOverview, error: overviewError } = useQuery<AnalyticsOverview>({
    queryKey: ['/api/admin/analytics/overview', timeRange],
    queryFn: async () => {
      if (!authUtils.isAuthenticated()) {
        throw new Error('No authentication token found');
      }
      const authHeaders = authUtils.getAuthHeaders();
      const response = await fetch(`/api/admin/analytics/overview?days=${timeRange}`, {
        headers: authHeaders,
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication expired');
        }
        throw new Error('Failed to fetch analytics overview');
      }
      return response.json();
    },
    refetchInterval: autoRefresh ? 30000 : false, // Refresh every 30 seconds
    retry: 1, // Reduce retries for faster error detection
  });

  // Real-time data query
  const { data: realtime, isLoading: realtimeLoading, refetch: refetchRealtime, error: realtimeError } = useQuery<RealtimeData>({
    queryKey: ['/api/admin/analytics/realtime'],
    queryFn: async () => {
      if (!authUtils.isAuthenticated()) {
        throw new Error('No authentication token found');
      }
      const authHeaders = authUtils.getAuthHeaders();
      const response = await fetch('/api/admin/analytics/realtime', {
        headers: authHeaders,
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication expired');
        }
        throw new Error('Failed to fetch real-time analytics');
      }
      return response.json();
    },
    refetchInterval: autoRefresh ? 10000 : false, // Refresh every 10 seconds
    retry: 1, // Reduce retries for faster error detection
  });

  const handleRefresh = () => {
    refetchOverview();
    refetchRealtime();
  };

  if (overviewLoading && realtimeLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Handle authentication errors
  if ((overviewError as any)?.message?.includes('Authentication') || (realtimeError as any)?.message?.includes('Authentication')) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Authentication Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Your session has expired. Please refresh the page and log in again.</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
            >
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle other errors with debugging info
  if (overviewError || realtimeError) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Analytics Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>There was an issue loading analytics data.</p>
            {overviewError && <p className="text-sm text-gray-600 mt-2">Overview: {String(overviewError)}</p>}
            {realtimeError && <p className="text-sm text-gray-600 mt-2">Realtime: {String(realtimeError)}</p>}
            <Button 
              onClick={() => {
                refetchOverview();
                refetchRealtime();
              }} 
              className="mt-4"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-600">Monitor your website traffic and visitor behavior</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Last 24h</SelectItem>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant={autoRefresh ? "default" : "outline"}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            Auto Refresh
          </Button>
          <Button onClick={handleRefresh} variant="outline">
            Refresh Now
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="realtime">Real-time</TabsTrigger>
          <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview?.totalVisitors || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {timeRange === '1' ? 'last 24 hours' : `last ${timeRange} days`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Page Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview?.totalPageViews || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Total page views
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Now</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{realtime?.activeVisitors || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Live visitors
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Session</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatDuration(overview?.averageSessionDuration || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Average duration
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Top Pages and Device Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Pages</CardTitle>
                <CardDescription>Most visited pages</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {overview?.topPages?.slice(0, 5).map((page, index) => (
                  <div key={page.page} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="w-6 h-6 p-0 text-xs">
                        {index + 1}
                      </Badge>
                      <span className="font-medium">
                        {page.page === '/' ? 'Home' : page.page}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{page.views} views</span>
                    </div>
                  </div>
                )) || <p className="text-gray-500">No page view data available</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Device Breakdown</CardTitle>
                <CardDescription>Visitor device types</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {overview?.deviceBreakdown?.map((device) => (
                  <div key={device.device} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getDeviceIcon(device.device)}
                      <span className="font-medium capitalize">
                        {device.device || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{device.count} visitors</span>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{
                            width: `${((device.count / (overview?.totalVisitors || 1)) * 100)}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )) || <p className="text-gray-500">No device data available</p>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="realtime" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  Active Visitors ({realtime?.activeVisitors || 0})
                </CardTitle>
                <CardDescription>Visitors in the last 30 minutes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {realtime?.sessionsLast30Min?.slice(0, 10).map((session) => (
                  <div key={session.sessionId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getDeviceIcon(session.device)}
                      <div>
                        <p className="font-medium">
                          {session.city ? `${session.city}${session.country ? `, ${session.country}` : ''}` : 'Unknown Location'}
                        </p>
                        <p className="text-sm text-gray-600">{session.browser} on {session.os}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{session.landingPage}</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(session.lastActiveAt), 'HH:mm:ss')}
                      </p>
                    </div>
                  </div>
                )) || <p className="text-gray-500">No active visitors</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Page Views</CardTitle>
                <CardDescription>Pages being viewed right now</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {realtime?.currentPageViews?.map((pageView) => (
                  <div key={pageView.page} className="flex items-center justify-between">
                    <span className="font-medium">
                      {pageView.page === '/' ? 'Home' : pageView.page}
                    </span>
                    <Badge variant="secondary">
                      {pageView.visitors} {pageView.visitors === 1 ? 'visitor' : 'visitors'}
                    </Badge>
                  </div>
                )) || <p className="text-gray-500">No current page views</p>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Sessions Details</CardTitle>
              <CardDescription>Detailed information about current visitors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {realtime?.sessionsLast30Min?.map((session) => (
                  <div key={session.sessionId} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(session.device)}
                        <span className="font-medium">Session {session.sessionId.slice(-6)}</span>
                        <Badge variant={session.isActive ? "default" : "secondary"}>
                          {session.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        Started {format(new Date(session.createdAt), 'MMM d, HH:mm')}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Location</p>
                        <p className="font-medium">
                          {session.city ? `${session.city}${session.country ? `, ${session.country}` : ''}` : 'Unknown'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Device</p>
                        <p className="font-medium capitalize">{session.device || 'Unknown'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Browser</p>
                        <p className="font-medium">{session.browser || 'Unknown'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">OS</p>
                        <p className="font-medium">{session.os || 'Unknown'}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Landing Page</p>
                        <p className="font-medium">{session.landingPage}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Referrer</p>
                        <p className="font-medium">{session.referrer || 'Direct'}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-gray-600">Last Active</p>
                      <p className="font-medium">{format(new Date(session.lastActiveAt), 'MMM d, yyyy HH:mm:ss')}</p>
                    </div>
                  </div>
                )) || <p className="text-gray-500">No active sessions</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}