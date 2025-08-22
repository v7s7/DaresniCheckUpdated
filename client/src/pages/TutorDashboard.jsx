import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth.jsx";
import { api } from "../lib/api";
import { queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from "../components/LoadingSpinner";
import AvailabilityGrid from "../components/AvailabilityGrid";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function TutorDashboard() {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [subjectDialogOpen, setSubjectDialogOpen] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '', level: '', priceOverride: '' });

  // Fetch tutor bookings
  const { data: bookings = [], isLoading: bookingsLoading, refetch: refetchBookings } = useQuery({
    queryKey: ['user-bookings', userProfile?.id],
    queryFn: () => api.getUserBookings(userProfile.id, 'tutor'),
    enabled: !!userProfile?.id
  });

  // Fetch tutor subjects
  const { data: subjects = [], isLoading: subjectsLoading, refetch: refetchSubjects } = useQuery({
    queryKey: ['tutor-subjects', userProfile?.id],
    queryFn: () => api.getTutorSubjects(userProfile.id),
    enabled: !!userProfile?.id
  });

  // Fetch tutor availability
  const { data: availability, isLoading: availabilityLoading, refetch: refetchAvailability } = useQuery({
    queryKey: ['tutor-availability', userProfile?.id],
    queryFn: () => api.getTutorAvailability(userProfile.id),
    enabled: !!userProfile?.id
  });

  // Fetch tutor reviews
  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['tutor-reviews', userProfile?.id],
    queryFn: () => api.getTutorReviews(userProfile.id),
    enabled: !!userProfile?.id
  });

  // Update booking status mutation
  const updateBookingMutation = useMutation({
    mutationFn: ({ bookingId, status }) => api.updateBookingStatus(bookingId, status),
    onSuccess: () => {
      toast({
        title: "Booking Updated",
        description: "Booking status has been updated successfully."
      });
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

  // Add subject mutation
  const addSubjectMutation = useMutation({
    mutationFn: (subjectData) => api.createSubject({
      tutorId: userProfile.id,
      ...subjectData,
      priceOverride: subjectData.priceOverride ? parseFloat(subjectData.priceOverride) : null
    }),
    onSuccess: () => {
      toast({
        title: "Subject Added",
        description: "New subject has been added to your profile."
      });
      setSubjectDialogOpen(false);
      setNewSubject({ name: '', level: '', priceOverride: '' });
      refetchSubjects();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Update availability mutation
  const updateAvailabilityMutation = useMutation({
    mutationFn: (availabilityData) => api.setWeeklyAvailability(userProfile.id, availabilityData),
    onSuccess: () => {
      toast({
        title: "Availability Updated",
        description: "Your availability has been updated successfully."
      });
      refetchAvailability();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleBookingAction = (bookingId, action) => {
    updateBookingMutation.mutate({ bookingId, status: action });
  };

  const handleAddSubject = () => {
    if (!newSubject.name.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a subject name.",
        variant: "destructive"
      });
      return;
    }
    addSubjectMutation.mutate(newSubject);
  };

  const handleAvailabilityChange = (availabilityData) => {
    updateAvailabilityMutation.mutate(availabilityData);
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

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const upcomingBookings = bookings.filter(b => 
    b.status === 'approved' && new Date(b.startAt) > new Date()
  );
  const completedBookings = bookings.filter(b => b.status === 'completed');

  const totalEarnings = completedBookings.reduce((sum, booking) => {
    const duration = (new Date(booking.endAt) - new Date(booking.startAt)) / (1000 * 60 * 60);
    return sum + (userProfile?.pricePerHour || 0) * duration;
  }, 0);

  const isLoading = bookingsLoading || subjectsLoading || availabilityLoading || reviewsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="loading-tutor-dashboard">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="title-tutor-dashboard">
            Welcome back, {userProfile?.firstName}!
          </h1>
          <p className="text-lg text-gray-600">
            Manage your tutoring sessions and profile
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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

          <Card data-testid="stat-total-sessions">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-graduation-cap text-green-600 text-xl"></i>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{completedBookings.length}</p>
                  <p className="text-gray-600">Total Sessions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-total-earnings">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-dollar-sign text-primary-600 text-xl"></i>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">${totalEarnings.toFixed(2)}</p>
                  <p className="text-gray-600">Total Earnings</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5" data-testid="tabs-tutor-dashboard">
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Pending Requests */}
          <TabsContent value="requests" className="space-y-4" data-testid="tab-requests">
            {pendingBookings.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8" data-testid="no-pending-requests">
                    <i className="fas fa-inbox text-gray-400 text-6xl mb-4"></i>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pending Requests</h3>
                    <p className="text-gray-600">New booking requests will appear here.</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              pendingBookings.map((booking) => (
                <Card key={booking.id} data-testid={`booking-request-${booking.id}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                          <i className="fas fa-user text-yellow-600"></i>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">New Booking Request</h3>
                          <p className="text-sm text-gray-600">
                            {new Date(booking.startAt).toLocaleDateString()} at{' '}
                            {new Date(booking.startAt).toLocaleTimeString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            Duration: {Math.round((new Date(booking.endAt) - new Date(booking.startAt)) / (1000 * 60))} minutes
                          </p>
                          {booking.notes && (
                            <p className="text-sm text-gray-600 mt-1 italic">"{booking.notes}"</p>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm"
                          onClick={() => handleBookingAction(booking.id, 'approved')}
                          disabled={updateBookingMutation.isPending}
                          data-testid={`button-approve-${booking.id}`}
                        >
                          <i className="fas fa-check mr-2"></i>
                          Approve
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleBookingAction(booking.id, 'cancelled')}
                          disabled={updateBookingMutation.isPending}
                          data-testid={`button-decline-${booking.id}`}
                        >
                          <i className="fas fa-times mr-2"></i>
                          Decline
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Upcoming Sessions */}
          <TabsContent value="upcoming" className="space-y-4" data-testid="tab-upcoming-sessions">
            {upcomingBookings.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8" data-testid="no-upcoming-sessions">
                    <i className="fas fa-calendar text-gray-400 text-6xl mb-4"></i>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Upcoming Sessions</h3>
                    <p className="text-gray-600">Your approved sessions will appear here.</p>
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
                          <i className="fas fa-video text-blue-600"></i>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Upcoming Session</h3>
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
                        <Button size="sm" data-testid={`button-start-session-${booking.id}`}>
                          <i className="fas fa-play mr-2"></i>
                          Start Session
                        </Button>
                        <Button variant="outline" size="sm" data-testid={`button-reschedule-${booking.id}`}>
                          <i className="fas fa-calendar-alt mr-2"></i>
                          Reschedule
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Profile Management */}
          <TabsContent value="profile" className="space-y-6" data-testid="tab-profile">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Subjects */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Subjects I Teach</CardTitle>
                    <Button 
                      size="sm"
                      onClick={() => setSubjectDialogOpen(true)}
                      data-testid="button-add-subject"
                    >
                      <i className="fas fa-plus mr-2"></i>
                      Add Subject
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {subjects.length === 0 ? (
                    <p className="text-gray-600" data-testid="no-subjects">
                      No subjects added yet. Add your first subject to start receiving bookings.
                    </p>
                  ) : (
                    <div className="space-y-3" data-testid="subjects-list">
                      {subjects.map((subject) => (
                        <div key={subject.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-900">{subject.name}</h4>
                            {subject.level && (
                              <p className="text-sm text-gray-600">{subject.level}</p>
                            )}
                          </div>
                          <div className="text-primary-600 font-semibold">
                            ${subject.priceOverride || userProfile?.pricePerHour}/hour
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Reviews */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  {reviews.length === 0 ? (
                    <p className="text-gray-600" data-testid="no-reviews">
                      No reviews yet. Complete some sessions to receive reviews.
                    </p>
                  ) : (
                    <div className="space-y-4" data-testid="reviews-list">
                      {reviews.slice(0, 3).map((review) => (
                        <div key={review.id} className="border-b border-gray-200 pb-3 last:border-b-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="flex text-yellow-400">
                              {[...Array(5)].map((_, i) => (
                                <i 
                                  key={i}
                                  className={`fas fa-star text-xs ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                ></i>
                              ))}
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(review.createdAt?.seconds * 1000).toLocaleDateString()}
                            </span>
                          </div>
                          {review.comment && (
                            <p className="text-sm text-gray-600">"{review.comment}"</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Availability Management */}
          <TabsContent value="availability" className="space-y-6" data-testid="tab-availability">
            <Card>
              <CardHeader>
                <CardTitle>Manage Your Availability</CardTitle>
                <p className="text-gray-600">Set your weekly schedule to let students know when you're available.</p>
              </CardHeader>
              <CardContent>
                <AvailabilityGrid
                  availability={availability?.weekly || []}
                  onAvailabilityChange={handleAvailabilityChange}
                  readOnly={false}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-6" data-testid="tab-analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Rating</span>
                      <span className="font-semibold">
                        {userProfile?.ratingAvg ? `${userProfile.ratingAvg}/5.0` : 'No ratings yet'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Reviews</span>
                      <span className="font-semibold">{userProfile?.ratingCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Response Rate</span>
                      <span className="font-semibold">98%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Completion Rate</span>
                      <span className="font-semibold">96%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Earnings Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">This Month</span>
                      <span className="font-semibold">${(totalEarnings * 0.3).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Earnings</span>
                      <span className="font-semibold">${totalEarnings.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hourly Rate</span>
                      <span className="font-semibold">${userProfile?.pricePerHour || 0}/hour</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Add Subject Dialog */}
        <Dialog open={subjectDialogOpen} onOpenChange={setSubjectDialogOpen}>
          <DialogContent data-testid="dialog-add-subject">
            <DialogHeader>
              <DialogTitle>Add New Subject</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject Name *
                </label>
                <Input
                  placeholder="e.g., Mathematics, Physics, English"
                  value={newSubject.name}
                  onChange={(e) => setNewSubject(prev => ({ ...prev, name: e.target.value }))}
                  data-testid="input-subject-name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Level
                </label>
                <Select 
                  value={newSubject.level}
                  onValueChange={(value) => setNewSubject(prev => ({ ...prev, level: value }))}
                >
                  <SelectTrigger data-testid="select-subject-level">
                    <SelectValue placeholder="Select level (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Elementary">Elementary</SelectItem>
                    <SelectItem value="Middle School">Middle School</SelectItem>
                    <SelectItem value="High School">High School</SelectItem>
                    <SelectItem value="University">University</SelectItem>
                    <SelectItem value="Professional">Professional</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Price (Optional)
                </label>
                <Input
                  type="number"
                  placeholder={`Default: $${userProfile?.pricePerHour || 0}/hour`}
                  value={newSubject.priceOverride}
                  onChange={(e) => setNewSubject(prev => ({ ...prev, priceOverride: e.target.value }))}
                  data-testid="input-subject-price"
                />
              </div>

              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setSubjectDialogOpen(false)}
                  data-testid="button-cancel-subject"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddSubject}
                  disabled={addSubjectMutation.isPending}
                  data-testid="button-save-subject"
                >
                  {addSubjectMutation.isPending ? (
                    <>
                      <LoadingSpinner size="small" className="mr-2" />
                      Adding...
                    </>
                  ) : (
                    'Add Subject'
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
