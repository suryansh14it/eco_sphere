import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { latitude, longitude } = await req.json();
    
    if (!latitude || !longitude) {
      return NextResponse.json({ 
        success: false, 
        message: "Latitude and longitude are required" 
      }, { status: 400 });
    }
    
    const apiKey = process.env.OPENCAGE_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ 
        success: false, 
        message: "Location service not configured" 
      }, { status: 500 });
    }
    
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}&pretty=1&no_annotations=1`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      
      return NextResponse.json({
        success: true,
        location: {
          formatted: result.formatted,
          components: result.components,
          coordinates: {
            latitude: result.geometry.lat,
            longitude: result.geometry.lng
          }
        }
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: "Location not found" 
      }, { status: 404 });
    }
    
  } catch (error: any) {
    console.error("Error in reverse geocoding:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Error getting location details" 
    }, { status: 500 });
  }
}
