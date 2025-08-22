import { useState } from "react";
import { useParams, useLocation, Redirect } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth.jsx";
import { api } from "../lib/api";
import { queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from "../components/LoadingSpinner";
import AvailabilityGrid from "../components/AvailabilityGrid";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const BOOKING_STEPS = {
  SELECT_SUBJECT: 1,
  SELECT_TIME: 2,
  CONFIRM_DETAILS: 3,
  PAYMENT: 4,
  CONFIRMATION: 5
};

export default function BookingFlow() {
  const { tutorId } = useParams();
  const [location, navigate] = useLocation();
  const { isAuthenticated, userProfile } = useAuth();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(BOOKING_STEPS.SELECT_SUBJECT);
  const [bookingData, setBookingData] = useState({
    subjectId: '',
    selectedSlot: null,
    duration: 60,
    notes: '',
    totalPrice: 0
  });

  // Fetch tutor data
  const { data: tutor, isLoading: tutorLoading } = useQuery({
    queryKey: ['tutor', tutorId],
    queryFn: () => api.getUser(tutorId)
  });

  // Fetch tutor subjects
  const { data: subjects = [], isLoading: subjectsLoading } = useQuery({
    queryKey: ['tutor-subjects', tutorId],
    queryFn: () => api.getTutorSubjects(tutorId),
    enabled: !!tutorId
  });

  // Fetch tutor availability
  const { data: availability, isLoading: availabilityLoading } = useQuery({
    queryKey: ['tutor-availability', tutorId],
    queryFn: () => api.getTutorAvailability(tutorId),
    enabled: !!tutorId
  });

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: (bookingData) => api.createBooking(bookingData),
    onSuccess: (booking) => {
      queryClient.invalidateQueries({ queryKey: ['user-bookings'] });
      setCurrentStep(BOOKING_STEPS.CONFIRMATION);
      toast({
        title: "Booking Request Sent!",
        description: "Your tutor will review and respond to your request soon."
      });
    },
    onError: (error) => {
      toast({
        title: "Booking Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Redirect if not authenticated or not a student
  if (!isAuthenticated || userProfile?.role !== 'student') {
    return <Redirect to="/login" />;
  }

  const isLoading = tutorLoading || subjectsLoading || availabilityLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="loading-booking">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!tutor || tutor.role !== 'tutor') {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="tutor-not-found-booking">
        <div className="text-center">
          <i className="fas fa-user-slash text-gray-400 text-6xl mb-4"></i>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Tutor Not Found</h2>
          <p className="text-gray-600">Unable to load tutor information for booking.</p>
        </div>
      </div>
    );
  }

  const handleSubjectSelect = (subjectId) => {
    const selectedSubject = subjects.find(s => s.id === subjectId);
    const price = selectedSubject?.priceOverride || tutor.pricePerHour;
    
    setBookingData(prev => ({
      ...prev,
      subjectId,
      totalPrice: price * (prev.duration / 60)
    }));
    setCurrentStep(BOOKING_STEPS.SELECT_TIME);
  };

  const handleTimeSelect = (slot) => {
    setBookingData(prev => ({
      ...prev,
      selectedSlot: slot
    }));
  };

  const handleConfirmBooking = () => {
    if (!bookingData.subjectId || !bookingData.selectedSlot) {
      toast({
        title: "Missing Information",
        description: "Please select a subject and time slot.",
        variant: "destructive"
      });
      return;
    }

    const bookingRequest = {
      tutorId: tutorId,
      studentId: userProfile.id,
      subjectId: bookingData.subjectId,
      startAt: new Date(bookingData.selectedSlot.datetime).toISOString(),
      endAt: new Date(bookingData.selectedSlot.datetime + bookingData.duration * 60000).toISOString(),
      notes: bookingData.notes,
      groupSeatsMax: 1,
      groupSeatsTaken: 1
    };

    createBookingMutation.mutate(bookingRequest);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case BOOKING_STEPS.SELECT_SUBJECT:
        return (
          <Card data-testid="step-select-subject">
            <CardHeader>
              <CardTitle>Select a Subject</CardTitle>
              <p className="text-gray-600">Choose which subject you'd like to learn</p>
            </CardHeader>
            <CardContent>
              {subjects.length === 0 ? (
                <p className="text-gray-600">No subjects available for this tutor.</p>
              ) : (
                <div className="space-y-3">
                  {subjects.map((subject) => (
                    <button
                      key={subject.id}
                      onClick={() => handleSubjectSelect(subject.id)}
                      className="w-full p-4 text-left border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
                      data-testid={`subject-option-${subject.id}`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium text-gray-900">{subject.name}</h3>
                          {subject.level && (
                            <p className="text-sm text-gray-600">{subject.level}</p>
                          )}
                        </div>
                        <div className="text-primary-600 font-semibold">
                          ${subject.priceOverride || tutor.pricePerHour}/hour
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );

      case BOOKING_STEPS.SELECT_TIME:
        return (
          <Card data-testid="step-select-time">
            <CardHeader>
              <CardTitle>Select Date & Time</CardTitle>
              <p className="text-gray-600">Choose an available time slot</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Duration
                  </label>
                  <Select 
                    value={bookingData.duration.toString()}
                    onValueChange={(value) => {
                      const duration = parseInt(value);
                      const selectedSubject = subjects.find(s => s.id === bookingData.subjectId);
                      const price = selectedSubject?.priceOverride || tutor.pricePerHour;
                      setBookingData(prev => ({
                        ...prev,
                        duration,
                        totalPrice: price * (duration / 60)
                      }));
                    }}
                  >
                    <SelectTrigger data-testid="select-duration">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {availability && (
                  <AvailabilityGrid
                    availability={availability.weekly || []}
                    readOnly={true}
                    onSlotSelect={handleTimeSelect}
                  />
                )}

                {bookingData.selectedSlot && (
                  <div className="p-4 bg-primary-50 rounded-lg">
                    <h4 className="font-medium text-primary-900 mb-2">Selected Time</h4>
                    <p className="text-primary-800">
                      {bookingData.selectedSlot.day} at {bookingData.selectedSlot.time}
                    </p>
                    <p className="text-primary-600 text-sm">
                      Duration: {bookingData.duration} minutes
                    </p>
                  </div>
                )}

                <div className="flex space-x-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentStep(BOOKING_STEPS.SELECT_SUBJECT)}
                    data-testid="button-back-to-subject"
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={() => setCurrentStep(BOOKING_STEPS.CONFIRM_DETAILS)}
                    disabled={!bookingData.selectedSlot}
                    data-testid="button-continue-to-confirm"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case BOOKING_STEPS.CONFIRM_DETAILS:
        const selectedSubject = subjects.find(s => s.id === bookingData.subjectId);
        
        return (
          <Card data-testid="step-confirm-details">
            <CardHeader>
              <CardTitle>Confirm Booking Details</CardTitle>
              <p className="text-gray-600">Review your session details before booking</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Tutor Info */}
                <div className="flex items-center space-x-4">
                  {tutor.avatarUrl ? (
                    <img 
                      src={tutor.avatarUrl} 
                      alt={`${tutor.firstName} ${tutor.lastName}`}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                      <i className="fas fa-user text-gray-400 text-xl"></i>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {tutor.firstName} {tutor.lastName}
                    </h3>
                    <p className="text-gray-600">Your Tutor</p>
                  </div>
                </div>

                {/* Session Details */}
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">Session Details</h4>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Subject</dt>
                      <dd className="font-medium">{selectedSubject?.name}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Date & Time</dt>
                      <dd className="font-medium">
                        {bookingData.selectedSlot?.day} at {bookingData.selectedSlot?.time}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Duration</dt>
                      <dd className="font-medium">{bookingData.duration} minutes</dd>
                    </div>
                    <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                      <dt>Total Price</dt>
                      <dd className="text-primary-600">${bookingData.totalPrice}</dd>
                    </div>
                  </dl>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <Textarea
                    placeholder="Any specific topics you'd like to focus on or questions you have..."
                    value={bookingData.notes}
                    onChange={(e) => setBookingData(prev => ({ ...prev, notes: e.target.value }))}
                    data-testid="textarea-booking-notes"
                  />
                </div>

                {/* Actions */}
                <div className="flex space-x-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentStep(BOOKING_STEPS.SELECT_TIME)}
                    data-testid="button-back-to-time"
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={handleConfirmBooking}
                    disabled={createBookingMutation.isPending}
                    data-testid="button-confirm-booking"
                  >
                    {createBookingMutation.isPending ? (
                      <>
                        <LoadingSpinner size="small" className="mr-2" />
                        Booking...
                      </>
                    ) : (
                      'Send Booking Request'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case BOOKING_STEPS.CONFIRMATION:
        return (
          <Card data-testid="step-confirmation">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <i className="fas fa-check text-green-600 text-2xl"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Booking Request Sent!</h2>
                <p className="text-gray-600 max-w-md mx-auto">
                  Your booking request has been sent to {tutor.firstName} {tutor.lastName}. 
                  You'll receive a notification once they respond.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button 
                    onClick={() => navigate('/dashboard')}
                    data-testid="button-go-to-dashboard"
                  >
                    Go to Dashboard
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate(`/tutor/${tutorId}`)}
                    data-testid="button-back-to-profile"
                  >
                    Back to Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        {currentStep < BOOKING_STEPS.CONFIRMATION && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Step {currentStep} of 3</span>
              <span className="text-sm text-gray-600">
                {Math.round((currentStep / 3) * 100)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Book a Session</h1>
          <p className="text-lg text-gray-600">
            with {tutor.firstName} {tutor.lastName}
          </p>
        </div>

        {/* Step Content */}
        <div className="max-w-2xl mx-auto">
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
}
