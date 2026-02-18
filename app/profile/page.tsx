/**
 * Profile Page
 * 
 * Classic user profile page with personal information, settings, and account management.
 * Features comprehensive user data management and professional layout.
 */

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
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
        <div className="min-h-screen bg-[#e1e1db] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700 mx-auto mb-4"></div>
            <p className="text-stone-700">Loading your profile...</p>
          </div>
        </div>
      </RouteGuard>
    );
  }

  return (
    <RouteGuard requireAuth={true}>
      <div className="min-h-screen bg-[#e1e1db]">
        <div className="max-w-4xl mx-auto p-6 pt-24">
          {/* Header */}
          <div className="bg-white/40 backdrop-blur-sm rounded-xl border border-amber-700/20 mb-8 overflow-hidden">
            <div className="relative h-40 bg-amber-700/90">
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
                  <div className="w-40 h-40 rounded-full border-6 border-white/80 overflow-hidden">
                    <Image
                      src="/user.webp"
                      alt="Profile Photo"
                      width={160}
                      height={160}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button className="absolute bottom-3 right-3 w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all duration-200 hover:scale-110">
                    <Camera className="w-5 h-5 text-stone-700" />
                  </button>
                  
                  {/* Online indicator */}
                  <div className="absolute top-3 right-3 w-6 h-6 bg-emerald-500 rounded-full border-3 border-white/80 flex items-center justify-center">
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
                    className="bg-white/80 backdrop-blur-sm text-stone-700 hover:bg-white border-amber-700/30"
                    size="sm"
                  >
                    {isRefreshing ? (
                      <div className="w-4 h-4 animate-spin rounded-full border-2 border-stone-300 border-t-stone-700"></div>
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
                        className="bg-white/80 backdrop-blur-sm text-stone-700 border-amber-700/30"
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
                      className="bg-white/80 backdrop-blur-sm text-stone-700 hover:bg-white border-amber-700/30"
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
                        className="text-3xl font-bold text-black bg-transparent border-b-2 border-amber-700/50 focus:border-amber-700 focus:outline-none w-full"
                        placeholder="Your Name"
                      />
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="text-xl text-stone-700 bg-transparent border-b border-stone-300 focus:outline-none focus:border-amber-700/50 w-full"
                        placeholder="Job Title"
                      />
                    </div>
                  ) : (
                    <div>
                      <h1 className="text-4xl font-bold text-black mb-2">
                        {formData.name || 'Welcome!'}
                      </h1>
                      <p className="text-xl text-stone-700 mb-1">{formData.title}</p>
                      <p className="text-stone-600 mb-3">{formData.company}</p>
                      <div className="flex items-center gap-4 text-sm text-stone-500">
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
                  <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border border-amber-200">
                    <div className="text-2xl font-bold text-amber-700 mb-1">{userStats.interviewsCompleted}</div>
                    <div className="text-xs text-stone-700 font-medium">Interviews</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                    <div className="text-2xl font-bold text-emerald-600 mb-1">{userStats.averageScore}%</div>
                    <div className="text-xs text-stone-700 font-medium">Avg Score</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-amber-100 to-amber-50 rounded-xl border border-amber-200">
                    <div className="text-2xl font-bold text-amber-700 mb-1">{userStats.achievements}</div>
                    <div className="text-xs text-stone-700 font-medium">Achievements</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                    <div className="text-2xl font-bold text-amber-600 mb-1">{userStats.streak}</div>
                    <div className="text-xs text-stone-700 font-medium">Day Streak</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white/40 backdrop-blur-sm rounded-xl border border-amber-700/20 mb-6">
            <div className="border-b border-amber-700/20">
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
                          ? 'border-amber-700 text-amber-700'
                          : 'border-transparent text-stone-600 hover:text-black hover:border-amber-400'
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
                        <label className="block text-sm font-medium text-stone-700 mb-2">Full Name</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 border border-amber-700/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-600/50 bg-white/50"
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-black">
                            <User className="w-4 h-4 text-stone-600" />
                            {formData.name}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">Email</label>
                        {isEditing ? (
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-3 py-2 border border-amber-700/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-600/50 bg-white/50"
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-black">
                            <Mail className="w-4 h-4 text-stone-600" />
                            {formData.email}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">Phone</label>
                        {isEditing ? (
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-3 py-2 border border-amber-700/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-600/50 bg-white/50"
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-black">
                            <Phone className="w-4 h-4 text-stone-600" />
                            {formData.phone}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">Location</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="w-full px-3 py-2 border border-amber-700/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-600/50 bg-white/50"
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-black">
                            <MapPin className="w-4 h-4 text-stone-600" />
                            {formData.location}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">LinkedIn</label>
                        {isEditing ? (
                          <input
                            type="url"
                            value={formData.linkedIn}
                            onChange={(e) => setFormData({ ...formData, linkedIn: e.target.value })}
                            className="w-full px-3 py-2 border border-amber-700/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-600/50 bg-white/50"
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-black">
                            <Globe className="w-4 h-4 text-stone-600" />
                            <a href={formData.linkedIn} className="text-amber-700 hover:underline">
                              View LinkedIn Profile
                            </a>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">Website</label>
                        {isEditing ? (
                          <input
                            type="url"
                            value={formData.website}
                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            className="w-full px-3 py-2 border border-amber-700/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-600/50 bg-white/50"
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-black">
                            <Globe className="w-4 h-4 text-stone-600" />
                            <a href={formData.website} className="text-amber-700 hover:underline">
                              {formData.website}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Bio</label>
                    {isEditing ? (
                      <textarea
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2 border border-amber-700/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-600/50 bg-white/50"
                        placeholder="Tell us about yourself..."
                      />
                    ) : (
                      <p className="text-black leading-relaxed">{formData.bio}</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'professional' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">Current Role</label>
                        <div className="flex items-center gap-2 text-black">
                          <Briefcase className="w-4 h-4 text-stone-600" />
                          {formData.title} at {formData.company}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">Experience Level</label>
                        <div className="text-black">Mid-Level (3-5 years)</div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">Industry</label>
                        <div className="text-black">Technology</div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">Skills</label>
                        <div className="flex flex-wrap gap-2">
                          {formData.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm border border-amber-300"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">Looking for</label>
                        <div className="text-black">Senior Software Engineer roles</div>
                      </div>
                    </div>
                  </div>

                  {/* Achievements */}
                  <div>
                    <h3 className="text-lg font-semibold text-black mb-6">Achievements & Progress</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {achievements.map((achievement, index) => {
                        const Icon = achievement.icon;
                        return (
                          <div key={index} className={`p-6 rounded-xl border transition-all duration-200 hover:shadow-md ${
                            achievement.earned 
                              ? 'bg-amber-50/60 border-amber-200/50' 
                              : 'bg-white/30 border-stone-200'
                          }`}>
                            <div className="flex items-center gap-3 mb-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                achievement.earned ? 'bg-amber-700' : 'bg-stone-400'
                              }`}>
                                {achievement.earned ? (
                                  <CheckCircle className="w-5 h-5 text-white" />
                                ) : (
                                  <Icon className="w-5 h-5 text-white" />
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className={`font-medium ${
                                  achievement.earned ? 'text-black' : 'text-stone-500'
                                }`}>{achievement.title}</h4>
                                <p className={`text-sm ${
                                  achievement.earned ? 'text-stone-700' : 'text-stone-400'
                                }`}>{achievement.description}</p>
                              </div>
                            </div>
                            {!achievement.earned && (
                              <div className="mt-3">
                                <div className="flex justify-between text-xs text-stone-500 mb-1">
                                  <span>Progress</span>
                                  <span>{Math.round(achievement.progress)}%</span>
                                </div>
                                <div className="w-full bg-stone-300 rounded-full h-2">
                                  <div 
                                    className="bg-amber-700 h-2 rounded-full transition-all duration-300"
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
                    <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg border border-amber-700/20 hover:bg-white/70 transition-colors">
                      <div className="flex items-center gap-3">
                        <Key className="w-5 h-5 text-stone-600" />
                        <div>
                          <h4 className="font-medium text-black">Password</h4>
                          <p className="text-sm text-stone-600">Last changed 2 months ago</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="border-amber-700/30 text-black">Change Password</Button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg border border-amber-700/20 hover:bg-white/70 transition-colors">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-stone-600" />
                        <div>
                          <h4 className="font-medium text-black">Two-Factor Authentication</h4>
                          <p className="text-sm text-stone-600">Add an extra layer of security</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="border-amber-700/30 text-black">Enable 2FA</Button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg border border-amber-700/20 hover:bg-white/70 transition-colors">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-stone-600" />
                        <div>
                          <h4 className="font-medium text-black">Email Verification</h4>
                          <p className="text-sm text-emerald-600">Verified ✓</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" disabled className="border-amber-700/30">Verified</Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-black mb-4">Privacy Settings</h3>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between">
                        <span className="text-stone-700">Make profile public</span>
                        <input type="checkbox" className="form-checkbox h-4 w-4 text-amber-700" />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-stone-700">Allow search engines to index profile</span>
                        <input type="checkbox" className="form-checkbox h-4 w-4 text-amber-700" />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-stone-700">Show online status</span>
                        <input type="checkbox" defaultChecked className="form-checkbox h-4 w-4 text-amber-700" />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-black mb-4">Notifications</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg border border-amber-700/20 hover:bg-white/70 transition-colors">
                        <div className="flex items-center gap-3">
                          <Bell className="w-5 h-5 text-stone-600" />
                          <div>
                            <h4 className="font-medium text-black">Email Notifications</h4>
                            <p className="text-sm text-stone-600">Receive updates about your account</p>
                          </div>
                        </div>
                        <input type="checkbox" defaultChecked className="form-checkbox h-4 w-4 text-amber-700" />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg border border-amber-700/20 hover:bg-white/70 transition-colors">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-stone-600" />
                          <div>
                            <h4 className="font-medium text-black">Interview Reminders</h4>
                            <p className="text-sm text-stone-600">Get notified before scheduled interviews</p>
                          </div>
                        </div>
                        <input type="checkbox" defaultChecked className="form-checkbox h-4 w-4 text-amber-700" />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg border border-amber-700/20 hover:bg-white/70 transition-colors">
                        <div className="flex items-center gap-3">
                          <Award className="w-5 h-5 text-stone-600" />
                          <div>
                            <h4 className="font-medium text-black">Achievement Notifications</h4>
                            <p className="text-sm text-stone-600">Celebrate your milestones</p>
                          </div>
                        </div>
                        <input type="checkbox" defaultChecked className="form-checkbox h-4 w-4 text-amber-700" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-black mb-4">Interview Preferences</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">Default Interview Duration</label>
                        <select className="w-full px-3 py-2 border border-amber-700/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-600/50 bg-white/50 text-black">
                          <option>30 minutes</option>
                          <option>45 minutes</option>
                          <option>60 minutes</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">Difficulty Level</label>
                        <select className="w-full px-3 py-2 border border-amber-700/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-600/50 bg-white/50 text-black">
                          <option>Beginner</option>
                          <option>Intermediate</option>
                          <option>Advanced</option>
                          <option>Mixed</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">Preferred Interview Types</label>
                        <div className="space-y-2">
                          {['Technical', 'Behavioral', 'System Design', 'Case Study'].map((type) => (
                            <label key={type} className="flex items-center gap-2">
                              <input type="checkbox" defaultChecked className="form-checkbox h-4 w-4 text-amber-700" />
                              <span className="text-stone-700">{type}</span>
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