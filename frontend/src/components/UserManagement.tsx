import React, { useState, useEffect } from 'react';
import { userStorage, User } from '../utils/userStorage';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState({ patients: 0, doctors: 0, total: 0 });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const allUsers = userStorage.getAllUsers();
    const userStats = userStorage.getUserCount();
    setUsers(allUsers);
    setStats(userStats);
  };

  const clearAllUsers = () => {
    if (window.confirm('Are you sure you want to clear all registered users? This action cannot be undone.')) {
      userStorage.clearAllUsers();
      loadUsers();
    }
  };

  const updateUserStatus = (email: string, status: User['status']) => {
    userStorage.updateUserStatus(email, status);
    loadUsers();
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ color: '#111827', marginBottom: '8px' }}>User Management</h2>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          Utility to view and manage registered users
        </p>
      </div>

      {/* Statistics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{
          backgroundColor: '#f0f9ff',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #e0f2fe'
        }}>
          <p style={{ fontSize: '24px', fontWeight: '700', color: '#0369a1', margin: '0 0 4px' }}>
            {stats.patients}
          </p>
          <p style={{ fontSize: '14px', color: '#0369a1', margin: 0 }}>Patients</p>
        </div>
        <div style={{
          backgroundColor: '#f0fdf4',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #dcfce7'
        }}>
          <p style={{ fontSize: '24px', fontWeight: '700', color: '#166534', margin: '0 0 4px' }}>
            {stats.doctors}
          </p>
          <p style={{ fontSize: '14px', color: '#166534', margin: 0 }}>Doctors</p>
        </div>
        <div style={{
          backgroundColor: '#fef7ff',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #f3e8ff'
        }}>
          <p style={{ fontSize: '24px', fontWeight: '700', color: '#7c3aed', margin: '0 0 4px' }}>
            {stats.total}
          </p>
          <p style={{ fontSize: '14px', color: '#7c3aed', margin: 0 }}>Total Users</p>
        </div>
      </div>

      {/* Actions */}
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={clearAllUsers}
          style={{
            padding: '8px 16px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          Clear All Users
        </button>
      </div>

      {/* Users List */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '16px',
          backgroundColor: '#f9fafb',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h3 style={{ margin: 0, color: '#111827', fontSize: '16px' }}>Registered Users</h3>
        </div>
        
        {users.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>
            No users registered yet
          </div>
        ) : (
          <div>
            {users.map((user, index) => (
              <div
                key={user.id}
                style={{
                  padding: '16px',
                  borderBottom: index < users.length - 1 ? '1px solid #f3f4f6' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '500', color: '#111827' }}>{user.name}</span>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      backgroundColor: user.userType === 'patient' ? '#dbeafe' : '#dcfce7',
                      color: user.userType === 'patient' ? '#1e40af' : '#166534'
                    }}>
                      {user.userType}
                    </span>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      backgroundColor: user.status === 'active' || user.status === 'verified' ? '#dcfce7' : '#fef3c7',
                      color: user.status === 'active' || user.status === 'verified' ? '#166534' : '#92400e'
                    }}>
                      {user.status}
                    </span>
                  </div>
                  <p style={{ margin: '0 0 2px', fontSize: '14px', color: '#6b7280' }}>
                    {user.email}
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>
                    CPR: {user.cpr} • Registered: {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                {user.userType === 'doctor' && user.status === 'pending_verification' && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => updateUserStatus(user.email, 'verified')}
                      style={{
                        padding: '4px 12px',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      Verify
                    </button>
                    <button
                      onClick={() => updateUserStatus(user.email, 'active')}
                      style={{
                        padding: '4px 12px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;