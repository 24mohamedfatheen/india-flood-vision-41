
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from '@/lib/utils';
import { 
  Shield,
  Eye, 
  PhoneCall,
  Info,
  Mail,
  User,
  LogOut,
  Settings
} from 'lucide-react';
import { Button } from './ui/button';

const Navigation = () => {
  const { logout, user, userType } = useAuth();
  const { translate } = useLanguage();
  const location = useLocation();
  
  return (
    <div className="bg-white border-b shadow-sm py-2">
      <div className="container mx-auto flex justify-between items-center">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link to="/" className={navigationMenuTriggerStyle()}>
                <Eye className="mr-2 h-4 w-4" />
                {translate('flood-vision')}
              </Link>
            </NavigationMenuItem>
            
            <NavigationMenuItem>
              <NavigationMenuTrigger>
                <Shield className="mr-2 h-4 w-4" />
                {translate('safety-tips')}
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                  <li className="row-span-3">
                    <NavigationMenuLink asChild>
                      <Link
                        className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-blue-100 to-blue-200 p-6 no-underline outline-none focus:shadow-md"
                        to="/safety"
                      >
                        <Shield className="h-6 w-6 mb-2" />
                        <div className="mb-2 mt-4 text-lg font-medium">
                          Safety First
                        </div>
                        <p className="text-sm leading-tight text-muted-foreground">
                          Essential guidelines to keep you and your loved ones safe during flood events
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <Link
                      to="/safety/before-flood"
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      <div className="text-sm font-medium leading-none">Before a Flood</div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Preparation measures to take before flooding occurs
                      </p>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/safety/during-flood"
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      <div className="text-sm font-medium leading-none">During a Flood</div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Critical actions to take when flooding is occurring
                      </p>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/safety/after-flood"
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      <div className="text-sm font-medium leading-none">After a Flood</div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Recovery guidelines after flood waters recede
                      </p>
                    </Link>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            
            <NavigationMenuItem>
              <Link to="/emergency" className={cn(navigationMenuTriggerStyle(), "text-red-600")}>
                <PhoneCall className="mr-2 h-4 w-4" />
                {translate('emergency')}
              </Link>
            </NavigationMenuItem>
            
            <NavigationMenuItem>
              <Link to="/about" className={navigationMenuTriggerStyle()}>
                <Info className="mr-2 h-4 w-4" />
                {translate('about-us')}
              </Link>
            </NavigationMenuItem>
            
            <NavigationMenuItem>
              <Link to="/contact" className={navigationMenuTriggerStyle()}>
                <Mail className="mr-2 h-4 w-4" />
                {translate('contact-us')}
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link to="/settings" className={navigationMenuTriggerStyle()}>
                <Settings className="mr-2 h-4 w-4" />
                {translate('settings')}
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <User className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">
              {translate('welcome')}, {user?.username}
              {user?.userType === 'admin' && (
                <span className="ml-1 text-xs bg-red-100 text-red-600 px-1 py-0.5 rounded">{translate('admin')}</span>
              )}
            </span>
          </div>
          
          {userType === 'admin' && (
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin">{translate('admin')} Panel</Link>
            </Button>
          )}
          
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4 mr-1" />
            {translate('logout')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Navigation;
