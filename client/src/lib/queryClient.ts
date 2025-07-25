import { QueryClient, QueryFunction } from "@tanstack/react-query";

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
    const token = localStorage.getItem("adminToken");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
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
  const token = localStorage.getItem("adminToken");
  console.log("Making admin request with token:", token ? `present (${token.substring(0, 20)}...)` : "missing");
  
  const res = await fetch(queryKey.join("/") as string, {
    credentials: "include",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  console.log("Admin request response status:", res.status);
  
  if (res.status === 401) {
    const errorText = await res.text();
    console.error("Admin authentication failed:", errorText);
    console.error("Clearing tokens and redirecting to login");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    window.location.href = "/admin";
    throw new Error("Authentication required");
  }

  await throwIfResNotOk(res);
  return await res.json();
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes for better performance
      gcTime: 10 * 60 * 1000, // 10 minutes cache time
      retry: 1, // Reduce retries for faster error handling
    },
    mutations: {
      retry: 1,
    },
  },
});
