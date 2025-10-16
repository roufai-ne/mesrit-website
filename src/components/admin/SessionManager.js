// components/admin/SessionManager.js
import React, { useState, useEffect } from 'react';
import { Shield, Users, Clock, Globe, AlertTriangle, X, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/toast';
import { secureApi } from '@/lib/secureApi';

export default function SessionManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sessions, setSessions] = useState([]);
  const [sessionStats, setSessionStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchSessions();
      
      // Auto-refresh every 30 seconds
      const interval = setInterval(fetchSessions, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchSessions = async () => {
    try {
      const data = await secureApi.get('/api/admin/sessions', true);
      setSessions(data.sessions || []);
      setSessionStats(data.stats || {});
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('Failed to load session data');
    } finally {
      setLoading(false);
    }
  };

  const terminateSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to terminate this session?')) {
      return;
    }

    try {
      await secureApi.delete(`/api/admin/sessions/${sessionId}`, true);
      toast.success('Session terminated successfully');
      fetchSessions();
    } catch (error) {
      console.error('Error terminating session:', error);
      toast.error('Failed to terminate session');
    }
  };

  const terminateUserSessions = async (userId) => {
    if (!window.confirm('Are you sure you want to terminate all sessions for this user?')) {
      return;
    }

    try {
      await secureApi.delete(`/api/admin/users/${userId}/sessions`, true);
      toast.success('All user sessions terminated');
      fetchSessions();
    } catch (error) {
      console.error('Error terminating user sessions:', error);
      toast.error('Failed to terminate user sessions');
    }
  };

  const formatDuration = (timestamp) => {
    const now = new Date();
    const sessionTime = new Date(timestamp);
    const diffMs = now - sessionTime;
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ago`;
    }
    return `${minutes}m ago`;
  };

  const getDeviceType = (userAgent) => {
    if (!userAgent) return 'Unknown';
    
    if (userAgent.includes('Mobile')) return 'Mobile';
    if (userAgent.includes('Tablet')) return 'Tablet';
    return 'Desktop';
  };

  const getBrowserInfo = (userAgent) => {
    if (!userAgent) return 'Unknown Browser';
    
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Other';
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 text-niger-green dark:text-niger-green-light">
          Access Denied
        </h3>
        <p className="text-gray-600 dark:text-gray-400 dark:text-muted-foreground dark:text-muted-foreground">
          Only administrators can access session management.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-niger-green dark:text-niger-green-light">
            Session Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 dark:text-muted-foreground dark:text-muted-foreground">
            Monitor and manage active user sessions
          </p>
        </div>
        <Button 
          onClick={fetchSessions}
          variant="outline"
          leftIcon={<RefreshCw className="w-4 h-4" />}
        >
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400 text-niger-orange dark:text-niger-orange" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-muted-foreground dark:text-muted-foreground">Active Sessions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-niger-green dark:text-niger-green-light">
                  {sessionStats.active || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-muted-foreground dark:text-muted-foreground">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-niger-green dark:text-niger-green-light">
                  {sessionStats.total || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-muted-foreground dark:text-muted-foreground">Unique Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-niger-green dark:text-niger-green-light">
                  {Object.keys(sessionStats.byUser || {}).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                <Globe className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-muted-foreground dark:text-muted-foreground">Expired Sessions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-niger-green dark:text-niger-green-light">
                  {sessionStats.inactive || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Sessions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 dark:border-secondary-600">
                  <th className="text-left p-3 font-medium text-gray-900 dark:text-gray-100 dark:text-niger-green-light">User</th>
                  <th className="text-left p-3 font-medium text-gray-900 dark:text-gray-100 dark:text-niger-green-light">Device</th>
                  <th className="text-left p-3 font-medium text-gray-900 dark:text-gray-100 dark:text-niger-green-light">Location</th>
                  <th className="text-left p-3 font-medium text-gray-900 dark:text-gray-100 dark:text-niger-green-light">Last Activity</th>
                  <th className="text-left p-3 font-medium text-gray-900 dark:text-gray-100 dark:text-niger-green-light">Duration</th>
                  <th className="text-left p-3 font-medium text-gray-900 dark:text-gray-100 dark:text-niger-green-light">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session.sessionId} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-secondary-700 dark:hover:bg-secondary-700/50">
                    <td className="p-3">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100 dark:text-niger-green-light">
                          {session.user?.username || 'Unknown User'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-muted-foreground dark:text-muted-foreground">
                          {session.user?.email}
                        </p>
                      </div>
                    </td>
                    <td className="p-3">
                      <div>
                        <p className="text-sm text-gray-900 dark:text-gray-100 dark:text-niger-green-light">
                          {getBrowserInfo(session.userAgent)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-muted-foreground dark:text-muted-foreground">
                          {getDeviceType(session.userAgent)}
                        </p>
                      </div>
                    </td>
                    <td className="p-3">
                      <p className="text-sm text-gray-900 dark:text-gray-100 dark:text-niger-green-light">
                        {session.ipAddress}
                      </p>
                    </td>
                    <td className="p-3">
                      <p className="text-sm text-gray-900 dark:text-gray-100 dark:text-niger-green-light">
                        {formatDuration(session.lastActivity)}
                      </p>
                    </td>
                    <td className="p-3">
                      <p className="text-sm text-gray-900 dark:text-gray-100 dark:text-niger-green-light">
                        {formatDuration(session.createdAt)}
                      </p>
                    </td>
                    <td className="p-3">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => terminateSession(session.sessionId)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => terminateUserSessions(session.userId)}
                          className="text-orange-600 hover:text-orange-700"
                        >
                          Terminate All
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {sessions.length === 0 && (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4 dark:text-muted-foreground" />
                <p className="text-gray-500 dark:text-gray-400 dark:text-muted-foreground dark:text-muted-foreground">No active sessions found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}