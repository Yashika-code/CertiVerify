import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`\n MongoDB connected !! `)
    } catch (error) {
        console.log("MongoDB connection Failed", error);
        process.exit(1);
    }
}

export default connectDB;