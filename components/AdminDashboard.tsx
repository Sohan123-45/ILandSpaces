import React, { useState, useEffect, useMemo } from 'react';
import { CustomerRequirement, FilterState } from '../types';
import { getCustomers, updateCustomerStatus, deleteCustomer, logoutAdmin } from '../services/mockBackend';
import { Button } from './ui/Button';
import { Download, Search, Trash2, CheckCircle, XCircle, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerRequirement[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    lookingFor: '',
    minBudget: '',
    maxBudget: ''
  });
  
  const navigate = useNavigate();
  // Refresh data trigger
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    setCustomers(getCustomers());
  }, [refresh]);

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin');
  };

  const handleStatusChange = (id: string, newStatus: CustomerRequirement['status']) => {
    // Determine action text for confirmation
    const actionText = newStatus === 'Contacted' ? 'mark this lead as contacted' : 'close this lead';
    if (window.confirm(`Are you sure you want to ${actionText}?`)) {
      updateCustomerStatus(id, newStatus);
      setRefresh(prev => prev + 1);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
      deleteCustomer(id);
      setRefresh(prev => prev + 1);
    }
  };

  const exportToCSV = () => {
    if (filteredCustomers.length === 0) {
        alert("No data to export");
        return;
    }
    const headers = ['Name', 'Mobile', 'Email', 'Budget', 'Location', 'Preferred', 'Status', 'Date'];
    const csvContent = [
      headers.join(','),
      ...filteredCustomers.map(c => [
        `"${c.name}"`,
        c.mobile,
        c.email,
        c.budget,
        `"${c.currentLocation}"`,
        `"${c.preferredLocation}"`,
        c.status,
        new Date(c.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ilandspaces_leads_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchesSearch = 
        c.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        c.currentLocation.toLowerCase().includes(filters.search.toLowerCase()) ||
        c.preferredLocation.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesStatus = filters.status ? c.status === filters.status : true;
      const matchesType = filters.lookingFor ? c.lookingFor === filters.lookingFor : true;
      
      const budget = c.budget;
      const matchesMinBudget = filters.minBudget ? budget >= Number(filters.minBudget) : true;
      const matchesMaxBudget = filters.maxBudget ? budget <= Number(filters.maxBudget) : true;

      return matchesSearch && matchesStatus && matchesType && matchesMinBudget && matchesMaxBudget;
    });
  }, [customers, filters]);

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Top Bar */}
      <div className="bg-white shadow border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">iL</div>
            <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden md:block">Logged in as admin</span>
            <Button variant="secondary" onClick={handleLogout} className="flex items-center gap-2 text-sm py-1.5">
              <LogOut className="w-4 h-4" /> Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Filter Leads</h2>
            <Button onClick={exportToCSV} variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" /> Export CSV
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search name or location..."
                className="pl-9 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 text-sm"
                value={filters.search}
                onChange={e => setFilters(prev => ({...prev, search: e.target.value}))}
              />
            </div>
            
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 text-sm"
              value={filters.status}
              onChange={e => setFilters(prev => ({...prev, status: e.target.value}))}
            >
              <option value="">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Closed">Closed</option>
            </select>

            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 text-sm"
              value={filters.lookingFor}
              onChange={e => setFilters(prev => ({...prev, lookingFor: e.target.value}))}
            >
              <option value="">All Property Types</option>
              <option value="Gated">Gated</option>
              <option value="Semi-gated">Semi-gated</option>
              <option value="Standalone">Standalone</option>
            </select>

            <input
              type="number"
              placeholder="Min Budget"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 text-sm"
              value={filters.minBudget}
              onChange={e => setFilters(prev => ({...prev, minBudget: e.target.value}))}
            />

             <input
              type="number"
              placeholder="Max Budget"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 text-sm"
              value={filters.maxBudget}
              onChange={e => setFilters(prev => ({...prev, maxBudget: e.target.value}))}
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requirement</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Locations</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget/Size</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.length === 0 ? (
                    <tr>
                        <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                            No records found matching your filters.
                        </td>
                    </tr>
                ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                      <div className="text-sm text-gray-500">{customer.mobile}</div>
                      <div className="text-xs text-gray-400">{customer.email}</div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="text-sm text-gray-900">{customer.lookingFor}</div>
                       <div className="text-xs text-gray-500 mt-1 max-w-xs truncate" title={customer.requirement}>
                         {customer.requirement}
                       </div>
                       <div className="text-xs text-gray-500 mt-1">Floor: {customer.floorPreference} | {customer.direction}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-medium text-gray-500 uppercase">Current</div>
                      <div className="text-sm text-gray-900 mb-1">{customer.currentLocation}</div>
                      <div className="text-xs font-medium text-gray-500 uppercase">Preferred</div>
                      <div className="text-sm text-gray-900">{customer.preferredLocation}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">₹{(customer.budget / 100000).toFixed(1)} L</div>
                      <div className="text-sm text-gray-500">{customer.flatSize} sq.ft</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${customer.status === 'New' ? 'bg-green-100 text-green-800' : ''}
                        ${customer.status === 'Contacted' ? 'bg-blue-100 text-blue-800' : ''}
                        ${customer.status === 'Closed' ? 'bg-gray-100 text-gray-800' : ''}
                      `}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        {customer.status === 'New' && (
                            <button 
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleStatusChange(customer.id, 'Contacted'); }}
                                className="p-1 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-full transition-colors" 
                                title="Mark Contacted"
                            >
                                <CheckCircle className="w-5 h-5 pointer-events-none" />
                            </button>
                        )}
                         {customer.status !== 'Closed' && (
                            <button 
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleStatusChange(customer.id, 'Closed'); }}
                                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors" 
                                title="Close Lead"
                            >
                                <XCircle className="w-5 h-5 pointer-events-none" />
                            </button>
                        )}
                        <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleDelete(customer.id); }}
                            className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors ml-1" 
                            title="Delete"
                        >
                            <Trash2 className="w-5 h-5 pointer-events-none" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-sm text-gray-500">
            Showing {filteredCustomers.length} records
          </div>
        </div>
      </div>
    </div>
  );
};