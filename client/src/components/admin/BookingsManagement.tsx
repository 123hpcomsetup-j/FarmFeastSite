import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { Eye, Download, RefreshCw } from "lucide-react";

export default function BookingsManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["/api/admin/bookings"],
    meta: {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
      },
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest(`/api/bookings/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bookings"] });
      toast({
        title: "Success",
        description: "Booking status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update booking status",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "default",
      confirmed: "default",
      completed: "default",
      cancelled: "destructive",
    } as const;

    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-green-100 text-green-800",
      completed: "bg-blue-100 text-blue-800",
      cancelled: "bg-red-100 text-red-800",
    };

    return (
      <Badge 
        variant={variants[status as keyof typeof variants] || "default"}
        className={colors[status as keyof typeof colors]}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const exportBookings = () => {
    if (!bookings) return;
    
    const csvContent = [
      ["ID", "Name", "Contact", "Check-in", "Check-out", "Guests", "Total", "Status"].join(","),
      ...bookings.map((booking: any) => [
        booking.id,
        booking.fullName,
        booking.contactNumber,
        booking.checkinDate,
        booking.checkoutDate,
        booking.guestCount,
        booking.finalTotal,
        booking.status
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bookings-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Bookings data has been exported to CSV",
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading bookings...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bookings Management</h2>
          <p className="text-gray-600">Manage all farmhouse bookings and reservations</p>
        </div>
        <Button onClick={exportBookings} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead>Check-out</TableHead>
                <TableHead>Guests</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings?.map((booking: any) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">#{booking.id}</TableCell>
                  <TableCell>{booking.fullName}</TableCell>
                  <TableCell>{booking.contactNumber}</TableCell>
                  <TableCell>{format(new Date(booking.checkinDate), "MMM dd, yyyy")}</TableCell>
                  <TableCell>{format(new Date(booking.checkoutDate), "MMM dd, yyyy")}</TableCell>
                  <TableCell>{booking.guestCount}</TableCell>
                  <TableCell>₹{booking.finalTotal?.toLocaleString()}</TableCell>
                  <TableCell>{getStatusBadge(booking.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Select
                        value={booking.status}
                        onValueChange={(status) => 
                          updateStatusMutation.mutate({ id: booking.id, status })
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedBooking(booking)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )) || (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                    No bookings found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Booking Details Modal would go here */}
      {selectedBooking && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Booking Details - #{selectedBooking.id}</CardTitle>
            <Button 
              variant="outline" 
              onClick={() => setSelectedBooking(null)}
              className="w-fit"
            >
              Close
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-700">Customer Information</h4>
                <p><strong>Name:</strong> {selectedBooking.fullName}</p>
                <p><strong>Email:</strong> {selectedBooking.email || "Not provided"}</p>
                <p><strong>Contact:</strong> {selectedBooking.contactNumber}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700">Booking Details</h4>
                <p><strong>Check-in:</strong> {format(new Date(selectedBooking.checkinDate), "PPP")}</p>
                <p><strong>Check-out:</strong> {format(new Date(selectedBooking.checkoutDate), "PPP")}</p>
                <p><strong>Check-in Time:</strong> {selectedBooking.checkinTime}</p>
                <p><strong>Guests:</strong> {selectedBooking.guestCount}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700">Pricing</h4>
                <p><strong>Base Price:</strong> ₹{selectedBooking.basePrice?.toLocaleString()}</p>
                <p><strong>Discount:</strong> ₹{selectedBooking.discountAmount?.toLocaleString() || 0}</p>
                <p><strong>Final Total:</strong> ₹{selectedBooking.finalTotal?.toLocaleString()}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700">Additional Information</h4>
                <p><strong>Special Requests:</strong> {selectedBooking.specialRequests || "None"}</p>
                <p><strong>Coupon Used:</strong> {selectedBooking.couponCode || "None"}</p>
                <p><strong>Created:</strong> {format(new Date(selectedBooking.createdAt), "PPP p")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}