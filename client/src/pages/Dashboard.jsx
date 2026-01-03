import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { financeAPI } from '../api';
import AddModal from '../components/AddModal';
import ImageModal from '../components/ImageModal';
import './Dashboard.css';

const Dashboard = ({ setIsAuthenticated }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await financeAPI.getAll();
      setRecords(response.data.data);
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setLoading(false);
    }
  };

  // Real-time filtered records
  const filteredRecords = useMemo(() => {
    if (!searchQuery.trim()) return records;
    
    const query = searchQuery.toLowerCase().trim();
    return records.filter((record) => {
      return (
        record.userName.toLowerCase().includes(query) ||
        record.mobileNumber.toLowerCase().includes(query) ||
        record.amount.toString().includes(query) ||
        record.location.toLowerCase().includes(query)
      );
    });
  }, [records, searchQuery]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/login');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    
    try {
      setDeleteLoading(id);
      await financeAPI.delete(id);
      setRecords(records.filter(record => record._id !== id));
    } catch (error) {
      console.error('Error deleting record:', error);
      alert('Failed to delete record');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleViewImage = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  const handleAddSuccess = (newRecord) => {
    setRecords([newRecord, ...records]);
    setShowAddModal(false);
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left">
          <div className="header-logo">₹</div>
          <h1>SAMBHAV</h1>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <span>Logout</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </button>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-title-bar">
          <div>
            <h2>Finance Records</h2>
            <p>
              {searchQuery ? (
                <>Showing {filteredRecords.length} of {records.length} entries</>
              ) : (
                <>{records.length} total entries</>
              )}
            </p>
          </div>
          <button className="add-btn" onClick={() => setShowAddModal(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add New Record
          </button>
        </div>

        {/* Search Bar */}
        <div className="search-bar">
          <div className="search-input-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="search-icon">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Search by name, mobile, amount, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button className="clear-search" onClick={() => setSearchQuery('')}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="table-container">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading records...</p>
            </div>
          ) : records.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>No Records Found</h3>
              <p>Start by adding your first finance record</p>
              <button className="add-btn-empty" onClick={() => setShowAddModal(true)}>
                Add First Record
              </button>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3>No Results Found</h3>
              <p>No records match "{searchQuery}"</p>
              <button className="add-btn-empty" onClick={() => setSearchQuery('')}>
                Clear Search
              </button>
            </div>
          ) : (
            <table className="finance-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>User Name</th>
                  <th>Mobile Number</th>
                  <th>Amount</th>
                  <th>Location</th>
                  <th>Bill Image</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record, index) => (
                  <tr key={record._id}>
                    <td className="row-number">{index + 1}</td>
                    <td className="user-name">{record.userName}</td>
                    <td className="mobile">{record.mobileNumber}</td>
                    <td className="amount">{formatAmount(record.amount)}</td>
                    <td className="location">{record.location}</td>
                    <td>
                      <button
                        className="view-btn"
                        onClick={() => handleViewImage(record.billImage.url)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        View
                      </button>
                    </td>
                    <td className="date">{formatDate(record.createdAt)}</td>
                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(record._id)}
                        disabled={deleteLoading === record._id}
                      >
                        {deleteLoading === record._id ? (
                          <span className="btn-spinner"></span>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                            Delete
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {showAddModal && (
        <AddModal
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAddSuccess}
        />
      )}

      {showImageModal && (
        <ImageModal
          imageUrl={selectedImage}
          onClose={() => setShowImageModal(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
