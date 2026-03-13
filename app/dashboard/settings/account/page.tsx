'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, Trash2, Edit2, Plus, X, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Manager {
  id: string;
  name: string;
  email: string;
  role: 'all' | 'manager' | 'cashier';
  phone: string;
  status: 'active' | 'inactive';
  joinDate: string;
  avatar: string;
}

const mockManagers: Manager[] = [
  {
    id: '1',
    name: 'Rajib Ahmed',
    email: 'rajib@grocery.com',
    role: 'manager',
    phone: '+88 01700 123456',
    status: 'active',
    joinDate: '2024-01-15',
    avatar: 'RA',
  },
  {
    id: '2',
    name: 'Fatima Khan',
    email: 'fatima@grocery.com',
    role: 'manager',
    phone: '+88 01711 234567',
    status: 'active',
    joinDate: '2024-02-20',
    avatar: 'FK',
  },
  {
    id: '3',
    name: 'Karim Hassan',
    email: 'karim@grocery.com',
    role: 'cashier',
    phone: '+88 01722 345678',
    status: 'active',
    joinDate: '2024-03-10',
    avatar: 'KH',
  },
  {
    id: '4',
    name: 'Nasrin Begum',
    email: 'nasrin@grocery.com',
    role: 'cashier',
    phone: '+88 01733 456789',
    status: 'active',
    joinDate: '2024-03-15',
    avatar: 'NB',
  },
  {
    id: '5',
    name: 'Rashed Ali',
    email: 'rashed@grocery.com',
    role: 'cashier',
    phone: '+88 01744 567890',
    status: 'inactive',
    joinDate: '2023-12-01',
    avatar: 'RA',
  },
  {
    id: '6',
    name: 'Sofia Yasmin',
    email: 'sofia@grocery.com',
    role: 'manager',
    phone: '+88 01755 678901',
    status: 'active',
    joinDate: '2024-01-22',
    avatar: 'SY',
  },
];

type RoleFilter = 'all' | 'manager' | 'cashier';

export default function AccountManagerPage() {
  const router = useRouter();
  const [managers, setManagers] = useState<Manager[]>(mockManagers);
  const [selectedRole, setSelectedRole] = useState<RoleFilter>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'cashier' as 'manager' | 'cashier',
    phone: '',
  });

  const filteredManagers =
    selectedRole === 'all'
      ? managers
      : managers.filter((m) => m.role === selectedRole);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'manager':
        return 'bg-blue-100 text-blue-700';
      case 'cashier':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active'
      ? 'bg-green-50 text-green-700 border-green-200'
      : 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) return;

    const newUser: Manager = {
      id: (managers.length + 1).toString(),
      name: formData.name,
      email: formData.email,
      role: formData.role,
      phone: formData.phone,
      status: 'active',
      joinDate: new Date().toISOString().split('T')[0],
      avatar: formData.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase(),
    };

    setManagers([...managers, newUser]);
    setFormData({ name: '', email: '', role: 'cashier', phone: '' });
    setIsAddModalOpen(false);
  };

  const handleDeleteUser = (id: string) => {
    setManagers(managers.filter((m) => m.id !== id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex h-full w-full flex-col overflow-hidden bg-linear-to-br from-gray-50 to-white"
    >
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-4 py-4 md:px-6 md:py-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="rounded-lg p-2 hover:bg-gray-100 text-gray-600 transition-colors"
              title="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="rounded-lg bg-blue-100 p-2 md:p-3">
              <Shield className="h-5 w-5 text-blue-600 md:h-6 md:w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-gray-900 md:text-2xl">
                Account Manager
              </h1>
              <p className="text-xs text-gray-500 md:text-sm">
                Manage user accounts & permissions
              </p>
            </div>
          </div>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add User</span>
          </Button>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="border-b border-gray-200 bg-white px-4 py-3 md:px-6 md:py-4 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Filter by Role:</span>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as RoleFilter)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Users</option>
              <option value="manager">Manager</option>
              <option value="cashier">Cashier</option>
            </select>
          </div>
          <span className="text-xs text-gray-500 md:text-sm">
            {filteredManagers.length} user{filteredManagers.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-4 py-4 md:px-6 md:py-6 lg:px-8">
        <div className="space-y-3">
          {filteredManagers.map((manager, index) => (
            <motion.div
              key={manager.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="rounded-lg border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left side - Avatar & Info */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br ${
                      manager.role === 'manager'
                        ? 'from-blue-400 to-blue-600'
                        : 'from-green-400 to-green-600'
                    } text-white font-semibold text-sm`}
                  >
                    {manager.avatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {manager.name}
                      </h3>
                      <span
                        className={`inline-block shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${getRoleColor(
                          manager.role
                        )}`}
                      >
                        {manager.role.charAt(0).toUpperCase() + manager.role.slice(1)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{manager.email}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-600">
                      <span>{manager.phone}</span>
                      <span>•</span>
                      <span>
                        Joined{' '}
                        {new Date(manager.joinDate).toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right side - Status & Actions */}
                <div className="flex shrink-0 items-center gap-2">
                  <div
                    className={`rounded-full px-3 py-1 text-xs font-medium border ${getStatusColor(
                      manager.status
                    )}`}
                  >
                    {manager.status === 'active' ? '● Active' : '● Inactive'}
                  </div>
                  <div className="flex gap-1">
                    <button className="rounded-lg p-2 hover:bg-blue-50 text-blue-600 transition-colors">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(manager.id)}
                      className="rounded-lg p-2 hover:bg-red-50 text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Add New User</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-1 hover:bg-gray-100 text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter phone number"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role: e.target.value as 'manager' | 'cashier',
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="manager">Manager</option>
                  <option value="cashier">Cashier</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 bg-gray-200 text-gray-900 hover:bg-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                >
                  Add User
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
