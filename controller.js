import Finance from './model.js';
import { deleteImage } from './config/cloudinary.js';

// Get all finance records
export const getAllFinanceRecords = async (req, res) => {
  try {
    const records = await Finance.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    console.error('Error fetching records:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching records',
      error: error.message,
    });
  }
};

// Get single finance record by ID
export const getFinanceRecordById = async (req, res) => {
  try {
    const record = await Finance.findById(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found',
      });
    }
    res.status(200).json({
      success: true,
      data: record,
    });
  } catch (error) {
    console.error('Error fetching record:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching record',
      error: error.message,
    });
  }
};

// Create new finance record
export const createFinanceRecord = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    
    const { userName, mobileNumber, amount, location } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Bill image is required. Please check your Cloudinary credentials.',
      });
    }

    const record = await Finance.create({
      userName,
      mobileNumber,
      amount: parseFloat(amount),
      location,
      billImage: {
        url: req.file.path,
        publicId: req.file.filename,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Record created successfully',
      data: record,
    });
  } catch (error) {
    console.error('Error creating record:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating record',
      error: error.message,
    });
  }
};

// Update finance record
export const updateFinanceRecord = async (req, res) => {
  try {
    const { userName, mobileNumber, amount, location } = req.body;
    
    const updateData = {
      userName,
      mobileNumber,
      amount: parseFloat(amount),
      location,
    };

    // If new image is uploaded, update it
    if (req.file) {
      // Get old record to delete old image
      const oldRecord = await Finance.findById(req.params.id);
      if (oldRecord && oldRecord.billImage.publicId) {
        await deleteImage(oldRecord.billImage.publicId);
      }
      
      updateData.billImage = {
        url: req.file.path,
        publicId: req.file.filename,
      };
    }

    const record = await Finance.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Record updated successfully',
      data: record,
    });
  } catch (error) {
    console.error('Error updating record:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating record',
      error: error.message,
    });
  }
};

// Delete finance record
export const deleteFinanceRecord = async (req, res) => {
  try {
    const record = await Finance.findById(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found',
      });
    }

    // Delete image from Cloudinary
    if (record.billImage.publicId) {
      await deleteImage(record.billImage.publicId);
    }

    await Finance.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Record deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting record:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting record',
      error: error.message,
    });
  }
};
