
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle, FileText } from 'lucide-react';

// Mock data for emergency reports
const mockEmergencyReports = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    contactNumber: '+91 9876543210',
    location: 'Near Krishna Temple, Ghati Village',
    numPeople: '4',
    hasDisabled: true,
    hasMedicalNeeds: true,
    medicalDetails: 'Elderly person with diabetes needs medication',
    hasWaterFood: false,
    waterFoodDuration: '',
    situationDescription: 'Water level is rising, first floor already flooded. We are on the second floor.',
    urgencyLevel: 'high',
    timestamp: '2025-05-11T15:30:00',
    status: 'pending'
  },
  {
    id: '2',
    name: 'Priya Singh',
    contactNumber: '+91 8765432109',
    location: 'Green Park Apartments, Block C, Flat 302',
    numPeople: '2',
    hasDisabled: false,
    hasMedicalNeeds: false,
    medicalDetails: '',
    hasWaterFood: true,
    waterFoodDuration: '2 days',
    situationDescription: 'Area is flooded but we are safe at the moment. Roads are blocked.',
    urgencyLevel: 'medium',
    timestamp: '2025-05-11T14:15:00',
    status: 'in_progress'
  },
  {
    id: '3',
    name: 'Mohammed Ali',
    contactNumber: '+91 7654321098',
    location: 'Blue Hills School, Main Road',
    numPeople: '12',
    hasDisabled: true,
    hasMedicalNeeds: true,
    medicalDetails: 'One child with asthma, needs inhaler',
    hasWaterFood: true,
    waterFoodDuration: '1 day',
    situationDescription: 'Group of families took shelter in school building. Water is entering ground floor.',
    urgencyLevel: 'high',
    timestamp: '2025-05-11T12:45:00',
    status: 'pending'
  },
  {
    id: '4',
    name: 'Anita Sharma',
    contactNumber: '+91 6543210987',
    location: 'River View Colony, House 45',
    numPeople: '3',
    hasDisabled: false,
    hasMedicalNeeds: false,
    medicalDetails: '',
    hasWaterFood: false,
    waterFoodDuration: '',
    situationDescription: 'Water is nearly at our doorstep, may need evacuation soon.',
    urgencyLevel: 'medium',
    timestamp: '2025-05-11T11:20:00',
    status: 'resolved'
  },
  {
    id: '5',
    name: 'Suresh Patel',
    contactNumber: '+91 5432109876',
    location: 'Old Market Area, Behind Temple',
    numPeople: '6',
    hasDisabled: true,
    hasMedicalNeeds: false,
    medicalDetails: '',
    hasWaterFood: true,
    waterFoodDuration: '3 days',
    situationDescription: 'Entire family on terrace, water level rising rapidly in the area.',
    urgencyLevel: 'high',
    timestamp: '2025-05-11T10:05:00',
    status: 'in_progress'
  }
];

const EmergencyReports = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedReport, setSelectedReport] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Redirect to login if not authenticated as admin
  React.useEffect(() => {
    if (!user || user.userType !== 'admin') {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user || user.userType !== 'admin') {
    return null; // Don't render anything while redirecting
  }

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setIsDialogOpen(true);
  };

  const handleUpdateStatus = (reportId, newStatus) => {
    console.log(`Updating report ${reportId} status to ${newStatus}`);
    // In a real application, this would update the status in the database
    // For now, we'll just log it
  };

  const getStatusBadge = (status) => {
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
            <h2 className="text-lg font-medium">Emergency Assistance Reports</h2>
          </div>
          
          <div className="p-4">
            <Table>
              <TableCaption>Emergency reports requiring attention</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
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
                {mockEmergencyReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-mono">{report.id}</TableCell>
                    <TableCell>{report.name}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{report.location}</TableCell>
                    <TableCell>{report.numPeople}</TableCell>
                    <TableCell>
                      {report.urgencyLevel === 'high' ? (
                        <div className="flex items-center gap-1 text-red-600">
                          <AlertTriangle className="h-4 w-4" />
                          <span>High</span>
                        </div>
                      ) : report.urgencyLevel === 'medium' ? (
                        <span className="text-yellow-600">Medium</span>
                      ) : (
                        <span>Low</span>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(report.timestamp)}</TableCell>
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                    <TableCell>
                      <Button size="sm" onClick={() => handleViewReport(report)}>View Details</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {selectedReport && (
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Emergency Report #{selectedReport.id}</DialogTitle>
              <DialogDescription>
                Submitted on {formatDate(selectedReport.timestamp)}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Reporter Information</h3>
                <div className="mt-2 space-y-2">
                  <p><span className="font-medium">Name:</span> {selectedReport.name}</p>
                  <p><span className="font-medium">Contact:</span> {selectedReport.contactNumber}</p>
                  <p><span className="font-medium">Location:</span> {selectedReport.location}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Situation Details</h3>
                <div className="mt-2 space-y-2">
                  <p><span className="font-medium">People affected:</span> {selectedReport.numPeople}</p>
                  <p><span className="font-medium">Urgency level:</span> {selectedReport.urgencyLevel.toUpperCase()}</p>
                  <p><span className="font-medium">Status:</span> {getStatusBadge(selectedReport.status)}</p>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-gray-500">Situation Description</h3>
                <p className="mt-2 text-gray-700">{selectedReport.situationDescription}</p>
              </div>
              
              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-gray-500">Special Needs</h3>
                <div className="mt-2 space-y-2">
                  {selectedReport.hasDisabled && (
                    <p><span className="font-medium">Has disabled/elderly:</span> Yes</p>
                  )}
                  
                  {selectedReport.hasMedicalNeeds && (
                    <p><span className="font-medium">Medical needs:</span> {selectedReport.medicalDetails}</p>
                  )}
                  
                  <p><span className="font-medium">Food/water available:</span> {selectedReport.hasWaterFood ? 'Yes' : 'No'}</p>
                  
                  {selectedReport.hasWaterFood && selectedReport.waterFoodDuration && (
                    <p><span className="font-medium">Supplies duration:</span> {selectedReport.waterFoodDuration}</p>
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
