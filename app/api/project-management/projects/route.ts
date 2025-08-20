import { NextRequest, NextResponse } from 'next/server';
import { indiaSpecificMockData } from '../mock-data';

// Project data utility functions
function calculateProgressMetrics(project: any) {
  // Calculate days since project start
  const startDate = new Date(project.startDate);
  const today = new Date();
  const daysPassed = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Calculate percentage of time elapsed
  const totalDuration = Math.ceil((new Date(project.expectedEndDate).getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const timeElapsedPercent = Math.min(100, Math.round((daysPassed / totalDuration) * 100));
  
  // Calculate funding utilization
  const fundingUtilized = parseFloat(project.fundingUtilized.replace(/[^\d.-]/g, ''));
  const totalFunding = parseFloat(project.funding.replace(/[^\d.-]/g, ''));
  const fundingUtilizationPercent = Math.round((fundingUtilized / totalFunding) * 100);
  
  return {
    daysPassed,
    totalDuration,
    timeElapsedPercent,
    fundingUtilizationPercent
  };
}

export async function GET(req: NextRequest) {
  // Parse query parameters
  const url = new URL(req.url);
  const projectId = url.searchParams.get('projectId');
  
  try {
    // Get all projects data from mock data
    let responseData;
    
    if (projectId) {
      // Get specific project data
      const project = indiaSpecificMockData.projects.find(p => p.id === projectId);
      
      if (!project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }
      
      // Get metrics for this project
      const metrics = calculateProgressMetrics(project);
      
      // Get attendance records for today
      const today = new Date().toISOString().split('T')[0];
      
      // Return enhanced project data with Indian-specific details
      responseData = {
        ...project,
        metrics,
        contributors: indiaSpecificMockData.contributors,
        attendanceToday: {
          date: today,
          present: Math.floor(indiaSpecificMockData.contributors.length * 0.8),
          absent: Math.floor(indiaSpecificMockData.contributors.length * 0.1),
          partial: Math.floor(indiaSpecificMockData.contributors.length * 0.1),
        },
        recentReports: [
          {
            id: 'dr1',
            date: new Date(new Date().setDate(new Date().getDate() - 1)),
            submittedBy: 'Anita Sharma',
            summary: 'Completed riverbank cleanup at Zone 2. Collected 120kg of plastic waste. Conducted water quality tests at 3 points showing improvement in dissolved oxygen levels.',
            tasksCompleted: ['Waste collection at Zone 2', 'Water quality testing', 'Community awareness session'],
            environmentalImpactMetrics: {
              wasteCollected: '120kg',
              waterQualityImprovement: '12%'
            },
            governmentReportSubmitted: true
          },
          {
            id: 'dr2',
            date: new Date(new Date().setDate(new Date().getDate() - 2)),
            submittedBy: 'Ravi Mehta',
            summary: 'Started plantation of native species along Zone 3. Installed educational signboards about local ecosystem. Engaged with 45 local students for environmental awareness.',
            tasksCompleted: ['Native species plantation', 'Educational signboard installation', 'Student engagement workshop'],
            environmentalImpactMetrics: {
              treesPlanted: 35,
              communityEngagement: '45 students'
            },
            governmentReportSubmitted: false
          }
        ],
        materialStock: indiaSpecificMockData.materialCatalog.map(material => ({
          ...material,
          inStock: Math.floor(Math.random() * 50) + 10
        })),
        skillsList: indiaSpecificMockData.skillsList,
        weatherConditions: indiaSpecificMockData.indianWeatherConditions,
        attendanceLocations: indiaSpecificMockData.attendanceLocations.filter(loc => {
          // Filter locations based on project
          if (project.location.includes('Delhi') || project.location.includes('Yamuna')) {
            return loc.name.includes('Yamuna') || loc.name.includes('Okhla') || loc.name.includes('Wazirabad');
          }
          if (project.location.includes('Mumbai') || project.location.includes('Mahim')) {
            return loc.name.includes('Mahim') || loc.name.includes('Gorai');
          }
          if (project.location.includes('Jodhpur') || project.location.includes('Rajasthan')) {
            return loc.name.includes('Jodhpur');
          }
          return false;
        })
      };
    } else {
      // Return list of all projects
      responseData = {
        projects: indiaSpecificMockData.projects.map(project => ({
          ...project,
          metrics: calculateProgressMetrics(project)
        }))
      };
    }
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching project management data:', error);
    return NextResponse.json({ error: 'Failed to fetch project data' }, { status: 500 });
  }
}
