import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mal_id: { type: Number, required: true },
  title: { type: String, required: true },
  image_url: { type: String, default: '' },
  synopsis: { type: String, default: '' },
  review: { type: String, default: '' }
});

const Favorite = mongoose.model('Favorite', favoriteSchema);

export default Favorite;
