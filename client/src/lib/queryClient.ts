import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { authUtils } from "./auth";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const headers: Record<string, string> = {};
  
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  
  // Automatically add JWT token for admin routes and protected endpoints
  if (url.includes("/api/admin/") || 
      (method !== "GET" && url.includes("/api/blog-posts")) ||
      (method !== "GET" && url.includes("/api/services")) ||
      (method !== "GET" && url.includes("/api/coupons"))) {
    const authHeaders = authUtils.getAuthHeaders();
    Object.assign(headers, authHeaders);
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

// Admin query function with authentication
export const getAdminQueryFn: QueryFunction = async ({ queryKey }) => {
  const authHeaders = authUtils.getAuthHeaders();
  const url = queryKey.join("/") as string;
  
  console.log("Admin API request:", url, "Auth headers present:", !!authHeaders.Authorization);
  
  const res = await fetch(url, {
    credentials: "include",
    headers: authHeaders,
  });
  
  console.log("Admin API response:", res.status, res.statusText);
  
  if (res.status === 401) {
    console.error("Admin authentication failed, clearing tokens");
    authUtils.clearAuth();
    window.location.href = "/admin";
    throw new Error("Authentication required");
  }

  await throwIfResNotOk(res);
  const data = await res.json();
  console.log("Admin API data:", Array.isArray(data) ? `Array(${data.length})` : typeof data);
  return data;
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 30 * 60 * 1000, // 30 minutes for repeat visits
      gcTime: 60 * 60 * 1000, // 1 hour cache time
      retry: 1, // Reduce retries for faster error handling
    },
    mutations: {
      retry: 1,
    },
  },
});
