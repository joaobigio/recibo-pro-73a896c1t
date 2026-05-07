import { useRef, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface SignaturePadProps {
  className?: string
  onSave: (signature: string | null) => void
}

export function SignaturePad({ className, onSave }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    setIsDrawing(true)
    const rect = canvas.getBoundingClientRect()

    let clientX, clientY
    if ('touches' in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    ctx.beginPath()
    ctx.moveTo(clientX - rect.left, clientY - rect.top)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()

    let clientX, clientY
    if ('touches' in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    ctx.lineTo(clientX - rect.left, clientY - rect.top)
    ctx.stroke()
    setHasSignature(true)
  }

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false)
      save()
    }
  }

  const clear = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
    onSave(null)
  }

  const save = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (hasSignature) {
      onSave(canvas.toDataURL('image/png'))
    }
  }

  // Ensure canvas matches its display size
  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.lineWidth = 2
        ctx.lineCap = 'round'
        ctx.strokeStyle = '#000'
      }
    }
  }, [])

  return (
    <div className="relative border rounded-md bg-white overflow-hidden">
      <canvas
        ref={canvasRef}
        className={className}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
      {hasSignature && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute top-1 right-1 h-6 w-6 rounded-full bg-muted/50 hover:bg-muted"
          onClick={clear}
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </Button>
      )}
      {!hasSignature && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-muted-foreground text-sm">
          Assine aqui
        </div>
      )}
    </div>
  )
}
