import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { FaUpload, FaSpinner } from 'react-icons/fa'
import axios from 'axios'

const ImageOverlayPanel = ({ onAdd }) => {
  const [uploading, setUploading] = useState(false)
  const [uploadedImage, setUploadedImage] = useState(null)
  const [position, setPosition] = useState({ x: 50, y: 50 })
  const [size, setSize] = useState({ width: 20 })
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: 1,
    disabled: uploading,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        await uploadImage(acceptedFiles[0])
      }
    }
  })
  
  const uploadImage = async (file) => {
    setUploading(true)
    
    const formData = new FormData()
    formData.append('image', file)
    
    try {
      const response = await axios.post(
        'http://localhost:5000/api/assets/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      )
      
      setUploadedImage(response.data)
    } catch (error) {
      console.error('Error uploading image:', error)
    } finally {
      setUploading(false)
    }
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!uploadedImage) return
    
    onAdd({
      src: uploadedImage.path,
      position,
      size
    })
    
    // Reset form
    setUploadedImage(null)
    setPosition({ x: 50, y: 50 })
    setSize({ width: 20 })
  }
  
  return (
    <div className="p-4">
      <h3 className="font-medium mb-4">Add Image Overlay</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Upload Image</label>
          
          {!uploadedImage ? (
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragActive 
                  ? 'border-primary-500 bg-primary-900/20' 
                  : 'border-editor-border hover:border-primary-400 hover:bg-editor-light'
              }`}
            >
              <input {...getInputProps()} />
              
              {uploading ? (
                <div className="flex flex-col items-center">
                  <FaSpinner className="animate-spin text-2xl mb-2" />
                  <p>Uploading image...</p>
                </div>
              ) : (
                <div>
                  <FaUpload className="mx-auto text-2xl mb-2 text-editor-muted" />
                  <p>Drag and drop an image here, or click to select</p>
                  <p className="text-sm text-editor-muted mt-2">
                    Supports JPG, PNG, GIF
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="border border-editor-border rounded-lg p-2 mb-4">
              <div className="aspect-video bg-black flex items-center justify-center">
                <img 
                  src={`http://localhost:5000${uploadedImage.path}`} 
                  alt="Uploaded" 
                  className="max-h-32 max-w-full"
                />
              </div>
              <button
                type="button"
                onClick={() => setUploadedImage(null)}
                className="mt-2 text-sm text-red-500 hover:text-red-400"
              >
                Remove
              </button>
            </div>
          )}
        </div>
        
        {uploadedImage && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Position</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-editor-muted mb-1">Horizontal: {position.x}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={position.x}
                    onChange={(e) => setPosition({ ...position, x: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs text-editor-muted mb-1">Vertical: {position.y}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={position.y}
                    onChange={(e) => setPosition({ ...position, y: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Size: {size.width}%</label>
              <input
                type="range"
                min="5"
                max="100"
                value={size.width}
                onChange={(e) => setSize({ width: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
            
            <button type="submit" className="btn-primary w-full">
              Add Image
            </button>
          </>
        )}
      </form>
    </div>
  )
}

export default ImageOverlayPanel