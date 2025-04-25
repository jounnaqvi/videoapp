import asyncHandler from 'express-async-handler'
import Project from '../models/Project.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import ffmpeg from 'fluent-ffmpeg'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({}).sort({ updatedAt: -1 })
  res.json(projects)
})

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Public
const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
  
  if (project) {
    res.json(project)
  } else {
    res.status(404)
    throw new Error('Project not found')
  }
})

// @desc    Create a project
// @route   POST /api/projects
// @access  Public
const createProject = asyncHandler(async (req, res) => {
  const { title, description } = req.body
  
  const project = await Project.create({
    title,
    description,
    status: 'draft'
  })
  
  if (project) {
    res.status(201).json(project)
  } else {
    res.status(400)
    throw new Error('Invalid project data')
  }
})

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Public
const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
  
  if (project) {
    project.title = req.body.title || project.title
    project.description = req.body.description || project.description
    
    if (req.body.timeline) {
      project.timeline = req.body.timeline
    }
    
    const updatedProject = await project.save()
    res.json(updatedProject)
  } else {
    res.status(404)
    throw new Error('Project not found')
  }
})

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Public
const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
  
  if (project) {
    // Delete associated files if they exist
    if (project.videoUrl) {
      const videoPath = path.join(__dirname, '..', project.videoUrl)
      if (fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath)
      }
    }
    
    if (project.thumbnail) {
      const thumbnailPath = path.join(__dirname, '..', project.thumbnail)
      if (fs.existsSync(thumbnailPath)) {
        fs.unlinkSync(thumbnailPath)
      }
    }
    
    if (project.outputUrl) {
      const outputPath = path.join(__dirname, '..', project.outputUrl)
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath)
      }
    }
    
    await project.deleteOne()
    res.json({ message: 'Project removed' })
  } else {
    res.status(404)
    throw new Error('Project not found')
  }
})

// @desc    Export a project
// @route   POST /api/projects/:id/export
// @access  Public
const exportProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
  
  if (!project) {
    res.status(404)
    throw new Error('Project not found')
  }
  
  if (!project.videoUrl) {
    res.status(400)
    throw new Error('No video found for this project')
  }
  
  const { quality, format, resolution } = req.body
  
  // Create output directory if it doesn't exist
  const outputDir = path.join(__dirname, '../uploads/output')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
  
  // Generate output filename
  const outputFilename = `export_${project._id}_${Date.now()}.${format}`
  const outputPath = path.join(outputDir, outputFilename)
  const relativeOutputPath = `/uploads/output/${outputFilename}`
  
  // Set quality parameters based on chosen settings
  let videoBitrate = '1500k'
  let audioBitrate = '128k'
  let videoSize = '1280x720'
  
  if (quality === 'low') {
    videoBitrate = '800k'
    audioBitrate = '96k'
  } else if (quality === 'high') {
    videoBitrate = '3000k'
    audioBitrate = '192k'
  }
  
  if (resolution === '480p') {
    videoSize = '854x480'
  } else if (resolution === '1080p') {
    videoSize = '1920x1080'
  }
  
  try {
    // For simplicity in this MVP, we're just copying the base video
    // In a real implementation, this would process all timeline items
    // and add overlays, audio tracks, etc.
    await new Promise((resolve, reject) => {
      ffmpeg(path.join(__dirname, '..', project.videoUrl))
        .outputOptions([
          `-b:v ${videoBitrate}`,
          `-b:a ${audioBitrate}`,
          `-s ${videoSize}`
        ])
        .output(outputPath)
        .on('end', () => {
          resolve()
        })
        .on('error', (err) => {
          reject(err)
        })
        .run()
    })
    
    // Update project with output URL
    project.outputUrl = relativeOutputPath
    project.status = 'completed'
    await project.save()
    
    res.json({
      message: 'Export completed successfully',
      outputUrl: relativeOutputPath
    })
  } catch (error) {
    console.error('Export error:', error)
    res.status(500)
    throw new Error('Failed to export video: ' + error.message)
  }
})

export {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  exportProject
}