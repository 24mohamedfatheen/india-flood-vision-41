
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EmergencyReport {
  id: string;
  name: string;
  contact_number: string;
  location: string;
  num_people: number;
  has_disabled: boolean;
  has_medical_needs: boolean;
  medical_details: string | null;
  has_water_food: boolean;
  water_food_duration: string | null;
  situation_description: string;
  urgency_level: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const EmergencyReports = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedReport, setSelectedReport] = useState<EmergencyReport | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [reports, setReports] = useState<EmergencyReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect to login if not authenticated as admin
  React.useEffect(() => {
    if (!user || user.userType !== 'admin') {
      navigate('/login');
    }
  }, [user, navigate]);

  // Fetch emergency reports from Supabase
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const { data, error } = await supabase
          .from('emergency_reports')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching emergency reports:', error);
          toast({
            title: "Error",
            description: "Failed to fetch emergency reports.",
            variant: "destructive",
          });
        } else {
          setReports(data || []);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user.userType === 'admin') {
      fetchReports();
    }
  }, [user, toast]);

  if (!user || user.userType !== 'admin') {
    return null; // Don't render anything while redirecting
  }

  const handleViewReport = (report: EmergencyReport) => {
    setSelectedReport(report);
    setIsDialogOpen(true);
  };

  const handleUpdateStatus = async (reportId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('emergency_reports')
        .update({ status: newStatus })
        .eq('id', reportId);

      if (error) {
        console.error('Error updating status:', error);
        toast({
          title: "Error",
          description: "Failed to update report status.",
          variant: "destructive",
        });
      } else {
        // Update local state
        setReports(reports.map(report => 
          report.id === reportId 
            ? { ...report, status: newStatus }
            : report
        ));
        
        if (selectedReport && selectedReport.id === reportId) {
          setSelectedReport({ ...selectedReport, status: newStatus });
        }

        toast({
          title: "Success",
          description: "Report status updated successfully.",
        });
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="destructive">Pending</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">In Progress</Badge>;
      case 'resolved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Resolved</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <Header />
          <div className="flex justify-center items-center h-64">
            <p>Loading emergency reports...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <Header />
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Emergency Reports</h1>
            <p className="text-muted-foreground">View and manage emergency assistance requests from citizens</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/admin')}>Back to Dashboard</Button>
            <Button variant="outline" onClick={logout}>Logout</Button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b flex items-center gap-2">
            <FileText className="h-5 w-5 text-red-600" />
            <h2 className="text-lg font-medium">Emergency Assistance Reports ({reports.length})</h2>
          </div>
          
          <div className="p-4">
            {reports.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No emergency reports found.</p>
              </div>
            ) : (
              <Table>
                <TableCaption>Emergency reports requiring attention</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>People</TableHead>
                    <TableHead>Urgency</TableHead>
                    <TableHead>Reported</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>{report.name}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{report.location}</TableCell>
                      <TableCell>{report.num_people}</TableCell>
                      <TableCell>
                        {report.urgency_level === 'high' ? (
                          <div className="flex items-center gap-1 text-red-600">
                            <AlertTriangle className="h-4 w-4" />
                            <span>High</span>
                          </div>
                        ) : report.urgency_level === 'medium' ? (
                          <span className="text-yellow-600">Medium</span>
                        ) : (
                          <span>Low</span>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(report.created_at)}</TableCell>
                      <TableCell>{getStatusBadge(report.status)}</TableCell>
                      <TableCell>
                        <Button size="sm" onClick={() => handleViewReport(report)}>View Details</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {selectedReport && (
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Emergency Report Details</DialogTitle>
              <DialogDescription>
                Submitted on {formatDate(selectedReport.created_at)}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Reporter Information</h3>
                <div className="mt-2 space-y-2">
                  <p><span className="font-medium">Name:</span> {selectedReport.name}</p>
                  <p><span className="font-medium">Contact:</span> {selectedReport.contact_number}</p>
                  <p><span className="font-medium">Location:</span> {selectedReport.location}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Situation Details</h3>
                <div className="mt-2 space-y-2">
                  <p><span className="font-medium">People affected:</span> {selectedReport.num_people}</p>
                  <p><span className="font-medium">Urgency level:</span> {selectedReport.urgency_level.toUpperCase()}</p>
                  <p><span className="font-medium">Status:</span> {getStatusBadge(selectedReport.status)}</p>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-gray-500">Situation Description</h3>
                <p className="mt-2 text-gray-700">{selectedReport.situation_description}</p>
              </div>
              
              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-gray-500">Special Needs</h3>
                <div className="mt-2 space-y-2">
                  {selectedReport.has_disabled && (
                    <p><span className="font-medium">Has disabled/elderly:</span> Yes</p>
                  )}
                  
                  {selectedReport.has_medical_needs && selectedReport.medical_details && (
                    <p><span className="font-medium">Medical needs:</span> {selectedReport.medical_details}</p>
                  )}
                  
                  <p><span className="font-medium">Food/water available:</span> {selectedReport.has_water_food ? 'Yes' : 'No'}</p>
                  
                  {selectedReport.has_water_food && selectedReport.water_food_duration && (
                    <p><span className="font-medium">Supplies duration:</span> {selectedReport.water_food_duration}</p>
                  )}
                </div>
              </div>
              
              <div className="md:col-span-2 border-t pt-4 mt-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Update Status</h3>
                <div className="flex gap-2">
                  <Button 
                    size="sm"
                    variant={selectedReport.status === 'pending' ? 'default' : 'outline'}
                    onClick={() => handleUpdateStatus(selectedReport.id, 'pending')}
                  >
                    Mark Pending
                  </Button>
                  <Button 
                    size="sm"
                    variant={selectedReport.status === 'in_progress' ? 'default' : 'outline'}
                    onClick={() => handleUpdateStatus(selectedReport.id, 'in_progress')}
                  >
                    Mark In Progress
                  </Button>
                  <Button 
                    size="sm"
                    variant={selectedReport.status === 'resolved' ? 'default' : 'outline'}
                    onClick={() => handleUpdateStatus(selectedReport.id, 'resolved')}
                  >
                    Mark Resolved
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default EmergencyReports;
