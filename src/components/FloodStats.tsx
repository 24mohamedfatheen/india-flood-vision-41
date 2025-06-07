import React from 'react';
import { CloudRain, MapPin, Earth, Users, Droplet, ExternalLink, AlertTriangle, BarChart3 } from 'lucide-react';
import { FloodData } from '../data/floodData';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface FloodStatsProps {
  floodData: FloodData | undefined;
}

const FloodStats: React.FC<FloodStatsProps> = ({ floodData }) => {
  if (!floodData) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="flood-card animate-pulse">
          <p className="text-muted-foreground">No data available</p>
        </div>
      </div>
    );
  }

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'severe':
        return 'bg-flood-danger/20 text-flood-danger border-flood-danger/30';
      case 'high':
        return 'bg-flood-warning/20 text-flood-warning border-flood-warning/30';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
      default:
        return 'bg-flood-safe/20 text-flood-safe border-flood-safe/30';
    }
  };
  
  // Format timestamp
  const getFormattedTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };
  
  // Calculate percentage of affected population
  const getAffectedPercentage = () => {
    // This is a simplified calculation - in a real app, you'd use actual population data
    const regionPopulations: Record<string, number> = {
      'mumbai': 1.84e7, // 18.4 million
      'delhi': 1.9e7,   // 19 million
      'kolkata': 1.48e7, // 14.8 million
      'chennai': 7.1e6,  // 7.1 million
      'bangalore': 8.4e6, // 8.4 million
      'hyderabad': 6.8e6, // 6.8 million
      'ahmedabad': 5.6e6, // 5.6 million
      'pune': 3.1e6,     // 3.1 million
      'surat': 4.5e6,    // 4.5 million
      'jaipur': 3.0e6,   // 3.0 million
      'lucknow': 2.8e6,  // 2.8 million
      'kanpur': 2.7e6,   // 2.7 million
      'nagpur': 2.4e6,   // 2.4 million
      'patna': 1.6e6,    // 1.6 million
      'indore': 1.9e6,   // 1.9 million
      'kochi': 2.1e6,    // 2.1 million
      'guwahati': 9.5e5, // 0.95 million
    };
    
    const totalPopulation = regionPopulations[floodData.region] || 1000000;
    return ((floodData.populationAffected / totalPopulation) * 100).toFixed(1);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div className="flood-card">
        <h2 className="font-semibold mb-2 flex items-center">
          <MapPin className="mr-2 h-5 w-5 text-primary" />
          Location Information
        </h2>
        <div className="space-y-3">
          <div>
            <p className="data-label">Region</p>
            <p className="font-medium">{floodData.region.charAt(0).toUpperCase() + floodData.region.slice(1)}, {floodData.state}</p>
          </div>
          <div>
            <p className="data-label">Risk Level</p>
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getRiskBadgeColor(floodData.riskLevel)}`}>
              {floodData.riskLevel.charAt(0).toUpperCase() + floodData.riskLevel.slice(1)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="data-label">Prediction Accuracy</p>
              <p className="data-value">{floodData.predictionAccuracy}%</p>
            </div>
            <div>
              <p className="data-label">Last Updated</p>
              <p className="text-sm font-medium">{getFormattedTime(floodData.timestamp)}</p>
            </div>
          </div>
          
          {/* Data sources badge */}
          <div className="mt-2">
            <p className="data-label mb-1">Data Sources</p>
            <div className="flex flex-wrap gap-1">
              {floodData.predictedFlood?.source && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a 
                        href={floodData.predictedFlood.source.url}
                        target="_blank"
                        rel="noopener noreferrer" 
                        className="data-source-badge hover:bg-blue-200"
                      >
                        {floodData.predictedFlood.source.type === 'IMD' ? 'Weather' : floodData.predictedFlood.source.type}
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">{
                        floodData.predictedFlood.source.name === 'India Meteorological Department' 
                          ? 'Weather Services' 
                          : floodData.predictedFlood.source.name
                      }</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              {floodData.riverData?.source && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a 
                        href={floodData.riverData.source.url}
                        target="_blank"
                        rel="noopener noreferrer" 
                        className="data-source-badge hover:bg-blue-200"
                      >
                        {floodData.riverData.source.type === 'IMD' ? 'Weather' : floodData.riverData.source.type}
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">{
                        floodData.riverData.source.name === 'India Meteorological Department' 
                          ? 'Weather Services' 
                          : floodData.riverData.source.name
                      }</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              {floodData.activeWarnings && floodData.activeWarnings.length > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="data-source-badge">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {floodData.activeWarnings.length} Active Warning(s)
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-xs space-y-1">
                        {floodData.activeWarnings.map((warning, i) => (
                          <p key={i}>{warning.issuedBy}: {warning.type.toUpperCase()}</p>
                        ))}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flood-card">
        <h2 className="font-semibold mb-2 flex items-center">
          <CloudRain className="mr-2 h-5 w-5 text-primary" />
          Current Conditions
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="data-label">Rainfall</p>
            <p className="data-value">{floodData.currentRainfall} mm</p>
          </div>
          
          {floodData.riverData ? (
            <div>
              <p className="data-label flex items-center justify-between">
                <span>
                  <Droplet className="mr-1 h-3 w-3 inline" />
                  {floodData.riverData.name}
                </span>
                {floodData.riverData.currentLevel >= floodData.riverData.warningLevel && (
                  <span className={`text-xs px-1 rounded ${floodData.riverData.currentLevel >= floodData.riverData.dangerLevel ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {floodData.riverData.currentLevel >= floodData.riverData.dangerLevel ? 'DANGER' : 'WARNING'}
                  </span>
                )}
              </p>
              <div className="flex items-center">
                <p className="data-value">{floodData.riverData.currentLevel} m</p>
                {floodData.riverData.trend === 'rising' && <ArrowTrendingUp className="h-4 w-4 ml-1 text-flood-danger" />}
                {floodData.riverData.trend === 'falling' && <ArrowTrendingDown className="h-4 w-4 ml-1 text-flood-safe" />}
                {floodData.riverData.trend === 'stable' && <ArrowTrendingStable className="h-4 w-4 ml-1 text-muted-foreground" />}
              </div>
            </div>
          ) : (
            <div>
              <p className="data-label">River Level</p>
              <p className="data-value">{floodData.riverLevel} m</p>
            </div>
          )}
          
          <div>
            <p className="data-label flex items-center">
              <Earth className="mr-1 h-4 w-4 text-muted-foreground" />
              Affected Area
            </p>
            <p className="data-value">{floodData.affectedArea} km²</p>
          </div>
          <div>
            <p className="data-label flex items-center justify-between">
              <span>
                <Users className="mr-1 h-4 w-4 text-muted-foreground" />
                People Affected
              </span>
              <span className="text-xs text-muted-foreground">({getAffectedPercentage()}%)</span>
            </p>
            <p className="data-value">{floodData.populationAffected.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Arrow trend indicators as custom SVG components
const ArrowTrendingUp = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M17 7L7 17M17 7H8M17 7V16" />
  </svg>
);

const ArrowTrendingDown = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M7 17L17 7M7 17H16M7 17V8" />
  </svg>
);

const ArrowTrendingStable = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M7 12L17 12" />
  </svg>
);

export default FloodStats;
