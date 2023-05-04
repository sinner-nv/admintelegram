import { model, Schema } from "mongoose";


const userSchema = new Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    avatarUrl: String

}, {
    timestamps: true
})

const UserModel = model('User', userSchema)
export default UserModel