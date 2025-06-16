import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { PhoneCall, MapPin, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Define emergency form schema
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  contactNumber: z.string().min(10, {
    message: "Please enter a valid contact number.",
  }),
  location: z.string().min(5, {
    message: "Please provide a detailed location.",
  }),
  numPeople: z.string().min(1, {
    message: "Please indicate how many people are stranded.",
  }),
  hasDisabled: z.boolean(),
  hasMedicalNeeds: z.boolean(),
  medicalDetails: z.string().optional(),
  hasWaterFood: z.boolean(),
  waterFoodDuration: z.string().optional(),
  situationDescription: z.string().min(10, {
    message: "Please describe your situation.",
  }),
  urgencyLevel: z.string(),
});

const Emergency = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      contactNumber: "",
      location: "",
      numPeople: "1",
      hasDisabled: false,
      hasMedicalNeeds: false,
      medicalDetails: "",
      hasWaterFood: false,
      waterFoodDuration: "",
      situationDescription: "",
      urgencyLevel: "medium",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    try {
      // Insert emergency report into Supabase
      const { data, error } = await supabase
        .from('emergency_reports')
        .insert([
          {
            name: values.name,
            contact_number: values.contactNumber,
            location: values.location,
            num_people: parseInt(values.numPeople),
            has_disabled: values.hasDisabled,
            has_medical_needs: values.hasMedicalNeeds,
            medical_details: values.medicalDetails,
            has_water_food: values.hasWaterFood,
            water_food_duration: values.waterFoodDuration,
            situation_description: values.situationDescription,
            urgency_level: values.urgencyLevel,
          }
        ])
        .select();

      if (error) {
        console.error('Error submitting emergency report:', error);
        toast({
          title: "Error",
          description: "Failed to submit emergency report. Please try again.",
          variant: "destructive",
        });
      } else {
        console.log("Emergency report submitted successfully:", data);
        
        toast({
          title: "Emergency Report Sent",
          description: "Your emergency has been reported. Help is on the way. Please stay where you are if safe.",
          variant: "default",
          duration: 10000,
        });
        
        form.reset();
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-4">
        <PhoneCall className="h-8 w-8 mr-2 text-red-600" />
        <h1 className="text-3xl font-bold">Emergency Flood Assistance</h1>
      </div>
      
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              If you are in immediate danger, please call the National Emergency Number: <strong>112</strong>
            </p>
            <p className="text-sm text-red-700 mt-1">
              Use this form only if you are in a stable location and need assistance due to flooding.
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-6">Report a Flood Emergency</h2>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="contactNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Location (be as specific as possible)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input placeholder="Address, landmark, or GPS coordinates" {...field} />
                      <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Example: "Near Krishna Temple, Ghati Village, 2nd floor of blue building"
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="numPeople"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of People Stranded</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" placeholder="How many people?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="hasDisabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Disabled/Elderly Persons Present
                      </FormLabel>
                      <FormDescription>
                        Check if there are disabled or elderly people who need special assistance
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="urgencyLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Urgency Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select urgency level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low - We are safe for now</SelectItem>
                        <SelectItem value="medium">Medium - Need help within 24 hours</SelectItem>
                        <SelectItem value="high">High - Need immediate help</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="hasMedicalNeeds"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                          }}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Medical Needs
                        </FormLabel>
                        <FormDescription>
                          Check if anyone requires medical attention or medications
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                {form.watch('hasMedicalNeeds') && (
                  <FormField
                    control={form.control}
                    name="medicalDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medical Details</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Please describe medical conditions or needs" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
              
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="hasWaterFood"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                          }}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Food and Water Available
                        </FormLabel>
                        <FormDescription>
                          Check if you have access to food and clean water
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                {form.watch('hasWaterFood') && (
                  <FormField
                    control={form.control}
                    name="waterFoodDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>How long will supplies last?</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Example: 2 days" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="situationDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Situation Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Please describe your current situation and any other relevant details" 
                      className="min-h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Include information about water level, hazards, and any other important details about your situation
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full bg-red-600 hover:bg-red-700" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting Report..." : "Submit Emergency Report"}
            </Button>
            
            <p className="text-center text-sm text-gray-500 mt-4">
              Your report will be sent to local emergency services and flood response teams.
              Stay in your current location if it is safe to do so.
            </p>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default Emergency;
