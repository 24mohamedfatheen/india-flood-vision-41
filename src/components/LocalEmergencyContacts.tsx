
import React from 'react';
import { Phone, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LocationData {
  lat: number;
  lng: number;
  address: string;
  city: string;
  state: string;
  country: string;
}

interface EmergencyContact {
  name: string;
  phone: string;
  type: 'police' | 'ambulance' | 'fire' | 'disaster' | 'municipal' | 'coast_guard' | 'railway' | 'other';
}

interface LocalEmergencyContactsProps {
  userLocation: LocationData;
}

const LocalEmergencyContacts: React.FC<LocalEmergencyContactsProps> = ({ userLocation }) => {
  
  const getLocalEmergencyContacts = (location: LocationData): EmergencyContact[] => {
    const contacts: EmergencyContact[] = [];
    
    // Universal emergency numbers (available across India)
    contacts.push(
      { name: "Police Emergency", phone: "100", type: "police" },
      { name: "Ambulance Services", phone: "108", type: "ambulance" },
      { name: "Fire Brigade", phone: "101", type: "fire" },
      { name: "Disaster Management Helpline", phone: "1078", type: "disaster" }
    );

    // State-specific and city-specific numbers
    const state = location.state.toLowerCase();
    const city = location.city.toLowerCase();
    
    // Maharashtra-specific contacts
    if (state.includes('maharashtra') || city.includes('mumbai') || city.includes('pune') || city.includes('nagpur')) {
      contacts.push(
        { name: "Maharashtra Control Room", phone: "022-2266 0000", type: "disaster" },
        { name: "Mumbai Municipal Helpline", phone: "1916", type: "municipal" },
        { name: "Coast Guard Mumbai", phone: "1554", type: "coast_guard" }
      );
    }
    
    // West Bengal-specific contacts
    if (state.includes('west bengal') || city.includes('kolkata') || city.includes('calcutta')) {
      contacts.push(
        { name: "West Bengal Disaster Management", phone: "033-2214 5555", type: "disaster" },
        { name: "Kolkata Police Control", phone: "033-2214 5185", type: "police" },
        { name: "Kolkata Municipal Corporation", phone: "033-2225 5676", type: "municipal" }
      );
    }
    
    // Tamil Nadu-specific contacts
    if (state.includes('tamil nadu') || city.includes('chennai') || city.includes('madras')) {
      contacts.push(
        { name: "Tamil Nadu Disaster Management", phone: "044-2841 1500", type: "disaster" },
        { name: "Chennai Corporation", phone: "1913", type: "municipal" },
        { name: "Coast Guard Chennai", phone: "044-2346 0405", type: "coast_guard" }
      );
    }
    
    // Kerala-specific contacts
    if (state.includes('kerala') || city.includes('kochi') || city.includes('thiruvananthapuram') || city.includes('kozhikode')) {
      contacts.push(
        { name: "Kerala Disaster Management", phone: "0471-2327010", type: "disaster" },
        { name: "Kerala State Emergency Service", phone: "112", type: "other" }
      );
    }
    
    // Assam-specific contacts
    if (state.includes('assam') || city.includes('guwahati') || city.includes('dibrugarh')) {
      contacts.push(
        { name: "Assam Disaster Management", phone: "0361-2237121", type: "disaster" },
        { name: "Assam State Emergency Response", phone: "108", type: "other" }
      );
    }
    
    // Bihar-specific contacts
    if (state.includes('bihar') || city.includes('patna')) {
      contacts.push(
        { name: "Bihar Disaster Management", phone: "0612-2215688", type: "disaster" },
        { name: "Bihar Emergency Control Room", phone: "0612-2215020", type: "other" }
      );
    }
    
    // Odisha-specific contacts
    if (state.includes('odisha') || state.includes('orissa') || city.includes('bhubaneswar') || city.includes('cuttack')) {
      contacts.push(
        { name: "Odisha Disaster Management", phone: "0674-2534177", type: "disaster" },
        { name: "Cyclone Warning Center", phone: "0674-2596029", type: "other" }
      );
    }
    
    // Delhi-specific contacts
    if (state.includes('delhi') || city.includes('delhi') || city.includes('new delhi')) {
      contacts.push(
        { name: "Delhi Disaster Management", phone: "011-2337 1700", type: "disaster" },
        { name: "Delhi Municipal Corporation", phone: "1800-11-0083", type: "municipal" }
      );
    }

    // Add generic numbers if no specific local numbers found
    if (contacts.length <= 4) {
      contacts.push(
        { name: "Women Helpline", phone: "1091", type: "other" },
        { name: "Child Helpline", phone: "1098", type: "other" },
        { name: "Tourist Emergency Helpline", phone: "1363", type: "other" }
      );
    }

    return contacts;
  };

  const contacts = getLocalEmergencyContacts(userLocation);
  
  const getContactIcon = (type: string) => {
    switch (type) {
      case 'police': return '🚔';
      case 'ambulance': return '🚑';
      case 'fire': return '🚒';
      case 'disaster': return '🆘';
      case 'municipal': return '🏛️';
      case 'coast_guard': return '⚓';
      case 'railway': return '🚂';
      default: return '📞';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Phone className="h-5 w-5 mr-2" />
          Emergency Contacts for {userLocation.city}, {userLocation.state}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {contacts.map((contact, index) => (
            <div key={index} className="flex justify-between items-center pb-2 border-b border-gray-100">
              <div className="flex items-center">
                <span className="text-lg mr-2">{getContactIcon(contact.type)}</span>
                <span className="font-medium">{contact.name}</span>
              </div>
              <a 
                href={`tel:${contact.phone}`} 
                className="bg-purple-100 text-purple-800 py-1 px-3 rounded-full font-semibold hover:bg-purple-200 transition-colors"
              >
                {contact.phone}
              </a>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-start">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Note:</p>
              <p>These contacts are based on your detected location. In case of emergency, always dial <strong>112</strong> for immediate assistance, which works across all of India.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocalEmergencyContacts;
