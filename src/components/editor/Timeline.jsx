import { useState, useRef, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { FaPlay, FaPause, FaTrash, FaCut } from 'react-icons/fa'

const TRACK_HEIGHT = 60
const VISIBLE_TRACKS = 4

const Timeline = ({ 
  items, 
  updateItem, 
  removeItem, 
  currentTime, 
  setCurrentTime, 
  duration 
}) => {
  const [zoom, setZoom] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState(null)
  const [lastDeletedItem, setLastDeletedItem] = useState(null)
  const [trimStart, setTrimStart] = useState(null) 
  const [trimEnd, setTrimEnd] = useState(null)

  const timelineRef = useRef(null)
  const playheadRef = useRef(null)

  const trackItems = {}
  items.forEach(item => {
    if (!trackItems[item.track]) {
      trackItems[item.track] = []
    }
    trackItems[item.track].push(item)
  })

  const timeToPixels = (time) => time * 100 * zoom
  const pixelsToTime = (pixels) => pixels / (100 * zoom)

  const handleDragEnd = (result) => {
    if (!result.destination) return
    const itemId = result.draggableId
    const item = items.find(i => i.id === itemId)
    const startTimeDelta = pixelsToTime(result.destination.x - result.source.x)
    const newTrack = parseInt(result.destination.droppableId.split('-')[1])
    updateItem(itemId, {
      start: item.start + startTimeDelta,
      end: item.end + startTimeDelta,
      track: newTrack
    })
    setIsDragging(false)
  }

  const handleTimelineClick = (e) => {
    if (!timelineRef.current) return
    const rect = timelineRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const newTime = pixelsToTime(clickX)
    if (newTime >= 0 && newTime <= duration) {
      setCurrentTime(newTime)
    }
  }

  const handleTrimStart = (e) => {
    const rect = timelineRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const newTrimStart = pixelsToTime(clickX)
    setTrimStart(newTrimStart)
  }

  const handleTrimEnd = (e) => {
    const rect = timelineRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const newTrimEnd = pixelsToTime(clickX)
    setTrimEnd(newTrimEnd)
  }

  const handleCut = () => {
    if (selectedItemId && trimStart !== null && trimEnd !== null && trimEnd > trimStart) {
      const item = items.find(i => i.id === selectedItemId)
      const newStart = Math.max(item.start, trimStart)
      const newEnd = Math.min(item.end, trimEnd)

      // Split item into two (cutting)
      const newItem = { ...item, start: newStart, end: newEnd }
      const newItemId = new Date().getTime().toString() // Unique ID for the new item
      updateItem(selectedItemId, { ...item, end: item.start + (trimStart - item.start) }) // Update the original item
      updateItem(newItemId, newItem) // Add the cut part

      setTrimStart(null)
      setTrimEnd(null)
    }
  }

  const undoDelete = () => {
    if (lastDeletedItem) {
      // Restore the item
      updateItem(lastDeletedItem.id, lastDeletedItem) // Placeholder for addItem function
      setLastDeletedItem(null)
    }
  }

  useEffect(() => {
    const handleResize = () => {
      if (timelineRef.current) {
        const width = timelineRef.current.offsetWidth
        setZoom(width / (duration * 100)) // Adjust zoom based on container width
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize() // Initial calculation

    return () => window.removeEventListener('resize', handleResize)
  }, [duration])

  useEffect(() => {
    if (playheadRef.current) {
      playheadRef.current.style.left = `${timeToPixels(currentTime)}px`
    }
  }, [currentTime, zoom])

  const tracks = []
  for (let i = 0; i < Math.max(VISIBLE_TRACKS, Math.max(...Object.keys(trackItems).map(Number)) + 1); i++) {
    tracks.push(i)
  }

  return (
    <div className="flex flex-col bg-editor-darker border-t border-editor-border h-64">
      {selectedItemId && (
        <div className="flex justify-end p-2 bg-editor-dark border-b border-editor-border">
          <button
            onClick={() => {
              removeItem(selectedItemId)
              setLastDeletedItem(items.find(item => item.id === selectedItemId))
              setSelectedItemId(null)
            }}
            className="bg-red-600 hover:bg-red-700 text-white text-xs px-4 py-1 rounded"
          >
            Delete Selected
          </button>
        </div>
      )}

      <div className="flex items-center justify-between p-2 bg-editor-dark border-b border-editor-border">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Timeline</span>
          <span className="text-xs text-editor-muted">{currentTime.toFixed(2)}s</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <span className="text-xs mr-2">Zoom:</span>
            <input
              type="range"
              min="0.5"
              max="5"
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-24"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto relative">
        <div className="h-6 border-b border-editor-border sticky top-0 bg-editor-dark z-10 flex">
          {(() => {
            const interval = zoom < 0.75 ? 5 : zoom < 1.5 ? 2 : 1
            const markers = []
            for (let i = 0; i <= Math.ceil(duration); i += interval) {
              markers.push(
                <div 
                  key={i} 
                  className="absolute h-full flex flex-col items-center" 
                  style={{ left: `${timeToPixels(i)}px` }}
                >
                  <div className="h-2 w-px bg-editor-border"></div>
                  <span className="text-xs text-editor-muted">{i}s</span>
                </div>
              )
            }
            return markers
          })()}
        </div>

        <div 
          ref={timelineRef}
          className="relative" 
          style={{ width: `${Math.max(timeToPixels(duration + 1), 1000)}px`, minHeight: `${tracks.length * TRACK_HEIGHT}px` }}
          onClick={handleTimelineClick}
        >
          {tracks.map(track => (
            <div 
              key={`track-${track}`}
              className="absolute w-full border-b border-editor-border flex items-center"
              style={{ 
                top: `${track * TRACK_HEIGHT}px`, 
                height: `${TRACK_HEIGHT}px`,
                backgroundColor: track % 2 === 0 ? 'rgba(26, 26, 26, 0.5)' : 'rgba(26, 26, 26, 0.8)'
              }}
            >
              <div className="h-full w-16 flex items-center justify-center border-r border-editor-border bg-editor-dark text-xs text-editor-muted">
                {track === 0 ? 'Video' : track === 1 ? 'Text' : track === 2 ? 'Image' : 'Audio'}
              </div>
            </div>
          ))}

          <div 
            ref={playheadRef}
            className="absolute top-0 bottom-0 w-px bg-primary-500 z-20 pointer-events-none"
            style={{ left: `${timeToPixels(currentTime)}px` }}
          >
            <div className="w-3 h-3 bg-primary-500 rounded-full -ml-1.5 -mt-1.5"></div>
          </div>

          <DragDropContext 
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
          >
            {tracks.map(track => (
              <Droppable 
                key={`track-${track}`} 
                droppableId={`track-${track}`} 
                direction="horizontal"
              >
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="absolute w-full"
                    style={{ 
                      top: `${track * TRACK_HEIGHT}px`, 
                      height: `${TRACK_HEIGHT}px` 
                    }}
                  >
                    {trackItems[track]?.map((item, index) => (
                      <Draggable 
                        key={item.id} 
                        draggableId={item.id} 
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedItemId(item.id)
                            }}
                            className={`absolute timeline-item flex flex-col overflow-hidden cursor-pointer rounded ${selectedItemId === item.id ? 'ring-2 ring-red-500' : ''}`}
                            style={{
                              left: `${timeToPixels(item.start)}px`,
                              width: `${Math.max(timeToPixels(item.end - item.start), 10)}px`,
                              top: '8px',
                              height: `${TRACK_HEIGHT - 16}px`,
                              backgroundColor: item.type === 'video' 
                                ? '#2563eb' 
                                : item.type === 'text' 
                                ? '#059669' 
                                : item.type === 'image' 
                                ? '#7c3aed' 
                                : '#d97706',
                              ...provided.draggableProps.style
                            }}
                          >
                            <div className="flex justify-between items-center p-1 text-white text-xs truncate">
                              <span className="truncate">
                                {item.type === 'text' 
                                  ? item.text?.substring(0, 10) || 'Text' 
                                  : item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (window.confirm("Are you sure you want to delete this item?")) {
                                    setLastDeletedItem(item)
                                    removeItem(item.id)
                                    if (selectedItemId === item.id) setSelectedItemId(null)
                                  }
                                }}
                                className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-2 py-0.5 rounded text-xs"
                              >
                                <FaTrash size={10} />
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </DragDropContext>
        </div>
      </div>

      {/* Undo delete button */}
      {lastDeletedItem && (
        <div className="flex justify-center py-2">
          <button 
            onClick={undoDelete} 
            className="bg-green-600 hover:bg-green-700 text-white text-xs px-4 py-1 rounded"
          >
            Undo Delete
          </button>
        </div>
      )}

      {/* Trim controls */}
      {selectedItemId && (
        <div className="flex justify-center py-2">
          <button 
            onClick={handleTrimStart}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-1 rounded"
          >
            Trim Start
          </button>
          <button 
            onClick={handleTrimEnd}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-1 rounded ml-2"
          >
            Trim End
          </button>
          <button 
            onClick={handleCut}
            className="bg-green-600 hover:bg-green-700 text-white text-xs px-4 py-1 rounded ml-2"
          >
            Cut
          </button>
        </div>
      )}
    </div>
  )
}

export default Timeline
