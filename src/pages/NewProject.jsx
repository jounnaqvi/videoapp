import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { FaUpload, FaSpinner } from 'react-icons/fa'
import { useProject } from '../context/ProjectContext'

const NewProject = () => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [videoFile, setVideoFile] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  
  const { createProject, uploadVideo } = useProject()
  const navigate = useNavigate()

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.webm']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setVideoFile(acceptedFiles[0])
        setError('')
      }
    }
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!title.trim()) {
      setError('Project title is required')
      return
    }
    
    if (!videoFile) {
      setError('Please upload a video file')
      return
    }
    
    setIsUploading(true)
    setError('')
    
    try {
      // 1. Create the project
      const projectData = {
        title: title.trim(),
        description: description.trim(),
      }
      
      const projectId = await createProject(projectData)
      
      if (projectId) {
        // 2. Upload the video file
        const videoData = await uploadVideo(videoFile, projectId)
        
        if (videoData) {
          // 3. Navigate to editor
          navigate(`/editor/${projectId}`)
        } else {
          setError('Failed to upload video')
        }
      } else {
        setError('Failed to create project')
      }
    } catch (err) {
      console.error('Error in project creation:', err)
      setError('An unexpected error occurred')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Create New Project</h1>
      
      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-200 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="panel p-6">
        <div className="mb-6">
          <label htmlFor="title" className="block mb-2 font-medium">
            Project Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input w-full"
            placeholder="Enter project title"
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="description" className="block mb-2 font-medium">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input w-full h-24 resize-none"
            placeholder="Enter project description (optional)"
          />
        </div>
        
        <div className="mb-6">
          <label className="block mb-2 font-medium">
            Upload Video <span className="text-red-500">*</span>
          </label>
          
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-primary-500 bg-primary-900/20' 
                : 'border-editor-border hover:border-primary-400 hover:bg-editor-dark'
            } ${videoFile ? 'bg-editor-dark' : ''}`}
          >
            <input {...getInputProps()} />
            
            {videoFile ? (
              <div>
                <div className="flex items-center justify-center mb-2 text-green-500">
                  <FaUpload className="mr-2" />
                  <span>File selected</span>
                </div>
                <p className="text-sm text-editor-muted">{videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(2)} MB)</p>
                <p className="text-xs text-editor-muted mt-2">Click or drag to replace</p>
              </div>
            ) : (
              <div>
                <FaUpload className="mx-auto text-3xl mb-2 text-editor-muted" />
                <p>Drag and drop your video here, or click to select</p>
                <p className="text-sm text-editor-muted mt-2">
                  Supports MP4, MOV, AVI, WebM (max 500MB)
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end">
          <button 
            type="submit" 
            className="btn-primary flex items-center" 
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                <span>Creating Project...</span>
              </>
            ) : (
              <>
                Create Project
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default NewProject