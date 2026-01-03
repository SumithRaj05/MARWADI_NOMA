import mongoose from 'mongoose';

// Finance Data Schema
const financeSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
    },
    mobileNumber: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    billImage: {
      url: {
        type: String,
        required: [true, 'Bill image is required'],
      },
      publicId: {
        type: String,
        required: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

const Finance = mongoose.model('Finance', financeSchema);

export default Finance;
