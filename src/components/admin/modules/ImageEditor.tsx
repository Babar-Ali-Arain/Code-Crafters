import React, { useState, useRef, useEffect, DragEvent, ChangeEvent } from 'react';
import { 
  UploadCloud, RotateCw, RotateCcw, ZoomIn, ZoomOut, Sliders, 
  Crop, FileImage, Check, Trash2, Camera, Eye, Info
} from 'lucide-react';

interface ImageEditorProps {
  initialImageUrl?: string;
  onImageCropped: (base64Data: string) => void;
  aspectRatio?: number; // default 1 (square)
}

export default function ImageEditor({ 
  initialImageUrl = '', 
  onImageCropped, 
  aspectRatio = 1 
}: ImageEditorProps) {
  // State variables
  const [imgSrc, setImgSrc] = useState<string>('');
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>('');
  
  // Canvas configuration and settings
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);
  const [maskType, setMaskType] = useState<'circle' | 'square'>('circle');
  const [format, setFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/webp');
  const [quality, setQuality] = useState<number>(0.85);
  const [estimatedSizeKb, setEstimatedSizeKb] = useState<number>(0);
  
  // Drag-and-drop active state
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
  
  // Canvas references
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  
  // Drag state for moving image inside canvas
  const isMouseDownRef = useRef<boolean>(false);
  const startPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Load initial image if provided
  useEffect(() => {
    if (initialImageUrl && !initialImageUrl.startsWith('https://api.dicebear.com')) {
      // Don't pre-load dicebear SVG images into the editor to avoid canvas taint errors
      setImgSrc(initialImageUrl);
      setImageLoaded(true);
    }
  }, [initialImageUrl]);

  // Load original image file
  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Selected file is not an image.');
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result && typeof e.target.result === 'string') {
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.src = e.target.result;
        image.onload = () => {
          setImgSrc(e.target.result as string);
          setImageLoaded(true);
          // Reset controls
          setZoom(1);
          setRotation(0);
          setOffsetX(0);
          setOffsetY(0);
        };
      }
    };
    reader.readAsDataURL(file);
  };

  // Drag and drop event handlers
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  // Canvas Drawing Logic
  useEffect(() => {
    if (!imageLoaded || !imgSrc) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imgSrc;

    imgRef.current = img;

    img.onload = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Save canvas state
      ctx.save();

      // Translate to the canvas center
      ctx.translate(canvas.width / 2, canvas.height / 2);

      // Rotate canvas
      ctx.rotate((rotation * Math.PI) / 180);

      // Scale canvas
      ctx.scale(zoom, zoom);

      // Apply drag offsets
      ctx.translate(offsetX, offsetY);

      // Draw the image centered
      const imgWidth = img.width;
      const imgHeight = img.height;
      const scaleToFit = Math.min(canvas.width / imgWidth, canvas.height / imgHeight);
      
      const drawWidth = imgWidth * scaleToFit;
      const drawHeight = imgHeight * scaleToFit;

      ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);

      // Restore base canvas state
      ctx.restore();

      // Recalculate size in background without trigger state loops
      calculateOutputSize();
    };
  }, [imgSrc, imageLoaded, zoom, rotation, offsetX, offsetY, format, quality]);

  // Estimate the encoded file size
  const calculateOutputSize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const dataUrl = canvas.toDataURL(format, quality);
      // Rough Base64 size estimation in KB
      const bytes = dataUrl.length * 0.75;
      setEstimatedSizeKb(Math.round(bytes / 102.4) / 10);
    } catch (e) {
      console.warn('Could not estimate output canvas size:', e);
    }
  };

  // Interactive mouse handlers for direct dragging (Panning) on canvas
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    isMouseDownRef.current = true;
    startPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isMouseDownRef.current) return;
    
    const dx = e.clientX - startPosRef.current.x;
    const dy = e.clientY - startPosRef.current.y;
    
    // Adjust dragging velocity relative to zoom to feel proportional
    const speedFactor = 1.2 / zoom;
    
    // De-rotate drag deltas if rotated
    const rad = (-rotation * Math.PI) / 180;
    const rotatedDx = dx * Math.cos(rad) - dy * Math.sin(rad);
    const rotatedDy = dx * Math.sin(rad) + dy * Math.cos(rad);

    setOffsetX(prev => prev + rotatedDx * speedFactor);
    setOffsetY(prev => prev + rotatedDy * speedFactor);
    
    startPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUpOrLeave = () => {
    isMouseDownRef.current = false;
  };

  // Button adjustments
  const handleQuickRotate = (dir: 'cw' | 'ccw') => {
    setRotation(prev => {
      const delta = dir === 'cw' ? 90 : -90;
      let next = (prev + delta) % 360;
      if (next < -185) next += 360;
      return next;
    });
  };

  // Crop Action
  const handleApplyCrop = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imageLoaded) return;
    
    try {
      // 1. We create an output canvas of standardized size (400x400)
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = 400;
      exportCanvas.height = 400;
      const exportCtx = exportCanvas.getContext('2d');
      if (!exportCtx) return;

      // 2. We can draw the contents of the main canvas onto the crop export canvas
      // Or we can just grab the main canvas pixels, but drawing the source image is much higher quality!
      const img = imgRef.current;
      if (img) {
        exportCtx.save();
        
        // Match the center translation of our standard 400x400 output canvas
        exportCtx.translate(200, 200);
        exportCtx.rotate((rotation * Math.PI) / 180);
        
        // Since original main canvas is 400x400, safe to say layout match is 1-to-1
        exportCtx.scale(zoom, zoom);
        exportCtx.translate(offsetX, offsetY);

        const imgWidth = img.width;
        const imgHeight = img.height;
        // Standard canvas side dimension for calculations
        const canvasSide = 400;
        const scaleToFit = Math.min(canvasSide / imgWidth, canvasSide / imgHeight);
        
        const drawWidth = imgWidth * scaleToFit;
        const drawHeight = imgHeight * scaleToFit;

        exportCtx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
        exportCtx.restore();
      } else {
        // Fallback: copy visual canvas directly
        exportCtx.drawImage(canvas, 0, 0, 400, 400);
      }

      const croppedBase64 = exportCanvas.toDataURL(format, quality);
      onImageCropped(croppedBase64);
    } catch (err) {
      console.error('Cropping action failed: ', err);
      alert('Internal security taints or system limits failed to render final image. Please try a different photo format.');
    }
  };

  const resetImageState = () => {
    setImgSrc('');
    setImageLoaded(false);
    setFileName('');
    setZoom(1);
    setRotation(0);
    setOffsetX(0);
    setOffsetY(0);
  };

  return (
    <div id="image-editor-workspace" className="space-y-4">
      
      {!imageLoaded ? (
        /* DRAG AND DROP LANDING PLATE */
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`group flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-[24px] cursor-pointer transition-all ${
            isDraggingOver 
              ? 'border-indigo-500 bg-indigo-50/50 scale-[0.99] shadow-inner' 
              : 'border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50'
          }`}
        >
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          <div className="flex flex-col items-center space-y-3.5 text-center">
            <div className={`p-4 rounded-2xl transition-all ${
              isDraggingOver 
                ? 'bg-indigo-500 text-white animate-bounce' 
                : 'bg-indigo-50 text-[#4f46e5] group-hover:bg-indigo-100/70 group-hover:scale-105'
            }`}>
              <UploadCloud className="w-6 h-6" />
            </div>

            <div>
              <p className="text-xs font-bold text-slate-800 tracking-tight">
                Drag & Drop Team Photo
              </p>
              <p className="text-[10px] text-slate-400 font-mono mt-1">
                PNG, JPG, WEBP • Supports high res up to 10MB
              </p>
            </div>

            <button
              type="button"
              className="px-4 py-2 bg-[#4f46e5] hover:bg-[#4338ca] text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition-colors shadow-sm cursor-pointer"
            >
              Browse Local Computer
            </button>
          </div>
        </div>
      ) : (
        /* ACTIVE MULTI-AXIS IMAGE EDITOR */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
            
            {/* Direct Interactive Viewfinder Frame (Canvas wrapper) */}
            <div className="md:col-span-6 flex flex-col items-center justify-center p-5 bg-slate-900 rounded-[28px] border border-slate-950 shadow-inner relative overflow-hidden group">
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-slate-950/70 text-slate-400 uppercase font-mono tracking-widest text-[8px] rounded-full backdrop-blur-xs">
                <Camera className="w-3 h-3 text-[#4f46e5]" />
                <span>Viewport Viewfinder</span>
              </div>

              {/* Aspect ratio frame box */}
              <div id="viewfinder-frame" className="relative cursor-move my-5">
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={400}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUpOrLeave}
                  onMouseLeave={handleMouseUpOrLeave}
                  className={`w-64 h-64 bg-slate-950 shadow-2xl transition-all shadow-indigo-950/40 relative z-10 ${
                    maskType === 'circle' ? 'rounded-full' : 'rounded-2xl'
                  }`}
                  style={{ touchAction: 'none' }}
                />

                {/* Simulated Lens Cover Layer (Border overlay that does not print) */}
                <div className={`absolute inset-0 pointer-events-none ring-4 ring-indigo-500/80 ring-offset-4 ring-offset-slate-900 border-2 border-[#00F0FF]/30 transition-all z-20 ${
                  maskType === 'circle' ? 'rounded-full' : 'rounded-2xl'
                }`} />
                
                {/* Micro target guides */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none border border-white/10 w-24 h-24 rounded-full z-15" />
                <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/10 pointer-events-none z-15" />
                <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-white/10 pointer-events-none z-15" />
              </div>

              <span className="text-[10px] text-slate-500 font-mono text-center flex items-center gap-1">
                <Info className="w-3 h-3 text-indigo-400" />
                <span>Drag inside the frame above to adjust placement</span>
              </span>
            </div>

            {/* Editing Sliders Drawer Module */}
            <div className="md:col-span-6 flex flex-col justify-between p-5 border border-slate-100 bg-slate-50/50 rounded-[28px] min-h-[320px]">
              
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                  <Sliders className="w-4 h-4 text-indigo-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Precision Settings</h4>
                </div>

                {/* Aspect-Ratio/Mask Frame Toggle */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">Crop View Model</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setMaskType('circle')}
                      className={`py-2 px-3 rounded-xl border text-[10px] uppercase font-bold font-mono tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        maskType === 'circle'
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:text-slate-800'
                      }`}
                    >
                      <div className="w-2.5 h-2.5 rounded-full border border-current" />
                      Circle Avatar
                    </button>
                    <button
                      type="button"
                      onClick={() => setMaskType('square')}
                      className={`py-2 px-3 rounded-xl border text-[10px] uppercase font-bold font-mono tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        maskType === 'square'
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:text-slate-800'
                      }`}
                    >
                      <div className="w-2.5 h-2.5 border border-current rounded-xs" />
                      Square Grid
                    </button>
                  </div>
                </div>

                {/* Zoom range controller */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-mono font-bold text-slate-500">
                    <span className="flex items-center gap-1">
                      <ZoomIn className="w-3 h-3 text-slate-400" />
                      SCALE / ZOOM
                    </span>
                    <span className="text-indigo-600 font-bold">{Math.round(zoom * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="4"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full accent-indigo-600 h-1 bg-slate-200 rounded-lg cursor-pointer transition-all duration-75"
                  />
                </div>

                {/* Fine rotation range controller / button mix */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-mono font-bold text-slate-500">
                    <span className="flex items-center gap-1">
                      <RotateCw className="w-3 h-3 text-slate-400" />
                      ROTATION
                    </span>
                    <span className="text-indigo-600">{rotation}°</span>
                  </div>
                  
                  <div className="flex gap-2 items-center">
                    <button
                      type="button"
                      onClick={() => handleQuickRotate('ccw')}
                      className="p-2 border border-slate-200 hover:bg-slate-50 bg-white rounded-xl text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                      title="Rotate counter-clockwise"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      step="1"
                      value={rotation}
                      onChange={(e) => setRotation(parseInt(e.target.value))}
                      className="w-full accent-indigo-600 h-1 bg-slate-200 rounded-lg cursor-pointer"
                    />

                    <button
                      type="button"
                      onClick={() => handleQuickRotate('cw')}
                      className="p-2 border border-slate-200 hover:bg-slate-50 bg-white rounded-xl text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                      title="Rotate clockwise"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Quality & Format Compression Gate */}
                <div className="pt-2.5 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-[10px] font-mono font-bold text-slate-500">
                    <span>COMPRESSION FORMAT</span>
                    <span>SIZE ESTIMATE</span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    {(['image/webp', 'image/jpeg', 'image/png'] as const).map(fmt => (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() =>setFormat(fmt)}
                        className={`py-1.5 px-2 rounded-lg border text-[8px] tracking-wide font-mono uppercase font-bold cursor-pointer transition-all ${
                          format === fmt
                            ? 'bg-slate-900 border-slate-900 text-white'
                            : 'bg-white border-slate-200 text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        {fmt.split('/')[1]}
                      </button>
                    ))}
                  </div>

                  {format !== 'image/png' && (
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[10px] font-mono font-bold text-slate-500">
                        <span>EXPORT QUALITY</span>
                        <span className="text-emerald-600">{Math.round(quality * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.4"
                        max="1.0"
                        step="0.05"
                        value={quality}
                        onChange={(e) => setQuality(parseFloat(e.target.value))}
                        className="w-full accent-emerald-500 h-1 bg-slate-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  )}

                  {/* Size info badge */}
                  <div className="flex items-center justify-between text-[10px] font-mono p-2 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800">
                    <span className="font-bold flex items-center gap-1.5">
                      <FileImage className="w-3.5 h-3.5 text-emerald-500" />
                      {fileName ? `${fileName.slice(0, 15)}...` : 'Transformed file'}
                    </span>
                    <span className="font-bold bg-emerald-100 px-1.5 py-0.5 rounded-md">
                      ~ {estimatedSizeKb} KB
                    </span>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t border-slate-100 mt-4 shrink-0">
                <button
                  type="button"
                  onClick={resetImageState}
                  className="flex-1 py-2 px-3 border border-slate-250 hover:bg-slate-50 bg-white hover:text-red-500 text-slate-500 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all font-mono inline-flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Discard
                </button>
                <button
                  type="button"
                  onClick={handleApplyCrop}
                  className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all inline-flex items-center justify-center gap-1 cursor-pointer shadow-sm active:scale-[0.98]"
                >
                  <Check className="w-4 h-4" />
                  Lock In Photo
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
