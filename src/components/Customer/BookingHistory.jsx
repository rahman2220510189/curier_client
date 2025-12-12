import React, { useState, useEffect } from 'react';
import { Package, Clock, User } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../Common/LoadingSpinner';
import StatusBadge from '../Common/StatusBadge';
import { formatDate } from '../../utils/helpers';

const BookingHistory = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.id) {
        fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/users/customers/${user.id}/bookings`);
      // Convert ObjectIds to strings for React keys
      setBookings(response.data.map(b => ({ ...b, _id: b._id.toString() }))); 
    } catch (err) {
      setError('Failed to fetch booking history: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-center py-12 text-red-600 font-medium">{error}</div>;
  }
  
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-xl p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Package className='mr-2 text-blue-600' size={24} />
            My Parcel Booking History
        </h2>
        
        {bookings.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>You have not placed any bookings yet.</p>
          </div>
        ) : (
            <div className='space-y-4'>
                {bookings.map(booking => (
                    <div key={booking._id} className='p-4 border border-gray-200 rounded-lg hover:shadow-md transition bg-white'>
                        <div className='flex justify-between items-start mb-3'>
                            <p className='font-mono text-lg font-semibold text-blue-700'>{booking.trackingId}</p>
                            <StatusBadge status={booking.status} />
                        </div>
                        
                        <div className='grid grid-cols-2 gap-4 text-sm text-gray-600'>
                            <div>
                                <p className='font-medium text-gray-800'>Pickup:</p>
                                <p className='truncate'>{booking.pickupAddress}</p>
                            </div>
                            <div>
                                <p className='font-medium text-gray-800'>Delivery:</p>
                                <p className='truncate'>{booking.deliveryAddress}</p>
                            </div>
                            <div>
                                <p className='font-medium text-gray-800'>Type/Size:</p>
                                <p>{booking.type} / {booking.size}</p>
                            </div>
                            <div>
                                <p className='font-medium text-gray-800'>COD Amount:</p>
                                <p className='font-semibold text-purple-600'>৳{booking.codAmount.toLocaleString()}</p>
                            </div>
                        </div>
                        
                        <div className='mt-3 pt-3 border-t text-xs text-gray-500 flex justify-between items-center'>
                            <p className='flex items-center'><Clock size={14} className='mr-1' /> Booked on: {formatDate(booking.createdAt)}</p>
                            <a href={`/customer/track?id=${booking.trackingId}`} className='text-blue-500 hover:text-blue-700 font-medium'>
                                View Tracking Details &rarr;
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default BookingHistory;