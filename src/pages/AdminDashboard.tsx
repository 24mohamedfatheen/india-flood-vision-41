
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Database, Settings, Users, FileText, Phone, MapPin, Clock } from 'lucide-react';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated as admin
  React.useEffect(() => {
    if (!user || user.userType !== 'admin') {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user || user.userType !== 'admin') {
    return null;
  }

  // Mock emergency stats - in real app, this would come from API
  const emergencyStats = {
    pending: 8,
    inProgress: 5,
    resolved: 24,
    highPriority: 3
  };

  const recentEmergencies = [
    {
      id: '1',
      location: 'Near Krishna Temple, Ghati Village',
      priority: 'high',
      people: 4,
      time: '15 mins ago',
      status: 'pending'
    },
    {
      id: '2',
      location: 'Blue Hills School, Main Road',
      priority: 'high',
      people: 12,
      time: '1 hour ago',
      status: 'in_progress'
    },
    {
      id: '3',
      location: 'Green Park Apartments, Block C',
      priority: 'medium',
      people: 2,
      time: '2 hours ago',
      status: 'in_progress'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'destructive';
      case 'in_progress': return 'outline';
      case 'resolved': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <Header />
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Emergency Command Center</h1>
            <p className="text-muted-foreground">Monitor and respond to flood emergency requests</p>
          </div>
          <Button variant="outline" onClick={logout}>Logout</Button>
        </div>
        
        {/* Emergency Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card className="border-red-200 bg-red-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-800">
                Pending Emergencies
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-900">{emergencyStats.pending}</div>
              <p className="text-xs text-red-700">
                Requires immediate attention
              </p>
              <Button 
                className="w-full mt-3 bg-red-600 hover:bg-red-700" 
                size="sm"
                onClick={() => navigate('/emergency-reports')}
              >
                <Phone className="h-3 w-3 mr-1" />
                Respond Now
              </Button>
            </CardContent>
          </Card>
          
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-800">
                In Progress
              </CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">{emergencyStats.inProgress}</div>
              <p className="text-xs text-orange-700">
                Help being dispatched
              </p>
              <Button 
                className="w-full mt-3 bg-orange-600 hover:bg-orange-700" 
                size="sm"
                onClick={() => navigate('/emergency-reports')}
              >
                Track Progress
              </Button>
            </CardContent>
          </Card>
          
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-800">
                Resolved Today
              </CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{emergencyStats.resolved}</div>
              <p className="text-xs text-green-700">
                People successfully helped
              </p>
              <Button 
                className="w-full mt-3 bg-green-600 hover:bg-green-700" 
                size="sm"
                onClick={() => navigate('/emergency-reports')}
              >
                View Reports
              </Button>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-800">
                High Priority
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">{emergencyStats.highPriority}</div>
              <p className="text-xs text-purple-700">
                Critical situations
              </p>
              <Button 
                className="w-full mt-3 bg-purple-600 hover:bg-purple-700" 
                size="sm"
                onClick={() => navigate('/emergency-reports')}
              >
                <AlertTriangle className="h-3 w-3 mr-1" />
                Urgent Response
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Emergencies */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-red-600" />
              Recent Emergency Requests
            </CardTitle>
            <CardDescription>Latest emergency assistance requests requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentEmergencies.map((emergency) => (
                <div key={emergency.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getPriorityColor(emergency.priority)}>
                        {emergency.priority.toUpperCase()}
                      </Badge>
                      <Badge variant={getStatusColor(emergency.status)} className="text-xs">
                        {emergency.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <p className="font-medium text-sm">{emergency.location}</p>
                    <p className="text-xs text-muted-foreground">
                      {emergency.people} people affected • {emergency.time}
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => navigate('/emergency-reports')}
                  >
                    Respond
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* System Management Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Flood Alerts
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12 Active</div>
              <p className="text-xs text-muted-foreground">
                3 high severity, 5 medium, 4 low
              </p>
              <Button className="w-full mt-4" size="sm">Manage Alerts</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Data Management
              </CardTitle>
              <Database className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">6 Regions</div>
              <p className="text-xs text-muted-foreground">
                Last updated 2 hours ago
              </p>
              <Button className="w-full mt-4" size="sm">Update Data</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                User Management
              </CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156 Users</div>
              <p className="text-xs text-muted-foreground">
                24 new users this week
              </p>
              <Button className="w-full mt-4" size="sm">Manage Users</Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="text-center text-sm text-muted-foreground mt-8">
          <p>Emergency Command Center - Authorized Personnel Only</p>
          <p className="text-xs mt-1">All emergency responses are logged and monitored</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
