import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Maximize2, Move, Camera, X, FlipHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ARProductViewProps {
  image: string;
  title: string;
}

const ARProductView = ({ image, title }: ARProductViewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [arMode, setArMode] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [arPosition, setArPosition] = useState({ x: 50, y: 50 });
  const [arScale, setArScale] = useState(0.5);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");

  const startCamera = useCallback(async (facing: "environment" | "user") => {
    try {
      // Stop existing stream
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setArMode(true);
    } catch {
      alert("Camera access denied. Please allow camera permissions to use AR view.");
    }
  }, [stream]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
    setArMode(false);
  }, [stream]);

  const flipCamera = useCallback(() => {
    const newFacing = facingMode === "environment" ? "user" : "environment";
    setFacingMode(newFacing);
    startCamera(newFacing);
  }, [facingMode, startCamera]);

  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [stream]);

  // AR drag handling
  const handleArPointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setArPosition({ x: Math.max(10, Math.min(90, x)), y: Math.max(10, Math.min(90, y)) });
  };

  // Pinch to scale
  const handleWheel = (e: React.WheelEvent) => {
    if (arMode) {
      e.preventDefault();
      setArScale((s) => Math.max(0.2, Math.min(1.5, s - e.deltaY * 0.001)));
    }
  };

  // Standard rotation for non-AR
  const handleRotateMove = (e: React.PointerEvent) => {
    if (!isDragging || !containerRef.current || arMode) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientY - rect.top) / rect.height - 0.5) * -30;
    const y = ((e.clientX - rect.left) / rect.width - 0.5) * 30;
    setRotation({ x, y });
  };

  const handlePointerDown = () => {
    setIsDragging(true);
    setShowHint(false);
  };
  const handlePointerUp = () => setIsDragging(false);
  const handleReset = () => {
    setRotation({ x: 0, y: 0 });
    setArPosition({ x: 50, y: 50 });
    setArScale(0.5);
  };

  return (
    <div className="relative">
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerMove={arMode ? handleArPointerMove : handleRotateMove}
        onWheel={handleWheel}
        className="relative rounded-2xl overflow-hidden border border-border/50 bg-card cursor-grab active:cursor-grabbing select-none aspect-square"
        style={{ perspective: "1000px" }}
      >
        {/* Camera feed for AR mode */}
        <AnimatePresence>
          {arMode && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-0"
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid overlay */}
        {!arMode && (
          <div
            className="absolute inset-0 z-10 pointer-events-none opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(hsl(var(--primary) / 0.15) 1px, transparent 1px),
                linear-gradient(90deg, hsl(var(--primary) / 0.15) 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px",
            }}
          />
        )}

        {/* Corner markers */}
        <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 border-primary/40 z-10 pointer-events-none" />
        <div className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 border-primary/40 z-10 pointer-events-none" />
        <div className="absolute bottom-3 left-3 w-6 h-6 border-l-2 border-b-2 border-primary/40 z-10 pointer-events-none" />
        <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 border-primary/40 z-10 pointer-events-none" />

        {/* Badge */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className="flex items-center gap-1.5 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary border border-primary/20">
            {arMode ? <Camera className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
            {arMode ? "AR Live" : "AR View"}
          </div>
        </div>

        {/* Product image */}
        {arMode ? (
          <motion.div
            className="absolute z-10 pointer-events-none"
            style={{
              left: `${arPosition.x}%`,
              top: `${arPosition.y}%`,
              transform: `translate(-50%, -50%) scale(${arScale})`,
              width: "60%",
            }}
            animate={{ left: `${arPosition.x}%`, top: `${arPosition.y}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <img
              src={image}
              alt={title}
              className="w-full rounded-xl shadow-2xl shadow-primary/20"
              style={{ filter: "drop-shadow(0 0 20px hsl(75 100% 50% / 0.15))" }}
              draggable={false}
            />
          </motion.div>
        ) : (
          <motion.div
            style={{
              transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
              transition: isDragging ? "none" : "transform 0.5s ease-out",
            }}
          >
            <img
              src={image}
              alt={title}
              className="w-full aspect-square object-cover"
              draggable={false}
            />
          </motion.div>
        )}

        {/* Hint */}
        {showHint && !arMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs text-muted-foreground"
          >
            <Move className="w-3.5 h-3.5" /> Drag to rotate
          </motion.div>
        )}

        {arMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs text-muted-foreground"
          >
            <Move className="w-3.5 h-3.5" /> Drag to place · Scroll to resize
          </motion.div>
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-3 right-3 z-20 flex gap-2">
        {arMode && (
          <button
            onClick={flipCamera}
            className="p-2 rounded-lg bg-background/80 backdrop-blur-sm border border-border/50 text-muted-foreground hover:text-foreground transition-colors"
          >
            <FlipHorizontal className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={handleReset}
          className="p-2 rounded-lg bg-background/80 backdrop-blur-sm border border-border/50 text-muted-foreground hover:text-foreground transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* AR Toggle Button */}
      <div className="mt-3">
        {arMode ? (
          <Button variant="outline" size="sm" className="w-full" onClick={stopCamera}>
            <X className="w-4 h-4" /> Exit AR View
          </Button>
        ) : (
          <Button variant="neon" size="sm" className="w-full" onClick={() => startCamera(facingMode)}>
            <Camera className="w-4 h-4" /> View in Your Space
          </Button>
        )}
      </div>
    </div>
  );
};

export default ARProductView;
