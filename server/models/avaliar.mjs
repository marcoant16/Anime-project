import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mal_id: { type: Number, required: true }, // ID do anime na API externa
  title: String,
  reviewText: String,
  createdAt: { type: Date, default: Date.now }
});

const review = mongoose.model('Review', reviewSchema);

export default review

