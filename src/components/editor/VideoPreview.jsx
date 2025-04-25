import { useEffect, useState } from 'react'
import { FaPlay, FaPause, FaRedo, FaUndo } from 'react-icons/fa'

const VideoPreview = ({ 
  videoRef, 
  project, 
  timelineItems, 
  currentTime, 
  setCurrentTime, 
  duration, 
  setDuration, 
  isPlaying, 
  setIsPlaying 
}) => {
  const [activeOverlays, setActiveOverlays] = useState([])
  
  // Update video time when currentTime changes
  useEffect(() => {
    if (videoRef.current && Math.abs(videoRef.current.currentTime - currentTime) > 0.1) {
      videoRef.current.currentTime = currentTime
    }
  }, [currentTime])
  
  // Play/pause video
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play()
      } else {
        videoRef.current.pause()
      }
    }
  }, [isPlaying])
  
  // Handle time update
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }
  
  // Handle duration change
  const handleDurationChange = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }
  
  // Handle video end
  const handleVideoEnd = () => {
    setIsPlaying(false)
    setCurrentTime(0)
  }
  
  // Update active overlays based on current time
  useEffect(() => {
    // Filter items that should be visible at the current time
    const visibleItems = timelineItems.filter(
      item => item.type !== 'video' && 
      currentTime >= item.start && 
      currentTime <= item.end
    )
    
    setActiveOverlays(visibleItems)
  }, [timelineItems, currentTime])
  
  // Jump forward 5 seconds
  const jumpForward = () => {
    if (videoRef.current) {
      const newTime = Math.min(currentTime + 5, duration)
      setCurrentTime(newTime)
    }
  }
  
  // Jump backward 5 seconds
  const jumpBackward = () => {
    if (videoRef.current) {
      const newTime = Math.max(currentTime - 5, 0)
      setCurrentTime(newTime)
    }
  }
  
  return (
    <div className="flex-1 bg-black relative">
      {/* Video */}
      <div className="w-full h-full flex items-center justify-center">
        <video
          ref={videoRef}
          src={project.videoUrl ? `http://localhost:5000${project.videoUrl}` : ''}
          className="max-h-full max-w-full"
          onTimeUpdate={handleTimeUpdate}
          onDurationChange={handleDurationChange}
          onEnded={handleVideoEnd}
        />
        
        {/* Overlays */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {activeOverlays.map(overlay => {
            if (overlay.type === 'text') {
              return (
                <div 
                  key={overlay.id}
                  className="absolute"
                  style={{
                    top: `${overlay.position?.y || 50}%`,
                    left: `${overlay.position?.x || 50}%`,
                    transform: 'translate(-50%, -50%)',
                    color: overlay.style?.color || 'white',
                    fontSize: `${overlay.style?.fontSize || 24}px`,
                    fontWeight: overlay.style?.fontWeight || 'normal',
                    textShadow: overlay.style?.shadow ? '2px 2px 4px rgba(0,0,0,0.7)' : 'none'
                  }}
                >
                  {overlay.text}
                </div>
              )
            } else if (overlay.type === 'image') {
              return (
                <img 
                  key={overlay.id}
                  src={`http://localhost:5000${overlay.src}`}
                  className="absolute"
                  style={{
                    top: `${overlay.position?.y || 50}%`,
                    left: `${overlay.position?.x || 50}%`,
                    transform: 'translate(-50%, -50%)',
                    width: `${overlay.size?.width || 20}%`,
                    height: 'auto'
                  }}
                  alt="Overlay"
                />
              )
            }
            return null
          })}
        </div>
      </div>
      
      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm p-2 flex items-center">
        <div className="flex space-x-2 items-center">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-editor-light hover:bg-editor-border"
          >
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>
          
          <button 
            onClick={jumpBackward}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-editor-light hover:bg-editor-border"
          >
            <FaUndo size={14} />
          </button>
          
          <button 
            onClick={jumpForward}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-editor-light hover:bg-editor-border"
          >
            <FaRedo size={14} />
          </button>
        </div>
        
        <div className="flex-1 mx-4">
          <div className="relative h-2 bg-editor-border rounded overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-primary-500"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            ></div>
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.01"
              value={currentTime}
              onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
        </div>
        
        <div className="text-sm text-editor-muted">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>
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

export default VideoPreview