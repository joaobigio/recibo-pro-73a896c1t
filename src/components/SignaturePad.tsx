import React, { useRef, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

interface SignaturePadProps {
  onSave: (data: string | null) => void
  className?: string
}

export function SignaturePad({ onSave, className }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [isEmpty, setIsEmpty] = useState(true)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Setup canvas resolution
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height

    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.strokeStyle = '#000'
    }
  }, [])

  const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement> | PointerEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const { x, y } = getCoordinates(e)
    const ctx = canvasRef.current?.getContext('2d')
    if (ctx) {
      ctx.beginPath()
      ctx.moveTo(x, y)
      setIsDrawing(true)
      setIsEmpty(false)
    }
  }

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const { x, y } = getCoordinates(e)
    const ctx = canvasRef.current?.getContext('2d')
    if (ctx) {
      ctx.lineTo(x, y)
      ctx.stroke()
    }
  }

  const endDrawing = () => {
    setIsDrawing(false)
    save()
  }

  const clear = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      setIsEmpty(true)
      onSave(null)
    }
  }

  const save = () => {
    if (isEmpty || !canvasRef.current) return
    onSave(canvasRef.current.toDataURL('image/png'))
  }

  return (
    <div className={`relative border rounded-md bg-white ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full touch-none cursor-crosshair"
        onPointerDown={startDrawing}
        onPointerMove={draw}
        onPointerUp={endDrawing}
        onPointerLeave={endDrawing}
      />
      {!isEmpty && (
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8"
          onClick={clear}
          type="button"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
      {isEmpty && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-muted-foreground opacity-50">
          Assine aqui
        </div>
      )}
    </div>
  )
}
