import React, { useState, useEffect } from 'react';
import { Search, Download, Filter, Package } from 'lucide-react';
import StatusBadge from '../Common/StatusBadge';
import LoadingSpinner from '../Common/LoadingSpinner';
import api from '../../services/api';

const ParcelManagement = () => {
  const [parcels, setParcels] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const getAgentName = (agentId) => {
    if (!agentId) return 'Unassigned';
    const agent = agents.find(a => a._id === agentId.toString()); 
    return agent ? agent.name : 'Unknown Agent';
  };

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [parcelsRes, usersRes] = await Promise.all([
        api.get('/parcels'),
        api.get('/users') 
      ]);

      setParcels(parcelsRes.data);
      setAgents(usersRes.data.filter(u => u.role === 'agent')); 
    } catch (err) {
      setError('Failed to fetch data: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleAssignAgent = async (parcelId, agentId) => {
    if (!agentId) return;

    try {
      await api.post(`/parcels/${parcelId}/assign`, { agentId });
      alert('Agent assigned successfully! Parcel will now show up for the agent.');
      fetchData(); // Refresh data
    } catch (err) {
      alert('Failed to assign agent: ' + (err.response?.data?.error || 'Server Error'));
    }
  };

  const handleExportCSV = async () => {
    try {
      // Backend handles CSV export via query parameter
      const response = await api.get('/reports/bookings?format=csv', {
        responseType: 'blob' // Important for file download
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      // Get filename from backend header if possible, or use a default
      const contentDisposition = response.headers['content-disposition'];
      let filename = `parcels-${new Date().toISOString().split('T')[0]}.csv`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch.length === 2) filename = filenameMatch[1];
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to export CSV: ' + (err.response?.data?.error || 'Server Error'));
    }
  };

  const filteredParcels = parcels.filter(parcel => {
    const matchesSearch = parcel.trackingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parcel.pickupAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parcel.deliveryAddress.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || parcel.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (error) {
    return <div className="text-center py-12 text-red-600 font-medium">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Parcel Management ({parcels.length} Total)</h2>
          <button
            onClick={handleExportCSV}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition"
          >
            <Download size={20} />
            Export All CSV
          </button>
        </div>

        {/* Filters */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search ID, pickup, or delivery address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Assigned">Assigned</option>
            <option value="Picked Up">Picked Up</option>
            <option value="In Transit">In Transit</option>
            <option value="Delivered">Delivered</option>
            <option value="Failed">Failed</option>
          </select>

          <div className="text-right py-2">
            <span className="text-gray-600">Showing: <span className="font-semibold">{filteredParcels.length}</span> parcels</span>
          </div>
        </div>

        {/* Parcels Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pickup/Delivery</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">COD (৳)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredParcels.map(parcel => (
                <tr key={parcel._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono font-semibold text-blue-600">
                    {parcel.trackingId}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 max-w-[200px] truncate" title={`${parcel.pickupAddress} to ${parcel.deliveryAddress}`}>
                    <p className='font-medium'>{parcel.pickupAddress}</p>
                    <p className='text-xs text-gray-500'>to {parcel.deliveryAddress}</p>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-purple-600">৳{parcel.codAmount.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={parcel.status} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {getAgentName(parcel.assignedAgentId)}
                  </td>
                  <td className="px-4 py-3">
                    {!parcel.assignedAgentId ? (
                      <select
                        onChange={(e) => handleAssignAgent(parcel._id, e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1 bg-white hover:border-blue-500"
                        defaultValue=""
                      >
                        <option value="" disabled>Assign Agent</option>
                        {agents.map(agent => (
                          <option key={agent._id} value={agent._id}>{agent.name}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-xs text-green-600 font-medium">Agent Assigned</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredParcels.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-gray-500">
                    No parcels found matching your criteria.
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

export default ParcelManagement;