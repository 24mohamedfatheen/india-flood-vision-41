
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Database, Settings, Users, FileText } from 'lucide-react';

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
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <Header />
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Government/Admin Dashboard</h1>
            <p className="text-muted-foreground">Welcome, {user.username}! Manage flood data and user access here.</p>
          </div>
          <Button variant="outline" onClick={logout}>Logout</Button>
        </div>
        
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
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Emergency Reports
              </CardTitle>
              <FileText className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5 New</div>
              <p className="text-xs text-muted-foreground">
                3 high priority reports requiring attention
              </p>
              <Button 
                className="w-full mt-4" 
                size="sm"
                onClick={() => navigate('/emergency-reports')}
              >
                View Reports
              </Button>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Configure application behavior and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Settings className="h-3 w-3" /> General Settings
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Users className="h-3 w-3" /> User Permissions
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Database className="h-3 w-3" /> Data Sources
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="text-center text-sm text-muted-foreground mt-8">
          <p>Government Admin Portal - Restricted Access</p>
          <p className="text-xs mt-1">For authorized personnel only</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
