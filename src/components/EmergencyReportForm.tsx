
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Phone } from 'lucide-react';
import { submitEmergencyReport } from '@/services/emergencyReportsService';
import { useToast } from '@/hooks/use-toast';

const EmergencyReportForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contactNumber: '',
    location: '',
    numPeople: '',
    hasDisabled: false,
    hasMedicalNeeds: false,
    medicalDetails: '',
    hasWaterFood: false,
    waterFoodDuration: '',
    situationDescription: '',
    urgencyLevel: 'medium' as 'low' | 'medium' | 'high'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.contactNumber || !formData.location || !formData.situationDescription) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await submitEmergencyReport(formData);
      toast({
        title: "Report Submitted",
        description: "Your emergency report has been sent to authorities. Help is on the way.",
      });
      // Reset form
      setFormData({
        name: '',
        contactNumber: '',
        location: '',
        numPeople: '',
        hasDisabled: false,
        hasMedicalNeeds: false,
        medicalDetails: '',
        hasWaterFood: false,
        waterFoodDuration: '',
        situationDescription: '',
        urgencyLevel: 'medium'
      });
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Submission Failed",
        description: "Could not submit your report. Please try again or call emergency services.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-5 w-5" />
          Emergency Assistance Request
        </CardTitle>
        <CardDescription>
          Fill out this form if you need immediate assistance during a flood emergency
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Your full name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Contact Number *</label>
              <Input
                value={formData.contactNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, contactNumber: e.target.value }))}
                placeholder="+91 9876543210"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Current Location *</label>
            <Input
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Building name, street, area, landmarks"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Number of People</label>
              <Input
                value={formData.numPeople}
                onChange={(e) => setFormData(prev => ({ ...prev, numPeople: e.target.value }))}
                placeholder="How many people need help?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Urgency Level</label>
              <Select value={formData.urgencyLevel} onValueChange={(value: 'low' | 'medium' | 'high') => setFormData(prev => ({ ...prev, urgencyLevel: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low - Stable situation</SelectItem>
                  <SelectItem value="medium">Medium - Need assistance</SelectItem>
                  <SelectItem value="high">High - Immediate danger</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasDisabled"
                checked={formData.hasDisabled}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasDisabled: checked as boolean }))}
              />
              <label htmlFor="hasDisabled" className="text-sm">
                Elderly, disabled, or injured people in group
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasMedicalNeeds"
                checked={formData.hasMedicalNeeds}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasMedicalNeeds: checked as boolean }))}
              />
              <label htmlFor="hasMedicalNeeds" className="text-sm">
                Medical emergency or special medical needs
              </label>
            </div>

            {formData.hasMedicalNeeds && (
              <Textarea
                value={formData.medicalDetails}
                onChange={(e) => setFormData(prev => ({ ...prev, medicalDetails: e.target.value }))}
                placeholder="Describe medical condition or needs..."
                className="mt-2"
              />
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasWaterFood"
                checked={formData.hasWaterFood}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasWaterFood: checked as boolean }))}
              />
              <label htmlFor="hasWaterFood" className="text-sm">
                Have access to food and drinking water
              </label>
            </div>

            {formData.hasWaterFood && (
              <Input
                value={formData.waterFoodDuration}
                onChange={(e) => setFormData(prev => ({ ...prev, waterFoodDuration: e.target.value }))}
                placeholder="How long will supplies last? (e.g., 2 days)"
                className="mt-2"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Situation Description *</label>
            <Textarea
              value={formData.situationDescription}
              onChange={(e) => setFormData(prev => ({ ...prev, situationDescription: e.target.value }))}
              placeholder="Describe your current situation, flood level, immediate dangers..."
              rows={4}
              required
            />
          </div>

          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-start gap-2">
              <Phone className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800">Emergency Numbers</h4>
                <p className="text-sm text-red-700">
                  For immediate life-threatening emergencies, call: <strong>100 (Police)</strong>, <strong>108 (Ambulance)</strong>
                </p>
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-red-600 hover:bg-red-700" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Emergency Report'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default EmergencyReportForm;
