// Utility to update existing pending verification doctors to active status
import { userStorage } from './userStorage';

export const activateAllPendingDoctors = () => {
  try {
    const allUsers = userStorage.getAllUsers();
    let updated = false;
    
    const updatedUsers = allUsers.map(user => {
      if (user.userType === 'doctor' && user.status === 'pending_verification') {
        updated = true;
        return { ...user, status: 'active' as const };
      }
      return user;
    });
    
    if (updated) {
      localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
      console.log('Updated pending verification doctors to active status');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error updating doctor status:', error);
    return false;
  }
};

// Auto-run this function when the module is imported
activateAllPendingDoctors();