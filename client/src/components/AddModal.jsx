import { useState, useRef } from 'react';
import { financeAPI } from '../api';
import './AddModal.css';

const AddModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    userName: '',
    mobileNumber: '',
    amount: '',
    location: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!imageFile) {
      setError('Please upload a bill image');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const submitData = new FormData();
      submitData.append('userName', formData.userName);
      submitData.append('mobileNumber', formData.mobileNumber);
      submitData.append('amount', formData.amount);
      submitData.append('location', formData.location);
      submitData.append('billImage', imageFile);

      const response = await financeAPI.create(submitData);
      onSuccess(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Record</h2>
          <button className="close-btn" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="form-error">{error}</div>}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="userName">User Name</label>
              <input
                type="text"
                id="userName"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                placeholder="Enter client name"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="mobileNumber">Mobile Number</label>
              <input
                type="tel"
                id="mobileNumber"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                placeholder="Enter mobile number"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="amount">Amount (₹)</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="Enter amount"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter location"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Bill Image</label>
            <div className="image-upload-area">
              {imagePreview ? (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                  <button type="button" className="remove-image" onClick={removeImage}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              ) : (
                <label className="upload-label">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*,.pdf"
                    onChange={handleImageChange}
                    hidden
                  />
                  <div className="upload-content">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    <span>Click to upload bill image</span>
                    <small>JPG, PNG, GIF, PDF (max 5MB)</small>
                  </div>
                </label>
              )}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="btn-spinner"></span>
                  Adding...
                </>
              ) : (
                'Add Record'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddModal;

