import { Play, Terminal, ArrowRight, ShieldCheck, CheckCircle2, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

export interface ApiLog {
  id: string;
  timestamp: string;
  action: string;
  requestBody: any;
  responseBody: any;
  status: number;
  loading: boolean;
}

interface ConsoleInspectorProps {
  logs: ApiLog[];
  activeLogId: string | null;
  onSelectLog: (id: string) => void;
  onClearLogs: () => void;
}

export default function ConsoleInspector({ logs, activeLogId, onSelectLog, onClearLogs }: ConsoleInspectorProps) {
  const activeLog = logs.find(l => l.id === activeLogId) || logs[0];

  return (
    <div className="h-full bg-[#1A1C23] rounded-3xl border border-[#2D313D] flex flex-col overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="px-5 py-4 bg-[#21242D] border-b border-[#2D313D] flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FF6B35] animate-pulse" />
          <Terminal size={17} className="text-[#9BA1B1]" />
          <span className="font-display font-bold text-xs tracking-wider uppercase text-[#E0E0E6]">
            StoryCraft Engine Inspector
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-[10px] font-mono text-[#9BA1B1] bg-[#0F1014] px-2.5 py-1 rounded text-center border border-[#2D313D]">
            JSON ONLY MODE
          </div>
          {logs.length > 0 && (
            <button
              onClick={onClearLogs}
              className="text-[10px] font-mono hover:text-white text-[#E0E0E6] transition-all bg-[#2D313D] hover:bg-[#3A3F4E] px-2.5 py-1 rounded border border-[#3A3F4E] cursor-pointer"
            >
              Clear Logs
            </button>
          )}
        </div>
      </div>

      {/* Main split log panel */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row">
        {/* Left Column: Log list */}
        <div className="w-full lg:w-72 border-r border-[#2D313D] bg-[#0F1014] flex flex-col shrink-0 overflow-y-auto">
          <div className="p-3 bg-[#1A1C23] border-b border-[#2D313D]">
            <span className="text-[10px] uppercase font-mono tracking-widest font-bold text-[#FF6B35]">
              API Solicitudes ({logs.length})
            </span>
          </div>

          <div className="divide-y divide-[#2D313D]">
            {logs.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-[#9BA1B1]">
                No hay solicitudes registradas aún. Interactúa con la aplicación para ver el flujo.
              </div>
            ) : (
              logs.map((log) => {
                const isActive = log.id === activeLogId;
                return (
                  <button
                    key={log.id}
                    onClick={() => onSelectLog(log.id)}
                    className={`w-full text-left p-3.5 flex flex-col gap-1.5 transition-all text-xs outline-none cursor-pointer ${
                      isActive 
                        ? 'bg-[#21242D] border-l-4 border-[#FF6B35] text-white' 
                        : 'hover:bg-[#1A1C23] text-[#9BA1B1]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full font-mono text-[10px]">
                      <span className="text-[#9BA1B1] font-semibold">{log.timestamp}</span>
                      <span className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold ${
                        log.loading 
                          ? 'bg-[#FFD166]/10 text-[#FFD166] animate-pulse border border-[#FFD166]/20'
                          : log.status === 200 
                            ? 'bg-[#06D6A0]/10 text-[#06D6A0] border border-[#06D6A0]/20' 
                            : 'bg-rose-950/40 text-[#FF6D6D] border border-rose-900/40'
                      }`}>
                        {log.loading ? 'POSTING...' : log.status === 200 ? '200 OK' : '500 ERR'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 font-mono text-xs">
                      <span className="text-[#FF6B35] font-bold">POST</span>
                      <span className="text-[#E0E0E6] truncate">/api/storycraft</span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-mono text-[#9BA1B1] truncate">
                      <ChevronRight size={12} className="text-[#FF6B35] shrink-0" />
                      <span>action: <b className="text-white">{log.action}</b></span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Code viewer */}
        <div className="flex-1 bg-[#1A1C23] flex flex-col overflow-hidden min-h-[300px]">
          {activeLog ? (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Tab selector */}
              <div className="border-b border-[#2D313D] bg-[#21242D] px-5 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#E0E0E6]">
                  <Terminal size={12} className="text-[#FF6B35]" />
                  <span>Payload: action <b className="text-[#FFD166]">{activeLog.action}</b></span>
                </div>
                {activeLog.loading && (
                  <div className="text-[10px] font-mono text-[#FFD166] animate-pulse flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FFD166]" />
                    <span>Gemini pensando...</span>
                  </div>
                )}
              </div>

              {/* Panes */}
              <div className="flex-1 min-h-0 divide-y divide-[#2D313D] overflow-y-auto font-mono text-[11px]">
                {/* Request */}
                <div className="p-4 flex flex-col bg-[#0F1014]/50">
                  <div className="text-[10px] text-[#FF6B35] font-bold uppercase tracking-widest mb-1.5 select-none opacity-90">
                    &gt; Request Body JSON
                  </div>
                  <pre className="text-[#06D6A0] overflow-x-auto whitespace-pre-wrap leading-relaxed select-all">
                    {JSON.stringify(activeLog.requestBody, null, 2)}
                  </pre>
                </div>

                {/* Response */}
                <div className="p-4 flex flex-col bg-[#0F1014] flex-1">
                  <div className="text-[10px] text-[#06D6A0] font-bold uppercase tracking-widest mb-1.5 select-none opacity-90">
                    &lt; Response JSON (Engine Output)
                  </div>
                  {activeLog.loading ? (
                    <div className="py-8 flex flex-col items-center justify-center gap-2 text-[#9BA1B1]">
                      <div className="w-5 h-5 border-2 border-[#FF6B35] border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-mono">Procesando reglas de StoryCraft pedagógicas...</span>
                    </div>
                  ) : activeLog.responseBody ? (
                    <pre className="text-[#E0E0E6] overflow-x-auto whitespace-pre-wrap leading-relaxed select-all">
                      {JSON.stringify(activeLog.responseBody, null, 2)}
                    </pre>
                  ) : (
                    <div className="py-8 text-center text-[#FFD166] font-mono">
                      No se recibió respuesta o se presentó un error de conexión con la IA. Log en servidor.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#9BA1B1]">
              <Terminal size={48} className="text-[#2D313D] mb-3" />
              <p className="font-display font-bold text-sm text-[#E0E0E6]">Evaluador de StoryCraft</p>
              <p className="text-xs text-[#9BA1B1] max-w-sm mt-1 leading-relaxed">
                Haz clic en una lección, inicia el diagnóstico o envía un texto para ver las peticiones y respuestas JSON nativas en este panel.
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="px-5 py-2.5 bg-[#21242D] border-t border-[#2D313D] flex items-center justify-between text-[11px] text-[#9BA1B1] font-mono select-none">
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={12} className="text-[#06D6A0]" />
          <span>Restricción: Español neutro, sin emojis redundantes. Sin markdown.</span>
        </div>
        <span>model: gemini-3.5-flash</span>
      </div>
    </div>
  );
}
