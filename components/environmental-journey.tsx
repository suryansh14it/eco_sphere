import React from 'react';
import { Calendar, Award, TreePine, Leaf, Droplets, Users, MapPin, Camera, BookOpen, Play, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow, format } from 'date-fns';

interface ActivityEvent {
  eventType: 'quiz_completion' | 'project_joined' | 'tree_planted' | 'issue_reported' | 'educational_content' | 'community_event';
  description: string;
  xpEarned: number;
  environmentalImpact?: {
    treesPlanted?: number;
    co2Offset?: number;
    waterSaved?: number;
  };
  timestamp: Date;
  relatedItemId?: string;
}

interface EnvironmentalJourneyProps {
  activityHistory?: ActivityEvent[];
  language: 'en' | 'hi' | 'bn' | 'ta' | 'te' | 'mr';
  translations: any;
}

export default function EnvironmentalJourney({ activityHistory = [], language, translations }: EnvironmentalJourneyProps) {
  const t = translations[language] || translations.en;
  
  // Helper function to get icon based on event type
  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'quiz_completion':
        return <Star className="w-5 h-5 text-yellow-500" />;
      case 'project_joined':
        return <Users className="w-5 h-5 text-blue-500" />;
      case 'tree_planted':
        return <TreePine className="w-5 h-5 text-green-600" />;
      case 'issue_reported':
        return <MapPin className="w-5 h-5 text-red-500" />;
      case 'educational_content':
        return <BookOpen className="w-5 h-5 text-purple-500" />;
      case 'community_event':
        return <Users className="w-5 h-5 text-orange-500" />;
      default:
        return <Leaf className="w-5 h-5 text-emerald-500" />;
    }
  };
  
  // If no history, show detailed sample activities
  const displayActivities = activityHistory.length > 0 ? activityHistory : [
    {
      eventType: 'project_joined',
      description: 'Participated in "Clean Shores" initiative at Juhu Beach, removing over 50kg of plastic waste with 35 other volunteers',
      xpEarned: 25,
      environmentalImpact: { waterSaved: 125, co2Offset: 5.3 },
      timestamp: new Date(),
      location: 'Juhu Beach, Mumbai',
      participants: 36,
      organizer: 'Marine Conservation Society'
    },
    {
      eventType: 'educational_content',
      description: 'Completed "Climate Change: Science, Impacts, and Solutions" video series from Environment Education Institute',
      xpEarned: 15,
      environmentalImpact: { co2Offset: 0.8 },
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      duration: '45 minutes',
      provider: 'Environment Education Institute',
      certification: true
    },
    {
      eventType: 'tree_planted',
      description: 'Planted 5 native Neem and Banyan trees in Sanjay Gandhi National Park as part of urban reforestation initiative',
      xpEarned: 45,
      environmentalImpact: { treesPlanted: 5, co2Offset: 45.5 },
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      location: 'Sanjay Gandhi National Park, Mumbai',
      treeSpecies: ['Neem', 'Banyan', 'Peepal'],
      survivabilityRate: '85%'
    },
    {
      eventType: 'issue_reported',
      description: 'Documented and reported industrial effluent discharge into Mithi River with water quality measurements and photo evidence',
      xpEarned: 20,
      environmentalImpact: { waterSaved: 0, co2Offset: 0 },
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      location: 'Mithi River, BKC Area',
      issueType: 'Water Pollution',
      evidenceType: 'Photos, Water Sample',
      status: 'Under Investigation',
      caseNumber: 'ENV-2025-08-0342'
    },
    {
      eventType: 'community_event',
      description: 'Organized "Zero Waste Weekend" workshop in Powai community center, teaching composting and sustainable waste management to 85 residents',
      xpEarned: 50,
      environmentalImpact: { co2Offset: 38.2, waterSaved: 450 },
      timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
      location: 'Powai Community Center',
      attendees: 85,
      duration: '3 hours',
      outcomes: 'Created 12 new community compost systems'
    },
    {
      eventType: 'educational_content',
      description: 'Studied "Marine Conservation and Sustainable Fishing Practices in the Arabian Sea" research paper from Indian Ocean Research Institute',
      xpEarned: 15,
      environmentalImpact: { co2Offset: 0.3 },
      timestamp: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000), // 18 days ago
      source: 'Indian Ocean Research Institute',
      citations: 18,
      topic: 'Marine Conservation',
      length: '32 pages'
    },
    {
      eventType: 'project_joined',
      description: 'Joined "Solar For Schools" initiative, helping install solar panels at Dharavi Municipal School, contributing to 5.5kW capacity',
      xpEarned: 40,
      environmentalImpact: { co2Offset: 210.5 },
      timestamp: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 3 weeks ago
      location: 'Dharavi Municipal School',
      projectDuration: '4 days',
      role: 'Installation Assistant',
      impact: 'Providing renewable energy to 450 students'
    },
    {
      eventType: 'issue_reported',
      description: 'Documented illegal tree-cutting activity in Aarey Colony with drone footage and GPS coordinates, leading to intervention',
      xpEarned: 25,
      environmentalImpact: { treesPlanted: -12, co2Offset: -108 },
      timestamp: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), // 25 days ago
      location: 'Aarey Colony, Sector 5',
      issueType: 'Deforestation',
      evidenceType: 'Drone Footage, GPS Data',
      status: 'Resolved',
      outcome: 'Activity stopped, restoration ordered'
    },
    {
      eventType: 'educational_content',
      description: 'Completed advanced course on "Sustainable Urban Water Management" from IIT Bombay Environmental Engineering Department',
      xpEarned: 35,
      environmentalImpact: { waterSaved: 320, co2Offset: 1.2 },
      timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 1 month ago
      provider: 'IIT Bombay',
      duration: '12 hours',
      certification: true,
      skills: ['Water conservation', 'Urban planning', 'Rainwater harvesting']
    },
  ];

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="text-lg font-serif flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-600" />
          {t.environmentalJourney || 'My Environmental Journey'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {displayActivities.map((activity: any, index) => (
            <div key={index} className="relative pl-6 pb-6 border-l-2 border-emerald-200 last:border-0 last:pb-0">
              {/* Timeline dot */}
              <div className="absolute -left-2.5 top-0 w-5 h-5 rounded-full bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center border-2 border-emerald-200">
                {getEventIcon(activity.eventType)}
              </div>
              
              {/* Content */}
              <div className="bg-white/50 p-4 rounded-lg shadow-sm">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-foreground">{activity.description}</h3>
                  <Badge className="bg-emerald-100 text-emerald-700">+{activity.xpEarned} XP</Badge>
                </div>
                
                {/* Activity Details */}
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                  {/* Location if available */}
                  {activity.location && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{activity.location}</span>
                    </div>
                  )}
                  
                  {/* Participants */}
                  {(activity.participants || activity.attendees) && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Users className="w-3.5 h-3.5 text-blue-500" />
                      <span>{activity.participants || activity.attendees} participants</span>
                    </div>
                  )}
                  
                  {/* Organizer */}
                  {activity.organizer && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Award className="w-3.5 h-3.5 text-yellow-500" />
                      <span>By {activity.organizer}</span>
                    </div>
                  )}
                  
                  {/* Duration */}
                  {activity.duration && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5 text-purple-500" />
                      <span>{activity.duration}</span>
                    </div>
                  )}
                  
                  {/* Provider */}
                  {activity.provider && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{activity.provider}</span>
                    </div>
                  )}
                  
                  {/* Issue Type */}
                  {activity.issueType && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5 text-red-500" />
                      <span>{activity.issueType}</span>
                    </div>
                  )}
                  
                  {/* Evidence Type */}
                  {activity.evidenceType && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Camera className="w-3.5 h-3.5 text-slate-500" />
                      <span>{activity.evidenceType}</span>
                    </div>
                  )}
                  
                  {/* Status */}
                  {activity.status && (
                    <div className="flex items-center gap-1.5 text-xs">
                      <Badge variant="outline" className={`px-2 py-0.5 ${activity.status === 'Resolved' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                        {activity.status}
                      </Badge>
                    </div>
                  )}
                </div>
                
                {/* Environmental impact */}
                {activity.environmentalImpact && (
                  <div className="flex flex-wrap gap-3 mt-3 py-2 border-t border-emerald-100">
                    {activity.environmentalImpact.treesPlanted && (
                      <div className="flex items-center gap-1 text-xs text-emerald-600">
                        <TreePine className="w-3.5 h-3.5" />
                        <span>{activity.environmentalImpact.treesPlanted > 0 ? '+' : ''}{activity.environmentalImpact.treesPlanted} Trees</span>
                      </div>
                    )}
                    {activity.environmentalImpact.co2Offset && (
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <Leaf className="w-3.5 h-3.5" />
                        <span>{activity.environmentalImpact.co2Offset > 0 ? '-' : '+'}{Math.abs(activity.environmentalImpact.co2Offset)}kg CO₂</span>
                      </div>
                    )}
                    {activity.environmentalImpact.waterSaved && (
                      <div className="flex items-center gap-1 text-xs text-blue-600">
                        <Droplets className="w-3.5 h-3.5" />
                        <span>{activity.environmentalImpact.waterSaved > 0 ? '+' : ''}{activity.environmentalImpact.waterSaved}L Water</span>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Project outcomes or additional info */}
                {(activity.outcomes || activity.impact) && (
                  <div className="mt-2 py-2 px-3 bg-emerald-50 rounded-md text-xs text-emerald-700">
                    <span className="font-medium">Outcome: </span>
                    {activity.outcomes || activity.impact}
                  </div>
                )}
                
                {/* Timestamp */}
                <div className="mt-2 text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </div>
              </div>
            </div>
          ))}
          
          {displayActivities.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No environmental activities recorded yet. Start your journey today!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
