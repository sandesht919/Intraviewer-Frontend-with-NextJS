/**
 * Profile Page
 * 
 * Classic user profile page with personal information, settings, and account management.
 * Features comprehensive user data management and professional layout.
 */

'use client';

import { useState, useEffect } from 'react';
import { RouteGuard } from '@/components/guards/RouteGuard';
import { useAuthStore } from '@/lib/stores/authStore';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Calendar, 
  Edit3, 
  Save, 
  X,
  Camera,
  Shield,
  Bell,
  Key,
  Globe,
  Award,
  FileText,
  Settings as SettingsIcon,
  Star,
  Clock,
  TrendingUp,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  const { user, setUser, isAuthenticated, fetchUserData } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [mounted, setMounted] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Initialize mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Form state for editing - initialized with real user data
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    name: '',
    email: '',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    title: 'Interview Candidate',
    company: 'Looking for Opportunities',
    bio: 'Preparing for technical interviews and enhancing my skills through IntraViewer.',
    linkedIn: '',
    website: '',
    skills: ['Problem Solving', 'Communication', 'Technical Skills']
  });

  // Update form data when user data changes
  useEffect(() => {
    if (user && mounted) {
      setFormData(prev => ({
        ...prev,
        firstname: user.firstname ?? '',
        lastname: user.lastname ?? '',
        name: user.name ?? `${user.firstname ?? ''} ${user.lastname ?? ''}`.trim(),
        email: user.email ?? '',
      }));
    }
  }, [user, mounted]);

  // Fetch user data on mount
  useEffect(() => {
    if (mounted && isAuthenticated) {
      handleRefreshUserData();
    }
  }, [mounted, isAuthenticated]);

  // Handle refreshing user data
  const handleRefreshUserData = async () => {
    setIsRefreshing(true);
    try {
      await fetchUserData();
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Helper function to extract name from email
  const extractNameFromEmail = (email: string): string => {
    const username = email.split('@')[0];
    return username.charAt(0).toUpperCase() + username.slice(1);
  };

  // Get user initials for avatar
  const getUserInitials = (): string => {
    if (user?.firstname && user?.lastname) {
      return `${user.firstname?.[0] || ''}${user.lastname?.[0] || ''}`.toUpperCase();
    }
    if (user?.firstname) {
      return user.firstname?.[0]?.toUpperCase() || 'U';
    }
    if (formData.name) {
      return formData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return 'U';
  };

  // Calculate user stats based on usage
  const userStats = {
    interviewsCompleted: 8,
    averageScore: 78,
    totalPracticeTime: '12.5h',
    achievements: 4,
    streak: 5,
    joinDate: user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Recently',
    isActive: user?.is_active || false,
    role: user?.role || 'user'
  };

  const handleSave = () => {
    // Update user data
    if (user) {
      setUser({ ...user, name: formData.name, email: formData.email });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset form data
    setFormData({
      ...formData,
      name: user?.name || '',
      email: user?.email || ''
    });
    setIsEditing(false);
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'professional', label: 'Professional', icon: Briefcase },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: SettingsIcon }
  ];

  const achievements = [
    { 
      title: 'Getting Started', 
      description: 'Completed your first interview practice', 
      icon: Award, 
      earned: userStats.interviewsCompleted > 0,
      progress: Math.min(100, (userStats.interviewsCompleted / 1) * 100)
    },
    { 
      title: 'Consistent Learner', 
      description: `${userStats.streak}-day practice streak`, 
      icon: Calendar, 
      earned: userStats.streak >= 3,
      progress: Math.min(100, (userStats.streak / 7) * 100)
    },
    { 
      title: 'Rising Star', 
      description: 'Achieved 75%+ average score', 
      icon: Star, 
      earned: userStats.averageScore >= 75,
      progress: Math.min(100, (userStats.averageScore / 75) * 100)
    },
    { 
      title: 'Interview Pro', 
      description: 'Completed 10+ practice sessions', 
      icon: TrendingUp, 
      earned: userStats.interviewsCompleted >= 10,
      progress: Math.min(100, (userStats.interviewsCompleted / 10) * 100)
    }
  ];

  // Show loading state while mounting
  if (!mounted) {
    return (
      <RouteGuard requireAuth={true}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your profile...</p>
          </div>
        </div>
      </RouteGuard>
    );
  }

  return (
    <RouteGuard requireAuth={true}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-4xl mx-auto p-6">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-8 overflow-hidden">
            <div className="relative h-40 bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600">
              {/* Decorative pattern */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
              <div className="absolute top-4 right-4 flex gap-2">
                <div className="w-3 h-3 bg-white/30 rounded-full"></div>
                <div className="w-3 h-3 bg-white/20 rounded-full"></div>
                <div className="w-3 h-3 bg-white/10 rounded-full"></div>
              </div>
              
              {/* Profile Photo */}
              <div className="absolute -bottom-20 left-8">
                <div className="relative group">
                  <div className="w-40 h-40 bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full border-6 border-white shadow-xl flex items-center justify-center text-4xl font-bold text-white">
                    {getUserInitials()}
                  </div>
                  <button className="absolute bottom-3 right-3 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all duration-200 hover:scale-110">
                    <Camera className="w-5 h-5 text-gray-600" />
                  </button>
                  
                  {/* Online indicator */}
                  <div className="absolute top-3 right-3 w-6 h-6 bg-green-500 rounded-full border-3 border-white flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
              
              {/* Edit Button */}
              <div className="absolute top-4 right-4">
                <div className="flex gap-2">
                  {/* Refresh Data Button */}
                  <Button
                    onClick={handleRefreshUserData}
                    disabled={isRefreshing}
                    variant="outline"
                    className="bg-white/90 text-gray-700 hover:bg-white"
                    size="sm"
                  >
                    {isRefreshing ? (
                      <div className="w-4 h-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                    ) : (
                      <>
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Sync
                      </>
                    )}
                  </Button>
                  
                  {isEditing ? (
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSave}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        size="sm"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button
                        onClick={handleCancel}
                        variant="outline"
                        className="bg-white text-gray-700"
                        size="sm"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      className="bg-white/90 text-gray-700 hover:bg-white"
                      size="sm"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>
            </div>
            
            {/* Profile Info */}
            <div className="pt-24 p-8">
              <div className="flex flex-col lg:flex-row lg:items-end gap-6">
                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="text-3xl font-bold text-gray-900 bg-transparent border-b-2 border-sky-500 focus:outline-none w-full"
                        placeholder="Your Name"
                      />
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="text-xl text-gray-600 bg-transparent border-b border-gray-300 focus:outline-none focus:border-sky-500 w-full"
                        placeholder="Job Title"
                      />
                    </div>
                  ) : (
                    <div>
                      <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        {formData.name || 'Welcome!'}
                      </h1>
                      <p className="text-xl text-gray-600 mb-1">{formData.title}</p>
                      <p className="text-gray-500 mb-3">{formData.company}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Joined {userStats.joinDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {userStats.totalPracticeTime} practiced
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Enhanced Quick Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl border border-sky-100">
                    <div className="text-2xl font-bold text-sky-600 mb-1">{userStats.interviewsCompleted}</div>
                    <div className="text-xs text-gray-600 font-medium">Interviews</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-100">
                    <div className="text-2xl font-bold text-emerald-600 mb-1">{userStats.averageScore}%</div>
                    <div className="text-xs text-gray-600 font-medium">Avg Score</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                    <div className="text-2xl font-bold text-indigo-600 mb-1">{userStats.achievements}</div>
                    <div className="text-xs text-gray-600 font-medium">Achievements</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                    <div className="text-2xl font-bold text-amber-600 mb-1">{userStats.streak}</div>
                    <div className="text-xs text-gray-600 font-medium">Day Streak</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors
                        ${activeTab === tab.id
                          ? 'border-sky-500 text-sky-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'personal' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-gray-900">
                            <User className="w-4 h-4 text-gray-500" />
                            {formData.name}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        {isEditing ? (
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-gray-900">
                            <Mail className="w-4 h-4 text-gray-500" />
                            {formData.email}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                        {isEditing ? (
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-gray-900">
                            <Phone className="w-4 h-4 text-gray-500" />
                            {formData.phone}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-gray-900">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            {formData.location}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                        {isEditing ? (
                          <input
                            type="url"
                            value={formData.linkedIn}
                            onChange={(e) => setFormData({ ...formData, linkedIn: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-gray-900">
                            <Globe className="w-4 h-4 text-gray-500" />
                            <a href={formData.linkedIn} className="text-sky-600 hover:underline">
                              View LinkedIn Profile
                            </a>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                        {isEditing ? (
                          <input
                            type="url"
                            value={formData.website}
                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-gray-900">
                            <Globe className="w-4 h-4 text-gray-500" />
                            <a href={formData.website} className="text-sky-600 hover:underline">
                              {formData.website}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    {isEditing ? (
                      <textarea
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                        placeholder="Tell us about yourself..."
                      />
                    ) : (
                      <p className="text-gray-900 leading-relaxed">{formData.bio}</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'professional' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Role</label>
                        <div className="flex items-center gap-2 text-gray-900">
                          <Briefcase className="w-4 h-4 text-gray-500" />
                          {formData.title} at {formData.company}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
                        <div className="text-gray-900">Mid-Level (3-5 years)</div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                        <div className="text-gray-900">Technology</div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                        <div className="flex flex-wrap gap-2">
                          {formData.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-sky-100 text-sky-800 rounded-full text-sm"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Looking for</label>
                        <div className="text-gray-900">Senior Software Engineer roles</div>
                      </div>
                    </div>
                  </div>

                  {/* Achievements */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Achievements & Progress</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {achievements.map((achievement, index) => {
                        const Icon = achievement.icon;
                        return (
                          <div key={index} className={`p-6 rounded-xl border transition-all duration-200 hover:shadow-md ${
                            achievement.earned 
                              ? 'bg-gradient-to-br from-sky-50 to-indigo-50 border-sky-200' 
                              : 'bg-gray-50 border-gray-200'
                          }`}>
                            <div className="flex items-center gap-3 mb-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                achievement.earned ? 'bg-sky-600' : 'bg-gray-400'
                              }`}>
                                {achievement.earned ? (
                                  <CheckCircle className="w-5 h-5 text-white" />
                                ) : (
                                  <Icon className="w-5 h-5 text-white" />
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className={`font-medium ${
                                  achievement.earned ? 'text-gray-900' : 'text-gray-500'
                                }`}>{achievement.title}</h4>
                                <p className={`text-sm ${
                                  achievement.earned ? 'text-gray-600' : 'text-gray-400'
                                }`}>{achievement.description}</p>
                              </div>
                            </div>
                            {!achievement.earned && (
                              <div className="mt-3">
                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                  <span>Progress</span>
                                  <span>{Math.round(achievement.progress)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-sky-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${achievement.progress}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Key className="w-5 h-5 text-gray-500" />
                        <div>
                          <h4 className="font-medium text-gray-900">Password</h4>
                          <p className="text-sm text-gray-600">Last changed 2 months ago</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Change Password</Button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-gray-500" />
                        <div>
                          <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                          <p className="text-sm text-gray-600">Add an extra layer of security</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Enable 2FA</Button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-500" />
                        <div>
                          <h4 className="font-medium text-gray-900">Email Verification</h4>
                          <p className="text-sm text-green-600">Verified ✓</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" disabled>Verified</Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h3>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between">
                        <span className="text-gray-700">Make profile public</span>
                        <input type="checkbox" className="form-checkbox h-4 w-4 text-sky-600" />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-gray-700">Allow search engines to index profile</span>
                        <input type="checkbox" className="form-checkbox h-4 w-4 text-sky-600" />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-gray-700">Show online status</span>
                        <input type="checkbox" defaultChecked className="form-checkbox h-4 w-4 text-sky-600" />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Bell className="w-5 h-5 text-gray-500" />
                          <div>
                            <h4 className="font-medium text-gray-900">Email Notifications</h4>
                            <p className="text-sm text-gray-600">Receive updates about your account</p>
                          </div>
                        </div>
                        <input type="checkbox" defaultChecked className="form-checkbox h-4 w-4 text-sky-600" />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-gray-500" />
                          <div>
                            <h4 className="font-medium text-gray-900">Interview Reminders</h4>
                            <p className="text-sm text-gray-600">Get notified before scheduled interviews</p>
                          </div>
                        </div>
                        <input type="checkbox" defaultChecked className="form-checkbox h-4 w-4 text-sky-600" />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Award className="w-5 h-5 text-gray-500" />
                          <div>
                            <h4 className="font-medium text-gray-900">Achievement Notifications</h4>
                            <p className="text-sm text-gray-600">Celebrate your milestones</p>
                          </div>
                        </div>
                        <input type="checkbox" defaultChecked className="form-checkbox h-4 w-4 text-sky-600" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Interview Preferences</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Default Interview Duration</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500">
                          <option>30 minutes</option>
                          <option>45 minutes</option>
                          <option>60 minutes</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500">
                          <option>Beginner</option>
                          <option>Intermediate</option>
                          <option>Advanced</option>
                          <option>Mixed</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Interview Types</label>
                        <div className="space-y-2">
                          {['Technical', 'Behavioral', 'System Design', 'Case Study'].map((type) => (
                            <label key={type} className="flex items-center gap-2">
                              <input type="checkbox" defaultChecked className="form-checkbox h-4 w-4 text-sky-600" />
                              <span className="text-gray-700">{type}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}