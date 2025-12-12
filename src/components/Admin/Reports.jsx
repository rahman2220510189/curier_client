// src/components/Admin/Reports.jsx
import React, { useState, useEffect } from 'react';
import { FileText, DollarSign, Download, BarChart2 } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';

const Reports = () => {
  const [codSummary, setCodSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch COD Summary
      const codRes = await api.get('/reports/cod');
      setCodSummary(codRes.data);
    } catch (err) {
      setError('Failed to fetch reports: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleExportBookingsCSV = async () => {
    try {
      const response = await api.get('/reports/bookings?format=csv', {
        responseType: 'blob' 
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bookings_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      alert('Bookings CSV exported successfully!');
    } catch (err) {
      alert('Failed to export Bookings CSV: ' + (err.response?.data?.error || 'Server Error'));
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 flex items-center">
        <FileText className="mr-3 text-blue-600" size={28} />
        System Reports
      </h1>

      {error && <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}

      {/* Booking Report Section */}
      <div className="bg-white rounded-xl shadow-xl p-6">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800 flex items-center"><BarChart2 className="mr-2 text-green-600" size={20} /> Booking Data Report</h3>
            <button
              onClick={handleExportBookingsCSV}
              className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition"
            >
              <Download size={20} />
              Export Bookings CSV
            </button>
        </div>
        <p className="text-gray-600">Export all parcel booking data in CSV format for external analysis. Note: The backend's CSV export is basic and requires manual customer name population.</p>
      </div>

      {/* COD Summary Section */}
      <div className="bg-white rounded-xl shadow-xl p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <DollarSign className="mr-2 text-purple-600" size={20} />
          Cash on Delivery (COD) Summary
        </h3>

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parcels</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total COD Due (৳)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {codSummary.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{item.agentName}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.agentPhone || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm text-blue-600 font-semibold">{item.parcelCount}</td>
                  <td className="px-4 py-3 text-sm font-bold text-right text-purple-700">৳{item.totalCOD.toLocaleString()}</td>
                </tr>
              ))}
              {codSummary.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-gray-500">
                    No active COD parcels found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
      </div>
    </div>
  );
};

export default Reports;