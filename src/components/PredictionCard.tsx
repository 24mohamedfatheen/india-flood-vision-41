import React from 'react';
import { ArrowUp, ArrowDown, Minus, ExternalLink, AlertCircle, Droplet, Home, Wheat, Building, Clock, AlertTriangle, Info } from 'lucide-react';
import { FloodData } from '../data/floodData';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface PredictionCardProps {
  floodData: FloodData | undefined;
}

const PredictionCard: React.FC<PredictionCardProps> = ({ floodData }) => {
  if (!floodData) {
    return (
      <div className="flood-card animate-pulse h-[200px] flex items-center justify-center">
        <p className="text-muted-foreground">No prediction data available</p>
      </div>
    );
  }

  const { predictedFlood } = floodData;
  
  if (!predictedFlood) {
    return (
      <div className="flood-card h-[200px] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">No forecast data available for this region</p>
        </div>
      </div>
    );
  }
  
  // Format date
  const formattedDate = new Date(predictedFlood.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  
  const probabilityColor = 
    predictedFlood.probabilityPercentage > 75 ? 'text-flood-danger' :
    predictedFlood.probabilityPercentage > 50 ? 'text-flood-warning' :
    'text-flood-safe';
    
  const daysUntil = Math.ceil((new Date(predictedFlood.date).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
  
  // River level trend icon and color
  const getRiverTrendIcon = () => {
    if (!floodData.riverData) return null;
    
    switch (floodData.riverData.trend) {
      case 'rising':
        return <ArrowUp className="ml-1 h-4 w-4 text-flood-danger" />;
      case 'falling':
        return <ArrowDown className="ml-1 h-4 w-4 text-flood-safe" />;
      case 'stable':
      default:
        return <Minus className="ml-1 h-4 w-4 text-muted-foreground" />;
    }
  };
  
  // River level percentage calculation for visualization
  const getRiverLevelPercentage = () => {
    if (!floodData.riverData) return 0;
    
    const { currentLevel, normalLevel, dangerLevel } = floodData.riverData;
    const totalRange = dangerLevel - normalLevel;
    const currentAboveNormal = currentLevel - normalLevel;
    
    // Calculate percentage between normal and danger level
    const percentage = (currentAboveNormal / totalRange) * 100;
    
    // Clamp between 0 and 100
    return Math.min(100, Math.max(0, percentage));
  };
  
  // Information source link rendering
  const renderSourceLink = () => {
    if (!predictedFlood.source?.url) return null;
    
    return (
      <a 
        href={predictedFlood.source.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="data-source-link"
      >
        {predictedFlood.source.name} <ExternalLink className="h-3 w-3" />
      </a>
    );
  };

  // Calculate next update time (12 hours from last update)
  const getNextUpdateTime = () => {
    if (!predictedFlood.timestamp) return null;
    
    const lastUpdate = new Date(predictedFlood.timestamp);
    const nextUpdate = new Date(lastUpdate.getTime() + (12 * 60 * 60 * 1000));
    return nextUpdate.toLocaleString();
  };
  
  // Alert variant based on risk level
  const getAlertVariant = () => {
    if (floodData.riskLevel === 'severe') return "destructive";
    if (floodData.riskLevel === 'high') return "default";
    return "outline";
  };
  
  // Active warnings
  const activeWarnings = floodData.activeWarnings || [];
  const hasActiveWarnings = activeWarnings.length > 0;

  return (
    <div className="flood-card space-y-4">
      <h2 className="font-semibold text-lg flex items-center">
        <AlertCircle className="h-5 w-5 mr-2 text-flood-warning" />
        Flood Risk Assessment
      </h2>
      
      {/* Source-based prediction alert */}
      {predictedFlood.source && (
        <Alert variant="default" className="bg-yellow-50 border-yellow-200 text-yellow-800 mb-4">
          <AlertTitle className="text-sm font-semibold">
            {predictedFlood.predictedEvent || `Flood Warning for ${floodData.region.charAt(0).toUpperCase() + floodData.region.slice(1)}`}
          </AlertTitle>
          <AlertDescription className="text-xs">
            <p className="mb-1"><strong>Location:</strong> {predictedFlood.predictedLocation || floodData.region.charAt(0).toUpperCase() + floodData.region.slice(1)}, {floodData.state}</p>
            <p className="mb-1"><strong>Timeframe:</strong> {predictedFlood.timeframe || `Valid until ${formattedDate}`}</p>
            {predictedFlood.supportingData && (
              <p className="mb-1"><strong>Assessment:</strong> {predictedFlood.supportingData}</p>
            )}
            {renderSourceLink()}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Active official warnings section */}
      {hasActiveWarnings && (
        <div className="border-t pt-3">
          <h3 className="text-sm font-semibold mb-2 flex items-center">
            <AlertTriangle className="h-4 w-4 mr-1 text-flood-danger" />
            Active Official Warnings
          </h3>
          
          <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
            {activeWarnings.map((warning, index) => (
              <div 
                key={index}
                className={`text-xs p-2 rounded ${
                  warning.type === 'severe' ? 'bg-red-50 border border-red-200' :
                  warning.type === 'warning' ? 'bg-orange-50 border border-orange-200' :
                  warning.type === 'alert' ? 'bg-yellow-50 border border-yellow-200' :
                  'bg-blue-50 border border-blue-200'
                }`}
              >
                <div className="font-medium mb-0.5">
                  {warning.type === 'severe' && 'RED ALERT: '}
                  {warning.type === 'warning' && 'WARNING: '}
                  {warning.type === 'alert' && 'ALERT: '}
                  {warning.type === 'watch' && 'WATCH: '}
                  {warning.message}
                </div>
                <div className="flex justify-between">
                  <span>By: {warning.issuedBy}</span>
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-0.5" />
                    Until {new Date(warning.validUntil).toLocaleDateString()}
                  </span>
                </div>
                <div className="mt-1">
                  <a 
                    href={warning.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline flex items-center hover:text-blue-800"
                  >
                    View official warning <ExternalLink className="h-2.5 w-2.5 ml-0.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        <div>
          <span className="text-xs text-muted-foreground block mb-1">Region Risk Level</span>
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            floodData.riskLevel === 'severe' ? 'bg-flood-danger/20 text-flood-danger' :
            floodData.riskLevel === 'high' ? 'bg-flood-warning/20 text-flood-warning' :
            floodData.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-flood-safe/20 text-flood-safe'
          }`}>
            {floodData.riskLevel.toUpperCase()}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Predicted Date:</span>
          <div>
            <span className="font-semibold">{formattedDate}</span>
            <span className="text-xs text-muted-foreground ml-2">({daysUntil} days)</span>
          </div>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">Flood Probability:</span>
            <span className={`font-semibold ${probabilityColor}`}>{predictedFlood.probabilityPercentage}%</span>
          </div>
          <Progress value={predictedFlood.probabilityPercentage} className={`h-2 ${
            predictedFlood.probabilityPercentage > 75 ? 'bg-muted [&>div]:bg-flood-danger' :
            predictedFlood.probabilityPercentage > 50 ? 'bg-muted [&>div]:bg-flood-warning' :
            'bg-muted [&>div]:bg-flood-safe'
          }`} />
        </div>
        
        {/* River level visualization */}
        {floodData.riverData && (
          <div className="border-t pt-3">
            <h3 className="text-sm font-semibold mb-2 flex items-center">
              <Droplet className="h-4 w-4 mr-1 text-blue-500" />
              River Level Status
            </h3>
            
            <div className="flex items-center">
              <div className="grow">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">
                    {floodData.riverData.name}
                  </span>
                  <span className="font-medium flex items-center">
                    {floodData.riverData.currentLevel}m
                    {getRiverTrendIcon()}
                  </span>
                </div>
                
                <div className="relative h-6 bg-blue-100 rounded overflow-hidden">
                  {/* Danger level marker */}
                  <div 
                    className="absolute top-0 h-full border-r-2 border-red-500 z-10 flex items-center"
                    style={{ left: `${(floodData.riverData.dangerLevel / floodData.riverData.dangerLevel) * 100}%` }}
                  >
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="h-2 w-2 rounded-full bg-red-500 -ml-1"></div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Danger Level: {floodData.riverData.dangerLevel}m</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  
                  {/* Warning level marker */}
                  <div 
                    className="absolute top-0 h-full border-r-2 border-yellow-500 z-10 flex items-center"
                    style={{ left: `${(floodData.riverData.warningLevel / floodData.riverData.dangerLevel) * 100}%` }}
                  >
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="h-2 w-2 rounded-full bg-yellow-500 -ml-1"></div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Warning Level: {floodData.riverData.warningLevel}m</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  
                  {/* Current level indicator */}
                  <div 
                    className={`h-full ${
                      floodData.riverData.currentLevel >= floodData.riverData.dangerLevel ? 'bg-red-500' :
                      floodData.riverData.currentLevel >= floodData.riverData.warningLevel ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`}
                    style={{ width: `${(floodData.riverData.currentLevel / floodData.riverData.dangerLevel) * 100}%` }}
                  ></div>
                </div>
                
                <div className="mt-1 text-xs flex justify-between text-muted-foreground">
                  <span>Normal: {floodData.riverData.normalLevel}m</span>
                  <div className="flex items-center">
                    <Info className="h-3 w-3 mr-1" />
                    <a
                      href={floodData.riverData.source.url}
                      target="_blank"
                      rel="noopener noreferrer" 
                      className="text-blue-600 hover:underline"
                    >
                      Source: {floodData.riverData.source.name}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Expected Rainfall</p>
            <p className="font-semibold flex items-center">
              {predictedFlood.expectedRainfall} mm
              <ArrowUp className="ml-1 h-4 w-4 text-flood-danger" />
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">River Rise</p>
            <p className="font-semibold flex items-center">
              {predictedFlood.expectedRiverRise} m
              <ArrowUp className="ml-1 h-4 w-4 text-flood-danger" />
            </p>
          </div>
        </div>
        
        {/* Estimated damages */}
        {floodData.estimatedDamage && (
          <div className="border-t pt-3">
            <h3 className="text-sm font-semibold mb-2 flex items-center">
              <Building className="h-4 w-4 mr-1 text-flood-warning" />
              Estimated Damages
            </h3>
            <div className="space-y-1">
              <div className="damage-stat">
                <span className="flex items-center"><Wheat className="h-3 w-3 mr-1" /> Agricultural Crops</span>
                <span className="damage-value">₹{floodData.estimatedDamage.crops} Cr</span>
              </div>
              <div className="damage-stat">
                <span className="flex items-center"><Home className="h-3 w-3 mr-1" /> Properties</span>
                <span className="damage-value">₹{floodData.estimatedDamage.properties} Cr</span>
              </div>
              {floodData.estimatedDamage.infrastructure && (
                <div className="damage-stat">
                  <span className="flex items-center"><Building className="h-3 w-3 mr-1" /> Infrastructure</span>
                  <span className="damage-value">₹{floodData.estimatedDamage.infrastructure} Cr</span>
                </div>
              )}
              <div className="mt-2 text-xs text-muted-foreground">
                <span className="italic">Note: These are preliminary estimates based on official sources and may change as more information becomes available.</span>
              </div>
            </div>
          </div>
        )}
        
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            {predictedFlood.timestamp ? (
              <>
                Last updated: {new Date(predictedFlood.timestamp).toLocaleString()}<br/>
                Next update: {getNextUpdateTime()}
              </>
            ) : (
              <>Prediction based on official data sources</>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PredictionCard;
