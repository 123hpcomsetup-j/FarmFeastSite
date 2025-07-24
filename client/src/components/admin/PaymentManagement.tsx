import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  CreditCard,
  AlertTriangle,
  DollarSign,
  Search,
  Eye
} from "lucide-react";
import type { Booking } from "@shared/schema";

export default function PaymentManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [verificationNotes, setVerificationNotes] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all bookings
  const { data: bookings = [], isLoading } = useQuery<Booking[]>({
    queryKey: ["/api/admin/bookings"],
  });

  // Verify payment mutation
  const verifyPaymentMutation = useMutation({
    mutationFn: async ({ bookingId, verified, notes }: { bookingId: number; verified: boolean; notes: string }) => {
      const response = await apiRequest("POST", `/api/admin/bookings/${bookingId}/verify-payment`, { verified, notes });
      return response.json();
    },
    onSuccess: (data, variables) => {
      toast({
        title: variables.verified ? "Payment Verified" : "Payment Rejected",
        description: variables.verified 
          ? "Payment has been verified and booking confirmed"
          : "Payment has been marked as failed",
      });
      setSelectedBooking(null);
      setVerificationNotes("");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bookings"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to verify payment",
        variant: "destructive",
      });
    },
  });

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

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'paid':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'pending_verification':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'pending':
      default:
        return 'bg-orange-100 text-orange-800 border-orange-300';
    }
  };

  const getBookingStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Filter bookings based on search term
  const filteredBookings = bookings.filter(booking => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      booking.confirmationCode?.toLowerCase().includes(search) ||
      booking.fullName.toLowerCase().includes(search) ||
      booking.contactNumber.includes(search) ||
      booking.upiTransactionId?.toLowerCase().includes(search)
    );
  });

  // Separate bookings by payment status
  const pendingPayments = filteredBookings.filter(b => b.paymentStatus === 'pending');
  const paidBookings = filteredBookings.filter(b => b.paymentStatus === 'paid' || b.paymentStatus === 'pending_verification');
  const verifiedPayments = filteredBookings.filter(b => b.paymentStatus === 'verified');
  const failedPayments = filteredBookings.filter(b => b.paymentStatus === 'failed');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading payment data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Payment Management</h2>
          <p className="text-muted-foreground mt-1">
            Verify UPI payments and manage booking confirmations
          </p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search by confirmation code, name, phone, or UTR number</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Enter search term..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
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
                <p className="text-sm font-medium text-gray-600">Pending Payment</p>
                <p className="text-2xl font-bold text-orange-600">{pendingPayments.length}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Awaiting Verification</p>
                <p className="text-2xl font-bold text-blue-600">{paidBookings.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-green-600">{verifiedPayments.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">{failedPayments.length}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Management Tabs */}
      <Tabs defaultValue="verification" className="space-y-4">
        <TabsList>
          <TabsTrigger value="verification">Awaiting Verification ({paidBookings.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending Payment ({pendingPayments.length})</TabsTrigger>
          <TabsTrigger value="verified">Verified ({verifiedPayments.length})</TabsTrigger>
          <TabsTrigger value="failed">Failed ({failedPayments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="verification">
          <PaymentTable 
            bookings={paidBookings}
            onVerify={(booking) => setSelectedBooking(booking)}
            showVerificationActions={true}
            formatDate={formatDate}
            getPaymentStatusColor={getPaymentStatusColor}
            getBookingStatusColor={getBookingStatusColor}
          />
        </TabsContent>

        <TabsContent value="pending">
          <PaymentTable 
            bookings={pendingPayments}
            showVerificationActions={false}
            formatDate={formatDate}
            getPaymentStatusColor={getPaymentStatusColor}
            getBookingStatusColor={getBookingStatusColor}
          />
        </TabsContent>

        <TabsContent value="verified">
          <PaymentTable 
            bookings={verifiedPayments}
            showVerificationActions={false}
            formatDate={formatDate}
            getPaymentStatusColor={getPaymentStatusColor}
            getBookingStatusColor={getBookingStatusColor}
          />
        </TabsContent>

        <TabsContent value="failed">
          <PaymentTable 
            bookings={failedPayments}
            onVerify={(booking) => setSelectedBooking(booking)}
            showVerificationActions={true}
            formatDate={formatDate}
            getPaymentStatusColor={getPaymentStatusColor}
            getBookingStatusColor={getBookingStatusColor}
          />
        </TabsContent>
      </Tabs>

      {/* Payment Verification Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Verify Payment</DialogTitle>
            <DialogDescription>
              Review the payment details and verify the transaction
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-4">
              {/* Booking Details */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-3">Booking Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Confirmation Code:</span>
                    <p>{selectedBooking.confirmationCode}</p>
                  </div>
                  <div>
                    <span className="font-medium">Guest Name:</span>
                    <p>{selectedBooking.fullName}</p>
                  </div>
                  <div>
                    <span className="font-medium">Contact:</span>
                    <p>{selectedBooking.contactNumber}</p>
                  </div>
                  <div>
                    <span className="font-medium">Amount:</span>
                    <p className="font-semibold text-green-600">₹{selectedBooking.finalTotal.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold mb-3">Payment Information</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">UTR/Transaction ID:</span>
                    <p className="font-mono text-lg">{selectedBooking.upiTransactionId || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Payment Status:</span>
                    <Badge className={getPaymentStatusColor(selectedBooking.paymentStatus || 'pending')}>
                      {selectedBooking.paymentStatus || 'pending'}
                    </Badge>
                  </div>
                  {selectedBooking.paymentNotes && (
                    <div>
                      <span className="font-medium">Previous Notes:</span>
                      <p className="text-gray-600">{selectedBooking.paymentNotes}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Verification Notes */}
              <div>
                <Label htmlFor="notes">Verification Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Enter notes about payment verification..."
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
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
                  verifyPaymentMutation.mutate({
                    bookingId: selectedBooking.id,
                    verified: false,
                    notes: verificationNotes
                  });
                }
              }}
              disabled={verifyPaymentMutation.isPending}
            >
              Mark as Failed
            </Button>
            <Button 
              onClick={() => {
                if (selectedBooking) {
                  verifyPaymentMutation.mutate({
                    bookingId: selectedBooking.id,
                    verified: true,
                    notes: verificationNotes
                  });
                }
              }}
              disabled={verifyPaymentMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              Verify Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Payment Table Component
interface PaymentTableProps {
  bookings: Booking[];
  onVerify?: (booking: Booking) => void;
  showVerificationActions: boolean;
  formatDate: (date: string) => string;
  getPaymentStatusColor: (status: string) => string;
  getBookingStatusColor: (status: string) => string;
}

function PaymentTable({ 
  bookings, 
  onVerify,
  showVerificationActions,
  formatDate,
  getPaymentStatusColor,
  getBookingStatusColor 
}: PaymentTableProps) {
  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No payments found</p>
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
              <TableHead>Booking Details</TableHead>
              <TableHead>Payment Info</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              {showVerificationActions && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{booking.fullName}</div>
                    <div className="text-sm text-muted-foreground">{booking.confirmationCode}</div>
                    <div className="text-sm text-muted-foreground">{booking.contactNumber}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(booking.checkinDate)} ({booking.guestCount} guests)
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div>
                    {booking.upiTransactionId ? (
                      <div className="font-mono text-sm">{booking.upiTransactionId}</div>
                    ) : (
                      <div className="text-sm text-muted-foreground">No UTR provided</div>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                      Created: {formatDate(booking.createdAt?.toString() || '')}
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="font-semibold text-lg">₹{booking.finalTotal.toLocaleString()}</div>
                </TableCell>
                
                <TableCell>
                  <div className="space-y-1">
                    <Badge className={getPaymentStatusColor(booking.paymentStatus || 'pending')}>
                      {booking.paymentStatus || 'pending'}
                    </Badge>
                    <Badge className={getBookingStatusColor(booking.status || 'pending')}>
                      {booking.status || 'pending'}
                    </Badge>
                  </div>
                </TableCell>
                
                {showVerificationActions && (
                  <TableCell>
                    <Button 
                      size="sm" 
                      onClick={() => onVerify?.(booking)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Review
                    </Button>
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