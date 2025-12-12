import React, { useState } from 'react';
import { Package, MapPin, DollarSign, Text } from 'lucide-react';
import api from '../../services/api';

const BookingForm = ({ onBookingCreated }) => {
  const [formData, setFormData] = useState({
    pickupAddress: '',
    deliveryAddress: '',
    size: 'Medium',
    weight: '', 
    type: 'Package',
    codAmount: 0,
    paymentStatus: 'COD',
    declaredValue: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    // Backend expects weight and declaredValue as numbers
    const payload = {
      ...formData,
      weight: parseFloat(formData.weight) || 0,
      codAmount: parseFloat(formData.codAmount) || 0,
      declaredValue: parseFloat(formData.declaredValue) || 0,
    };
    
    // Simple frontend validation for COD
    if (payload.paymentStatus === 'COD' && payload.codAmount <= 0) {
      setError('COD Amount must be greater than zero for Cash on Delivery.');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/parcels', payload);
      onBookingCreated?.(response.data.parcel);
      
      setSuccessMessage(`Booking created successfully! Tracking ID: ${response.data.parcel.trackingId}. You will receive an email confirmation.`);
      
      // Reset form
      setFormData({
        pickupAddress: '',
        deliveryAddress: '',
        size: 'Medium',
        weight: '',
        type: 'Package',
        codAmount: 0,
        paymentStatus: 'COD',
        declaredValue: '',
        notes: ''
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create booking. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white rounded-xl shadow-xl p-8">
      <div className="flex items-center gap-3 mb-8">
        <Package className="text-blue-600" size={32} />
        <h2 className="text-3xl font-bold text-gray-800">Book New Parcel</h2>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Pickup/Delivery */}
          <div className='md:col-span-2 space-y-4'>
              <div>
                <label className="flex text-sm font-medium text-gray-700 mb-2 items-center">
                  <MapPin className="inline mr-1 text-blue-500" size={16} />
                  Pickup Address *
                </label>
                <input
                  type="text"
                  name="pickupAddress"
                  value={formData.pickupAddress}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Street, City, Postcode"
                />
              </div>

              <div>
                <label className="flex text-sm font-medium text-gray-700 mb-2 items-center">
                  <MapPin className="inline mr-1 text-green-500" size={16} />
                  Delivery Address *
                </label>
                <input
                  type="text"
                  name="deliveryAddress"
                  value={formData.deliveryAddress}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Street, City, Postcode"
                />
              </div>
          </div>
          

          {/* Parcel Details */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Parcel Size *</label>
            <select
              name="size"
              value={formData.size}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="Small">Small (up to 1kg)</option>
              <option value="Medium">Medium (1kg - 5kg)</option>
              <option value="Large">Large (5kg+)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Approx. Weight (kg)</label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              min="0"
              step="0.1"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 2.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Parcel Type *</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="Document">Document</option>
              <option value="Package">Package</option>
              <option value="Fragile">Fragile</option>
              <option value="Electronic">Electronic</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Declared Value (৳)</label>
            <input
              type="number"
              name="declaredValue"
              value={formData.declaredValue}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 1000"
            />
          </div>


          {/* Payment Details */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method *</label>
            <select
              name="paymentStatus"
              value={formData.paymentStatus}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="COD">Cash on Delivery</option>
              <option value="Prepaid">Prepaid</option>
            </select>
          </div>

          <div>
            <label className="flex text-sm font-medium text-gray-700 mb-2 items-center">
              <DollarSign className="inline mr-1 text-purple-500" size={16} />
              COD Amount (৳)
            </label>
            <input
              type="number"
              name="codAmount"
              value={formData.codAmount}
              onChange={handleChange}
              min="0"
              disabled={formData.paymentStatus !== 'COD'}
              className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 ${formData.paymentStatus !== 'COD' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              placeholder="0"
            />
          </div>

          <div className="md:col-span-2">
            <label className="flex text-sm font-medium text-gray-700 mb-2 items-center">
              <Text className="inline mr-1 text-gray-500" size={16} />
              Additional Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Any special instructions..."
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-lg"
        >
          {loading ? 'Creating Booking...' : 'Book Parcel'}
        </button>
      </form>
    </div>
  );
};

export default BookingForm;