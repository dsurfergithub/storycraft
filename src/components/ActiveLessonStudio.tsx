import { useState, useEffect } from 'react';
import { 
  BookOpen, Sparkles, CheckCircle2, ChevronRight, AlertCircle, 
  CornerDownRight, RotateCcw, ArrowRight, Lightbulb, PlayCircle, Award, 
  HelpCircle, Copy, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LessonId, LessonResponse, ExampleResponse, ChallengeResponse, FeedbackResponse } from '../types';

interface ActiveLessonStudioProps {
  lessonId: LessonId;
  lessonTitle: string;
  lessonSubtitle: string;
  // AI-generated inputs
  lessonData: LessonResponse | null;
  exampleData: ExampleResponse | null;
  challengeData: ChallengeResponse | null;
  feedbackData: FeedbackResponse | null;
  
  // Loading states
  loadingLesson: boolean;
  loadingExample: boolean;
  loadingChallenge: boolean;
  submittingDraft: boolean;

  // Actions
  onFetchExample: () => void;
  onFetchChallenge: () => void;
  onSubmitResponse: (text: string) => void;
  onResetFeedback: () => void;
  onNextLesson: (nextId: string) => void;
}

export default function ActiveLessonStudio({
  lessonId,
  lessonTitle,
  lessonSubtitle,
  lessonData,
  exampleData,
  challengeData,
  feedbackData,
  loadingLesson,
  loadingExample,
  loadingChallenge,
  submittingDraft,
  onFetchExample,
  onFetchChallenge,
  onSubmitResponse,
  onResetFeedback,
  onNextLesson
}: ActiveLessonStudioProps) {
  const [activeTab, setActiveTab] = useState<'concept' | 'example' | 'challenge' | 'feedback'>('concept');
  const [draftText, setDraftText] = useState('');
  const [selectedSpark, setSelectedSpark] = useState<string | null>(null);
  const [copiedSparkIdx, setCopiedSparkIdx] = useState<number | null>(null);

  // Auto-switch tabs based on data arrivals or resets
  useEffect(() => {
    if (feedbackData) {
      setActiveTab('feedback');
    } else {
      setActiveTab('concept');
    }
    // Load previously drafted or clear
    setDraftText('');
    setSelectedSpark(null);
  }, [lessonId, feedbackData]);

  // Handle character limits dynamically
  const charCount = draftText.length;
  const wordCount = draftText.trim() === '' ? 0 : draftText.trim().split(/\s+/).length;

  const handleSparkClick = (spark: string, idx: number) => {
    setSelectedSpark(spark);
    // Paste hint or let them copy it
    setDraftText(prev => prev ? `${prev} ${spark}` : spark);
    setCopiedSparkIdx(idx);
    setTimeout(() => setCopiedSparkIdx(null), 1500);
  };

  const handleSubmit = () => {
    if (draftText.trim().length >= 5) {
      onSubmitResponse(draftText);
    }
  };

  const handleRetry = () => {
    // Keeps text so user can implement feedback immediately
    onResetFeedback();
    setActiveTab('challenge');
  };

  // Helper to split a scene based on highlighted text line for gorgeous highlighting
  const renderHighlightedScene = (scene: string, highlight: string) => {
    if (!highlight || !scene.includes(highlight)) {
      return <p className="text-slate-200 leading-relaxed font-sans">{scene}</p>;
    }
    const parts = scene.split(highlight);
    return (
      <p className="text-slate-200 leading-relaxed font-sans italic">
        {parts[0]}
        <span className="bg-[#FF6B35]/15 text-[#FF6B35] font-semibold border-b border-[#FF6B35]/30 px-1 py-0.5 rounded not-italic">
          {highlight}
        </span>
        {parts[1]}
      </p>
    );
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#0F1014]">
      {/* Mobile-friendly Studio Header */}
      <div className="px-5 py-3.5 bg-[#1A1C23] border-b border-[#2D313D] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#FF6B35]/20 text-[#FF6B35] border border-[#FF6B35]/30 flex items-center justify-center font-bold text-xs">
            {lessonId}
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider font-mono text-[#9BA1B1] font-bold">Estudio Creativo</div>
            <h2 className="font-display font-black text-sm text-white tracking-tight leading-tight">{lessonTitle}</h2>
          </div>
        </div>

        {/* Tab Selection Navigation */}
        <div className="hidden sm:flex items-center gap-1.5 bg-[#0F1014] p-1.5 rounded-xl border border-[#2D313D]">
          <button
            onClick={() => setActiveTab('concept')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all outline-none cursor-pointer ${
              activeTab === 'concept' ? 'bg-[#2D313D] text-[#FF6B35] font-bold border border-[#3A3F4E]' : 'text-[#9BA1B1] hover:text-white'
            }`}
          >
            Concepto
          </button>
          <button
            onClick={() => {
              if (exampleData) setActiveTab('example');
              else onFetchExample();
            }}
            disabled={loadingLesson}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all outline-none cursor-pointer ${
              activeTab === 'example' ? 'bg-[#2D313D] text-[#FF6B35] font-bold border border-[#3A3F4E]' : 'text-[#9BA1B1] hover:text-white'
            }`}
          >
            Ejemplo
          </button>
          <button
            onClick={() => {
              if (challengeData) setActiveTab('challenge');
              else onFetchChallenge();
            }}
            disabled={loadingLesson}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all outline-none cursor-pointer ${
              activeTab === 'challenge' ? 'bg-[#2D313D] text-[#FF6B35] font-bold border border-[#3A3F4E]' : 'text-[#9BA1B1] hover:text-white'
            }`}
          >
            Desafío
          </button>
          {feedbackData && (
            <button
              onClick={() => setActiveTab('feedback')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all outline-none cursor-pointer ${
                activeTab === 'feedback' ? 'bg-[#2D313D] text-[#FF6B35] font-bold border border-[#3A3F4E]' : 'text-[#9BA1B1] hover:text-white'
              }`}
            >
              Feedback
            </button>
          )}
        </div>
      </div>

      {/* Progress timeline strictly matching mobile tab styling */}
      <div className="sm:hidden grid grid-cols-4 bg-[#1A1C23] border-b border-[#2D313D] py-2 text-center text-[10px] font-mono shrink-0">
        <button
          onClick={() => setActiveTab('concept')}
          className={`pb-1 ${activeTab === 'concept' ? 'text-[#FF6B35] font-bold border-b-2 border-[#FF6B35]' : 'text-[#9BA1B1]'}`}
        >
          Concepto
        </button>
        <button
          onClick={() => { if (exampleData) setActiveTab('example'); else onFetchExample(); }}
          className={`pb-1 ${activeTab === 'example' ? 'text-[#FF6B35] font-bold border-b-2 border-[#FF6B35]' : 'text-[#9BA1B1]'}`}
        >
          Ejemplo
        </button>
        <button
          onClick={() => { if (challengeData) setActiveTab('challenge'); else onFetchChallenge(); }}
          className={`pb-1 ${activeTab === 'challenge' ? 'text-[#FF6B35] font-bold border-b-2 border-[#FF6B35]' : 'text-[#9BA1B1]'}`}
        >
          Desafío
        </button>
        <button
          onClick={() => { if (feedbackData) setActiveTab('feedback'); }}
          disabled={!feedbackData}
          className={`pb-1 ${activeTab === 'feedback' ? 'text-[#06D6A0] font-bold border-b-2 border-[#06D6A0]' : 'text-[#9BA1B1] disabled:opacity-40'}`}
        >
          Evaluar
        </button>
      </div>

      {/* Content Container (Scrollable viewport mimicking a mobile view) */}
      <div className="flex-1 overflow-y-auto p-5 md:p-6">
        <AnimatePresence mode="wait">
          
          {/* 1. CONCEPT TAB */}
          {activeTab === 'concept' && (
            <motion.div
              key="concept"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {loadingLesson ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2">
                  <div className="w-6 h-6 border-2 border-[#FF6B35] border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-[#9BA1B1] font-mono">Invocando a StoryCraft...</span>
                </div>
              ) : lessonData ? (
                <>
                  {/* Title cards */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-[#FF6B35] tracking-widest font-bold uppercase">&gt; LECCIÓN DE STORYTELLING</span>
                    <h1 className="font-display font-black text-2xl text-white tracking-tight uppercase">{lessonData.title}</h1>
                    <p className="text-xs text-[#9BA1B1] font-mono">{lessonSubtitle}</p>
                  </div>

                  {/* Concept main box */}
                  <div className="p-6 bg-[#1A1C23] rounded-3xl border border-[#2D313D] space-y-3 shadow-md relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                      <span className="text-8xl font-black italic text-white">{lessonId}</span>
                    </div>
                    <h4 className="text-[11px] font-mono tracking-widest text-[#9BA1B1] uppercase font-bold">Concepto Técnico</h4>
                    <p className="text-base text-[#E0E0E6] leading-relaxed font-normal">
                      {lessonData.concept}
                    </p>
                  </div>

                  {/* Key Idea highlighted with special blockquote layout */}
                  <div className="bg-[#FF6B35]/10 border-l-4 border-[#FF6B35] p-4.5 rounded-r-2xl">
                    <span className="text-[9px] font-mono text-[#FF6B35] tracking-widest uppercase block mb-1 font-bold">IDEA MENTORA</span>
                    <p className="font-display font-bold text-[#E0E0E6] text-sm italic">
                      “{lessonData.key_idea}”
                    </p>
                  </div>

                  {/* Why it matters card */}
                  <div className="p-5 bg-[#21242D] rounded-3xl border border-[#2D313D] flex gap-3">
                    <div className="mt-1 text-[#FF6B35] shrink-0">
                      <Lightbulb size={16} />
                    </div>
                    <div>
                      <h5 className="text-[11px] font-mono text-white font-bold uppercase tracking-wider mb-0.5">Por qué marca la diferencia</h5>
                      <p className="text-xs text-[#9BA1B1] leading-relaxed">
                        {lessonData.why_it_matters}
                      </p>
                    </div>
                  </div>

                  {/* CTA button and step indicator */}
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        if (exampleData) setActiveTab('example');
                        else onFetchExample();
                      }}
                      className="w-full py-3.5 px-4 bg-[#FF6B35] hover:brightness-110 active:scale-[0.98] transition-all rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 group cursor-pointer shadow-lg shadow-[#FF6B35]/10"
                    >
                      <span>{exampleData ? "Ver ejemplo literario" : "Generar Ejemplo Práctico"}</span>
                      {loadingExample ? (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <ChevronRight size={15} className="group-hover:translate-x-0.5 transition-transform text-white" />
                      )}
                    </button>
                    <div className="text-center text-[10px] font-mono text-[#9BA1B1] mt-2">
                      El aprendizaje constructivo requiere interactuar paso a paso.
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-12 text-center text-[#9BA1B1]">
                  Haz clic para inicializar la lección.
                </div>
              )}
            </motion.div>
          )}

          {/* 2. EXAMPLE TAB */}
          {activeTab === 'example' && (
            <motion.div
              key="example"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {loadingExample ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2">
                  <div className="w-6 h-6 border-2 border-[#FF6B35] border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-[#9BA1B1] font-mono">Elaborando ejemplo óptimo...</span>
                </div>
              ) : exampleData ? (
                <>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-[#FF6B35] tracking-widest font-bold uppercase">&gt; EJEMPLO DE APLICACIÓN</span>
                    <h1 className="font-display font-black text-xl text-white tracking-tight uppercase">Ejemplo en Acción</h1>
                    <p className="text-xs text-[#9BA1B1] font-mono">Analiza cómo la teoría se convierte en belleza literaria</p>
                  </div>

                  {/* Textbook style example box with selective yellow highlight */}
                  <div className="p-6 bg-[#1A1C23] rounded-3xl border border-[#2D313D] space-y-4 shadow-inner relative">
                    <div className="text-[9px] font-mono text-[#9BA1B1] tracking-widest uppercase font-bold mb-2">Fragmento Escrito</div>
                    <div className="text-sm tracking-wide">
                      {renderHighlightedScene(exampleData.scene, exampleData.highlighted_line)}
                    </div>
                  </div>

                  {/* Highlights identification pane */}
                  <div className="p-5 bg-[#21242D] rounded-3xl border border-[#2D313D] space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#FFD166]">
                      <CheckCircle2 size={14} />
                      <span className="font-bold tracking-wider uppercase font-mono text-[10px]">¿Dónde fijarse? (Frase Clave)</span>
                    </div>
                    <p className="text-xs text-[#E0E0E6] pl-6 italic font-mono bg-[#0F1014] p-3 rounded-xl border border-[#2D313D]">
                      “{exampleData.highlighted_line}”
                    </p>
                    <div className="text-xs text-[#9BA1B1] pl-6 leading-relaxed">
                      <b className="text-white">Por qué funciona:</b> {exampleData.why_it_works}
                    </div>
                  </div>

                  {/* CTA button to challenge */}
                  <button
                    onClick={() => {
                      if (challengeData) setActiveTab('challenge');
                      else onFetchChallenge();
                    }}
                    className="w-full py-3.5 px-4 bg-[#FF6B35] hover:brightness-110 active:scale-[0.98] transition-all rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 group cursor-pointer shadow-lg shadow-[#FF6B35]/10"
                  >
                    <span>{challengeData ? "Ir al Desafío de Escritura" : "Generar Desafío del Maestro"}</span>
                    {loadingChallenge ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform text-white" />
                    )}
                  </button>
                </>
              ) : (
                <div className="py-12 text-center text-[#9BA1B1]">
                  <PlayCircle size={40} className="mx-auto text-[#FF6B35]/20 mb-3" />
                  <p className="text-sm ">No se ha cargado el ejemplo práctico</p>
                  <button
                    onClick={onFetchExample}
                    className="mt-3 px-4 py-1.5 rounded-xl bg-[#FF6B35] text-white text-xs font-bold hover:brightness-110 transition-all cursor-pointer shadow"
                  >
                    Cargar Ejemplo
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* 3. CHALLENGE TAB */}
          {activeTab === 'challenge' && (
            <motion.div
              key="challenge"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {loadingChallenge ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2">
                  <div className="w-6 h-6 border-2 border-[#FF6B35] border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-[#9BA1B1] font-mono">Diseñando desafío exclusivo...</span>
                </div>
              ) : challengeData ? (
                <>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-[#FF6B35] tracking-widest font-bold uppercase">&gt; EL DESAFÍO CREATIVO</span>
                    <h1 className="font-display font-black text-xl text-white tracking-tight uppercase">Es tu turno de escribir</h1>
                    <p className="text-xs text-[#9BA1B1] font-mono">El aprendizaje se consolida con tu puño y letra</p>
                  </div>

                  {/* Prompt instructional block */}
                  <div className="p-6 bg-[#1A1C23] rounded-3xl border border-[#2D313D] space-y-2 relative shadow-md">
                    <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none">
                      <Sparkles size={48} className="text-[#FF6B35]" />
                    </div>
                    <h4 className="text-[11px] font-mono text-[#FF6B35] uppercase tracking-widest font-bold">Consigna de Escritura</h4>
                    <p className="text-sm font-semibold text-[#E0E0E6] leading-relaxed">
                      {challengeData.prompt}
                    </p>
                  </div>

                  {/* Constraint badge line */}
                  <div className="p-4 bg-[#FF6B35]/10 rounded-2xl border border-[#FF6B35]/30 text-[#E0E0E6] flex items-center gap-3">
                    <AlertCircle size={15} className="shrink-0 text-[#FFD166]" />
                    <div className="text-xs font-mono font-medium">
                      <span className="text-[#FFD166] font-bold">RESTRICCIÓN IMPUESTA:</span> {challengeData.constraint}
                    </div>
                  </div>

                  {/* Clickable sparks triggers for writers block */}
                  <div className="space-y-2.5">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-[#9BA1B1] font-bold block">
                      💡 Chispas de Inspiración (Haz clic para copiar al editor)
                    </span>
                    <div className="grid grid-cols-1 gap-2">
                      {challengeData.sparks.map((spark, idx) => {
                        const types = ['Cotidiana', 'Fantástica', 'Oscura/Misterio'];
                        const borderColors = [
                          'border-[#2D313D] text-[#06D6A0] bg-[#06D6A0]/5 hover:border-[#06D6A0]/40',
                          'border-[#2D313D] text-[#FFD166] bg-[#FFD166]/5 hover:border-[#FFD166]/40',
                          'border-[#2D313D] text-[#FF6B35] bg-[#FF6B35]/5 hover:border-[#FF6B35]/40'
                        ];
                        
                        return (
                          <button
                            key={spark}
                            onClick={() => handleSparkClick(spark, idx)}
                            className={`p-4 text-left rounded-2xl border text-xs leading-relaxed transition-all cursor-pointer hover:scale-[1.01] block outline-none ${
                              borderColors[idx] || 'border-[#2D313D] text-slate-300 bg-[#1A1C23]'
                            }`}
                          >
                            <span className="text-[9px] uppercase font-mono tracking-widest font-bold block mb-1 opacity-70">
                              {types[idx]}:
                            </span>
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-[#E0E0E6] font-medium">{spark}</span>
                              <div className="text-[#9BA1B1] shrink-0 mt-0.5">
                                {copiedSparkIdx === idx ? <Check size={12} className="text-[#06D6A0]" /> : <Copy size={12} />}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Rich writing canvas area */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#9BA1B1]">
                      <span>Tu respuesta en español auténtico:</span>
                      <span className="font-bold text-[#E0E0E6]">{charCount} caracteres | {wordCount} palabras</span>
                    </div>

                    <div className="relative">
                      <textarea
                        value={draftText}
                        onChange={(e) => setDraftText(e.target.value)}
                        placeholder="Escribe tu fragmento narrativo aquí..."
                        disabled={submittingDraft}
                        className="w-full min-h-[150px] p-5 bg-[#1A1C23] rounded-3xl border-2 border-[#2D313D] focus:border-[#FF6B35] text-sm md:text-base text-[#E0E0E6] placeholder-slate-600 outline-none leading-relaxed tracking-wide shadow-inner resize-none transition-all focus:ring-1 focus:ring-[#FF6B35]/20"
                      />
                      {charCount === 0 && (
                        <div className="absolute top-5 left-5 pointer-events-none flex gap-1.5 items-center animate-pulse">
                          <span className="text-sm font-mono text-slate-600">Comienza a escribir</span>
                          <span className="w-1.5 h-4.5 bg-[#FF6B35] rounded-sm writing-cursor shrink-0" />
                        </div>
                      )}
                    </div>

                    {charCount > 0 && charCount < 5 && (
                      <div className="text-[10px] font-mono text-rose-400 flex items-center gap-1">
                        <AlertCircle size={10} />
                        <span>Mínimo cinco caracteres exigidos por StoryCraft.</span>
                      </div>
                    )}
                  </div>

                  {/* Submission and loading action buttons */}
                  <div className="pt-2">
                    <button
                      onClick={handleSubmit}
                      disabled={charCount < 5 || submittingDraft}
                      className="w-full py-4 px-4 bg-[#FF6B35] hover:brightness-110 active:scale-[0.98] disabled:scale-100 disabled:opacity-45 disabled:pointer-events-none transition-all rounded-xl text-white font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#FF6B35]/15"
                    >
                      <span>{submittingDraft ? "StoryCraft evaluando tu destreza..." : "Enviar a StoryCraft para Feedback"}</span>
                      {submittingDraft ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </button>
                    <p className="text-center text-[10px] font-mono text-[#9BA1B1] mt-2">
                      El motor evaluará de forma rigurosa tu apego técnico a la consigna.
                    </p>
                  </div>
                </>
              ) : (
                <div className="py-12 text-center text-[#9BA1B1]">
                  Carga el desafío de la lección para comenzar.
                </div>
              )}
            </motion.div>
          )}

          {/* 4. FEEDBACK TAB */}
          {activeTab === 'feedback' && (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {feedbackData ? (
                <>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-[#FF6B35] tracking-widest font-bold uppercase">&gt; RESULTADO DE LA EVALUACIÓN</span>
                    <h1 className="font-display font-black text-xl text-white tracking-tight uppercase">Veredicto de StoryCraft</h1>
                    <p className="text-xs text-[#9BA1B1] font-mono">El criterio constructivo te ayuda a madurar artísticamente</p>
                  </div>

                  {/* Mastery score dial / gauge widget */}
                  <div className="p-6 bg-[#1A1C23] rounded-3xl border border-[#2D313D] flex items-center justify-between gap-5 relative overflow-hidden shadow-md">
                    <div className="space-y-1 z-10">
                      <span className="text-[10px] font-mono text-[#9BA1B1] uppercase font-bold tracking-widest block">NIVEL DE MAESTRÍA</span>
                      <div className="flex items-baseline gap-1.5">
                        <span className={`font-display font-black text-4xl ${feedbackData.passed ? 'text-[#06D6A0]' : 'text-[#FFD166]'}`}>
                          {feedbackData.mastery_score}%
                        </span>
                        <span className="text-xs text-[#9BA1B1]">sobre 100</span>
                      </div>
                      <div className="pt-0.5">
                        <span className={`px-2.5 py-0.5 rounded-full font-mono text-[9px] font-bold ${
                          feedbackData.passed 
                            ? 'bg-[#06D6A0]/10 text-[#06D6A0] border border-[#06D6A0]/20' 
                            : 'bg-[#FFD166]/10 text-[#FFD166] border border-[#FFD166]/20'
                        }`}>
                          {feedbackData.passed ? 'APROBADO' : 'REESCRITURA SUGERIDA'}
                        </span>
                      </div>
                    </div>

                    {/* Simple score bar visuals */}
                    <div className="w-24 h-24 relative flex items-center justify-center bg-[#21242D] rounded-full border-3 border-[#2D313D] shrink-0">
                      <div className="text-center font-display font-bold text-xs text-[#9BA1B1] leading-tight px-2">
                        {feedbackData.passed ? '¡Aprobado!' : 'Prepara lápiz'}
                      </div>
                      <div className={`absolute inset-1.5 rounded-full border-2 border-dashed ${feedbackData.passed ? 'border-[#06D6A0]/30 animate-spin' : 'border-[#FFD166]/30'}`} style={{ animationDuration: '24s' }} />
                    </div>
                  </div>

                  {/* Evaluation points (Works & Improve strictly as requested) */}
                  <div className="space-y-4">
                    
                    {/* What works (positive sentence quoting user) */}
                    <div className="p-5 bg-[#06D6A0]/10 rounded-3xl border border-[#06D6A0]/20 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#06D6A0]">
                        <CheckCircle2 size={14} />
                        <span className="uppercase tracking-widest font-mono text-[10px]">Acierto Técnico Encontrado</span>
                      </div>
                      <p className="text-sm text-[#E0E0E6] leading-relaxed italic">
                        {feedbackData.works}
                      </p>
                    </div>

                    {/* What to improve (actionable advice without rewrites) */}
                    <div className="p-5 bg-[#FFD166]/10 rounded-3xl border border-[#FFD166]/20 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#FFD166]">
                        <HelpCircle size={14} />
                        <span className="uppercase tracking-widest font-mono text-[10px]">Eje de Mejora Pedagógica</span>
                      </div>
                      <p className="text-sm text-[#E0E0E6] leading-relaxed">
                        {feedbackData.improve}
                      </p>
                    </div>

                    {/* Rewrite Hint cluebox */}
                    <div className="p-5 bg-[#21242D] rounded-3xl border border-[#2D313D] flex gap-3">
                      <div className="mt-1 text-[#FF6B35] shrink-0">
                        <Lightbulb size={16} />
                      </div>
                      <div>
                        <h6 className="text-[11px] font-mono text-white font-bold uppercase tracking-wider mb-0.5">Pista para tu Reescritura</h6>
                        <p className="text-xs text-[#9BA1B1] leading-relaxed">
                          {feedbackData.rewrite_hint}
                        </p>
                      </div>
                    </div>

                  </div>

                  {/* Actions depending on Pass status */}
                  <div className="space-y-3 pt-3">
                    {!feedbackData.passed ? (
                      <button
                        onClick={handleRetry}
                        className="w-full py-4 px-4 bg-[#FF6B35] hover:brightness-110 text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow duration-150 active:scale-95 shadow-[#FF6B35]/25"
                      >
                        <RotateCcw size={15} />
                        <span>Reescribir con feedback de StoryCraft</span>
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <button
                          onClick={() => onNextLesson(feedbackData.next_suggestion)}
                          className="w-full py-4 px-4 bg-[#06D6A0] hover:brightness-110 active:scale-[0.98] text-black font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-transform duration-100 font-sans"
                        >
                          <span className="font-bold">Continuar al Siguiente Desafío</span>
                          <ArrowRight size={15} />
                        </button>
                        
                        <button
                          onClick={handleRetry}
                          className="w-full py-2.5 px-4 bg-[#2D313D] hover:bg-[#3A3F4E] border border-[#3A3F4E] text-[#E0E0E6] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer duration-100"
                        >
                          <RotateCcw size={12} className="text-[#9BA1B1]" />
                          <span>Reescribir de todos modos para el 100%</span>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="py-12 text-center text-[#9BA1B1]">
                  Completa tu escrito en la pestaña anterior para obtener evaluación pedagógica en tiempo real.
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
