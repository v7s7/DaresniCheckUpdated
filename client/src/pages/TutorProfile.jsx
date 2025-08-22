import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth.jsx";
import { api } from "../lib/api";
import LoadingSpinner from "../components/LoadingSpinner";
import AvailabilityGrid from "../components/AvailabilityGrid";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TutorProfile() {
  const { id } = useParams();
  const { isAuthenticated, userProfile } = useAuth();

  // Fetch tutor data
  const { data: tutor, isLoading: tutorLoading } = useQuery({
    queryKey: ['tutor', id],
    queryFn: () => api.getUser(id)
  });

  // Fetch tutor subjects
  const { data: subjects = [], isLoading: subjectsLoading } = useQuery({
    queryKey: ['tutor-subjects', id],
    queryFn: () => api.getTutorSubjects(id),
    enabled: !!id
  });

  // Fetch tutor reviews
  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['tutor-reviews', id],
    queryFn: () => api.getTutorReviews(id),
    enabled: !!id
  });

  // Fetch tutor availability
  const { data: availability, isLoading: availabilityLoading } = useQuery({
    queryKey: ['tutor-availability', id],
    queryFn: () => api.getTutorAvailability(id),
    enabled: !!id
  });

  const isLoading = tutorLoading || subjectsLoading || reviewsLoading || availabilityLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="loading-tutor-profile">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!tutor || tutor.role !== 'tutor') {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="tutor-not-found">
        <div className="text-center">
          <i className="fas fa-user-slash text-gray-400 text-6xl mb-4"></i>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Tutor Not Found</h2>
          <p className="text-gray-600 mb-4">The tutor you're looking for doesn't exist.</p>
          <Link href="/search">
            <Button>Back to Search</Button>
          </Link>
        </div>
      </div>
    );
  }

  const canBookSession = isAuthenticated && userProfile?.role === 'student' && userProfile.id !== tutor.id;
  const displayName = `${tutor.firstName} ${tutor.lastName}`;
  const rating = tutor.ratingAvg || 0;
  const reviewCount = tutor.ratingCount || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
                  <div className="relative">
                    {tutor.avatarUrl ? (
                      <img 
                        src={tutor.avatarUrl} 
                        alt={displayName}
                        className="w-24 h-24 rounded-full object-cover"
                        data-testid="img-tutor-avatar"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                        <i className="fas fa-user text-gray-400 text-3xl"></i>
                      </div>
                    )}
                    {tutor.verified && (
                      <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <i className="fas fa-check text-white"></i>
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h1 className="text-2xl font-bold text-gray-900" data-testid="text-tutor-name">
                        {displayName}
                      </h1>
                      {tutor.verified && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Verified
                        </Badge>
                      )}
                    </div>

                    {/* Rating */}
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <i 
                            key={i}
                            className={`fas fa-star ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                          ></i>
                        ))}
                      </div>
                      <span className="text-sm text-gray-600" data-testid="text-tutor-rating">
                        {rating.toFixed(1)} ({reviewCount} reviews)
                      </span>
                    </div>

                    <div className="text-2xl font-bold text-primary-600 mb-2" data-testid="text-tutor-price">
                      ${tutor.pricePerHour}/hour
                    </div>

                    {/* Languages */}
                    {tutor.languages && tutor.languages.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {tutor.languages.map((lang, index) => (
                          <Badge key={index} variant="outline">
                            {lang === 'en' ? 'English' : lang === 'ar' ? 'العربية' : lang}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bio */}
            {tutor.bio && (
              <Card>
                <CardHeader>
                  <CardTitle>About Me</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed" data-testid="text-tutor-bio">
                    {tutor.bio}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Subjects */}
            {subjects.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Subjects I Teach</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="tutor-subjects">
                    {subjects.map((subject) => (
                      <div key={subject.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">{subject.name}</h4>
                          {subject.level && (
                            <p className="text-sm text-gray-600">{subject.level}</p>
                          )}
                        </div>
                        {subject.priceOverride && (
                          <div className="text-primary-600 font-semibold">
                            ${subject.priceOverride}/hour
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Reviews ({reviews.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {reviews.length === 0 ? (
                  <p className="text-gray-600" data-testid="no-reviews">No reviews yet.</p>
                ) : (
                  <div className="space-y-4" data-testid="tutor-reviews">
                    {reviews.slice(0, 5).map((review) => (
                      <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="flex text-yellow-400">
                              {[...Array(5)].map((_, i) => (
                                <i 
                                  key={i}
                                  className={`fas fa-star text-xs ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                ></i>
                              ))}
                            </div>
                            <span className="text-sm font-medium">Anonymous Student</span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.createdAt?.seconds * 1000).toLocaleDateString()}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-gray-600 text-sm">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="text-3xl font-bold text-primary-600">
                    ${tutor.pricePerHour}
                    <span className="text-base font-normal text-gray-600">/hour</span>
                  </div>
                  
                  {canBookSession ? (
                    <Link href={`/book/${tutor.id}`}>
                      <Button className="w-full" size="lg" data-testid="button-book-session">
                        <i className="fas fa-calendar-plus mr-2"></i>
                        Book a Session
                      </Button>
                    </Link>
                  ) : (
                    <div className="space-y-2">
                      {!isAuthenticated && (
                        <Link href="/login">
                          <Button className="w-full" size="lg" data-testid="button-login-to-book">
                            Login to Book
                          </Button>
                        </Link>
                      )}
                      {isAuthenticated && userProfile?.role !== 'student' && (
                        <p className="text-sm text-gray-600">Only students can book sessions</p>
                      )}
                    </div>
                  )}

                  <Button variant="outline" className="w-full" data-testid="button-send-message">
                    <i className="fas fa-envelope mr-2"></i>
                    Send Message
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Availability */}
            {availability && (
              <Card>
                <CardHeader>
                  <CardTitle>Availability</CardTitle>
                </CardHeader>
                <CardContent>
                  <AvailabilityGrid
                    availability={availability.weekly || []}
                    readOnly={true}
                  />
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Response Rate</span>
                  <span className="font-semibold">98%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Response Time</span>
                  <span className="font-semibold">2 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Sessions</span>
                  <span className="font-semibold">150+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-semibold">
                    {new Date(tutor.createdAt?.seconds * 1000).getFullYear()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
