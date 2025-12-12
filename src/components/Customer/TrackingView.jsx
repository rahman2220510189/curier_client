import React, { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, Clock, Package, Zap ,  CheckCircle} from 'lucide-react';
import api from '../../services/api';
import socketService from '../../services/socket';
import StatusBadge from '../Common/StatusBadge';
import LoadingSpinner from '../Common/LoadingSpinner';
import Map from '../Common/Map';
import { formatDate } from '../../utils/helpers';

const TrackingView = () => {
  const [trackingId, setTrackingId] = useState('');
  const [parcel, setParcel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleParcelUpdate = useCallback((updatedData) => {
    // Only update the parcel data
    setParcel(prev => {
      // The backend emits the entire updated parcel object or partial tracking data
      // We merge it carefully to ensure the ID is always present
      if (prev && updatedData && (updatedData.trackingId === prev.trackingId || updatedData._id === prev._id)) {
        console.log('Real-time update received:', updatedData);
        // Special handling for live coords update
        if (updatedData.coords && updatedData.timestamp) {
            return {
                ...prev,
                liveCoords: updatedData.coords,
                liveTimestamp: updatedData.timestamp
            };
        }
        return { ...prev, ...updatedData };
      }
      return prev;
    });
  }, []); // Empty dependency array means this function never changes

  useEffect(() => {
    if (parcel) {
      // 1. Join the room on the socket connection
      socketService.joinParcel(parcel.trackingId);
      
      // 2. Set up the listener using the memoized callback
      socketService.onParcelUpdate(handleParcelUpdate);

      // 3. Cleanup: leave room and remove listener
      return () => {
        // Since the backend doesn't have a 'leaveParcel' event, 
        // we only remove the generic listener to prevent multiple callbacks.
        socketService.offParcelUpdate(); 
      };
    }
    // Dependency array: only re-run when parcel or handleParcelUpdate changes
  }, [parcel, handleParcelUpdate]); 


  const handleSearch = async (e) => {
    e.preventDefault();
    if (!trackingId.trim()) {
      setError('Please enter a tracking ID.');
      return;
    }

    setLoading(true);
    setError('');
    setParcel(null); // Clear previous parcel

    try {
      const response = await api.get(`/parcels/${trackingId.trim()}`);
      
      // Add a property to hold the most recent live location
      const parcelData = response.data;
      const lastTrackingEntry = parcelData.statusHistory?.filter(h => h.coords).pop();
      
      setParcel({
        ...parcelData,
        liveCoords: lastTrackingEntry?.coords || parcelData.pickupCoords,
        liveTimestamp: lastTrackingEntry?.at || parcelData.updatedAt
      });

    } catch (err) {
      setError(err.response?.data?.error || `Parcel with ID ${trackingId} not found.`);
    } finally {
      setLoading(false);
    }
  };

  const getTimelineSteps = (history) => {
    // The history array is assumed to be sorted oldest to newest by the backend
    return history.map((h, index) => ({
      ...h,
      isLatest: index === history.length - 1
    }));
  };

  // Build map locations from available coordinate data
  const mapLocations = [];
  if (parcel) {
    // Try to get live coordinates first
    if (parcel.liveCoords && parcel.liveCoords.lat && parcel.liveCoords.lng) {
      mapLocations.push({ lat: parcel.liveCoords.lat, lng: parcel.liveCoords.lng });
    } 
    // Fallback to pickup coordinates
    else if (parcel.pickupCoords && parcel.pickupCoords.lat && parcel.pickupCoords.lng) {
      mapLocations.push({ lat: parcel.pickupCoords.lat, lng: parcel.pickupCoords.lng });
    }
    // Fallback to delivery coordinates
    else if (parcel.deliveryCoords && parcel.deliveryCoords.lat && parcel.deliveryCoords.lng) {
      mapLocations.push({ lat: parcel.deliveryCoords.lat, lng: parcel.deliveryCoords.lng });
    }
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Track Your Parcel</h2>
        
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
            placeholder="Enter tracking ID (e.g., TRK1234567890)"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Search size={20} />
            {loading ? 'Searching...' : 'Track'}
          </button>
        </form>

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
      </div>

      {loading && <LoadingSpinner />}
      
      {parcel && (
        <div className="bg-white rounded-xl shadow-xl p-8 space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-6 mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">Parcel: <span className='text-blue-600 font-mono'>{parcel.trackingId}</span></h3>
              <p className="text-gray-600 mt-1 flex items-center">
                  <Package size={16} className='mr-2' />
                  {parcel.type} - {parcel.size} | COD: ৳{parcel.codAmount.toLocaleString()}
              </p>
            </div>
            <div className='mt-4 sm:mt-0'>
                <StatusBadge status={parcel.status} />
            </div>
          </div>
          
          {/* Map Section */}
          <section>
              <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <MapPin className='mr-2 text-red-600' size={20} />
                  Current Location
                  {parcel.liveCoords && <Zap className='ml-2 text-yellow-500 animate-pulse' size={16} title="Live Tracking Enabled" />}
              </h4>
              <div className='p-4 bg-gray-50 border rounded-lg mb-4'>
                <p className='font-medium'>
                    {parcel.liveCoords 
                      ? `Lat: ${parcel.liveCoords.lat.toFixed(4)}, Lng: ${parcel.liveCoords.lng.toFixed(4)}`
                      : 'Not yet picked up or live location unavailable.'
                    }
                </p>
                {parcel.liveCoords && <p className='text-xs text-gray-500 mt-1'>Last Updated: {formatDate(parcel.liveTimestamp)}</p>}
              </div>

              {parcel && mapLocations.length > 0 ? (
                <Map locations={mapLocations} apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} height='300px' />
              ) : (
                <div className="h-80 bg-gray-100 flex items-center justify-center rounded-lg border border-dashed border-gray-300 text-gray-500">
                  <p className="text-center">
                    <MapPin size={32} className="mx-auto mb-2" />
                    Search for a parcel to view its location on the map
                  </p>
                </div>
              )}
          </section>

          {/* Status Timeline */}
          <section className="border-t pt-8">
            <h4 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <Clock className='mr-2 text-orange-600' size={20} />
                Tracking History
            </h4>
            <div className="relative border-l-4 border-gray-200 ml-4 pl-8 space-y-6">
              {getTimelineSteps(parcel.statusHistory).reverse().map((history, index) => (
                <div key={index} className="relative">
                  {/* Circle Marker */}
                  <div className={`absolute -left-10 top-0 w-6 h-6 rounded-full flex items-center justify-center ${history.isLatest ? 'bg-blue-600 ring-4 ring-blue-200' : 'bg-gray-400'}`}>
                    <CheckCircle size={14} className='text-white' />
                  </div>
                  
                  <div className="pb-4">
                    <StatusBadge status={history.status} />
                    <p className="text-sm text-gray-500 mt-1">{formatDate(history.at)}</p>
                    {history.note && <p className="text-gray-700 mt-2">{history.note}</p>}
                    {history.coords && <p className="text-xs text-gray-500 mt-1">Location: Lat {history.coords.lat.toFixed(4)}, Lng {history.coords.lng.toFixed(4)}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
          
          {/* Agent/Customer Info */}
          <section className='grid md:grid-cols-2 gap-6 pt-6 border-t'>
            <div>
                <h4 className="font-semibold text-gray-800 mb-3">Customer Information</h4>
                <div className='text-sm space-y-1'>
                    <p>Name: <span className='font-medium'>{parcel.customer?.name}</span></p>
                    <p>Email: <span className='font-medium'>{parcel.customer?.email}</span></p>
                    <p>Phone: <span className='font-medium'>{parcel.customer?.phone || 'N/A'}</span></p>
                </div>
            </div>
            <div>
                <h4 className="font-semibold text-gray-800 mb-3">Assigned Agent</h4>
                <div className='text-sm space-y-1'>
                    <p>Name: <span className='font-medium'>{parcel.agent?.name || 'Unassigned'}</span></p>
                    <p>Phone: <span className='font-medium'>{parcel.agent?.phone || 'N/A'}</span></p>
                </div>
            </div>
          </section>

        </div>
      )}
    </div>
  );
};

export default TrackingView;