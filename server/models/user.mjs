import mongoose from "mongoose";
import bcryptjs from "bcryptjs";

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    profileImage: { type: String, default: null },
    createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function() {
    if (this.isModified('password')) {
        this.password = await bcryptjs.hash(this.password, 10);
    }
});

const User = mongoose.model('User', userSchema);

export default User;