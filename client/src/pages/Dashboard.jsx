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

  // Group records by userName (ledger style - one row per user with total)
  const ledgerRecords = useMemo(() => {
    const filtered = searchQuery.trim()
      ? records.filter((record) => {
          const query = searchQuery.toLowerCase().trim();
          return (
            record.userName.toLowerCase().includes(query) ||
            record.mobileNumber.toLowerCase().includes(query) ||
            record.amount.toString().includes(query) ||
            record.location.toLowerCase().includes(query)
          );
        })
      : records;

    const ledger = {};
    filtered.forEach((record) => {
      const key = record.userName.toLowerCase();
      if (!ledger[key]) {
        ledger[key] = {
          userName: record.userName,
          mobileNumber: record.mobileNumber,
          location: record.location,
          totalAmount: 0,
          entryCount: 0,
          latestDate: record.createdAt,
          billImages: [],
          entryIds: [],
        };
      }
      ledger[key].totalAmount += record.amount;
      ledger[key].entryCount += 1;
      ledger[key].billImages.push(record.billImage.url);
      ledger[key].entryIds.push(record._id);
      // Keep the latest date
      if (new Date(record.createdAt) > new Date(ledger[key].latestDate)) {
        ledger[key].latestDate = record.createdAt;
      }
    });

    return Object.values(ledger).sort((a, b) => 
      new Date(b.latestDate) - new Date(a.latestDate)
    );
  }, [records, searchQuery]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/login');
  };

  const handleDeleteAll = async (entryIds) => {
    if (!window.confirm(`Are you sure you want to delete all ${entryIds.length} entries for this user?`)) return;
    
    try {
      setDeleteLoading(entryIds[0]);
      await Promise.all(entryIds.map(id => financeAPI.delete(id)));
      setRecords(records.filter(record => !entryIds.includes(record._id)));
    } catch (error) {
      console.error('Error deleting records:', error);
      alert('Failed to delete records');
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

  // Calculate grand total
  const grandTotal = useMemo(() => {
    return ledgerRecords.reduce((sum, record) => sum + record.totalAmount, 0);
  }, [ledgerRecords]);

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
            <h2>Account Ledger</h2>
            <p>{ledgerRecords.length} clients • {records.length} entries • Total: {formatAmount(grandTotal)}</p>
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
          ) : ledgerRecords.length === 0 ? (
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
                  <th>Location</th>
                  <th>Entries</th>
                  <th>Total Amount</th>
                  <th>Last Updated</th>
                  <th>Bills</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {ledgerRecords.map((record, index) => (
                  <tr key={record.userName}>
                    <td className="row-number">{index + 1}</td>
                    <td className="user-name">{record.userName}</td>
                    <td className="mobile">{record.mobileNumber}</td>
                    <td className="location">{record.location}</td>
                    <td className="entry-count">
                      <span className="badge">{record.entryCount}</span>
                    </td>
                    <td className="amount">{formatAmount(record.totalAmount)}</td>
                    <td className="date">{formatDate(record.latestDate)}</td>
                    <td>
                      <div className="bills-btn-group">
                        {record.billImages.slice(0, 3).map((url, i) => (
                          <button
                            key={i}
                            className="view-btn-small"
                            onClick={() => handleViewImage(url)}
                            title={`View Bill ${i + 1}`}
                          >
                            {i + 1}
                          </button>
                        ))}
                        {record.billImages.length > 3 && (
                          <span className="more-bills">+{record.billImages.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteAll(record.entryIds)}
                        disabled={deleteLoading === record.entryIds[0]}
                      >
                        {deleteLoading === record.entryIds[0] ? (
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
              <tfoot>
                <tr className="total-row">
                  <td colSpan="5" className="total-label">Grand Total</td>
                  <td className="amount total-amount">{formatAmount(grandTotal)}</td>
                  <td colSpan="3"></td>
                </tr>
              </tfoot>
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
