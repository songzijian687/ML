
import React, { useState, useCallback, useRef } from 'react';
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
  RefreshCw
} from 'lucide-react';
import { LIGHTING_PROFILES, REPAIR_OPTIONS, TEXTURE_OPTIONS, QUICK_EDITS, ICON_MAP } from './constants';
import { RenderVersion, LightingProfile, RepairOption, AppStatus } from './types';
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
  const [selectedTextures, setSelectedTextures] = useState<string[]>([]);
  const [customPrompt, setCustomPrompt] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeVersion = versions[activeVersionIndex];
  const originalVersion = versions.find(v => v.type === 'original');

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
    };
    reader.readAsDataURL(file);
  };

  const toggleRepair = (id: string) => {
    setSelectedRepairs(prev => 
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const toggleTexture = (id: string) => {
    setSelectedTextures(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const applyQuickEdit = (prompt: string) => {
    setCustomPrompt(prev => {
      const newPrompt = prev.trim() ? `${prev}. ${prompt}` : prompt;
      return newPrompt;
    });
  };

  const handleEnhance = async () => {
    if (!activeVersion) return;

    try {
      setStatus(AppStatus.PROCESSING);
      setError(null);

      const lightingPrompt = selectedLighting 
        ? LIGHTING_PROFILES.find(p => p.id === selectedLighting)?.prompt 
        : '';
      
      const repairsPrompt = selectedRepairs
        .map(id => REPAIR_OPTIONS.find(r => r.id === id)?.prompt)
        .join(' ');

      const texturePrompt = selectedTextures
        .map(id => TEXTURE_OPTIONS.find(t => t.id === id)?.prompt)
        .join(' ');

      // 强调材质识别与替换的逻辑
      const fullPrompt = [
        "First, identify all primary architectural materials in the image.",
        texturePrompt,
        lightingPrompt,
        repairsPrompt,
        customPrompt
      ]
        .filter(Boolean)
        .join('. ');

      if (!fullPrompt.trim()) {
        throw new Error("请至少选择一个选项或输入自定义指令。");
      }

      const base64Data = activeVersion.imageUrl.split(',')[1];
      const resultUrl = await processRendering(base64Data, fullPrompt, setStatusMessage);

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
    if (confirm("确定要重置当前工作区吗？所有未导出的版本都将丢失。")) {
      setVersions([]);
      setActiveVersionIndex(-1);
      setSelectedLighting(null);
      setSelectedRepairs([]);
      setSelectedTextures([]);
      setCustomPrompt('');
      setError(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#050505] text-neutral-200">
      {/* 头部 */}
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
            <span className="flex items-center gap-1.5"><Search className="w-3 h-3" /> 自动材质识别: ON</span>
            <span className="flex items-center gap-1.5"><RefreshCw className="w-3 h-3" /> 物理引擎: Gemini 2.5</span>
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
        {/* 左侧边栏：控制面板 */}
        <aside className="w-[340px] border-r border-neutral-800/50 bg-[#0a0a0a] overflow-y-auto custom-scrollbar">
          <div className="p-6 space-y-8">
            {/* 1. 项目导入 */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[11px] font-bold text-neutral-500 uppercase tracking-[0.1em]">01. 原始场景导入</h3>
                {versions.length > 0 && <span className="text-[9px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded font-bold">READY</span>}
              </div>
              {versions.length === 0 ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border border-dashed border-neutral-800 rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all group"
                >
                  <Upload className="w-6 h-6 text-neutral-600 mb-3 group-hover:text-indigo-400 group-hover:scale-110 transition-all" />
                  <p className="text-xs font-bold text-neutral-400 group-hover:text-neutral-200">上传 3D 原始渲染图</p>
                  <p className="text-[9px] text-neutral-600 mt-1">支持无损 PNG / 高清 JPG</p>
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
                  <img 
                    src={originalVersion?.imageUrl} 
                    className="w-full aspect-[16/10] object-cover opacity-50"
                    alt="Source"
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <button 
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                      className="text-[10px] font-bold text-white bg-indigo-600/80 hover:bg-indigo-600 px-3 py-1.5 rounded-full backdrop-blur-md transition-all pointer-events-auto shadow-xl"
                    >
                      重新更换源图
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* 2. 材质库 */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[11px] font-bold text-neutral-500 uppercase tracking-[0.1em]">02. 智能材质库</h3>
                <span className="text-[9px] text-indigo-400 font-mono italic">AI-powered recognition</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {TEXTURE_OPTIONS.map(texture => (
                  <button
                    key={texture.id}
                    onClick={() => toggleTexture(texture.id)}
                    className={`p-2.5 rounded-lg border text-left transition-all duration-200 flex flex-col gap-2 ${
                      selectedTextures.includes(texture.id)
                        ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_10px_rgba(99,102,241,0.1)]' 
                        : 'border-neutral-800 bg-neutral-900/30 hover:border-neutral-700'
                    }`}
                  >
                    <div className={`${selectedTextures.includes(texture.id) ? 'text-indigo-400' : 'text-neutral-500'}`}>
                      {ICON_MAP[texture.icon]}
                    </div>
                    <p className={`text-[10px] font-bold truncate ${selectedTextures.includes(texture.id) ? 'text-white' : 'text-neutral-400'}`}>
                      {texture.label}
                    </p>
                  </button>
                ))}
              </div>
            </section>

            {/* 3. 光影系统 */}
            <section>
              <h3 className="text-[11px] font-bold text-neutral-500 uppercase tracking-[0.1em] mb-4">03. 动态光影引擎</h3>
              <div className="flex flex-col gap-2">
                {LIGHTING_PROFILES.map(profile => (
                  <button
                    key={profile.id}
                    onClick={() => setSelectedLighting(selectedLighting === profile.id ? null : profile.id)}
                    className={`p-3 rounded-lg border flex items-center gap-3 transition-all duration-200 ${
                      selectedLighting === profile.id 
                        ? 'border-amber-500/50 bg-amber-500/5' 
                        : 'border-neutral-800 bg-neutral-900/30 hover:border-neutral-700'
                    }`}
                  >
                    <div className={`${selectedLighting === profile.id ? 'text-amber-500' : 'text-neutral-600'}`}>
                      {ICON_MAP[profile.icon]}
                    </div>
                    <div className="flex-1 text-left">
                      <p className={`text-[10px] font-bold ${selectedLighting === profile.id ? 'text-white' : 'text-neutral-400'}`}>
                        {profile.name}
                      </p>
                    </div>
                    {selectedLighting === profile.id && <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
                  </button>
                ))}
              </div>
            </section>

            {/* 4. 魔法微调指令 */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[11px] font-bold text-neutral-500 uppercase tracking-[0.1em]">04. 精准微调指令</h3>
                <div className="flex gap-1.5">
                  {QUICK_EDITS.map(edit => (
                    <button
                      key={edit.id}
                      onClick={() => applyQuickEdit(edit.prompt)}
                      className="p-1.5 rounded-md bg-neutral-900 border border-neutral-800 text-neutral-500 hover:text-indigo-400 hover:border-indigo-500/30 transition-all shadow-sm"
                      title={edit.label}
                    >
                      {ICON_MAP[edit.icon]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative group">
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="例如：'识别地板并更换为鱼骨拼橡木'，'识别所有窗户并增加外景反光'..."
                  className="w-full h-28 bg-[#0d0d0d] border border-neutral-800 rounded-lg p-3 pt-4 pl-9 text-xs text-neutral-400 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 resize-none transition-all placeholder:text-neutral-700"
                />
                <MessageSquare className="absolute left-3 top-3.5 w-3.5 h-3.5 text-neutral-600 group-focus-within:text-indigo-400 transition-colors" />
              </div>
            </section>

            {/* 执行生成按钮 */}
            <div className="pt-2">
              <button
                onClick={handleEnhance}
                disabled={versions.length === 0 || status === AppStatus.PROCESSING}
                className="w-full py-3.5 rounded-lg accent-gradient text-white text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2.5 shadow-xl shadow-indigo-600/20 disabled:opacity-30 disabled:grayscale transition-all hover:brightness-110 active:scale-[0.97]"
              >
                {status === AppStatus.PROCESSING ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    正在渲染核心引擎...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    开始 AI 材质增强
                  </>
                )}
              </button>
            </div>
          </div>
        </aside>

        {/* 中心：工作区 */}
        <section className="flex-1 bg-black relative overflow-hidden flex items-center justify-center p-8">
          {versions.length === 0 ? (
            <div className="text-center max-w-sm">
              <div className="w-14 h-14 accent-gradient rounded-xl flex items-center justify-center mx-auto mb-6 shadow-2xl opacity-80 rotate-3">
                <Wand2 className="text-white w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold mb-2 text-white">等待项目导入</h2>
              <p className="text-neutral-600 text-[11px] leading-relaxed font-medium">
                耀影渲染 PRO 专为建筑师与 3D 艺术家设计。支持自动识别场景材质，并通过物理准确的 AI 逻辑进行替换与光影重构。
              </p>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-6">
              <div className="w-full max-w-5xl relative group">
                {activeVersionIndex > 0 && originalVersion ? (
                  <CompareSlider 
                    before={originalVersion.imageUrl} 
                    after={activeVersion.imageUrl} 
                  />
                ) : (
                  <div className="rounded-xl overflow-hidden border border-neutral-800 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                    <img 
                      src={activeVersion.imageUrl} 
                      alt="Current Render" 
                      className="w-full h-auto object-contain max-h-[75vh]"
                    />
                  </div>
                )}

                {/* 加载遮罩 */}
                {status === AppStatus.PROCESSING && (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-20 rounded-xl overflow-hidden">
                    <div className="text-center">
                      <div className="relative w-16 h-16 mx-auto mb-6">
                        <div className="absolute inset-0 border-4 border-indigo-500/10 rounded-full" />
                        <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <RefreshCw className="w-5 h-5 text-indigo-400 animate-pulse" />
                        </div>
                      </div>
                      <p className="text-indigo-400 text-xs font-bold tracking-widest uppercase mb-1">{statusMessage}</p>
                      <p className="text-neutral-500 text-[9px] font-mono tracking-tighter">PHYSICALLY BASED AI RECONSTRUCTION IN PROGRESS</p>
                    </div>
                  </div>
                )}
              </div>

              {/* 底部浮动栏 */}
              <div className="w-full max-w-lg glass border border-neutral-800 p-2.5 rounded-full flex items-center justify-between px-6 shadow-2xl">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <p className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest truncate max-w-[150px]">
                    {activeVersion.type === 'original' ? '原始渲染源' : '增强后版本'}
                  </p>
                </div>
                <div className="h-4 w-px bg-neutral-800 mx-2" />
                <button 
                  onClick={downloadImage}
                  className="px-4 py-1.5 rounded-full bg-white text-black hover:bg-neutral-200 transition-all text-[10px] font-black uppercase tracking-tight flex items-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  导出高清作品
                </button>
              </div>
            </div>
          )}

          {/* 错误提示 */}
          {error && (
            <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 px-5 py-3 rounded-lg backdrop-blur-xl shadow-2xl z-50">
              <AlertCircle className="w-4 h-4" />
              <div className="text-[11px] font-bold">
                渲染失败: <span className="font-medium opacity-80 ml-1">{error}</span>
              </div>
            </div>
          )}
        </section>

        {/* 右侧边栏：历史记录 */}
        <aside className="w-[120px] border-l border-neutral-800/50 bg-[#0a0a0a] overflow-y-auto custom-scrollbar p-4">
          <div className="text-center mb-6">
            <h3 className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.2em] mb-1">HISTORY</h3>
            <div className="h-0.5 w-4 bg-neutral-800 mx-auto rounded-full" />
          </div>

          <div className="space-y-4">
            {versions.length === 0 ? (
              <div className="flex flex-col items-center gap-2 opacity-20 py-10">
                <History className="w-4 h-4 text-neutral-500" />
                <span className="text-[8px] font-bold">空</span>
              </div>
            ) : (
              [...versions].reverse().map((v, i) => (
                <div 
                  key={v.id}
                  onClick={() => setActiveVersionIndex(versions.findIndex(orig => orig.id === v.id))}
                  className={`relative group cursor-pointer rounded-md overflow-hidden border transition-all ${
                    activeVersion.id === v.id 
                      ? 'border-indigo-500 ring-2 ring-indigo-500/20' 
                      : 'border-neutral-800 hover:border-neutral-600 opacity-40 hover:opacity-100'
                  }`}
                >
                  <img src={v.imageUrl} className="w-full aspect-square object-cover" alt={`V${i}`} />
                  {activeVersion.id === v.id && (
                    <div className="absolute inset-0 bg-indigo-500/10" />
                  )}
                </div>
              ))
            )}
          </div>
        </aside>
      </main>

      {/* 底部状态条 */}
      <footer className="h-6 border-t border-neutral-800/50 bg-black flex items-center px-4 justify-between text-[8px] text-neutral-700 font-mono tracking-widest uppercase">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2">
            <div className={`w-1 h-1 rounded-full ${status === AppStatus.IDLE ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
            STATUS: {status}
          </span>
          <span>GPU ACCELERATION: ACTIVE</span>
        </div>
        <div>
          LuminaRender Ultimate 2.0.1 &copy; 2024
        </div>
      </footer>
    </div>
  );
};

export default App;
