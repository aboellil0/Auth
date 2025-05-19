import server from './app';
import connectDB from './config/database';

// Connect to MongoDB
connectDB();
server();
