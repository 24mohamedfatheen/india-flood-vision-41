
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Languages, Settings as SettingsIcon, Bell, Palette, Shield, Database, Moon, Sun } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Settings = () => {
  const { language, languageData, setLanguage, translate } = useLanguage();
  const { toast } = useToast();
  
  // Original settings states
  const [notifications, setNotifications] = useState({
    floodAlerts: true,
    weatherUpdates: true,
    emergencyNotifications: true,
    maintenanceUpdates: false
  });
  
  const [theme, setTheme] = useState('light');
  const [dataRefreshInterval, setDataRefreshInterval] = useState('12');
  const [autoLocationDetection, setAutoLocationDetection] = useState(true);
  const [emergencyContactsVisible, setEmergencyContactsVisible] = useState(true);

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    const selectedLang = languageData.find(lang => lang.code === newLanguage);
    
    toast({
      title: translate('language-changed'),
      description: `${translate('language-changed-to')} ${selectedLang?.displayName || newLanguage}`,
      duration: 3000,
    });
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [key]: value
    }));
    
    toast({
      title: "Notification Settings Updated",
      description: `${key.replace(/([A-Z])/g, ' $1').toLowerCase()} ${value ? 'enabled' : 'disabled'}`,
      duration: 2000,
    });
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    
    // Apply theme to document
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(newTheme);
    localStorage.setItem('theme', newTheme);
    
    toast({
      title: "Theme Changed",
      description: `Theme changed to ${newTheme}`,
      duration: 2000,
    });
  };

  const handleDataRefreshChange = (interval: string) => {
    setDataRefreshInterval(interval);
    localStorage.setItem('dataRefreshInterval', interval);
    
    toast({
      title: "Data Refresh Updated",
      description: `Data will refresh every ${interval} hours`,
      duration: 2000,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center">
            <SettingsIcon className="h-8 w-8 mr-3" />
            {translate('settings')}
          </h1>
          <p className="text-muted-foreground mt-2">
            Customize your experience with the Flood Vision Dashboard
          </p>
        </div>

        <div className="grid gap-6">
          {/* Language Settings */}
          <Card className="bg-white/80 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Languages className="h-5 w-5 mr-2" />
                {translate('language-preferences')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language-select">{translate('select-language')}</Label>
                <Select value={language} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languageData.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        <div className="flex items-center space-x-2">
                          <span>{lang.name}</span>
                          <span className="text-muted-foreground text-sm">
                            ({lang.displayName})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p>{translate('current-language')}: <strong>{languageData.find(l => l.code === language)?.displayName}</strong></p>
                <p className="mt-1">
                  The interface will adapt to your selected language for better accessibility.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="bg-white/80 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="flood-alerts" className="text-sm font-medium">
                    Flood Alerts
                  </Label>
                  <Switch
                    id="flood-alerts"
                    checked={notifications.floodAlerts}
                    onCheckedChange={(checked) => handleNotificationChange('floodAlerts', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="weather-updates" className="text-sm font-medium">
                    Weather Updates
                  </Label>
                  <Switch
                    id="weather-updates"
                    checked={notifications.weatherUpdates}
                    onCheckedChange={(checked) => handleNotificationChange('weatherUpdates', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="emergency-notifications" className="text-sm font-medium">
                    Emergency Notifications
                  </Label>
                  <Switch
                    id="emergency-notifications"
                    checked={notifications.emergencyNotifications}
                    onCheckedChange={(checked) => handleNotificationChange('emergencyNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="maintenance-updates" className="text-sm font-medium">
                    Maintenance Updates
                  </Label>
                  <Switch
                    id="maintenance-updates"
                    checked={notifications.maintenanceUpdates}
                    onCheckedChange={(checked) => handleNotificationChange('maintenanceUpdates', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card className="bg-white/80 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="h-5 w-5 mr-2" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme-select">Theme</Label>
                <Select value={theme} onValueChange={handleThemeChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center space-x-2">
                        <Sun className="h-4 w-4" />
                        <span>Light</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center space-x-2">
                        <Moon className="h-4 w-4" />
                        <span>Dark</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Data & Privacy Settings */}
          <Card className="bg-white/80 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Data & Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="refresh-interval">Data Refresh Interval (hours)</Label>
                <Select value={dataRefreshInterval} onValueChange={handleDataRefreshChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select interval" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Every Hour</SelectItem>
                    <SelectItem value="6">Every 6 Hours</SelectItem>
                    <SelectItem value="12">Every 12 Hours</SelectItem>
                    <SelectItem value="24">Daily</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-location" className="text-sm font-medium">
                  Auto Location Detection
                </Label>
                <Switch
                  id="auto-location"
                  checked={autoLocationDetection}
                  onCheckedChange={setAutoLocationDetection}
                />
              </div>
            </CardContent>
          </Card>

          {/* Safety Settings */}
          <Card className="bg-white/80 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Safety & Emergency
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="emergency-contacts" className="text-sm font-medium">
                  Show Emergency Contacts
                </Label>
                <Switch
                  id="emergency-contacts"
                  checked={emergencyContactsVisible}
                  onCheckedChange={setEmergencyContactsVisible}
                />
              </div>
              
              <div className="pt-4">
                <Button variant="outline" className="w-full">
                  Configure Emergency Contacts
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Additional Settings Placeholder */}
          <Card className="bg-white/80 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Advanced configuration options for power users.
              </p>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  Export Settings
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Import Settings
                </Button>
                <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                  Reset to Defaults
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
