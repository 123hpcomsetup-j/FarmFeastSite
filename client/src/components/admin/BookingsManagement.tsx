import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, getAdminQueryFn } from "@/lib/queryClient";
import { format } from "date-fns";
import { Eye, Download, RefreshCw, Trash2, Plus } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function BookingsManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newBooking, setNewBooking] = useState({
    fullName: '',
    email: '',
    contactNumber: '',
    checkinDate: '',
    checkoutDate: '',
    guestCount: 1,
    checkinTime: '12:00',
    checkoutTime: '11:00',
    basePrice: 1150,
    servicesPrice: 0,
    discountAmount: 0,
    finalTotal: 1150,
    selectedServices: [],
    couponCode: '',
    specialRequests: ''
  });

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["/api/admin/bookings"],
    queryFn: getAdminQueryFn,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest("PATCH", `/api/admin/bookings/${id}/status`, { status });
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

  const deleteBookingMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/admin/bookings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bookings"] });
      toast({
        title: "Success",
        description: "Booking deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete booking",
        variant: "destructive",
      });
    },
  });

  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      return apiRequest("POST", "/api/admin/bookings", bookingData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bookings"] });
      setShowCreateDialog(false);
      setNewBooking({
        fullName: '',
        email: '',
        contactNumber: '',
        checkinDate: '',
        checkoutDate: '',
        guestCount: 1,
        checkinTime: '12:00',
        checkoutTime: '11:00',
        basePrice: 1150,
        servicesPrice: 0,
        discountAmount: 0,
        finalTotal: 1150,
        selectedServices: [],
        couponCode: '',
        specialRequests: ''
      });
      toast({
        title: "Success",
        description: "Booking created successfully. Email sent to customer.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create booking",
        variant: "destructive",
      });
    },
  });

  const handleCreateBooking = () => {
    // Calculate final total based on guest count and base price
    const calculatedTotal = Math.max(newBooking.basePrice * newBooking.guestCount + newBooking.servicesPrice - newBooking.discountAmount, 0);
    const bookingData = {
      ...newBooking,
      finalTotal: calculatedTotal
    };
    createBookingMutation.mutate(bookingData);
  };

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
    if (!bookings || !Array.isArray(bookings) || bookings.length === 0) return;
    
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
        <div className="flex items-center gap-2">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Booking
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create External Booking</DialogTitle>
                <DialogDescription>
                  Create a booking on behalf of a customer. They will receive an email with payment instructions.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={newBooking.fullName}
                    onChange={(e) => setNewBooking({...newBooking, fullName: e.target.value})}
                    placeholder="Customer's full name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newBooking.email}
                    onChange={(e) => setNewBooking({...newBooking, email: e.target.value})}
                    placeholder="customer@example.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor="contactNumber">Contact Number *</Label>
                  <Input
                    id="contactNumber"
                    value={newBooking.contactNumber}
                    onChange={(e) => setNewBooking({...newBooking, contactNumber: e.target.value})}
                    placeholder="+91 9876543210"
                  />
                </div>
                
                <div>
                  <Label htmlFor="guestCount">Number of Guests</Label>
                  <Input
                    id="guestCount"
                    type="number"
                    min="1"
                    value={newBooking.guestCount}
                    onChange={(e) => setNewBooking({...newBooking, guestCount: parseInt(e.target.value) || 1})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="checkinDate">Check-in Date *</Label>
                  <Input
                    id="checkinDate"
                    type="date"
                    value={newBooking.checkinDate}
                    onChange={(e) => setNewBooking({...newBooking, checkinDate: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="checkoutDate">Check-out Date *</Label>
                  <Input
                    id="checkoutDate"
                    type="date"
                    value={newBooking.checkoutDate}
                    onChange={(e) => setNewBooking({...newBooking, checkoutDate: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="finalTotal">Total Amount (₹) *</Label>
                  <Input
                    id="finalTotal"
                    type="number"
                    min="0"
                    value={newBooking.finalTotal}
                    onChange={(e) => setNewBooking({...newBooking, finalTotal: parseInt(e.target.value) || 0})}
                    placeholder="10000"
                  />
                </div>
                
                <div>
                  <Label htmlFor="specialRequests">Special Requests</Label>
                  <Textarea
                    id="specialRequests"
                    value={newBooking.specialRequests}
                    onChange={(e) => setNewBooking({...newBooking, specialRequests: e.target.value})}
                    placeholder="Any special requirements or notes"
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateDialog(false)}
                  disabled={createBookingMutation.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateBooking}
                  disabled={createBookingMutation.isPending || !newBooking.fullName || !newBooking.email || !newBooking.contactNumber}
                >
                  {createBookingMutation.isPending ? 'Creating...' : 'Create Booking'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button onClick={exportBookings} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
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
                <TableHead>UTR Number</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(bookings) && bookings.length > 0 ? (
                bookings.map((booking: any) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">#{booking.id}</TableCell>
                    <TableCell>{booking.fullName}</TableCell>
                    <TableCell>{booking.contactNumber}</TableCell>
                    <TableCell>{format(new Date(booking.checkinDate), "MMM dd, yyyy")}</TableCell>
                    <TableCell>{format(new Date(booking.checkoutDate), "MMM dd, yyyy")}</TableCell>
                    <TableCell>{booking.guestCount}</TableCell>
                    <TableCell>₹{booking.finalTotal?.toLocaleString()}</TableCell>
                    <TableCell>
                      {booking.upiTransactionId ? (
                        <span className="text-sm font-mono bg-blue-50 px-2 py-1 rounded">
                          {booking.upiTransactionId}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">No UTR</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {booking.paymentStatus === 'verified' && (
                        <Badge className="bg-green-100 text-green-800">Verified</Badge>
                      )}
                      {booking.paymentStatus === 'pending' && (
                        <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                      )}
                      {booking.paymentStatus === 'failed' && (
                        <Badge className="bg-red-100 text-red-800">Failed</Badge>
                      )}
                      {!booking.paymentStatus && (
                        <Badge className="bg-gray-100 text-gray-800">Not Set</Badge>
                      )}
                    </TableCell>
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
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Booking</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete booking #{booking.id} for {booking.fullName}? 
                                This action cannot be undone and will permanently remove all booking data.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteBookingMutation.mutate(booking.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete Booking
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
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