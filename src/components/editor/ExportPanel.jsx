import { useState } from 'react'
import { FaDownload, FaSpinner } from 'react-icons/fa'
import axios from 'axios'

const ExportPanel = ({ onExport, project }) => {
  const [quality, setQuality] = useState('medium')
  const [format, setFormat] = useState('mp4')
  const [resolution, setResolution] = useState('720p')
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [exportResult, setExportResult] = useState(null)
  const [error, setError] = useState('')
  
  const handleExport = async () => {
    setIsExporting(true)
    setError('')
    setExportProgress(0)
    
    try {
      const response = await axios.post(
        `http://localhost:5000/api/projects/${project._id}/export`,
        {
          quality,
          format,
          resolution
        },
        {
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            setExportProgress(progress)
          }
        }
      )
      
      setExportResult(response.data)
    } catch (err) {
      console.error('Export error:', err)
      setError('Failed to export video. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }
  
  return (
    <div className="p-4">
      <h3 className="font-medium mb-4">Export Video</h3>
      
      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-200 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {exportResult ? (
        <div className="text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white mx-auto">
              <FaDownload size={24} />
            </div>
            <h4 className="text-lg font-medium mt-2">Export Complete!</h4>
            <p className="text-sm text-editor-muted mt-1">Your video is ready to download</p>
          </div>
          
          <a 
            href={`http://localhost:5000${exportResult.outputUrl}`}
            download
            className="btn-accent w-full flex items-center justify-center mb-4"
          >
            <FaDownload className="mr-2" />
            Download Video
          </a>
          
          <button 
            onClick={() => setExportResult(null)}
            className="btn-secondary w-full"
          >
            Create New Export
          </button>
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Quality</label>
            <select
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
              className="input w-full"
              disabled={isExporting}
            >
              <option value="low">Low (faster export)</option>
              <option value="medium">Medium</option>
              <option value="high">High (slower export)</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Format</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="input w-full"
              disabled={isExporting}
            >
              <option value="mp4">MP4</option>
              <option value="webm">WebM</option>
              <option value="mov">MOV</option>
            </select>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Resolution</label>
            <select
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              className="input w-full"
              disabled={isExporting}
            >
              <option value="480p">480p</option>
              <option value="720p">720p</option>
              <option value="1080p">1080p</option>
            </select>
          </div>
          
          {isExporting ? (
            <div>
              <div className="h-2 bg-editor-border rounded-full overflow-hidden mb-2">
                <div 
                  className="h-full bg-primary-500"
                  style={{ width: `${exportProgress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-editor-muted">
                <span>Exporting video...</span>
                <span>{exportProgress}%</span>
              </div>
            </div>
          ) : (
            <button 
              onClick={handleExport}
              className="btn-primary w-full flex items-center justify-center"
            >
              <FaDownload className="mr-2" />
              Export Video
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default ExportPanel