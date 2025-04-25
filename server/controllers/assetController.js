import asyncHandler from 'express-async-handler'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Set up storage for uploaded images
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/images')
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    cb(null, 'image-' + uniqueSuffix + ext)
  }
})

// File filter for images
const imageFileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif/
  const mimetype = filetypes.test(file.mimetype)
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
  
  if (mimetype && extname) {
    return cb(null, true)
  }
  
  cb(new Error('Only image files are allowed'))
}

// Set up multer for image uploads
const uploadImage = multer({
  storage: imageStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
})

// Set up storage for uploaded audio
const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/audio')
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    cb(null, 'audio-' + uniqueSuffix + ext)
  }
})

// File filter for audio
const audioFileFilter = (req, file, cb) => {
  const filetypes = /mp3|wav|ogg/
  const mimetype = filetypes.test(file.mimetype)
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
  
  if (mimetype && extname) {
    return cb(null, true)
  }
  
  cb(new Error('Only audio files are allowed'))
}

// Set up multer for audio uploads
const uploadAudio = multer({
  storage: audioStorage,
  fileFilter: audioFileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
})

// @desc    Upload an image
// @route   POST /api/assets/upload
// @access  Public
const uploadImageHandler = asyncHandler(async (req, res) => {
  const imageUpload = uploadImage.single('image')
  
  imageUpload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message })
    }
    
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image file' })
    }
    
    const imagePath = `/uploads/images/${req.file.filename}`
    
    res.json({
      message: 'Image uploaded successfully',
      path: imagePath,
      originalName: req.file.originalname
    })
  })
})

// @desc    Upload an audio file
// @route   POST /api/assets/upload-audio
// @access  Public
const uploadAudioHandler = asyncHandler(async (req, res) => {
  const audioUpload = uploadAudio.single('audio')
  
  audioUpload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message })
    }
    
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an audio file' })
    }
    
    const audioPath = `/uploads/audio/${req.file.filename}`
    
    res.json({
      message: 'Audio uploaded successfully',
      path: audioPath,
      originalName: req.file.originalname
    })
  })
})

export { uploadImageHandler, uploadAudioHandler }