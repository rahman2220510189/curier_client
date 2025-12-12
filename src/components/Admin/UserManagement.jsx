import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Clock } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import { formatDate } from '../../utils/helpers';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (err) {
      setError('Failed to fetch users: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeClasses = (role) => {
    const baseClasses = 'px-3 py-1 rounded-full text-xs font-medium capitalize';
    const colors = {
      'admin': 'bg-red-100 text-red-800',
      'agent': 'bg-orange-100 text-orange-800',
      'customer': 'bg-blue-100 text-blue-800',
    };
    return `${baseClasses} ${colors[role] || 'bg-gray-100 text-gray-800'}`;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-center py-12 text-red-600 font-medium">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-xl p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">User Management ({users.length} Total)</h2>
        
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {users.map(user => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <p className="font-semibold flex items-center"><User size={16} className="mr-2 text-blue-500"/>{user.name}</p>
                    <p className="text-xs text-gray-500 flex items-center"><Mail size={12} className="mr-1"/>{user.email}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {user.phone ? <p className='flex items-center'><Phone size={14} className="mr-2 text-gray-400"/>{user.phone}</p> : 'N/A'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={getRoleBadgeClasses(user.role)}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    <p className='flex items-center'><Clock size={14} className="mr-2 text-gray-400"/>{formatDate(user.createdAt)}</p>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-500">
                    No users found.
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

export default UserManagement;