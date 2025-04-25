import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import projectRoutes from './routes/projectRoutes.js'
import videoRoutes from './routes/videoRoutes.js'
import assetRoutes from './routes/assetRoutes.js'
import Ffmpeg from 'fluent-ffmpeg';

// 👇 Set BOTH paths explicitly
Ffmpeg.setFfprobePath("C:\\Users\\hp\\OneDrive\\Documents\\Desktop\\ffmpeg-2025-04-21-git-9e1162bdf1-essentials_build\\bin\\ffprobe.exe");
Ffmpeg.setFfmpegPath("C:\\Users\\hp\\OneDrive\\Documents\\Desktop\\ffmpeg-2025-04-21-git-9e1162bdf1-essentials_build\\bin\\ffmpeg.exe");



// Configuration
dotenv.config()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5000
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/vidcraft'

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Routes
app.use('/api/projects', projectRoutes)
app.use('/api/videos', videoRoutes)
app.use('/api/assets', assetRoutes)

// Default route
app.get('/', (req, res) => {
  res.send('VidCraft API is running')
})

// Database connection
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB')
    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error)
  })

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Promise Rejection:', error)
})