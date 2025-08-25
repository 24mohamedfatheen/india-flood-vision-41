
import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Bot, Send, MessageSquare, X, Minimize2, Maximize2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface FloodBotProps {
  selectedRegion?: string;
}

const FloodBot: React.FC<FloodBotProps> = ({ selectedRegion = 'mumbai' }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateBotResponse = async (userMessage: string): Promise<string> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    const lowerMessage = userMessage.toLowerCase();
    
    // Flood-related knowledge base
    if (lowerMessage.includes('flood warning') || lowerMessage.includes('alert')) {
      return `🚨 **Flood Warning Information for ${selectedRegion}:**

**Current Alert Levels:**
• **Yellow Alert**: Heavy rainfall expected (50-100mm in 24hrs)
• **Orange Alert**: Very heavy rainfall (100-200mm in 24hrs) 
• **Red Alert**: Extremely heavy rainfall (>200mm in 24hrs)

**What to do during warnings:**
1. Stay updated with official weather forecasts
2. Avoid low-lying areas and waterlogged roads
3. Keep emergency supplies ready
4. Follow evacuation orders if issued

For real-time alerts, monitor IMD weather updates and local disaster management authorities.`;
    }

    if (lowerMessage.includes('evacuation') || lowerMessage.includes('evacuate')) {
      return `🏃‍♂️ **Evacuation Guidelines:**

**When to evacuate:**
• Official evacuation order issued
• Water level rising rapidly near your area
• Structural damage to your building
• Loss of utilities (power, water, communication)

**Evacuation checklist:**
✅ Important documents (ID, insurance, medical records)
✅ Emergency supplies (water, food, medicines)
✅ Phone chargers and cash
✅ Change of clothes and blankets

**Safe evacuation routes:**
• Use designated evacuation routes
• Avoid flooded roads and bridges  
• Move to higher ground immediately
• Follow traffic authorities' directions

Contact local emergency services: 📞 **108** for immediate assistance.`;
    }

    if (lowerMessage.includes('safety') || lowerMessage.includes('precaution')) {
      return `🛡️ **Flood Safety Measures:**

**Before floods:**
• Create an emergency plan with your family
• Prepare emergency kit (72-hour supplies)
• Know your evacuation routes
• Install sump pumps and waterproofing
• Keep sandbags and plastic sheets ready

**During floods:**
• Never walk through moving water
• Avoid electrical equipment if wet
• Stay away from storm drains and sewers
• Don't drive through flooded roads
• Stay indoors and on higher floors

**After floods:**
• Wait for authorities to declare area safe
• Check for structural damage before entering
• Boil water before drinking
• Dispose of contaminated food
• Watch for electrical hazards

Remember: **6 inches of moving water can knock you down, 12 inches can carry away a vehicle.**`;
    }

    if (lowerMessage.includes('emergency') || lowerMessage.includes('help') || lowerMessage.includes('contact')) {
      return `🚨 **Emergency Contacts & Services:**

**National Emergency Numbers:**
• **108** - Emergency Services (Ambulance, Fire, Police)
• **101** - Fire Department
• **100** - Police Emergency
• **102** - Women Helpline

**Disaster Management:**
• **NDMA**: 1078 (National Disaster Management)
• **State Emergency**: Contact your state control room

**Regional Emergency Services for ${selectedRegion}:**
• Local Control Room: Check district collector's office
• Municipal Corporation Emergency Line
• Regional Meteorological Office

**What information to provide:**
1. Your exact location and landmarks
2. Number of people affected
3. Type of emergency (flooding, medical, rescue)
4. Immediate danger or injuries
5. Contact number for follow-up

**Online reporting:** Use official disaster management apps or websites for non-critical updates.`;
    }

    if (lowerMessage.includes('preparation') || lowerMessage.includes('prepare') || lowerMessage.includes('kit')) {
      return `📋 **Flood Preparation Checklist:**

**Emergency Supply Kit:**
🥤 Water: 1 gallon per person per day (3-day supply)
🍞 Food: 3-day supply of non-perishable food
🔦 Flashlight and extra batteries
📻 Battery-powered or hand crank radio
🏥 First aid kit and medications
🧻 Sanitation and personal hygiene items
💰 Cash and credit cards
📄 Important family documents (copies)
🔥 Fire extinguisher, matches in waterproof container

**Home preparation:**
• Clear gutters and storm drains
• Trim trees near your home
• Secure outdoor furniture and decorations
• Install sump pump and backup power
• Waterproof basement walls
• Raise utilities above potential flood levels

**Vehicle preparation:**
• Keep fuel tank full
• Check emergency kit in car
• Know alternate routes to safety`;
    }

    if (lowerMessage.includes('water level') || lowerMessage.includes('river') || lowerMessage.includes('dam')) {
      return `🌊 **Water Level Information for ${selectedRegion}:**

**Current Monitoring:**
• River levels are monitored by Central Water Commission (CWC)
• Dam water levels tracked by state irrigation departments
• Real-time data available on official portals

**Critical levels:**
• **Normal**: Below warning level
• **Warning**: First alert level - increased monitoring
• **Danger**: Evacuation preparations begin
• **Extreme**: Immediate evacuation required

**Key water bodies to monitor:**
${selectedRegion === 'mumbai' ? '• Mithi River, Powai Lake, Vihar Lake' : 
  selectedRegion === 'chennai' ? '• Adyar River, Cooum River, Chembarambakkam Lake' :
  selectedRegion === 'kolkata' ? '• Hooghly River, Salt Lake' :
  '• Local rivers and reservoirs in your area'}

**Stay updated:**
📱 Download official apps: IMD Weather, NDMA, State Emergency apps
🌐 Visit: cwc.gov.in for real-time river data
📺 Follow local news and official social media accounts`;
    }

    if (lowerMessage.includes('insurance') || lowerMessage.includes('claim') || lowerMessage.includes('compensation')) {
      return `💰 **Flood Insurance & Compensation:**

**Insurance coverage:**
• **Home insurance**: Check if flood damage is covered
• **Vehicle insurance**: Comprehensive covers flood damage
• **Crop insurance**: For agricultural losses

**Documentation for claims:**
📸 Photos/videos of damage (before cleanup)
📋 List of damaged items with approximate values  
🧾 Bills and receipts of damaged property
📄 Police report (if required)
🏥 Medical bills (for flood-related injuries)

**Government compensation:**
• Relief funds available through District Collector
• Compensation for crop losses
• House repair grants for BPL families
• Livelihood restoration support

**Steps to file claims:**
1. Report damage immediately to insurance company
2. File FIR if required
3. Keep all documentation safe and dry
4. Don't dispose damaged items until assessment
5. Register for government relief at local camps

**Helpline:** Contact your insurance company immediately after flood damage occurs.`;
    }

    if (lowerMessage.includes('health') || lowerMessage.includes('disease') || lowerMessage.includes('medical')) {
      return `🏥 **Flood-Related Health Concerns:**

**Common health risks:**
🦠 **Water-borne diseases**: Cholera, typhoid, hepatitis A
🐛 **Vector-borne**: Malaria, dengue (increased mosquito breeding)
👂 **Skin/ear infections**: From contaminated water contact
🤧 **Respiratory issues**: From mold and dampness

**Prevention measures:**
💧 **Water safety**: Only drink boiled/bottled water
🍎 **Food safety**: Avoid street food, eat hot cooked meals
🧼 **Hygiene**: Wash hands frequently with soap
🩹 **Wound care**: Clean and cover any cuts immediately
😷 **Protection**: Use masks in moldy areas

**When to seek medical help:**
• Fever, diarrhea, vomiting
• Skin rashes or persistent wounds
• Difficulty breathing
• Signs of dehydration
• Any injury from flood debris

**Medical preparedness:**
✅ Stock essential medicines (7-day supply)
✅ Keep first aid kit updated
✅ Know location of nearest medical facility
✅ Have emergency medical contacts ready

**Post-flood cleanup:** Wear protective gear (gloves, boots, masks) when cleaning flood-damaged areas.`;
    }

    // Default response for general flood questions
    return `🌊 **Flood Information Assistant**

I can help you with information about:

🚨 **Emergency & Safety**
• Flood warnings and alerts
• Emergency contacts and procedures
• Evacuation guidelines

🛡️ **Preparation & Prevention**
• Emergency supply kits
• Home preparation measures
• Safety precautions

📊 **Monitoring & Data**
• Water levels and river status
• Weather forecasting
• Real-time flood updates

🏥 **Health & Recovery**
• Health risks and prevention
• Post-flood safety measures
• Medical emergency procedures

💰 **Support & Claims**
• Insurance information
• Government compensation
• Relief procedures

Please ask me specific questions about any of these topics, and I'll provide detailed, organized information to help keep you safe and informed about flood situations in ${selectedRegion}.

**Example questions:**
• "How do I prepare for floods?"
• "What are the emergency contact numbers?"
• "How do I file flood insurance claims?"
• "What health precautions should I take?"`;
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const botResponse = await generateBotResponse(inputText);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error generating bot response:', error);
      toast({
        title: "Error",
        description: "Failed to get response from Flood Bot. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatBotMessage = (text: string) => {
    // Convert markdown-style formatting to HTML
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/•/g, '•')
      .replace(/✅/g, '✅')
      .replace(/📞|📱|🌐|📺|📸|📋|🧾|📄|🏥/g, (match) => match)
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map((line, index) => (
        <div key={index} className="mb-1" dangerouslySetInnerHTML={{ __html: line }} />
      ));
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 shadow-lg bg-blue-600 hover:bg-blue-700"
          size="lg"
        >
          <Bot className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${isMinimized ? 'w-80' : 'w-96'}`}>
      <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bot className="h-5 w-5 text-blue-600" />
              Flood Bot
              <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">Online</span>
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-7 w-7 p-0"
              >
                {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-7 w-7 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0">
            <ScrollArea className="h-96 p-4">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Ask me anything about floods!</p>
                  <p className="text-xs mt-1">Emergency info, safety tips, preparation guides...</p>
                </div>
              )}
              
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-4 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}
                >
                  <div
                    className={`inline-block max-w-[85%] p-3 rounded-lg text-sm ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-900 rounded-bl-none'
                    }`}
                  >
                    {message.sender === 'bot' ? (
                      <div className="space-y-1">
                        {formatBotMessage(message.text)}
                      </div>
                    ) : (
                      message.text
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="text-left mb-4">
                  <div className="inline-block bg-gray-100 p-3 rounded-lg rounded-bl-none">
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                      <span className="text-xs text-gray-500">Flood Bot is typing...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </ScrollArea>

            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about flood safety, warnings, preparation..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputText.trim()}
                  size="sm"
                  className="px-3"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default FloodBot;
