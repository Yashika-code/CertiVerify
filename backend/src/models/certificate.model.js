import mongoose from "mongoose";
const certificateSchema = new mongoose.Schema({
    certificateId: {
        type: String,
        required: true,
        unique: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    course: {
        type: String,
        required: true

    },
    issuedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    issueDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['active', 'revoked'],
        default: 'active'
    },
    certificateUrl: {
        type: String,
        default: null
    }
},
    { timestamps: true }
)

export const Certificate=mongoose.model('Certificate',certificateSchema)