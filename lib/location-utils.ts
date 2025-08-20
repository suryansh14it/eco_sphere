import axios from 'axios';

/**
 * Get detailed address information from coordinates using OpenCage Geocoding API
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @returns {Promise<{address: string, components: any}>} Address information
 */
export async function getAddressFromCoordinates(latitude: number, longitude: number) {
  try {
    // Use the API key from environment variables
    const apiKey = process.env.NEXT_PUBLIC_OPENCAGE_API_KEY || process.env.OPENCAGE_API_KEY;
    
    if (!apiKey) {
      console.error('OpenCage API key not found in environment variables');
      throw new Error('API key not configured');
    }
    
    const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json`, {
      params: {
        q: `${latitude},${longitude}`,
        key: apiKey,
        language: 'en',
        countrycode: 'in', // Restrict to India
      }
    });

    if (response.data && response.data.results && response.data.results.length > 0) {
      const result = response.data.results[0];
      return {
        address: result.formatted,
        components: result.components,
        confidence: result.confidence,
        district: result.components.state_district || result.components.district,
        state: result.components.state,
        pincode: result.components.postcode
      };
    } else {
      throw new Error('No results found');
    }
  } catch (error) {
    console.error('Error fetching address from coordinates:', error);
    return {
      address: 'Unknown location, India',
      components: {},
      confidence: 0,
      district: '',
      state: '',
      pincode: ''
    };
  }
}

/**
 * Get current user location using browser's geolocation API
 * @returns {Promise<{latitude: number, longitude: number}>} Coordinates
 */
export function getCurrentLocation(): Promise<{latitude: number, longitude: number}> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        console.error('Error getting location:', error);
        reject(error);
      },
      { 
        enableHighAccuracy: true, 
        timeout: 10000,
        maximumAge: 0 
      }
    );
  });
}

/**
 * Verify if the user is within the acceptable radius of the project location
 * @param {number} userLat - User's latitude
 * @param {number} userLng - User's longitude
 * @param {number} siteLat - Project site latitude
 * @param {number} siteLng - Project site longitude
 * @param {number} radiusKm - Acceptable radius in kilometers (default: 1km)
 * @returns {boolean} Whether the user is within the acceptable radius
 */
export function isWithinProjectRadius(
  userLat: number, 
  userLng: number, 
  siteLat: number, 
  siteLng: number, 
  radiusKm: number = 1
): boolean {
  // Calculate distance using the Haversine formula
  const R = 6371; // Earth's radius in km
  const dLat = (siteLat - userLat) * Math.PI / 180;
  const dLng = (siteLng - userLng) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(userLat * Math.PI / 180) * Math.cos(siteLat * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return distance <= radiusKm;
}
