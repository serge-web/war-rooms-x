import React, { useRef, useState } from 'react'

interface DraggableContainerProps {
  initialLeftPanelWidth?: number
  minLeftPanelWidth?: number
  maxLeftPanelWidth?: number
  leftPanel: React.ReactNode
  rightPanel: React.ReactNode
  containerStyle?: React.CSSProperties
  dividerColor?: string
}

/**
 * A container with two panels separated by a draggable divider
 */
const DraggableContainer: React.FC<DraggableContainerProps> = ({
  initialLeftPanelWidth = 50,
  minLeftPanelWidth = 30,
  maxLeftPanelWidth = 70,
  leftPanel,
  rightPanel,
  containerStyle = {},
  dividerColor = '#e8e8e8'
}) => {
  const [leftPanelWidth, setLeftPanelWidth] = useState<number>(initialLeftPanelWidth)
  
  // Refs for draggable divider
  const containerRef = useRef<HTMLDivElement>(null)
  const dividerRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef<boolean>(false)

  const defaultContainerStyle: React.CSSProperties = {
    display: 'flex',
    position: 'relative',
    height: 'calc(100vh - 250px)',
    minHeight: '500px'
  }

  const mergedContainerStyle = { ...defaultContainerStyle, ...containerStyle }

  return (
    <div 
      ref={containerRef}
      style={mergedContainerStyle}
      onMouseUp={() => {
        isDraggingRef.current = false
        document.body.style.cursor = 'default'
      }}
      onMouseMove={(e) => {
        if (!isDraggingRef.current || !containerRef.current) return
        
        const containerRect = containerRef.current.getBoundingClientRect()
        const containerWidth = containerRect.width
        const mouseX = e.clientX - containerRect.left
        
        // Calculate percentage (constrained between min and max)
        let newLeftWidth = (mouseX / containerWidth) * 100
        newLeftWidth = Math.max(minLeftPanelWidth, Math.min(maxLeftPanelWidth, newLeftWidth))
        
        setLeftPanelWidth(newLeftWidth)
      }}
      onMouseLeave={() => {
        isDraggingRef.current = false
        document.body.style.cursor = 'default'
      }}
    >
      {/* Left Panel */}
      <div style={{ 
        width: `${leftPanelWidth}%`, 
        height: '100%',
        overflow: 'hidden',
        transition: isDraggingRef.current ? 'none' : 'width 0.1s ease'
      }}>
        {leftPanel}
      </div>
      
      {/* Draggable divider */}
      <div
        ref={dividerRef}
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: `${leftPanelWidth}%`,
          width: '10px',
          transform: 'translateX(-50%)',
          cursor: 'col-resize',
          zIndex: 10,
          transition: isDraggingRef.current ? 'none' : 'left 0.1s ease'
        }}
        onMouseDown={(e) => {
          isDraggingRef.current = true
          document.body.style.cursor = 'col-resize'
          e.preventDefault() // Prevent text selection during drag
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: '50%',
            width: '4px',
            backgroundColor: dividerColor,
            transform: 'translateX(-50%)',
            borderRadius: '2px'
          }}
        />
      </div>
      
      {/* Right Panel */}
      <div style={{ 
        width: `${100 - leftPanelWidth}%`, 
        height: '100%',
        overflow: 'hidden',
        transition: isDraggingRef.current ? 'none' : 'width 0.1s ease'
      }}>
        {rightPanel}
      </div>
    </div>
  )
}

export default DraggableContainer
