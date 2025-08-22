import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "../hooks/useAuth.jsx";
import { api } from "../lib/api";
import { queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from "../components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function StudentDashboard() {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: ''
  });

  // Fetch student bookings
  const { data: bookings = [], isLoading: bookingsLoading, refetch: refetchBookings } = useQuery({
    queryKey: ['user-bookings', userProfile?.id],
    queryFn: () => api.getUserBookings(userProfile.id, 'student'),
    enabled: !!userProfile?.id
  });

  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: (reviewData) => api.createReview(reviewData),
    onSuccess: () => {
      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback!"
      });
      setReviewDialogOpen(false);
      setSelectedBooking(null);
      setReviewData({ rating: 5, comment: '' });
      refetchBookings();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleReviewSubmit = () => {
    if (!selectedBooking || !reviewData.rating) {
      toast({
        title: "Missing Information",
        description: "Please provide a rating.",
        variant: "destructive"
      });
      return;
    }

    submitReviewMutation.mutate({
      tutorId: selectedBooking.tutorId,
      studentId: userProfile.id,
      bookingId: selectedBooking.id,
      rating: reviewData.rating,
      comment: reviewData.comment
    });
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'approved':
        return 'default';
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'approved':
        return 'text-blue-600 bg-blue-100';
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const upcomingBookings = bookings.filter(b => 
    ['approved'].includes(b.status) && new Date(b.startAt) > new Date()
  );

  const pastBookings = bookings.filter(b => 
    b.status === 'completed' || new Date(b.startAt) < new Date()
  );

  const pendingBookings = bookings.filter(b => b.status === 'pending');

  if (bookingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="loading-student-dashboard">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="title-student-dashboard">
            Welcome back, {userProfile?.firstName}!
          </h1>
          <p className="text-lg text-gray-600">
            Manage your learning sessions and track your progress
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card data-testid="stat-upcoming-sessions">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-calendar-check text-blue-600 text-xl"></i>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{upcomingBookings.length}</p>
                  <p className="text-gray-600">Upcoming Sessions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-completed-sessions">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-graduation-cap text-green-600 text-xl"></i>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{pastBookings.length}</p>
                  <p className="text-gray-600">Completed Sessions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-pending-requests">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-clock text-yellow-600 text-xl"></i>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{pendingBookings.length}</p>
                  <p className="text-gray-600">Pending Requests</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-total-hours">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-hourglass-half text-purple-600 text-xl"></i>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{pastBookings.length * 1}</p>
                  <p className="text-gray-600">Hours Learned</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3" data-testid="tabs-dashboard">
            <TabsTrigger value="upcoming">Upcoming Sessions</TabsTrigger>
            <TabsTrigger value="past">Past Sessions</TabsTrigger>
            <TabsTrigger value="requests">Pending Requests</TabsTrigger>
          </TabsList>

          {/* Upcoming Sessions */}
          <TabsContent value="upcoming" className="space-y-4" data-testid="tab-upcoming-sessions">
            {upcomingBookings.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8" data-testid="no-upcoming-sessions">
                    <i className="fas fa-calendar text-gray-400 text-6xl mb-4"></i>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Upcoming Sessions</h3>
                    <p className="text-gray-600 mb-4">
                      Ready to start learning? Find a tutor and book your next session.
                    </p>
                    <Link href="/search">
                      <Button data-testid="button-find-tutors">Find Tutors</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              upcomingBookings.map((booking) => (
                <Card key={booking.id} data-testid={`booking-upcoming-${booking.id}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <i className="fas fa-user-tie text-blue-600"></i>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Session with Tutor</h3>
                          <p className="text-sm text-gray-600">
                            {new Date(booking.startAt).toLocaleDateString()} at{' '}
                            {new Date(booking.startAt).toLocaleTimeString()}
                          </p>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <Button variant="outline" size="sm" data-testid={`button-join-session-${booking.id}`}>
                          <i className="fas fa-video mr-2"></i>
                          Join Session
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Past Sessions */}
          <TabsContent value="past" className="space-y-4" data-testid="tab-past-sessions">
            {pastBookings.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8" data-testid="no-past-sessions">
                    <i className="fas fa-history text-gray-400 text-6xl mb-4"></i>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Past Sessions</h3>
                    <p className="text-gray-600">Your completed sessions will appear here.</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              pastBookings.map((booking) => (
                <Card key={booking.id} data-testid={`booking-past-${booking.id}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <i className="fas fa-check text-green-600"></i>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Session with Tutor</h3>
                          <p className="text-sm text-gray-600">
                            {new Date(booking.startAt).toLocaleDateString()} at{' '}
                            {new Date(booking.startAt).toLocaleTimeString()}
                          </p>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setReviewDialogOpen(true);
                          }}
                          data-testid={`button-review-${booking.id}`}
                        >
                          <i className="fas fa-star mr-2"></i>
                          Write Review
                        </Button>
                        <Button variant="outline" size="sm" data-testid={`button-book-again-${booking.id}`}>
                          <i className="fas fa-redo mr-2"></i>
                          Book Again
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Pending Requests */}
          <TabsContent value="requests" className="space-y-4" data-testid="tab-pending-requests">
            {pendingBookings.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8" data-testid="no-pending-requests">
                    <i className="fas fa-hourglass-half text-gray-400 text-6xl mb-4"></i>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pending Requests</h3>
                    <p className="text-gray-600">Your booking requests will appear here.</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              pendingBookings.map((booking) => (
                <Card key={booking.id} data-testid={`booking-pending-${booking.id}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                          <i className="fas fa-clock text-yellow-600"></i>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Booking Request</h3>
                          <p className="text-sm text-gray-600">
                            {new Date(booking.startAt).toLocaleDateString()} at{' '}
                            {new Date(booking.startAt).toLocaleTimeString()}
                          </p>
                          <Badge className={getStatusColor(booking.status)}>
                            Waiting for approval
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <Button variant="outline" size="sm" data-testid={`button-cancel-request-${booking.id}`}>
                          Cancel Request
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Review Dialog */}
        <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
          <DialogContent data-testid="dialog-review">
            <DialogHeader>
              <DialogTitle>Write a Review</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <Select 
                  value={reviewData.rating.toString()}
                  onValueChange={(value) => setReviewData(prev => ({ ...prev, rating: parseInt(value) }))}
                >
                  <SelectTrigger data-testid="select-review-rating">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">⭐⭐⭐⭐⭐ Excellent</SelectItem>
                    <SelectItem value="4">⭐⭐⭐⭐ Very Good</SelectItem>
                    <SelectItem value="3">⭐⭐⭐ Good</SelectItem>
                    <SelectItem value="2">⭐⭐ Fair</SelectItem>
                    <SelectItem value="1">⭐ Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comment (Optional)
                </label>
                <Textarea
                  placeholder="Share your experience with this tutor..."
                  value={reviewData.comment}
                  onChange={(e) => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
                  data-testid="textarea-review-comment"
                />
              </div>

              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setReviewDialogOpen(false)}
                  data-testid="button-cancel-review"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleReviewSubmit}
                  disabled={submitReviewMutation.isPending}
                  data-testid="button-submit-review"
                >
                  {submitReviewMutation.isPending ? (
                    <>
                      <LoadingSpinner size="small" className="mr-2" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Review'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
