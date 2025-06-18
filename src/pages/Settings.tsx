
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Languages, Settings as SettingsIcon } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Settings = () => {
  const { language, languageData, setLanguage } = useLanguage();
  const { toast } = useToast();

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    const selectedLang = languageData.find(lang => lang.code === newLanguage);
    
    toast({
      title: "Language Changed",
      description: `Language changed to ${selectedLang?.displayName || newLanguage}`,
      duration: 3000,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center">
            <SettingsIcon className="h-8 w-8 mr-3" />
            Settings
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
                Language Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language-select">Select Language</Label>
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
                <p>Current language: <strong>{languageData.find(l => l.code === language)?.displayName}</strong></p>
                <p className="mt-1">
                  The interface will adapt to your selected language for better accessibility.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Additional Settings Placeholder */}
          <Card className="bg-white/80 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle>More Settings Coming Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Additional customization options will be available in future updates.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
