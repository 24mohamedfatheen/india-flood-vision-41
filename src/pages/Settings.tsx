import React, { useEffect, useState } from 'react';
import { SettingsIcon, Globe, Bell } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/context/LanguageContext';

const languageData = [
  { code: 'english', name: 'English', displayName: 'English', direction: 'ltr' },
  { code: 'hindi', name: 'हिन्दी', displayName: 'Hindi', direction: 'ltr' },
  { code: 'tamil', name: 'தமிழ்', displayName: 'Tamil', direction: 'ltr' },
  { code: 'malayalam', name: 'മലയാളം', displayName: 'Malayalam', direction: 'ltr' },
  { code: 'telugu', name: 'తెలుగు', displayName: 'Telugu', direction: 'ltr' },
  { code: 'urdu', name: 'اردو', displayName: 'Urdu', direction: 'rtl' },
  { code: 'bengali', name: 'বাংলা', displayName: 'Bengali', direction: 'ltr' },
  { code: 'marathi', name: 'मराठी', displayName: 'Marathi', direction: 'ltr' }
];

const Settings = () => {
  const [theme, setTheme] = useState('light');
  const { toast } = useToast();
  const { language, languageData, setLanguage } = useLanguage();
  
  // Apply theme when it changes
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    
    localStorage.setItem('theme', theme);
    
    toast({
      title: "Theme Changed",
      description: `Theme set to ${theme} mode`,
    });
  }, [theme, toast]);
  
  // Handle language change
  const handleLanguageChange = (newLanguage: string) => {
    const selectedLang = languageData.find(lang => lang.code === newLanguage);
    setLanguage(newLanguage);
    
    if (selectedLang) {
      toast({
        title: "Language Changed",
        description: `Interface language changed to ${selectedLang.displayName}`,
      });
    }
  };
  
  // Initialize theme from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <SettingsIcon className="h-8 w-8 mr-2 text-blue-600" />
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>
      
      <Tabs defaultValue="language" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="language">
            <Globe className="h-4 w-4 mr-2" />
            Language
          </TabsTrigger>
          <TabsTrigger value="display">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2">
              <circle cx="12" cy="12" r="4"></circle>
              <path d="M12 2v2"></path>
              <path d="M12 20v2"></path>
              <path d="M20 12h2"></path>
              <path d="M2 12h2"></path>
            </svg>
            Display
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>
        
        <TabsContent value="language" className="space-y-4">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center">
                <Globe className="h-5 w-5 mr-2 text-blue-600" />
                <CardTitle>Language Settings</CardTitle>
              </div>
              <CardDescription>Choose your preferred language for the entire application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                {languageData.map(lang => (
                  <Button
                    key={lang.code}
                    variant={language === lang.code ? "default" : "outline"}
                    className={`justify-start ${language === lang.code ? 'bg-blue-600' : ''} transition-all`}
                    onClick={() => handleLanguageChange(lang.code)}
                  >
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{lang.name}</span>
                      <span className="text-xs opacity-70">({lang.displayName})</span>
                    </div>
                  </Button>
                ))}
              </div>
              
              <div className="bg-blue-50 p-4 rounded-md mt-4">
                <h3 className="font-medium text-blue-700 mb-2">Application-wide Translation</h3>
                <p className="text-sm text-blue-700">
                  Selecting a language will change the interface language throughout the entire application. 
                  All menus, buttons, and content will be displayed in your chosen language.
                </p>
                <p className="text-sm text-blue-600 mt-2 font-medium">
                  Current Language: {languageData.find(l => l.code === language)?.displayName || 'English'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="display">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Display Settings</CardTitle>
              <CardDescription>Customize your viewing experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <RadioGroup value={theme} onValueChange={setTheme}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="light" id="light" />
                    <Label htmlFor="light">Light</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dark" id="dark" />
                    <Label htmlFor="dark">Dark</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="system" id="system" />
                    <Label htmlFor="system">System</Label>
                  </div>
                </RadioGroup>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="high-contrast">High Contrast Mode</Label>
                  <p className="text-sm text-muted-foreground">For better readability</p>
                </div>
                <Switch id="high-contrast" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-refresh">Auto-refresh Data</Label>
                  <p className="text-sm text-muted-foreground">Keep flood data current</p>
                </div>
                <Switch id="auto-refresh" defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how you receive alerts and notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive alerts via email</p>
                </div>
                <Switch id="email-notifications" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sms-notifications">SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive alerts via SMS</p>
                </div>
                <Switch id="sms-notifications" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive push notifications</p>
                </div>
                <Switch id="push-notifications" defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="privacy">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Manage your privacy preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="data-collection">Data Collection</Label>
                  <p className="text-sm text-muted-foreground">Allow anonymous usage data</p>
                </div>
                <Switch id="data-collection" defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="third-party">Third-party Sharing</Label>
                  <p className="text-sm text-muted-foreground">Share data with partners</p>
                </div>
                <Switch id="third-party" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="remember-history">Remember Search History</Label>
                  <p className="text-sm text-muted-foreground">Save your search history</p>
                </div>
                <Switch id="remember-history" defaultChecked />
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">Privacy settings last updated: {new Date().toLocaleDateString()}</p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle>Location Settings</CardTitle>
          <CardDescription>Configure your location preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="location-services">Location Services</Label>
              <p className="text-sm text-muted-foreground">Allow access to your location</p>
            </div>
            <Switch id="location-services" defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="default-region">Default Region</Label>
              <p className="text-sm text-muted-foreground">Set your preferred region</p>
            </div>
            <Switch id="default-region" />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="nearby-alerts">Nearby Flood Alerts</Label>
              <p className="text-sm text-muted-foreground">Receive alerts for nearby areas</p>
            </div>
            <Switch id="nearby-alerts" defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
