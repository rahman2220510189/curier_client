import React, { useState, useEffect } from 'react';
import { Package, Truck, BarChart3, DollarSign, TrendingUp, Users } from 'lucide-react';
import LoadingSpinner from '../Common/LoadingSpinner';
import api from '../../services/api';
import { Link } from 'react-router-dom';


const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    todayBookings: 0,
    inTransit: 0,
    totalDelivered: 0,
    codTotal: 0
  });
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [metricsRes, trendsRes] = await Promise.all([
        api.get('/analytics/daily'),
        api.get('/analytics/trends?days=7')
      ]);

      setMetrics(metricsRes.data);
      const trendData = Array.isArray(trendsRes.data) ? trendsRes.data : [];
      setTrends(trendData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }
  
  const maxCount = trends.length > 0 ? Math.max(...trends.map(t => t.count)) : 1;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Today's Bookings</p>
              <p className="text-3xl font-bold mt-2">{metrics.todayBookings}</p>
              <p className="text-blue-100 text-xs mt-1">Total bookings today</p>
            </div>
            <Package size={48} className="opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">In Transit Parcels</p>
              <p className="text-3xl font-bold mt-2">{metrics.inTransit}</p>
              <p className="text-yellow-100 text-xs mt-1">Currently on the road</p>
            </div>
            <Truck size={48} className="opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Delivered</p>
              <p className="text-3xl font-bold mt-2">{metrics.totalDelivered}</p>
              <p className="text-green-100 text-xs mt-1">All-time successful deliveries</p>
            </div>
            <BarChart3 size={48} className="opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Pending COD</p>
              <p className="text-3xl font-bold mt-2">৳{metrics.codTotal.toLocaleString()}</p>
              <p className="text-purple-100 text-xs mt-1">Total COD due</p>
            </div>
            <DollarSign size={48} className="opacity-80" />
          </div>
        </div>
      </div>

      {/* Trends Chart */}
      <div className="bg-white rounded-xl shadow-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="text-blue-600" size={24} />
          <h3 className="text-xl font-bold text-gray-800">7-Day Booking Trends</h3>
        </div>
        <div className="space-y-4">
          {trends.length > 0 ? trends.map((trend, index) => (
            <div key={index} className="flex items-center gap-4">
              <span className="text-sm text-gray-600 w-24 flex-shrink-0">{trend._id}</span>
              <div className="flex-1 bg-gray-200 rounded-full h-8 relative">
                <div
                  className="bg-blue-600 h-8 rounded-full flex items-center justify-end pr-3 text-white text-sm font-medium"
                  style={{ width: `${(trend.count / maxCount) * 100}%` }}
                >
                  {trend.count}
                </div>
              </div>
            </div>
          )) : (
            <p className="text-center text-gray-500 py-4">No trend data available for the last 7 days.</p>
          )}
        </div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        <Link to="/admin/users" className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg hover:ring-2 hover:ring-blue-500 transition text-left">
          <Users className="text-blue-600 mb-3" size={32} />
          <h4 className="font-semibold text-gray-800 mb-1">Manage Users</h4>
          <p className="text-sm text-gray-600">Add, edit, or remove users (Admin, Agent, Customer).</p>
        </Link>

        <Link to="/admin/parcels" className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg hover:ring-2 hover:ring-green-500 transition text-left">
          <Package className="text-green-600 mb-3" size={32} />
          <h4 className="font-semibold text-gray-800 mb-1">View All Parcels</h4>
          <p className="text-sm text-gray-600">Monitor all parcels and assign agents.</p>
        </Link>

        <Link to="/admin/reports" className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg hover:ring-2 hover:ring-purple-500 transition text-left">
          <BarChart3 className="text-purple-600 mb-3" size={32} />
          <h4 className="font-semibold text-gray-800 mb-1">Generate Reports</h4>
          <p className="text-sm text-gray-600">Export CSV and view COD summaries.</p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;