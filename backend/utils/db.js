import mongoose from "mongoose";
const connectDB=async()=>{
    try{
        mongoose.set("bufferCommands", false);
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000
        });
        console.log('mongodb connected successfully');
    }catch(error){
        console.log(error)
    }
}
export default connectDB;