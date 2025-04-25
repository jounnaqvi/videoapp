import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { FaUpload, FaSpinner, FaVolumeUp } from 'react-icons/fa'
import axios from 'axios'

const AudioPanel = ({ onAdd }) => {
  const [uploading, setUploading] = useState(false)
  const [uploadedAudio, setUploadedAudio] = useState(null)
  const [volume, setVolume] = useState(1.0)
  const [audioDuration, setAudioDuration] = useState(0)
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'audio/*': ['.mp3', '.wav', '.ogg']
    },
    maxFiles: 1,
    disabled: uploading,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        await uploadAudio(acceptedFiles[0])
      }
    }
  })
  
  const uploadAudio = async (file) => {
    setUploading(true)
    
    // Get audio duration
    const audio = new Audio()
    audio.src = URL.createObjectURL(file)
    
    audio.onloadedmetadata = async () => {
      setAudioDuration(audio.duration)
      
      const formData = new FormData()
      formData.append('audio', file)
      
      try {
        const response = await axios.post(
          'http://localhost:5000/api/assets/upload-audio',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        )
        
        setUploadedAudio(response.data)
      } catch (error) {
        console.error('Error uploading audio:', error)
      } finally {
        setUploading(false)
      }
    }
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!uploadedAudio) return
    
    onAdd({
      src: uploadedAudio.path,
      volume,
      duration: audioDuration
    })
    
    // Reset form
    setUploadedAudio(null)
    setVolume(1.0)
    setAudioDuration(0)
  }
  
  return (
    <div className="p-4">
      <h3 className="font-medium mb-4">Add Audio Track</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Upload Audio</label>
          
          {!uploadedAudio ? (
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
                  <p>Uploading audio...</p>
                </div>
              ) : (
                <div>
                  <FaUpload className="mx-auto text-2xl mb-2 text-editor-muted" />
                  <p>Drag and drop an audio file here, or click to select</p>
                  <p className="text-sm text-editor-muted mt-2">
                    Supports MP3, WAV, OGG
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="border border-editor-border rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-accent-500 rounded-full flex items-center justify-center text-white">
                  <FaVolumeUp />
                </div>
                <div className="ml-3">
                  <div className="font-medium">{uploadedAudio.originalName}</div>
                  <div className="text-sm text-editor-muted">
                    Duration: {formatTime(audioDuration)}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setUploadedAudio(null)}
                className="mt-2 text-sm text-red-500 hover:text-red-400"
              >
                Remove
              </button>
            </div>
          )}
        </div>
        
        {uploadedAudio && (
          <>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">
                Volume: {Math.round(volume * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            
            <button type="submit" className="btn-primary w-full">
              Add Audio
            </button>
          </>
        )}
      </form>
    </div>
  )
}

// Format time in mm:ss format
const formatTime = (time) => {
  if (!time || isNaN(time)) return '00:00'
  
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export default AudioPanel