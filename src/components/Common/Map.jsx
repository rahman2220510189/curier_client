import React, { useState } from 'react';
import { MapPin, AlertCircle } from 'lucide-react';

const Map = ({ locations = [], height = '400px', zoom = 10, apiKey }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Validate locations
  const hasValidLocations = locations.length > 0 && 
                           locations[0]?.lat && 
                           locations[0]?.lng &&
                           !isNaN(locations[0].lat) &&
                           !isNaN(locations[0].lng);

  // Debug logging
  console.log('Map Debug:', {
    hasValidLocations,
    locations,
    apiKey: apiKey ? 'Present' : 'Missing',
    apiKeyLength: apiKey?.length
  });

  if (!hasValidLocations) {
    return (
      <div 
        style={{ height }}
        className="bg-gray-100 flex items-center justify-center rounded-lg border border-dashed border-gray-300 text-gray-500"
      >
        <div className="text-center">
          <MapPin size={32} className="mx-auto mb-2" />
          <p>No location data available.</p>
          <p className="text-xs mt-1">Waiting for valid coordinates...</p>
        </div>
      </div>
    );
  }

  if (!apiKey) {
    return (
      <div 
        style={{ height }}
        className="bg-red-100 flex items-center justify-center rounded-lg border border-red-300 text-red-600"
      >
        <div className="text-center">
          <AlertCircle size={32} className="mx-auto mb-2" />
          <p className="font-semibold">Google Maps API key is missing</p>
          <p className="text-xs mt-1">Add VITE_GOOGLE_MAPS_API_KEY to your .env file</p>
        </div>
      </div>
    );
  }

  const { lat, lng } = locations[0];
  
  // Build the Static Maps API URL
  const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=800x${parseInt(height)}&markers=color:red%7Clabel:P%7C${lat},${lng}&key=${apiKey}&scale=2`;

  console.log('Map URL:', mapUrl);

  return (
    <div className="relative rounded-lg overflow-hidden shadow-lg border border-gray-200" style={{ height }}>
      {!imageLoaded && !imageError && (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
      
      {imageError && (
        <div className="w-full h-full bg-yellow-50 flex items-center justify-center border-2 border-yellow-300">
          <div className="text-center p-4">
            <AlertCircle size={32} className="mx-auto mb-2 text-yellow-600" />
            <p className="font-semibold text-yellow-800">Map failed to load</p>
            <p className="text-xs text-yellow-700 mt-2">Possible issues:</p>
            <ul className="text-xs text-left mt-2 space-y-1 text-yellow-700">
              <li>• API key invalid or expired</li>
              <li>• Maps Static API not enabled</li>
              <li>• Billing not set up in Google Cloud</li>
              <li>• API key has referrer restrictions</li>
            </ul>
            <p className="text-xs mt-2 text-gray-600 font-mono bg-white p-2 rounded">
              📍 {lat.toFixed(4)}, {lng.toFixed(4)}
            </p>
          </div>
        </div>
      )}

      <img
        src={mapUrl}
        alt={`Map showing location at ${lat}, ${lng}`}
        className={`w-full h-full object-cover ${imageLoaded && !imageError ? 'block' : 'hidden'}`}
        onLoad={() => {
          console.log('Map image loaded successfully');
          setImageLoaded(true);
        }}
        onError={(e) => {
          console.error('Map image failed to load:', e);
          setImageError(true);
        }}
      />
      
      {imageLoaded && !imageError && (
        <div className="absolute bottom-2 right-2 bg-white bg-opacity-90 px-3 py-1 rounded-lg shadow text-xs font-medium text-gray-700">
          📍 {lat.toFixed(4)}, {lng.toFixed(4)}
        </div>
      )}
    </div>
  );
};

export default Map;