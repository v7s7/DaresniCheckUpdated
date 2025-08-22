import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth.jsx";
import { api } from "../lib/api";
import { queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from "../components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function AdminDashboard() {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetailDialog, setUserDetailDialog] = useState(false);

  // Fetch all users
  const { data: allUsers = [], isLoading: usersLoading, refetch: refetchUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      // This would need to be implemented in the API
      // For now, we'll use a placeholder
      const students = await api.getTutors({ role: 'student' });
      const tutors = await api.getTutors({ role: 'tutor' });
      return [...students, ...tutors];
    },
    enabled: userProfile?.role === 'admin'
  });

  // Fetch pending verification requests
  const { data: pendingTutors = [], isLoading: pendingLoading } = useQuery({
    queryKey: ['admin-pending-tutors'],
    queryFn: () => api.getTutors({ verified: false }),
    enabled: userProfile?.role === 'admin'
  });

  // Fetch all bookings for stats
  const { data: allBookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
      // This would need admin-level API access
      // For now, return empty array
      return [];
    },
    enabled: userProfile?.role === 'admin'
  });

  // Update user verification
  const updateVerificationMutation = useMutation({
    mutationFn: ({ userId, verified }) => api.updateUser(userId, { verified }),
    onSuccess: () => {
      toast({
        title: "User Updated",
        description: "User verification status has been updated."
      });
      refetchUsers();
      queryClient.invalidateQueries({ queryKey: ['admin-pending-tutors'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleVerifyTutor = (userId, verified) => {
    updateVerificationMutation.mutate({ userId, verified });
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setUserDetailDialog(true);
  };

  const filteredUsers = allUsers.filter(user =>
    user.firstName?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  const stats = {
    totalUsers: allUsers.length,
    totalStudents: allUsers.filter(u => u.role === 'student').length,
    totalTutors: allUsers.filter(u => u.role === 'tutor').length,
    pendingVerifications: pendingTutors.length,
    totalBookings: allBookings.length,
    completedBookings: allBookings.filter(b => b.status === 'completed').length
  };

  const isLoading = usersLoading || pendingLoading || bookingsLoading;

  // Redirect if not admin
  if (userProfile?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="admin-access-denied">
        <div className="text-center">
          <i className="fas fa-shield-alt text-gray-400 text-6xl mb-4"></i>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="loading-admin-dashboard">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="title-admin-dashboard">
            Admin Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Manage users, monitor platform activity, and oversee operations
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          <Card data-testid="stat-total-users">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <i className="fas fa-users text-blue-600 text-xl"></i>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                <p className="text-gray-600 text-sm">Total Users</p>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-total-students">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <i className="fas fa-user-graduate text-green-600 text-xl"></i>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                <p className="text-gray-600 text-sm">Students</p>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-total-tutors">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <i className="fas fa-chalkboard-teacher text-purple-600 text-xl"></i>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTutors}</p>
                <p className="text-gray-600 text-sm">Tutors</p>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-pending-verifications">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <i className="fas fa-clock text-yellow-600 text-xl"></i>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingVerifications}</p>
                <p className="text-gray-600 text-sm">Pending</p>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-total-bookings">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <i className="fas fa-calendar text-indigo-600 text-xl"></i>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
                <p className="text-gray-600 text-sm">Total Bookings</p>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-completed-bookings">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <i className="fas fa-check-circle text-teal-600 text-xl"></i>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.completedBookings}</p>
                <p className="text-gray-600 text-sm">Completed</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3" data-testid="tabs-admin-dashboard">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="verification">Tutor Verification</TabsTrigger>
            <TabsTrigger value="analytics">Platform Analytics</TabsTrigger>
          </TabsList>

          {/* User Management */}
          <TabsContent value="users" className="space-y-6" data-testid="tab-users">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>All Users</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Search users..."
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      className="w-64"
                      data-testid="input-search-users"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-8" data-testid="no-users-found">
                    <i className="fas fa-search text-gray-400 text-6xl mb-4"></i>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Users Found</h3>
                    <p className="text-gray-600">Try adjusting your search criteria.</p>
                  </div>
                ) : (
                  <div className="space-y-3" data-testid="users-list">
                    {filteredUsers.map((user) => (
                      <div 
                        key={user.id} 
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleUserClick(user)}
                        data-testid={`user-item-${user.id}`}
                      >
                        <div className="flex items-center space-x-4">
                          {user.avatarUrl ? (
                            <img 
                              src={user.avatarUrl} 
                              alt={`${user.firstName} ${user.lastName}`}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <i className="fas fa-user text-gray-400"></i>
                            </div>
                          )}
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </h4>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={user.role === 'tutor' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                          {user.verified ? (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              Unverified
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tutor Verification */}
          <TabsContent value="verification" className="space-y-6" data-testid="tab-verification">
            <Card>
              <CardHeader>
                <CardTitle>Pending Tutor Verifications ({pendingTutors.length})</CardTitle>
                <p className="text-gray-600">Review and verify new tutor applications</p>
              </CardHeader>
              <CardContent>
                {pendingTutors.length === 0 ? (
                  <div className="text-center py-8" data-testid="no-pending-verifications">
                    <i className="fas fa-check-circle text-gray-400 text-6xl mb-4"></i>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">All Caught Up!</h3>
                    <p className="text-gray-600">No pending tutor verifications at the moment.</p>
                  </div>
                ) : (
                  <div className="space-y-4" data-testid="pending-verifications-list">
                    {pendingTutors.map((tutor) => (
                      <div key={tutor.id} className="border border-gray-200 rounded-lg p-6" data-testid={`pending-tutor-${tutor.id}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
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
                              <h3 className="font-semibold text-gray-900 text-lg">
                                {tutor.firstName} {tutor.lastName}
                              </h3>
                              <p className="text-gray-600 mb-2">{tutor.email}</p>
                              <p className="text-sm text-gray-600 mb-2">
                                Hourly Rate: ${tutor.pricePerHour}/hour
                              </p>
                              {tutor.bio && (
                                <p className="text-sm text-gray-600 max-w-md">
                                  {tutor.bio}
                                </p>
                              )}
                              <p className="text-xs text-gray-500 mt-2">
                                Applied: {new Date(tutor.createdAt?.seconds * 1000).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              size="sm"
                              onClick={() => handleVerifyTutor(tutor.id, true)}
                              disabled={updateVerificationMutation.isPending}
                              data-testid={`button-approve-tutor-${tutor.id}`}
                            >
                              <i className="fas fa-check mr-2"></i>
                              Approve
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleVerifyTutor(tutor.id, false)}
                              disabled={updateVerificationMutation.isPending}
                              data-testid={`button-reject-tutor-${tutor.id}`}
                            >
                              <i className="fas fa-times mr-2"></i>
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Platform Analytics */}
          <TabsContent value="analytics" className="space-y-6" data-testid="tab-analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">New Students (This Month)</span>
                      <span className="font-semibold">24</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">New Tutors (This Month)</span>
                      <span className="font-semibold">8</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Active Users</span>
                      <span className="font-semibold">{Math.round(stats.totalUsers * 0.7)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">User Retention Rate</span>
                      <span className="font-semibold">78%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Platform Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Success Rate</span>
                      <span className="font-semibold">94%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Session Duration</span>
                      <span className="font-semibold">65 min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Booking Conversion</span>
                      <span className="font-semibold">82%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Revenue (This Month)</span>
                      <span className="font-semibold">$12,450</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* User Detail Dialog */}
        <Dialog open={userDetailDialog} onOpenChange={setUserDetailDialog}>
          <DialogContent data-testid="dialog-user-details">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  {selectedUser.avatarUrl ? (
                    <img 
                      src={selectedUser.avatarUrl} 
                      alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                      <i className="fas fa-user text-gray-400 text-xl"></i>
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold">
                      {selectedUser.firstName} {selectedUser.lastName}
                    </h3>
                    <p className="text-gray-600">{selectedUser.email}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant={selectedUser.role === 'tutor' ? 'default' : 'secondary'}>
                        {selectedUser.role}
                      </Badge>
                      <Badge variant={selectedUser.verified ? 'default' : 'secondary'}>
                        {selectedUser.verified ? 'Verified' : 'Unverified'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Member Since</dt>
                      <dd>{new Date(selectedUser.createdAt?.seconds * 1000).toLocaleDateString()}</dd>
                    </div>
                    {selectedUser.role === 'tutor' && (
                      <>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Hourly Rate</dt>
                          <dd>${selectedUser.pricePerHour}/hour</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Rating</dt>
                          <dd>{selectedUser.ratingAvg ? `${selectedUser.ratingAvg}/5.0` : 'No ratings'}</dd>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Languages</dt>
                      <dd>{selectedUser.languages?.join(', ') || 'Not specified'}</dd>
                    </div>
                  </dl>
                </div>

                {selectedUser.bio && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Bio</h4>
                    <p className="text-gray-600 text-sm">{selectedUser.bio}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
