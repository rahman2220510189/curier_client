import React, { useState, useEffect, useCallback } from 'react';
import { Package, MapPin, CheckCircle, Map, Target } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../Common/LoadingSpinner';
import StatusBadge from '../Common/StatusBadge';
import { formatDate } from '../../utils/helpers';
import { useSocket } from '../../hooks/useSocket'; 

const STATUS_FLOW = ['Assigned', 'Picked Up', 'In Transit', 'Delivered'];
const ALL_STATUSES = [...STATUS_FLOW, 'Failed'];

const AssignedParcels = () => {
  const { user } = useAuth();
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAssignedParcels = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/users/agents/${user.id}/parcels`);
      setParcels(response.data);
    } catch (err) {
      setError('Failed to fetch assigned parcels: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
        fetchAssignedParcels();
    }
  }, [user?.id, fetchAssignedParcels]);

  const handleLiveUpdate = (updatedData) => {
    
    setParcels(prev => prev.map(p => p._id === updatedData._id ? { ...p, ...updatedData } : p));
  };
  
  useSocket('parcelUpdate', handleLiveUpdate);

  const handleStatusUpdate = async (parcelId, newStatus) => {
    if (!ALL_STATUSES.includes(newStatus)) {
        alert('Invalid status selected.');
        return;
    }
    
    let coords = null;
    let note = prompt(`Enter a note for status update to "${newStatus}": (Optional)`);

    if (newStatus !== 'Assigned' && newStatus !== 'Pending' && navigator.geolocation) {
        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });
            coords = { 
                lat: position.coords.latitude, 
                lng: position.coords.longitude 
            };
        } catch {
            alert('Could not get current location for the status update. Proceeding without location.');
        }
    }
    
    try {
      // Backend route: /api/parcels/:id/status (where :id is the ObjectId)
      await api.post(`/parcels/${parcelId}/status`, {
        status: newStatus,
        coords: coords,
        note: note || `Status updated by agent: ${newStatus}`
      });
      alert(`Status updated to ${newStatus} successfully!`);
      fetchAssignedParcels(); // Full refresh is safe after mutation
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.error || 'Server Error'));
    }
  };

  const handleUpdateLocation = async (parcelId) => {
    if (navigator.geolocation) {
      try {
        const position = await new Promise((resolve, reject) => {
            // High accuracy and timeout for better mobile performance
            navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }); 
        });
        
        const payload = {
            coords: {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            },
            speed: position.coords.speed,
            heading: position.coords.heading
        };
        
        await api.post(`/parcels/${parcelId}/track`, payload);
        alert('Live location updated successfully!');
      } catch (geoError) {
        alert('Failed to get or send current location: ' + geoError.message);
      }
    } else {
      alert('Geolocation is not supported by your browser');
    }
  };

  const getNextStatusOptions = (currentStatus) => {
    const currentIndex = STATUS_FLOW.indexOf(currentStatus);
    return STATUS_FLOW.slice(currentIndex + 1);
  };
  
  const inProgressParcels = parcels.filter(p => !['Delivered', 'Failed'].includes(p.status));
  const completedParcels = parcels.filter(p => ['Delivered', 'Failed'].includes(p.status));


  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-center py-12 text-red-600 font-medium">{error}</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">My Deliveries (Agent: {user.name})</h1>
      
      {/* Stats Summary */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <MapPin className="text-blue-600 mb-2" size={24} />
          <p className="text-sm text-blue-600 font-medium">Pending Pickup</p>
          <p className="text-2xl font-bold text-blue-900">
            {parcels.filter(p => p.status === 'Assigned').length}
          </p>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
          <Package className="text-yellow-600 mb-2" size={24} />
          <p className="text-sm text-yellow-600 font-medium">In Transit</p>
          <p className="text-2xl font-bold text-yellow-900">
            {parcels.filter(p => p.status === 'Picked Up' || p.status === 'In Transit').length}
          </p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <CheckCircle className="text-green-600 mb-2" size={24} />
          <p className="text-sm text-green-600 font-medium">Total Delivered</p>
          <p className="text-2xl font-bold text-green-900">
            {parcels.filter(p => p.status === 'Delivered').length}
          </p>
        </div>
      </div>


      {/* In Progress Parcels */}
      <div className="bg-white rounded-xl shadow-xl p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">In Progress ({inProgressParcels.length})</h2>
        {inProgressParcels.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
                <p>No active parcels assigned to you.</p>
            </div>
        ) : (
            <div className="space-y-4">
                {inProgressParcels.map(parcel => (
                    <div key={parcel._id} className="border border-gray-200 rounded-xl p-5 hover:border-blue-500 transition">
                        <div className="flex items-center justify-between mb-4">
                            <span className="font-mono text-base font-semibold text-blue-700">{parcel.trackingId}</span>
                            <StatusBadge status={parcel.status} />
                        </div>

                        <div className="grid md:grid-cols-3 gap-4 mb-4 text-sm">
                            <div className='flex flex-col'>
                                <p className="text-xs text-gray-500 uppercase">Customer</p>
                                <p className="font-medium">{parcel.customer.name}</p>
                                <p className='text-xs text-gray-500'>{parcel.customer.phone}</p>
                            </div>
                            <div className='flex flex-col'>
                                <p className="text-xs text-gray-500 uppercase">Pickup</p>
                                <p className="font-medium truncate" title={parcel.pickupAddress}>{parcel.pickupAddress}</p>
                            </div>
                            <div className='flex flex-col'>
                                <p className="text-xs text-gray-500 uppercase">Delivery</p>
                                <p className="font-medium truncate" title={parcel.deliveryAddress}>{parcel.deliveryAddress}</p>
                            </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                            <select
                                onChange={(e) => handleStatusUpdate(parcel._id, e.target.value)}
                                className="flex-1 text-sm border border-gray-300 rounded px-3 py-2 bg-white"
                                defaultValue=""
                                disabled={parcel.status === 'Failed' || parcel.status === 'Delivered'}
                            >
                                <option value="" disabled>Next Status: {parcel.status}</option>
                                {getNextStatusOptions(parcel.status).map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                                <option value="Failed">Mark as Failed</option>
                            </select>
                            <button
                                onClick={() => handleUpdateLocation(parcel._id)}
                                className="bg-purple-600 text-white px-4 py-2 rounded text-sm hover:bg-purple-700 transition flex items-center justify-center gap-1 flex-shrink-0"
                            >
                                <Target size={18} />
                                Update Location
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* Completed/Failed Parcels */}
      <div className="bg-white rounded-xl shadow-xl p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Completed/Failed ({completedParcels.length})</h2>
        <div className='max-h-96 overflow-y-auto space-y-3'>
            {completedParcels.map(parcel => (
                <div key={parcel._id} className='p-3 border border-gray-100 rounded-lg bg-gray-50 text-sm'>
                    <div className='flex justify-between items-center'>
                        <span className="font-mono text-sm text-gray-700">{parcel.trackingId}</span>
                        <StatusBadge status={parcel.status} />
                    </div>
                    <p className='text-xs text-gray-500 mt-1'>Completed: {formatDate(parcel.updatedAt)}</p>
                </div>
            ))}
        </div>
      </div>

    </div>
  );
};

export default AssignedParcels;