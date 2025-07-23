import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  CheckCircle, 
  XCircle, 
  Mail, 
  Calendar, 
  Users, 
  Phone,
  Eye,
  Clock,
  AlertTriangle
} from "lucide-react";
import type { Booking } from "@shared/schema";

interface BookingTableProps {
  bookings: Booking[];
  onConfirm?: (id: number) => void;
  onCancel?: (booking: Booking) => void;
  onSendReminder?: (id: number) => void;
  showActions: boolean;
  getStatusColor: (status: string) => string;
  formatDate: (date: string) => string;
}

export default function BookingConfirmationManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [searchCode, setSearchCode] = useState("");

  // Fetch all bookings
  const { data: bookings = [], isLoading } = useQuery<Booking[]>({
    queryKey: ["/api/admin/bookings"],
  });

  // Confirm booking mutation
  const confirmBookingMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      const response = await apiRequest("POST", `/api/bookings/${bookingId}/confirm`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Booking Confirmed",
        description: "Confirmation email has been sent to the customer",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bookings"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to confirm booking",
        variant: "destructive",
      });
    },
  });

  // Cancel booking mutation
  const cancelBookingMutation = useMutation({
    mutationFn: async ({ bookingId, reason }: { bookingId: number; reason: string }) => {
      const response = await apiRequest("POST", `/api/bookings/${bookingId}/cancel`, { reason });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Booking Cancelled",
        description: "Customer has been notified of the cancellation",
      });
      setCancellationReason("");
      setSelectedBooking(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bookings"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel booking",
        variant: "destructive",
      });
    },
  });

  // Send reminder mutation
  const sendReminderMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      const response = await apiRequest("POST", `/api/bookings/${bookingId}/reminder`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Reminder Sent",
        description: "Check-in reminder email has been sent to the customer",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bookings"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send reminder",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (!searchCode) return true;
    return booking.confirmationCode?.toLowerCase().includes(searchCode.toLowerCase()) ||
           booking.fullName.toLowerCase().includes(searchCode.toLowerCase()) ||
           booking.contactNumber.includes(searchCode);
  });

  const pendingBookings = filteredBookings.filter(b => b.status === 'pending');
  const confirmedBookings = filteredBookings.filter(b => b.status === 'confirmed');
  const cancelledBookings = filteredBookings.filter(b => b.status === 'cancelled');
  const completedBookings = filteredBookings.filter(b => b.status === 'completed');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Booking Confirmations</h2>
          <p className="text-muted-foreground mt-1">
            Manage booking confirmations and send notifications to customers
          </p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search by confirmation code, name, or phone</Label>
              <Input
                id="search"
                placeholder="Enter confirmation code, name, or phone number..."
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingBookings.length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-green-600">{confirmedBookings.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cancelled</p>
                <p className="text-2xl font-bold text-red-600">{cancelledBookings.length}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-blue-600">{completedBookings.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Booking Management Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingBookings.length})</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed ({confirmedBookings.length})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({cancelledBookings.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedBookings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <BookingTable 
            bookings={pendingBookings}
            onConfirm={(id) => confirmBookingMutation.mutate(id)}
            onCancel={(booking) => setSelectedBooking(booking)}
            showActions={true}
            getStatusColor={getStatusColor}
            formatDate={formatDate}
          />
        </TabsContent>

        <TabsContent value="confirmed">
          <BookingTable 
            bookings={confirmedBookings}
            onSendReminder={(id) => sendReminderMutation.mutate(id)}
            onCancel={(booking) => setSelectedBooking(booking)}
            showActions={true}
            getStatusColor={getStatusColor}
            formatDate={formatDate}
          />
        </TabsContent>

        <TabsContent value="cancelled">
          <BookingTable 
            bookings={cancelledBookings}
            showActions={false}
            getStatusColor={getStatusColor}
            formatDate={formatDate}
          />
        </TabsContent>

        <TabsContent value="completed">
          <BookingTable 
            bookings={completedBookings}
            showActions={false}
            getStatusColor={getStatusColor}
            formatDate={formatDate}
          />
        </TabsContent>
      </Tabs>

      {/* Cancel Booking Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p><strong>Guest:</strong> {selectedBooking.fullName}</p>
                <p><strong>Confirmation Code:</strong> {selectedBooking.confirmationCode}</p>
                <p><strong>Check-in:</strong> {formatDate(selectedBooking.checkinDate)}</p>
              </div>
              
              <div>
                <Label htmlFor="reason">Cancellation Reason</Label>
                <Textarea
                  id="reason"
                  placeholder="Enter reason for cancellation..."
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedBooking(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                if (selectedBooking) {
                  cancelBookingMutation.mutate({
                    bookingId: selectedBooking.id,
                    reason: cancellationReason
                  });
                }
              }}
            >
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Booking Table Component
function BookingTable({ 
  bookings, 
  onConfirm, 
  onCancel, 
  onSendReminder,
  showActions,
  getStatusColor,
  formatDate 
}: BookingTableProps) {
  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No bookings found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Guest Details</TableHead>
              <TableHead>Booking Info</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
              {showActions && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{booking.fullName}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {booking.contactNumber}
                    </div>
                    {booking.email && (
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {booking.email}
                      </div>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  <div>
                    <div className="font-medium">{booking.confirmationCode || 'N/A'}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(booking.checkinDate)} - {formatDate(booking.checkoutDate)}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {booking.guestCount} guests
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  <Badge className={getStatusColor(booking.status)}>
                    {booking.status}
                  </Badge>
                  {booking.emailSent && (
                    <div className="text-xs text-green-600 mt-1">Email sent</div>
                  )}
                  {booking.reminderSent && (
                    <div className="text-xs text-blue-600 mt-1">Reminder sent</div>
                  )}
                </TableCell>
                
                <TableCell>
                  <div className="font-medium">₹{booking.finalTotal.toLocaleString()}</div>
                </TableCell>
                
                {showActions && (
                  <TableCell>
                    <div className="flex gap-2">
                      {booking.status === 'pending' && onConfirm && (
                        <Button 
                          size="sm" 
                          onClick={() => onConfirm(booking.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Confirm
                        </Button>
                      )}
                      
                      {booking.status === 'confirmed' && onSendReminder && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => onSendReminder(booking.id)}
                        >
                          <Mail className="w-4 h-4 mr-1" />
                          Reminder
                        </Button>
                      )}
                      
                      {(booking.status === 'pending' || booking.status === 'confirmed') && onCancel && (
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => onCancel(booking)}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}