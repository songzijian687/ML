
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Upload, 
  Trash2, 
  Sparkles, 
  History, 
  Download, 
  AlertCircle,
  Wand2,
  Layers,
  ChevronRight,
  Info,
  Box,
  MessageSquare,
  Search,
  RefreshCw,
  Stars,
  Globe,
  Lock,
  ArrowRight,
  ImagePlus,
  X,
  Lightbulb,
  MousePointer2,
  Eraser,
  Thermometer,
  Scaling,
  PenTool,
  Check,
  Undo2,
  Disc,
  CircleDashed
} from 'lucide-react';
import { LIGHTING_PROFILES, REPAIR_OPTIONS, FIXTURE_OPTIONS, QUICK_EDITS, ICON_MAP } from './constants';
import { RenderVersion, LightingProfile, RepairOption, AppStatus, LightingMarker, PointMarker, PathMarker } from './types';
import { processRendering } from './services/geminiService';
import CompareSlider from './components/CompareSlider';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  const [versions, setVersions] = useState<RenderVersion[]>([]);
  const [activeVersionIndex, setActiveVersionIndex] = useState<number>(-1);
  
  const [selectedLighting, setSelectedLighting] = useState<string | null>(null);
  const [selectedRepairs, setSelectedRepairs] = useState<string[]>([]);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  
  // Local Texture State
  const [textureImage, setTextureImage] = useState<string | null>(null);
  const [textureTarget, setTextureTarget] = useState<string>('');

  // Lighting Tool State
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [markers, setMarkers] = useState<LightingMarker[]>([]);
  const [colorTemp, setColorTemp] = useState<number>(3500);
  
  // New States for Advanced Tools
  const [markerSize, setMarkerSize] = useState<number>(2.5); // % of image width
  const [fixtureVariant, setFixtureVariant] = useState<'recessed' | 'surface'>('recessed');
  const [currentPath, setCurrentPath] = useState<{x: number, y: number}[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textureInputRef = useRef<HTMLInputElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const activeVersion = versions[activeVersionIndex];
  const originalVersion = versions.find(v => v.type === 'original');

  // Key press listener for finishing paths
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && activeTool === 'light-strip' && currentPath.length > 1) {
        finishPath();
      }
      if (e.key === 'Escape' && activeTool === 'light-strip') {
        setCurrentPath([]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTool, currentPath]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      const newVersion: RenderVersion = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        imageUrl: base64,
        prompt: '原始上传',
        type: 'original'
      };
      setVersions([newVersion]);
      setActiveVersionIndex(0);
      setError(null);
      setMarkers([]); 
      setCurrentPath([]);
    };
    reader.readAsDataURL(file);
  };

  const handleTextureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setTextureImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearTexture = () => {
    setTextureImage(null);
    if (textureInputRef.current) textureInputRef.current.value = '';
  };

  const toggleTool = (id: string) => {
    if (activeTool === id) {
      setActiveTool(null);
      setCurrentPath([]); // Cancel current drawing if toggled off
    } else {
      setActiveTool(id);
      setCurrentPath([]); // Reset path when switching tools
      setFixtureVariant('recessed'); // Reset variant default
    }
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!activeTool || !imageContainerRef.current) return;

    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    if (activeTool === 'light-strip') {
      // Add point to path
      setCurrentPath(prev => [...prev, { x, y }]);
    } else {
      // Add point marker
      const canHaveVariant = activeTool === 'downlight' || activeTool === 'spotlight';
      const newMarker: PointMarker = {
        kind: 'point',
        id: crypto.randomUUID(),
        toolId: activeTool,
        variant: canHaveVariant ? fixtureVariant : undefined,
        x,
        y,
        radius: markerSize
      };
      setMarkers(prev => [...prev, newMarker]);
    }
  };

  const finishPath = () => {
    if (currentPath.length < 2) return;
    
    const newMarker: PathMarker = {
      kind: 'path',
      id: crypto.randomUUID(),
      toolId: 'light-strip',
      points: [...currentPath]
    };
    
    setMarkers(prev => [...prev, newMarker]);
    setCurrentPath([]);
  };

  const undoLastPathPoint = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPath(prev => prev.slice(0, -1));
  };

  const removeMarker = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setMarkers(prev => prev.filter(m => m.id !== id));
  };

  const clearMarkers = () => {
    setMarkers([]);
    setCurrentPath([]);
  };

  const applyQuickEdit = (prompt: string) => {
    setCustomPrompt(prev => {
      const newPrompt = prev.trim() ? `${prev}. ${prompt}` : prompt;
      return newPrompt;
    });
  };

  const getMarkerColor = (type: string) => {
    switch (type) {
      case 'downlight': return '#FF0000'; // Red
      case 'spotlight': return '#0000FF'; // Blue
      case 'light-strip': return '#00FF00'; // Green
      case 'pendant': return '#FFFF00'; // Yellow
      default: return '#FFFFFF';
    }
  };

  const compositeImageWithMarkers = async (base64Image: string): Promise<string> => {
    if (markers.length === 0) return base64Image;

    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(base64Image);
          return;
        }

        // Draw original image
        ctx.drawImage(img, 0, 0);

        // Draw markers
        markers.forEach(marker => {
          ctx.fillStyle = getMarkerColor(marker.toolId);
          ctx.strokeStyle = getMarkerColor(marker.toolId);

          if (marker.kind === 'point') {
            const cx = (marker.x / 100) * canvas.width;
            const cy = (marker.y / 100) * canvas.height;
            const radius = (marker.radius / 100) * canvas.width;

            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
            
            // Draw ring for Surface mount, Fill for Recessed
            if (marker.variant === 'surface') {
              ctx.lineWidth = radius * 0.3; // Thick ring relative to radius
              ctx.stroke();
            } else {
              ctx.fill();
            }
          } 
          else if (marker.kind === 'path') {
            if (marker.points.length < 2) return;
            
            ctx.lineWidth = canvas.width * 0.015; // Thick line relative to width
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            ctx.beginPath();
            const start = marker.points[0];
            ctx.moveTo((start.x / 100) * canvas.width, (start.y / 100) * canvas.height);
            
            for (let i = 1; i < marker.points.length; i++) {
              const p = marker.points[i];
              ctx.lineTo((p.x / 100) * canvas.width, (p.y / 100) * canvas.height);
            }
            ctx.stroke();
          }
        });

        resolve(canvas.toDataURL('image/png'));
      };
      img.src = base64Image;
    });
  };

  const handleEnhance = async () => {
    if (!activeVersion) return;

    try {
      setStatus(AppStatus.PROCESSING);
      setError(null);

      // Prepare prompts
      const lightingPrompt = selectedLighting 
        ? LIGHTING_PROFILES.find(p => p.id === selectedLighting)?.prompt 
        : '';
      
      const repairsPrompt = selectedRepairs
        .map(id => REPAIR_OPTIONS.find(r => r.id === id)?.prompt)
        .join(' ');

      let markerPrompt = '';
      if (markers.length > 0) {
        markerPrompt = `
          The image contains color-coded markers indicating where to install new light fixtures.
          
          MARKER DEFINITIONS:
          1. RED FILLED circles: Install RECESSED Downlights (flush with ceiling).
          2. RED RINGS (Hollow circles): Install SURFACE MOUNTED Downlights (cylindrical fixture protruding from ceiling).
          3. BLUE FILLED circles: Install RECESSED Spotlights.
          4. BLUE RINGS (Hollow circles): Install SURFACE MOUNTED Spotlights / Track Lights.
          5. YELLOW circles: Install Pendant Lights.
          6. GREEN lines: Install LED Light Strips along these lines. The strip should be continuous.
          
          The size of the circles indicates the diameter of the fixture.
          
          TASK:
          1. Replace these markers with realistic lighting fixtures of the specified type.
          2. The light emitted must have a Color Temperature of ${colorTemp}K.
          3. Ensure the lights cast realistic shadows.
          4. IMPORTANT: REMOVE all colored markers (dots and lines) from the final generation.
        `;
      }

      let localTexturePrompt = '';
      if (textureImage) {
        if (!textureTarget.trim()) {
           throw new Error("请在本地材质区域指定要替换的位置（例如：地板、墙面）。");
        }
        localTexturePrompt = `Use the provided reference texture image (second image) and apply it to the '${textureTarget}' in the scene. Replace the existing material of the ${textureTarget} with this texture.`;
      }

      const fullPrompt = [
        localTexturePrompt,
        markerPrompt,
        lightingPrompt,
        repairsPrompt,
        customPrompt
      ]
        .filter(Boolean)
        .join('. ');

      if (!fullPrompt.trim() && !textureImage && markers.length === 0) {
        throw new Error("请至少输入指令、选择修改选项或放置灯光。");
      }

      const sourceImageBase64 = markers.length > 0 
        ? await compositeImageWithMarkers(activeVersion.imageUrl) 
        : activeVersion.imageUrl;

      const base64Data = sourceImageBase64.split(',')[1];
      const textureBase64 = textureImage ? textureImage.split(',')[1] : null;

      const resultUrl = await processRendering(base64Data, fullPrompt, setStatusMessage, textureBase64);

      const newVersion: RenderVersion = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        imageUrl: resultUrl,
        prompt: fullPrompt,
        type: 'edited'
      };

      const updatedVersions = [...versions, newVersion];
      setVersions(updatedVersions);
      setActiveVersionIndex(updatedVersions.length - 1);
      setMarkers([]); 
      setCurrentPath([]);
      setStatus(AppStatus.IDLE);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "发生未知错误，请重试。");
      setStatus(AppStatus.ERROR);
    }
  };

  const downloadImage = () => {
    if (!activeVersion) return;
    const link = document.createElement('a');
    link.href = activeVersion.imageUrl;
    link.download = `lumina-render-${activeVersion.id.slice(0, 8)}.png`;
    link.click();
  };

  const resetAll = () => {
    if (confirm("确定要重置当前工作区吗？")) {
      setVersions([]);
      setActiveVersionIndex(-1);
      setSelectedLighting(null);
      setSelectedRepairs([]);
      setCustomPrompt('');
      setTextureImage(null);
      setTextureTarget('');
      setMarkers([]);
      setCurrentPath([]);
      setActiveTool(null);
      setColorTemp(3500);
      setFixtureVariant('recessed');
      setError(null);
    }
  };

  const getTempColor = (temp: number) => {
    if (temp <= 3000) return 'text-orange-400';
    if (temp <= 4500) return 'text-yellow-200';
    return 'text-blue-300';
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#050505] text-neutral-200">
      <header className="h-14 border-b border-neutral-800/50 flex items-center justify-between px-6 glass sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 accent-gradient rounded flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Layers className="text-white w-4 h-4" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
            耀影渲染 <span className="text-indigo-500 text-sm font-black bg-indigo-500/10 px-1.5 py-0.5 rounded">ULTIMATE</span>
          </h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-4 text-xs font-medium text-neutral-500">
            <span className="flex items-center gap-1.5"><ImagePlus className="w-3 h-3 text-emerald-400" /> Local Texture</span>
            <span className="flex items-center gap-1.5"><Lightbulb className="w-3 h-3 text-yellow-400" /> Smart Lighting</span>
          </div>
          {versions.length > 0 && (
            <button 
              onClick={resetAll}
              className="text-neutral-500 hover:text-red-400 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <Trash2 className="w-3.5 h-3.5" />
              清空
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-[340px] border-r border-neutral-800/50 bg-[#0a0a0a] overflow-y-auto custom-scrollbar">
          <div className="p-6 space-y-8">
            {/* 1. Upload */}
            <section>
              <h3 className="text-[11px] font-bold text-neutral-500 uppercase tracking-[0.1em] mb-4">01. 原始场景导入</h3>
              {versions.length === 0 ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border border-dashed border-neutral-800 rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all group"
                >
                  <Upload className="w-6 h-6 text-neutral-600 mb-3 group-hover:text-indigo-400 group-hover:scale-110 transition-all" />
                  <p className="text-xs font-bold text-neutral-400 group-hover:text-neutral-200">上传待编辑图像</p>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                </div>
              ) : (
                <div className="relative group rounded-lg overflow-hidden border border-neutral-800 bg-neutral-900/50">
                  <img src={originalVersion?.imageUrl} className="w-full aspect-[16/10] object-cover opacity-50" />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <button 
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                      className="text-[10px] font-bold text-white bg-indigo-600/80 hover:bg-indigo-600 px-3 py-1.5 rounded-full backdrop-blur-md transition-all pointer-events-auto"
                    >
                      重新更换源图
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* 2. Texture */}
            <section className="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[11px] font-bold text-emerald-400 uppercase tracking-[0.1em] flex items-center gap-2">
                  <ImagePlus className="w-3.5 h-3.5" /> 02. 本地材质替换
                </h3>
              </div>
              
              {!textureImage ? (
                <div 
                  onClick={() => textureInputRef.current?.click()}
                  className="border border-dashed border-neutral-700 bg-neutral-900/50 rounded-lg h-24 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all mb-3"
                >
                  <div className="flex flex-col items-center gap-1">
                    <Upload className="w-4 h-4 text-neutral-500" />
                    <span className="text-[10px] text-neutral-500">上传纹理/贴图</span>
                  </div>
                </div>
              ) : (
                <div className="relative mb-3 group">
                   <div className="h-24 rounded-lg overflow-hidden border border-neutral-700 relative">
                      <img src={textureImage} className="w-full h-full object-cover" alt="Texture" />
                      <button 
                        onClick={clearTexture}
                        className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full hover:bg-red-500/80 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                   </div>
                </div>
              )}
              
              <input 
                type="file"
                ref={textureInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleTextureUpload}
              />

              <div className="space-y-1">
                <label className="text-[9px] text-neutral-500 uppercase font-bold tracking-wider">应用位置</label>
                <input
                  type="text"
                  value={textureTarget}
                  onChange={(e) => setTextureTarget(e.target.value)}
                  placeholder="例如: 地板, 沙发, 背景墙..."
                  className="w-full h-8 bg-[#0d0d0d] border border-neutral-800 rounded text-xs text-neutral-300 px-2 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all placeholder:text-neutral-700"
                />
              </div>
            </section>

            {/* 3. Lighting (Updated) */}
            <section className="bg-neutral-900/30 p-4 rounded-xl border border-neutral-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[11px] font-bold text-yellow-500 uppercase tracking-[0.1em] flex items-center gap-2">
                   <Lightbulb className="w-3.5 h-3.5" /> 03. 增加灯光组件
                </h3>
                {markers.length > 0 && (
                  <button onClick={clearMarkers} className="text-[9px] text-red-400 hover:text-red-300 flex items-center gap-1">
                    <Eraser className="w-3 h-3" /> 清除 {markers.length} 个
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-4">
                {FIXTURE_OPTIONS.map(fixture => (
                  <button
                    key={fixture.id}
                    onClick={() => toggleTool(fixture.id)}
                    className={`p-2.5 rounded-lg border text-left transition-all duration-200 flex flex-col gap-2 relative ${
                      activeTool === fixture.id
                        ? 'border-yellow-500 bg-yellow-500/10 shadow-[0_0_10px_rgba(234,179,8,0.1)]' 
                        : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-600'
                    }`}
                  >
                    <div className={`${activeTool === fixture.id ? 'text-yellow-400' : 'text-neutral-500'}`}>
                      {ICON_MAP[fixture.icon]}
                    </div>
                    <p className={`text-[10px] font-bold truncate ${activeTool === fixture.id ? 'text-white' : 'text-neutral-400'}`}>
                      {fixture.label}
                    </p>
                  </button>
                ))}
              </div>

              {/* Tool Specific Controls */}
              {activeTool && activeTool !== 'light-strip' && (
                <div className="mb-4 space-y-3 bg-black/20 p-3 rounded-lg border border-neutral-800">
                  
                  {/* Installation Type Selection for Downlights/Spotlights */}
                  {(activeTool === 'downlight' || activeTool === 'spotlight') && (
                    <div className="flex gap-1 p-1 bg-neutral-900 rounded-lg mb-3">
                      <button
                        onClick={() => setFixtureVariant('recessed')}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[10px] font-bold transition-all ${
                          fixtureVariant === 'recessed' 
                            ? 'bg-neutral-800 text-white shadow-sm ring-1 ring-white/10' 
                            : 'text-neutral-500 hover:text-neutral-300'
                        }`}
                      >
                        <Disc className="w-3 h-3" /> 暗装 (嵌入)
                      </button>
                      <button
                        onClick={() => setFixtureVariant('surface')}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[10px] font-bold transition-all ${
                          fixtureVariant === 'surface' 
                            ? 'bg-neutral-800 text-white shadow-sm ring-1 ring-white/10' 
                            : 'text-neutral-500 hover:text-neutral-300'
                        }`}
                      >
                        <CircleDashed className="w-3 h-3" /> 明装 (吸顶)
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <label className="text-[9px] text-neutral-400 uppercase font-bold flex items-center gap-1.5">
                      <Scaling className="w-3 h-3" /> 灯具/光束直径
                    </label>
                    <span className="text-[10px] font-mono text-neutral-300">{markerSize.toFixed(1)}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.5" 
                    max="10" 
                    step="0.5" 
                    value={markerSize}
                    onChange={(e) => setMarkerSize(Number(e.target.value))}
                    className="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                  />
                  <p className="text-[9px] text-neutral-600">调整圆点大小以控制灯具尺寸或光束范围。</p>
                </div>
              )}

              {activeTool === 'light-strip' && (
                <div className="mb-4 space-y-2 bg-black/20 p-3 rounded-lg border border-neutral-800 border-l-2 border-l-green-500">
                   <div className="flex items-center justify-between">
                     <span className="text-[10px] font-bold text-green-400 flex items-center gap-1">
                       <PenTool className="w-3 h-3" /> 绘制灯带路径
                     </span>
                     {currentPath.length > 1 && (
                       <button 
                        onClick={finishPath}
                        className="text-[9px] bg-green-500/20 text-green-300 px-2 py-0.5 rounded border border-green-500/30 hover:bg-green-500/40 flex items-center gap-1"
                       >
                         <Check className="w-3 h-3" /> 完成
                       </button>
                     )}
                   </div>
                   <p className="text-[9px] text-neutral-500 leading-relaxed">
                     点击画面添加路径点。双击或点击“完成”结束绘制。<br/>
                     <span className="text-neutral-600">当前点数: {currentPath.length}</span>
                   </p>
                </div>
              )}

              {/* Color Temperature */}
              <div className="space-y-2 pt-2 border-t border-neutral-800">
                <div className="flex items-center justify-between">
                  <label className="text-[9px] text-neutral-400 uppercase font-bold flex items-center gap-1.5">
                    <Thermometer className="w-3 h-3" /> 色温调节
                  </label>
                  <span className={`text-[10px] font-mono font-bold ${getTempColor(colorTemp)}`}>{colorTemp}K</span>
                </div>
                <input 
                  type="range" 
                  min="2700" 
                  max="6500" 
                  step="100" 
                  value={colorTemp}
                  onChange={(e) => setColorTemp(Number(e.target.value))}
                  className="w-full h-1.5 bg-gradient-to-r from-orange-500 via-yellow-200 to-blue-400 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                />
              </div>
            </section>

            {/* 4. Magic Edit */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[11px] font-bold text-neutral-500 uppercase tracking-[0.1em] flex items-center gap-2">
                  <Stars className="w-3.5 h-3.5" /> 04. AI 魔法编辑
                </h3>
              </div>
              
              <div className="relative group mb-3">
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="添加更多细节指令..."
                  className="w-full h-24 bg-[#0d0d0d] border border-neutral-800 rounded-lg p-3 pt-4 pl-9 text-xs text-neutral-400 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 resize-none transition-all placeholder:text-neutral-700 shadow-inner"
                />
                <MessageSquare className="absolute left-3 top-3.5 w-3.5 h-3.5 text-neutral-600 group-focus-within:text-indigo-400 transition-colors" />
              </div>

              <div className="flex flex-wrap gap-1.5">
                {QUICK_EDITS.map(edit => (
                  <button
                    key={edit.id}
                    onClick={() => applyQuickEdit(edit.prompt)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-neutral-900 border border-neutral-800 text-neutral-500 hover:text-indigo-300 hover:border-indigo-500/30 transition-all text-[10px] font-medium"
                  >
                    {ICON_MAP[edit.icon]}
                    {edit.label}
                  </button>
                ))}
              </div>
            </section>

            <div className="pt-2">
              <button
                onClick={handleEnhance}
                disabled={versions.length === 0 || status === AppStatus.PROCESSING}
                className="w-full py-3.5 rounded-lg accent-gradient text-white text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2.5 shadow-xl shadow-indigo-600/20 disabled:opacity-30 disabled:grayscale transition-all hover:brightness-110 active:scale-[0.97]"
              >
                {status === AppStatus.PROCESSING ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    AI 渲染中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    开始渲染
                  </>
                )}
              </button>
            </div>
          </div>
        </aside>

        {/* Workspace */}
        <section className="flex-1 bg-black relative overflow-hidden flex items-center justify-center p-8">
          {versions.length === 0 ? (
            <div className="text-center max-w-sm">
              <div className="w-14 h-14 accent-gradient rounded-xl flex items-center justify-center mx-auto mb-6 shadow-2xl opacity-80 rotate-3">
                <Wand2 className="text-white w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold mb-2 text-white">开启 AI 图像魔法</h2>
              <p className="text-neutral-600 text-[11px] leading-relaxed font-medium">
                上传渲染图，上传 <span className="text-emerald-400">本地材质贴图</span> 进行替换，或使用 <span className="text-yellow-400">智能灯光组件</span> 自由布光。
              </p>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-6">
              <div className="w-full max-w-5xl relative">
                {(activeVersionIndex > 0 && originalVersion && !activeTool) ? (
                  <CompareSlider 
                    before={originalVersion.imageUrl} 
                    after={activeVersion.imageUrl} 
                  />
                ) : (
                  <div 
                    ref={imageContainerRef}
                    className={`rounded-xl overflow-hidden border border-neutral-800 shadow-2xl relative inline-block ${activeTool ? 'cursor-crosshair' : 'cursor-default'}`}
                    onClick={handleImageClick}
                  >
                    <img src={activeVersion.imageUrl} className="w-full h-auto object-contain max-h-[75vh] block" draggable={false} />
                    
                    {/* Render Completed Markers */}
                    {markers.map(marker => {
                      if (marker.kind === 'point') {
                        // Visual style depends on variant
                        const isSurface = marker.variant === 'surface';
                        const baseColor = getMarkerColor(marker.toolId);

                        return (
                          <div
                            key={marker.id}
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center group z-10"
                            style={{ 
                              left: `${marker.x}%`, 
                              top: `${marker.y}%`, 
                              width: `${marker.radius * 2}%`, 
                              aspectRatio: '1/1',
                              backgroundColor: isSurface ? 'transparent' : `${baseColor}80`,
                              border: isSurface ? `2px solid ${baseColor}` : `1px solid rgba(255,255,255,0.3)`,
                              boxShadow: isSurface ? '0 0 4px rgba(0,0,0,0.5)' : 'none'
                            }}
                          >
                             <button 
                                onClick={(e) => removeMarker(e, marker.id)}
                                className="hidden group-hover:flex w-full h-full items-center justify-center bg-black/50 rounded-full text-white"
                             >
                               <X className="w-3 h-3" />
                             </button>
                          </div>
                        );
                      } else if (marker.kind === 'path') {
                        // Render Paths using SVG overlay for simplicity in DOM
                        return (
                          <svg key={marker.id} className="absolute inset-0 w-full h-full pointer-events-none z-10">
                            <polyline
                              points={marker.points.map(p => `${p.x}%,${p.y}%`).join(' ')}
                              fill="none"
                              stroke={getMarkerColor(marker.toolId)}
                              strokeWidth="1.5%"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="opacity-80"
                            />
                            {/* Hit area for delete (first point) */}
                            <foreignObject x={`${marker.points[0].x}%`} y={`${marker.points[0].y}%`} width="20" height="20" style={{ overflow: 'visible' }}>
                               <div className="w-5 h-5 -translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full flex items-center justify-center cursor-pointer pointer-events-auto hover:scale-110 transition-transform" onClick={(e) => removeMarker(e, marker.id)}>
                                 <X className="w-3 h-3 text-white" />
                               </div>
                            </foreignObject>
                          </svg>
                        )
                      }
                      return null;
                    })}

                    {/* Render Current Path Being Drawn */}
                    {currentPath.length > 0 && (
                      <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
                         <polyline
                            points={currentPath.map(p => `${p.x}%,${p.y}%`).join(' ')}
                            fill="none"
                            stroke="#00FF00"
                            strokeWidth="1.5%"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeDasharray="4"
                          />
                          {currentPath.map((p, idx) => (
                            <circle key={idx} cx={`${p.x}%`} cy={`${p.y}%`} r="3" fill="white" stroke="black" />
                          ))}
                      </svg>
                    )}

                    {/* Hint Overlay */}
                    {activeTool && (
                       <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 text-white text-[10px] px-3 py-1.5 rounded-full backdrop-blur pointer-events-none flex items-center gap-2 border border-white/10 z-30">
                         <MousePointer2 className="w-3 h-3" /> 
                         {activeTool === 'light-strip' 
                           ? `点击绘制路径 (${currentPath.length} 点) - Enter 完成` 
                           : `点击放置 ${FIXTURE_OPTIONS.find(f => f.id === activeTool)?.label} ${fixtureVariant === 'surface' ? '(明装)' : '(暗装)'}`
                         }
                       </div>
                    )}
                    
                    {activeTool === 'light-strip' && currentPath.length > 0 && (
                       <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30">
                         <button onClick={(e) => { e.stopPropagation(); undoLastPathPoint(e); }} className="bg-black/70 text-white text-[10px] px-3 py-1.5 rounded-full hover:bg-neutral-800 flex items-center gap-1 border border-white/10">
                           <Undo2 className="w-3 h-3" /> 撤销点
                         </button>
                         <button onClick={(e) => { e.stopPropagation(); finishPath(); }} className="bg-green-600/90 text-white text-[10px] px-3 py-1.5 rounded-full hover:bg-green-600 flex items-center gap-1 shadow-lg">
                           <Check className="w-3 h-3" /> 完成路径
                         </button>
                       </div>
                    )}
                  </div>
                )}

                {status === AppStatus.PROCESSING && (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-20 rounded-xl">
                    <div className="text-center">
                      <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-indigo-400 text-xs font-bold tracking-widest uppercase">{statusMessage}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="w-full max-lg glass border border-neutral-800 p-2.5 rounded-full flex items-center justify-between px-6">
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${activeVersion.type === 'original' ? 'bg-neutral-600' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`} />
                  <p className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest">
                    {activeVersion.type === 'original' ? '原始渲染源' : 'AI 增强版本'}
                  </p>
                </div>
                <button onClick={downloadImage} className="px-4 py-1.5 rounded-full bg-white text-black hover:bg-neutral-200 transition-all text-[10px] font-black uppercase tracking-tight flex items-center gap-2">
                  <Download className="w-3.5 h-3.5" /> 导出高清
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 px-5 py-3 rounded-lg backdrop-blur-xl shadow-2xl z-50">
              <AlertCircle className="w-4 h-4" />
              <div className="text-[11px] font-bold">错误: <span className="font-medium opacity-80">{error}</span></div>
            </div>
          )}
        </section>

        {/* Right Sidebar: History */}
        <aside className="w-[120px] border-l border-neutral-800/50 bg-[#0a0a0a] overflow-y-auto custom-scrollbar p-4">
          <div className="text-center mb-6">
            <h3 className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.2em] mb-1">HISTORY</h3>
          </div>
          <div className="space-y-4">
            {versions.length > 0 ? (
              [...versions].reverse().map((v, i) => (
                <div 
                  key={v.id}
                  onClick={() => setActiveVersionIndex(versions.findIndex(orig => orig.id === v.id))}
                  className={`relative group cursor-pointer rounded-md overflow-hidden border transition-all ${
                    activeVersion.id === v.id ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-neutral-800 hover:border-neutral-600 opacity-40 hover:opacity-100'
                  }`}
                >
                  <img src={v.imageUrl} className="w-full aspect-square object-cover" />
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center gap-2 opacity-20 py-10">
                <History className="w-4 h-4 text-neutral-500" />
              </div>
            )}
          </div>
        </aside>
      </main>

      <footer className="h-6 border-t border-neutral-800/50 bg-black flex items-center px-4 justify-between text-[8px] text-neutral-700 font-mono uppercase">
        <div className="flex items-center gap-6">
          <span>STATUS: {status}</span>
          <span>POWERED BY GEMINI 2.5 FLASH IMAGE</span>
        </div>
        <div>LuminaRender Ultimate 2.2 &copy; 2024</div>
      </footer>
    </div>
  );
};

export default App;
