import asyncHandler from 'express-async-handler'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import Project from '../models/Project.js'
import ffmpeg from 'fluent-ffmpeg'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Set up storage for uploaded videos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/videos')
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    cb(null, 'video-' + uniqueSuffix + ext)
  }
})

// File filter for videos
const fileFilter = (req, file, cb) => {
  const filetypes = /mp4|mov|avi|webm|mkv/
  const mimetype = filetypes.test(file.mimetype)
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
  
  if (mimetype && extname) {
    return cb(null, true)
  }
  
  cb(new Error('Only video files are allowed'))
}

// Set up multer for video uploads
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB
})

// @desc    Upload a video
// @route   POST /api/videos/upload
// @access  Public
const uploadVideo = asyncHandler(async (req, res) => {
  const videoUpload = upload.single('video')
  
  videoUpload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message })
    }
    
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a video file' })
    }
    
    const videoUrl = `/uploads/videos/${req.file.filename}`
    const thumbnailDir = path.join(__dirname, '../uploads/thumbnails')
    
    // Create thumbnail directory if it doesn't exist
    if (!fs.existsSync(thumbnailDir)) {
      fs.mkdirSync(thumbnailDir, { recursive: true })
    }
    
    const thumbnailFilename = `thumb-${path.parse(req.file.filename).name}.jpg`
    const thumbnailPath = path.join(thumbnailDir, thumbnailFilename)
    const relativeThumbnailPath = `/uploads/thumbnails/${thumbnailFilename}`
    
    try {
      // Generate thumbnail from video
      await new Promise((resolve, reject) => {
        ffmpeg(req.file.path)
          .screenshots({
            count: 1,
            folder: thumbnailDir,
            filename: thumbnailFilename,
            size: '320x180'
          })
          .on('end', () => {
            resolve()
          })
          .on('error', (err) => {
            reject(err)
          })
      })
      
      // Get video duration
      const duration = await new Promise((resolve, reject) => {
        ffmpeg.ffprobe(req.file.path, (err, metadata) => {
          if (err) reject(err)
          resolve(metadata.format.duration)
        })
      })
      
      // Update project if projectId is provided
      if (req.query.projectId) {
        const project = await Project.findById(req.query.projectId)
        
        if (project) {
          project.videoUrl = videoUrl
          project.thumbnail = relativeThumbnailPath
          project.duration = duration
          
          await project.save()
        }
      }
      
      res.json({
        message: 'Video uploaded successfully',
        videoUrl,
        thumbnail: relativeThumbnailPath,
        duration
      })
    } catch (error) {
      console.error('Error processing video:', error)
      res.status(500).json({ message: 'Error processing video' })
    }
  })
})

export { uploadVideo }