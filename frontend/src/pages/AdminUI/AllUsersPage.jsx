import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, 
  faEye, 
  faTrashAlt, 
  faUser,
  faEnvelope,
  faPhone,
  faIdCard,
  faUserTag,
  faTimes,
  faExclamationTriangle,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import BackButton from '../../components/BackButton';
import styles from './AllUsersPage.module.css';

const AllUsersPage = () => {
  const navigate = useNavigate();
    const location = useLocation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const pendingDeleteIdRef = useRef(null);

  useEffect(() => {
    // Capture incoming state once on mount
    if (location.state?.deleteUserId) {
      pendingDeleteIdRef.current = location.state.deleteUserId;
    }
    fetchUsers();
  }, []);

  // After users load, if we have a pending delete id, trigger modal
  useEffect(() => {
    if (pendingDeleteIdRef.current && users.length > 0) {
      const userToDelete = users.find(u => u.user_id === pendingDeleteIdRef.current);
      if (userToDelete) {
        openDeleteModal(userToDelete);
        pendingDeleteIdRef.current = null;
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [users]);

  const fetchUsers = async () => {
    try {
      const auth = getAuth();
      const token = await auth.currentUser.getIdToken();
      
      const response = await axios.get('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Backend returns array directly
      setUsers(response.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const openDetailsModal = async (user) => {
    setLoadingDetails(true);
    setShowDetailsModal(true);
    setSelectedUser(user); // Show basic info immediately
    setLoadingDetails(false);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedUser(null);
  };

  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      const auth = getAuth();
      const token = await auth.currentUser.getIdToken();

      await axios.delete(`http://localhost:5000/api/admin/users/${userToDelete.user_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUsers(users.filter(u => u.user_id !== userToDelete.user_id));
      closeDeleteModal();
      alert('User deleted successfully');
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Failed to delete user: ' + (err.response?.data?.error || err.message));
    }
  };

  const getRoleBadgeClass = (role) => {
    switch(role?.toLowerCase()) {
      case 'admin': return styles.roleAdmin;
      case 'provider': return styles.roleProvider;
      case 'consumer':
      case 'customer': return styles.roleConsumer;
      default: return styles.roleDefault;
    }
  };

  if (loading) {
    return (
      <div className={styles.allUsersPage}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.allUsersPage}>
        <div className={styles.pageHeader}>
          <BackButton to="/AdminUI/AdminHomePage" />
          <h2>
            <FontAwesomeIcon icon={faUsers} /> All Users
          </h2>
        </div>
        <div className={styles.errorState}>{error}</div>
      </div>
    );
  }

  return (
    <div className={styles.allUsersPage}>
      <div className={styles.pageHeader}>
        <BackButton to="/AdminUI/AdminHomePage" />
        <h2>
          <FontAwesomeIcon icon={faUsers} /> All Users
        </h2>
      </div>

      {users.length === 0 ? (
        <div className={styles.emptyState}>
          <FontAwesomeIcon icon={faUsers} className={styles.emptyIcon} />
          <h3>No Users Found</h3>
          <p>There are no users in the system.</p>
        </div>
      ) : (
        <div className={styles.usersGrid}>
          {users.map((user) => (
            <div key={user.user_id} className={styles.userCard}>
              <div className={styles.cardHeader}>
                <div className={styles.userAvatar}>
                  <FontAwesomeIcon icon={faUser} />
                </div>
                <span className={`${styles.roleBadge} ${getRoleBadgeClass(user.role)}`}>
                  {user.role || 'User'}
                </span>
              </div>

              <div className={styles.cardBody}>
                <h3 className={styles.userName}>
                  {user.display_name || user.email}
                </h3>

                <div className={styles.userInfo}>
                  <div className={styles.infoRow}>
                    <FontAwesomeIcon icon={faEnvelope} className={styles.infoIcon} />
                    <span>{user.email}</span>
                  </div>
                  
                  {user.phone && (
                    <div className={styles.infoRow}>
                      <FontAwesomeIcon icon={faPhone} className={styles.infoIcon} />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  
                  <div className={styles.infoRow}>
                    <FontAwesomeIcon icon={faIdCard} className={styles.infoIcon} />
                    <span className={styles.userId}>{user.user_id?.substring(0, 20)}...</span>
                  </div>
                </div>

                <div className={styles.cardActions}>
                  <button
                    className={styles.viewBtn}
                    onClick={() => openDetailsModal(user)}
                  >
                    <FontAwesomeIcon icon={faEye} />
                    View Details
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => openDeleteModal(user)}
                  >
                    <FontAwesomeIcon icon={faTrashAlt} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && (
        <div className={styles.modalOverlay} onClick={closeDetailsModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={closeDetailsModal}>
              <FontAwesomeIcon icon={faTimes} />
            </button>

            <div className={styles.modalHeader}>
              <FontAwesomeIcon icon={faUser} className={styles.modalIcon} />
              <h2>User Details</h2>
            </div>

            {loadingDetails ? (
              <div className={styles.modalLoading}>
                <div className={styles.spinner}></div>
                <p>Loading details...</p>
              </div>
            ) : selectedUser ? (
              <div className={styles.modalBody}>
                <div className={styles.detailsGrid}>
                  <div className={styles.detailItem}>
                    <label><FontAwesomeIcon icon={faUser} /> Display Name</label>
                    <p>{selectedUser.display_name || 'N/A'}</p>
                  </div>

                  <div className={styles.detailItem}>
                    <label><FontAwesomeIcon icon={faEnvelope} /> Email</label>
                    <p>{selectedUser.email || 'N/A'}</p>
                  </div>

                  <div className={styles.detailItem}>
                    <label><FontAwesomeIcon icon={faPhone} /> Phone</label>
                    <p>{selectedUser.phone || 'N/A'}</p>
                  </div>

                  <div className={styles.detailItem}>
                    <label><FontAwesomeIcon icon={faUserTag} /> Role</label>
                    <p>
                      <span className={`${styles.roleBadge} ${getRoleBadgeClass(selectedUser.role)}`}>
                        {selectedUser.role || 'User'}
                      </span>
                    </p>
                  </div>

                  <div className={styles.detailItem}>
                    <label><FontAwesomeIcon icon={faIdCard} /> User ID</label>
                    <p className={styles.uidText}>{selectedUser.user_id || 'N/A'}</p>
                  </div>

                  {selectedUser.created_at && (
                    <div className={styles.detailItem}>
                      <label>Created At</label>
                      <p>{new Date(selectedUser.created_at).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p>No user data available</p>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <div className={styles.modalOverlay} onClick={closeDeleteModal}>
          <div className={styles.deleteModalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.deleteModalHeader}>
              <div className={styles.warningIconCircle}>
                <FontAwesomeIcon icon={faExclamationTriangle} />
              </div>
              <h2>Delete User</h2>
            </div>

            <div className={styles.deleteModalBody}>
              <p>Are you sure you want to delete this user?</p>
              <div className={styles.userToDelete}>
                <strong>{userToDelete.display_name || 'User'}</strong>
                <span>{userToDelete.email}</span>
              </div>
              <p className={styles.warningText}>This action cannot be undone.</p>
            </div>

            <div className={styles.deleteModalActions}>
              <button className={styles.cancelBtn} onClick={closeDeleteModal}>
                Cancel
              </button>
              <button className={styles.confirmDeleteBtn} onClick={handleDeleteUser}>
                <FontAwesomeIcon icon={faTrashAlt} />
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllUsersPage;
