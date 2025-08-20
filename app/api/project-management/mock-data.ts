// Indian NGO project management mock data
export const indiaSpecificMockData = {
  contributors: [
    { id: "c1", name: "Anita Sharma", role: "Site Coordinator", contactInfo: "anita.s@ecoinitiative.in", joinDate: new Date("2024-06-15"), totalHoursContributed: 450, xpPoints: 1200 },
    { id: "c2", name: "Ravi Mehta", role: "Environmental Specialist", contactInfo: "ravi.m@ecoinitiative.in", joinDate: new Date("2024-06-15"), totalHoursContributed: 420, xpPoints: 980 },
    { id: "c3", name: "Kavya Reddy", role: "Community Liaison", contactInfo: "kavya.r@ecoinitiative.in", joinDate: new Date("2024-07-01"), totalHoursContributed: 380, xpPoints: 840 },
    { id: "c4", name: "Vijay Kumar", role: "Field Volunteer", contactInfo: "vijay.k@ecoinitiative.in", joinDate: new Date("2024-07-15"), totalHoursContributed: 310, xpPoints: 680 },
    { id: "c5", name: "Meera Singh", role: "Field Volunteer", contactInfo: "meera.s@ecoinitiative.in", joinDate: new Date("2024-07-15"), totalHoursContributed: 290, xpPoints: 620 },
    { id: "c6", name: "Prakash Joshi", role: "Waste Management Expert", contactInfo: "prakash.j@ecoinitiative.in", joinDate: new Date("2024-06-20"), totalHoursContributed: 390, xpPoints: 850 },
    { id: "c7", name: "Lakshmi Narayanan", role: "Community Educator", contactInfo: "lakshmi.n@ecoinitiative.in", joinDate: new Date("2024-07-05"), totalHoursContributed: 320, xpPoints: 710 },
  ],
  
  projects: [
    {
      id: "yamuna-cleanup-2024",
      name: "Yamuna Riverfront Restoration Project",
      location: "Delhi-NCR, Uttar Pradesh",
      startDate: new Date("2024-06-15"),
      expectedEndDate: new Date("2024-12-15"),
      status: "active",
      progress: 65,
      funding: "₹86.4L",
      fundingUtilized: "₹53.2L",
      impactMetrics: {
        wasteRemoved: "450 tons",
        waterQualityImprovement: "35%",
        volunteersEngaged: "420",
        communitiesReached: "12"
      },
      description: "Comprehensive cleanup and ecological restoration of the Yamuna riverfront, involving waste removal, native plant restoration, community education, and sustainable riverbank management practices."
    },
    {
      id: "mangrove-restoration-mumbai",
      name: "Mumbai Mangrove Ecosystem Restoration",
      location: "Mahim Creek, Mumbai, Maharashtra",
      startDate: new Date("2024-05-10"),
      expectedEndDate: new Date("2025-05-10"),
      status: "active",
      progress: 42,
      funding: "₹1.2Cr",
      fundingUtilized: "₹48.6L",
      impactMetrics: {
        areaRestored: "15 hectares",
        mangrovesSaplings: "25,000",
        biodiversityIncrease: "28%",
        localCommunitiesEngaged: "8"
      },
      description: "Restoring critical mangrove ecosystems in Mumbai's coastal areas through replanting, pollution reduction measures, and sustainable fishing practice education for local communities."
    },
    {
      id: "solar-village-rajasthan",
      name: "Solar-Powered Village Initiative",
      location: "Jodhpur District, Rajasthan",
      startDate: new Date("2024-04-01"),
      expectedEndDate: new Date("2025-02-28"),
      status: "active",
      progress: 70,
      funding: "₹92.5L",
      fundingUtilized: "₹67.3L",
      impactMetrics: {
        solarPanelsInstalled: "320",
        householdsImpacted: "85",
        co2Reduction: "120 tons/year",
        renewableEnergyGenerated: "140 MWh/year"
      },
      description: "Implementing solar energy solutions in rural Rajasthan villages facing electricity shortages, including installation of solar panels, battery storage systems, and training local technicians."
    }
  ],
  
  attendanceLocations: [
    { name: "Yamuna Bank Site A", latitude: 28.6126, longitude: 77.2773 },
    { name: "Okhla Bird Sanctuary", latitude: 28.5681, longitude: 77.3031 },
    { name: "Wazirabad Barrage", latitude: 28.7081, longitude: 77.2304 },
    { name: "Mahim Creek North Section", latitude: 19.0470, longitude: 72.8426 },
    { name: "Mahim Mangrove Conservation Zone", latitude: 19.0425, longitude: 72.8349 },
    { name: "Gorai Mangrove Site", latitude: 19.2352, longitude: 72.7999 },
    { name: "Jodhpur Solar Village 1", latitude: 26.2967, longitude: 73.0351 },
    { name: "Jodhpur Solar Village 2", latitude: 26.3201, longitude: 73.0489 }
  ],
  
  indianWeatherConditions: [
    "Clear sky, 36°C, high humidity",
    "Partly cloudy, 32°C, moderate humidity",
    "Monsoon rains, 29°C, heavy precipitation",
    "Light rain, 30°C, high humidity",
    "Heat wave conditions, 42°C, low humidity",
    "Dust storm warning, 38°C, poor visibility",
    "Post-rain clear conditions, 28°C, moderate humidity",
    "Morning fog clearing to sunny conditions, 34°C"
  ],

  governmentOffices: [
    "Ministry of Environment, Forest and Climate Change, Delhi",
    "Delhi Pollution Control Committee",
    "UP Pollution Control Board, Noida Office",
    "Maharashtra Coastal Zone Management Authority",
    "Rajasthan Renewable Energy Corporation",
    "Municipal Corporation of Greater Mumbai, Environmental Division",
    "National Green Tribunal, Principal Bench, Delhi"
  ],

  materialCatalog: [
    { name: "Jute Geo-textile", unit: "sqm", avgCost: 120 },
    { name: "Bamboo stakes", unit: "units", avgCost: 35 },
    { name: "Native grass seeds (mixed)", unit: "kg", avgCost: 850 },
    { name: "Water quality testing kits", unit: "sets", avgCost: 2500 },
    { name: "Mangrove saplings", unit: "units", avgCost: 20 },
    { name: "Safety equipment set", unit: "sets", avgCost: 1200 },
    { name: "Solar panel (250W)", unit: "units", avgCost: 12000 },
    { name: "Battery storage (1kWh)", unit: "units", avgCost: 45000 },
    { name: "LED lighting kits", unit: "sets", avgCost: 3500 },
    { name: "Biodegradable waste bags", unit: "packs", avgCost: 450 }
  ],

  skillsList: [
    "Waste Segregation",
    "Water Quality Testing",
    "Community Mobilization",
    "Data Collection",
    "Sapling Plantation",
    "Soil Conservation",
    "Solar Panel Installation",
    "Rainwater Harvesting",
    "Environmental Education",
    "Biodiversity Assessment",
    "GPS Mapping",
    "Community Training",
    "Drone Survey Operation",
    "Stakeholder Engagement",
    "Documentation and Reporting"
  ]
};
