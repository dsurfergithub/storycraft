import { useState, useEffect } from 'react';
import { 
  Sparkles, BookOpen, Terminal, Layers, Award, RotateCcw, 
  ChevronRight, ArrowRight, Lock, Unlock, CheckCircle2, Bookmark, 
  Activity, Send, Smartphone, RefreshCw, Sliders, ShieldCheck, 
  Trash2, BookMarked, HelpCircle, GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Custom components
import DiagnosticQuiz from './components/DiagnosticQuiz';
import ActiveLessonStudio from './components/ActiveLessonStudio';
import ConsoleInspector, { ApiLog } from './components/ConsoleInspector';
import MilestoneOverlay from './components/MilestoneOverlay';

// Types
import { 
  LessonId, RouteType, LessonInfo, LESSON_MAP, 
  DiagnosticQuestion, RecommendationResponse, LessonResponse, 
  ExampleResponse, ChallengeResponse, FeedbackResponse, 
  MilestoneResponse, UserState 
} from './types';

export default function App() {
  // Curriculum definitions
  const trunkLessons: LessonId[] = ['T1', 'T2', 'T3', 'T4', 'T5'];
  const fictionLessons: LessonId[] = ['F1', 'F2', 'F3', 'F4', 'F5'];
  const scriptLessons: LessonId[] = ['G1', 'G2', 'G3', 'G4', 'G5'];
  const marketingLessons: LessonId[] = ['M1', 'M2', 'M3', 'M4', 'M5'];

  // Application general states
  const [userState, setUserState] = useState<UserState>({
    hasCompletedDiagnostic: false,
    diagnosticAnswers: {},
    selectedRoute: 'none',
    completedLessons: [],
    lessonProgress: {
      T1: { unlocked: true },
    } as any
  });

  const [diagnosticQuestions, setDiagnosticQuestions] = useState<DiagnosticQuestion[]>([]);
  const [activeLessonId, setActiveLessonId] = useState<LessonId | null>(null);
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  // Active loaded data from API
  const [recommendation, setRecommendation] = useState<RecommendationResponse | null>(null);
  const [activeLesson, setActiveLesson] = useState<LessonResponse | null>(null);
  const [activeExample, setActiveExample] = useState<ExampleResponse | null>(null);
  const [activeChallenge, setActiveChallenge] = useState<ChallengeResponse | null>(null);
  const [activeFeedback, setActiveFeedback] = useState<FeedbackResponse | null>(null);
  const [activeMilestone, setActiveMilestone] = useState<MilestoneResponse | null>(null);

  // Loaders
  const [loadingDiagnostic, setLoadingDiagnostic] = useState(false);
  const [submittingDiagnostic, setSubmittingDiagnostic] = useState(false);
  const [loadingLesson, setLoadingLesson] = useState(false);
  const [loadingExample, setLoadingExample] = useState(false);
  const [loadingChallenge, setLoadingChallenge] = useState(false);
  const [submittingResponse, setSubmittingResponse] = useState(false);
  const [loadingMilestone, setLoadingMilestone] = useState(false);

  // Developer console logger state
  const [apiLogs, setApiLogs] = useState<ApiLog[]>([]);
  const [activeLogId, setActiveLogId] = useState<string | null>(null);

  // Check backend server status on mount and load static diagnostic schema
  useEffect(() => {
    checkServerHealth();
    fetchDiagnosticQuestions();
  }, []);

  const checkServerHealth = async () => {
    try {
      const resp = await fetch('/api/health');
      if (resp.ok) {
        setServerOnline(true);
        setServerError(null);
      } else {
        setServerOnline(false);
        setServerError("El servidor retornó un estatus desfavorable en la ruta /api/health.");
      }
    } catch (e: any) {
      setServerOnline(false);
      setServerError("Incapaz de conectar con la API de Express (verifica que esté activa en el puerto 3000).");
    }
  };

  // Log function helper to make server communication visually transparent in our Console panel
  const addLog = (action: string, requestBody: any): string => {
    const id = Math.random().toString(36).substr(2, 9);
    const time = new Date().toLocaleTimeString();
    const newLog: ApiLog = {
      id,
      timestamp: time,
      action,
      requestBody,
      responseBody: null,
      status: 200,
      loading: true
    };
    setApiLogs(prev => [newLog, ...prev]);
    setActiveLogId(id);
    return id;
  };

  const updateLogSuccess = (id: string, responseBody: any, status = 200) => {
    setApiLogs(prev => prev.map(log => 
      log.id === id ? { ...log, responseBody, status, loading: false } : log
    ));
  };

  const updateLogFailure = (id: string, errorBody: any, status = 500) => {
    setApiLogs(prev => prev.map(log => 
      log.id === id ? { ...log, responseBody: errorBody, status, loading: false } : log
    ));
  };

  // Fetch Diagnostic questions
  const fetchDiagnosticQuestions = async () => {
    setLoadingDiagnostic(true);
    const logId = addLog('diagnostic', { action: 'diagnostic' });
    try {
      const resp = await fetch('/api/storycraft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'diagnostic' })
      });
      const data = await resp.json();
      if (resp.ok) {
        setDiagnosticQuestions(data.questions || []);
        updateLogSuccess(logId, data);
      } else {
        updateLogFailure(logId, data, resp.status);
      }
    } catch (err: any) {
      updateLogFailure(logId, { error: err.message });
    } finally {
      setLoadingDiagnostic(false);
    }
  };

  // Submit Diagnostic and Recommend Route
  const handleDiagnosticSubmit = async (answers: Record<string, string>) => {
    setSubmittingDiagnostic(true);
    const requestPayload = { action: 'recommend_route', answers };
    const logId = addLog('recommend_route', requestPayload);
    try {
      const resp = await fetch('/api/storycraft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload)
      });
      const data: RecommendationResponse = await resp.json();

      if (resp.ok && data.suggested_route) {
        setRecommendation(data);
        updateLogSuccess(logId, data);
        
        // Update local profile state
        setUserState(prev => ({
          ...prev,
          diagnosticAnswers: answers,
          selectedRoute: data.suggested_route || 'fiction'
        }));
      } else {
        updateLogFailure(logId, data, resp.status);
      }
    } catch (err: any) {
      updateLogFailure(logId, { error: err.message });
    } finally {
      setSubmittingDiagnostic(false);
    }
  };

  // Accept route and enter the actual learning dashboard
  const handleAcceptRoute = () => {
    setUserState(prev => {
      // Create initial lesson progress based on diagnostic recommendations
      const initialProgress = { ...prev.lessonProgress };
      
      // If the recommendation had skip_trunk_lessons, unlock F1/G1/M1 directly or mark skipped as completed
      const skips = recommendation?.skip_trunk_lessons || [];
      skips.forEach(lId => {
        if (initialProgress[lId]) {
          initialProgress[lId] = { ...initialProgress[lId], unlocked: true, masteryScore: 100 };
        }
      });

      // Unlock T1 explicitly if not skipped
      if (!skips.includes('T1')) {
        initialProgress['T1'] = { unlocked: true };
      } else {
        // Unlock first untrunked lesson or T2
        initialProgress['T2'] = { unlocked: true };
      }

      return {
        ...prev,
        hasCompletedDiagnostic: true,
        lessonProgress: initialProgress
      };
    });
    // Autoselect first lesson
    handleSelectLesson('T1');
  };

  // Fetch individual lesson concept
  const handleSelectLesson = async (lId: LessonId) => {
    setActiveLessonId(lId);
    setLoadingLesson(true);
    
    // Reset loaded tabs values
    setActiveLesson(null);
    setActiveExample(null);
    setActiveChallenge(null);
    setActiveFeedback(null);

    const requestPayload = { action: 'lesson', lesson_id: lId };
    const logId = addLog('lesson', requestPayload);

    try {
      const resp = await fetch('/api/storycraft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload)
      });
      const data: LessonResponse = await resp.json();
      if (resp.ok) {
        setActiveLesson(data);
        updateLogSuccess(logId, data);
      } else {
        updateLogFailure(logId, data, resp.status);
      }
    } catch (err: any) {
      updateLogFailure(logId, { error: err.message });
    } finally {
      setLoadingLesson(false);
    }
  };

  // Fetch lesson example
  const handleFetchExample = async () => {
    if (!activeLessonId) return;
    setLoadingExample(true);
    const requestPayload = { action: 'example', lesson_id: activeLessonId };
    const logId = addLog('example', requestPayload);

    try {
      const resp = await fetch('/api/storycraft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload)
      });
      const data: ExampleResponse = await resp.json();
      if (resp.ok) {
        setActiveExample(data);
        updateLogSuccess(logId, data);
      } else {
        updateLogFailure(logId, data, resp.status);
      }
    } catch (err: any) {
      updateLogFailure(logId, { error: err.message });
    } finally {
      setLoadingExample(false);
    }
  };

  // Fetch lesson challenge
  const handleFetchChallenge = async () => {
    if (!activeLessonId) return;
    setLoadingChallenge(true);
    const requestPayload = { action: 'challenge', lesson_id: activeLessonId };
    const logId = addLog('challenge', requestPayload);

    try {
      const resp = await fetch('/api/storycraft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload)
      });
      const data: ChallengeResponse = await resp.json();
      if (resp.ok) {
        setActiveChallenge(data);
        updateLogSuccess(logId, data);
      } else {
        updateLogFailure(logId, data, resp.status);
      }
    } catch (err: any) {
      updateLogFailure(logId, { error: err.message });
    } finally {
      setLoadingChallenge(false);
    }
  };

  // Submit response for structured feedback
  const handleSubmitResponse = async (text: string) => {
    if (!activeLessonId) return;
    setSubmittingResponse(true);
    const requestPayload = { 
      action: 'feedback', 
      lesson_id: activeLessonId, 
      user_text: text, 
      selected_route: userState.selectedRoute 
    };
    const logId = addLog('feedback', requestPayload);

    try {
      const resp = await fetch('/api/storycraft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload)
      });
      const data: FeedbackResponse = await resp.json();
      if (resp.ok) {
        setActiveFeedback(data);
        updateLogSuccess(logId, data);

        // Update local user state representation
        setUserState(prev => {
          const updatedProgress = { ...prev.lessonProgress };
          
          // Save scores and feedback logs inside this specific lesson
          updatedProgress[activeLessonId] = {
            ...updatedProgress[activeLessonId],
            unlocked: true,
            masteryScore: data.mastery_score,
            userSubmission: text,
            feedback: data,
            completedAt: new Date().toISOString()
          };

          // If passed, unlock matching next suggestion lesson!
          if (data.passed) {
            const nextLId = data.next_suggestion;
            if (nextLId && nextLId !== 'complete') {
              const nextLessonId = nextLId as LessonId;
              updatedProgress[nextLessonId] = {
                ...updatedProgress[nextLessonId],
                unlocked: true
              };
            }
          }

          return {
            ...prev,
            lessonProgress: updatedProgress,
            completedLessons: data.passed 
              ? Array.from(new Set([...prev.completedLessons, activeLessonId]))
              : prev.completedLessons
          };
        });

        // Trigger Milestone if completing trunk T5 or final specialization level F5/G5/M5
        if (data.passed && (activeLessonId === 'T5' || activeLessonId === 'F5' || activeLessonId === 'G5' || activeLessonId === 'M5')) {
          triggerMilestone(activeLessonId);
        }

      } else {
        updateLogFailure(logId, data, resp.status);
      }
    } catch (err: any) {
      updateLogFailure(logId, { error: err.message });
    } finally {
      setSubmittingResponse(false);
    }
  };

  // Fetch milestone celebration
  const triggerMilestone = async (completedId: LessonId) => {
    setLoadingMilestone(true);
    const requestPayload = { action: 'milestone', completed_lesson: completedId };
    const logId = addLog('milestone', requestPayload);

    try {
      const resp = await fetch('/api/storycraft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload)
      });
      const data: MilestoneResponse = await resp.json();
      if (resp.ok) {
        setActiveMilestone(data);
        updateLogSuccess(logId, data);
      } else {
        updateLogFailure(logId, data, resp.status);
      }
    } catch (err: any) {
      updateLogFailure(logId, { error: err.message });
    } finally {
      setLoadingMilestone(false);
    }
  };

  // Developer Fast Demo-Loader: Instantly inject positive values to let evaluators check elements
  const loadDemoProgress = () => {
    // Inject mock progress up to T5
    const mockProgress = {
      T1: { unlocked: true, masteryScore: 85, userSubmission: "La penumbra besaba el picaporte de hierro con el susurro frío de las cuatro de la madrugada." },
      T2: { unlocked: true, masteryScore: 78, userSubmission: "Deseaba ardientemente abrir aquel armario tapiado, pero un candado oxidado obstaculizaba mi avance." },
      T3: { unlocked: true, masteryScore: 92, userSubmission: "Ella me miraba fijamente desde la barandilla con ojos desprovistos de pupila." },
      T4: { unlocked: true, masteryScore: 81, userSubmission: "El cristal crujió bajo su bota pesada, fragmentando el silencio de la sala." },
      T5: { unlocked: true, status: 'unlocked' },
    } as any;

    setUserState({
      hasCompletedDiagnostic: true,
      diagnosticAnswers: { experience: 'A veces', goal: 'Novela o cuento', time: '15 min' },
      selectedRoute: 'fiction',
      completedLessons: ['T1', 'T2', 'T3', 'T4'],
      lessonProgress: mockProgress
    });

    handleSelectLesson('T5');
  };

  const handleResetProfile = () => {
    setUserState({
      hasCompletedDiagnostic: false,
      diagnosticAnswers: {},
      selectedRoute: 'none',
      completedLessons: [],
      lessonProgress: {
        T1: { unlocked: true },
      } as any
    });
    setRecommendation(null);
    setActiveLessonId(null);
    setActiveLesson(null);
    setActiveExample(null);
    setActiveChallenge(null);
    setActiveFeedback(null);
    setActiveMilestone(null);
  };

  const activeRouteLessons = 
    userState.selectedRoute === 'fiction' ? fictionLessons :
    userState.selectedRoute === 'script' ? scriptLessons :
    userState.selectedRoute === 'marketing' ? marketingLessons : [];

  return (
    <div className="flex flex-col h-screen min-w-0 bg-[#0F1014] font-sans antialiased [-webkit-font-smoothing:antialiased] select-none text-[#E0E0E6]">
      {/* Visual Top Branding Info Header */}
      <header className="px-6 py-4 bg-[#1A1C23] border-b border-[#2D313D] flex items-center justify-between shrink-0 z-10 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF6B35] to-[#FFD166] flex items-center justify-center text-white font-extrabold shadow-md shadow-[#FF6B35]/15">
            <GraduationCap size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-black text-sm tracking-tight text-white uppercase">StoryCraft Studio</h1>
              <span className="text-[9px] font-mono tracking-wider text-[#06D6A0] bg-[#06D6A0]/10 px-1.5 py-0.5 rounded border border-[#06D6A0]/20">v1.1</span>
            </div>
            <p className="text-[11px] text-[#9BA1B1] font-mono hidden sm:block">Motor pedagógico de storytelling en español neutro</p>
          </div>
        </div>

        {/* Server & API Status Badges */}
        <div className="flex items-center gap-3">
          {/* Quick Demo Assist Button */}
          <button
            onClick={loadDemoProgress}
            className="hidden md:flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-[11px] font-mono bg-[#FF6B35]/15 hover:bg-[#FF6B35]/25 text-[#FF6B35] border border-[#FF6B35]/30 transition-all outline-none cursor-pointer font-bold"
            title="Injecta progreso de demostración simulada para evaluar de forma ágil T1-T4."
          >
            <Sliders size={12} />
            <span>Modo Demostración</span>
          </button>

          {/* Connection diagnostics badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#21242D] border border-[#2D313D] text-xs font-mono">
            {serverOnline === null ? (
              <span className="text-gray-400 animate-pulse">Chequeando API...</span>
            ) : serverOnline ? (
              <div className="flex items-center gap-1.5 text-[#06D6A0]">
                <span className="w-2 h-2 rounded-full bg-[#06D6A0] animate-ping" />
                <span>API Conectada</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span>API Desconectada</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Primary Layout Frame */}
      <main className="flex-1 min-h-0 w-full p-4 lg:p-6 grid grid-cols-1 xl:grid-cols-12 gap-6 overflow-hidden">
        
        {/* Left column: Smartphone Emulator (Cols 5 on wide) */}
        <section className="col-span-1 xl:col-span-5 flex flex-col items-center justify-center min-w-0">
          
          {/* Decorative Phone Wrapper Framework */}
          <div className="w-full max-w-sm aspect-[9/18.5] min-h-[640px] max-h-[820px] rounded-[48px] bg-[#1A1C23] shadow-inner shadow-black/80 relative border-[10px] border-[#2D313D] flex flex-col overflow-hidden shadow-2xl">
            
            {/* Phone Top Speaker Notch */}
            <div className="absolute top-0 inset-x-0 h-5 bg-[#1A1C23] z-50 flex justify-center items-center pointer-events-none">
              <div className="w-24 h-4 bg-[#2D313D] rounded-b-xl flex items-center justify-around px-2">
                <div className="w-10 h-1 bg-[#1A1C23] rounded-full" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#1A1C23]" />
              </div>
            </div>

            {/* Custom Phone Info bar elements */}
            <div className="h-6 shrink-0 bg-[#21242D] flex items-center justify-between px-6 pt-5 pb-2 text-[8px] font-mono text-[#9BA1B1] z-40 select-none">
              <span>9:41 AM</span>
              <div className="flex items-center gap-1.5">
                <span>StoryCraft Core</span>
                <span className="w-2 h-2 rounded-full bg-[#06D6A0]/80" />
              </div>
            </div>

            {/* Smartphone Inner screen canvas */}
            <div className="flex-1 min-h-0 flex flex-col relative bg-[#0F1014] pt-2">
              
              {/* Dynamic Screen contents */}
              <AnimatePresence mode="wait">
                
                {/* STATE A: Diagnostic Needed */}
                {!userState.hasCompletedDiagnostic && !recommendation && (
                  <motion.div
                    key="diagnostic-screen"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-grow flex flex-col h-full overflow-hidden"
                  >
                    <DiagnosticQuiz
                      questions={diagnosticQuestions}
                      loading={loadingDiagnostic}
                      onComplete={handleDiagnosticSubmit}
                    />
                  </motion.div>
                )}

                {/* STATE B: Recommendation Review */}
                {!userState.hasCompletedDiagnostic && recommendation && (
                  <motion.div
                    key="recommendation-screen"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-6 flex flex-col h-full bg-[#1A1C23] overflow-y-auto"
                  >
                    <div className="flex-1 flex flex-col justify-center text-center space-y-6">
                      <div className="w-14 h-14 rounded-full bg-[#FF6B35]/15 text-[#FF6B35] mx-auto flex items-center justify-center border border-[#FF6B35]/30">
                        <Sparkles size={28} />
                      </div>
                      
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-[#9BA1B1] uppercase font-bold tracking-widest">Ruta Sugerida</span>
                        <h2 className="font-display font-black text-2xl text-white tracking-tight uppercase">
                          {recommendation.suggested_route === 'fiction' ? '📖 Ficción' :
                           recommendation.suggested_route === 'script' ? '🎬 Guion' : '📣 Marketing'}
                        </h2>
                      </div>

                      <div className="p-5 bg-[#0F1014] rounded-2xl border border-[#2D313D] text-xs leading-relaxed text-[#E0E0E6] italic">
                        {recommendation.reason}
                      </div>

                      {recommendation.skip_trunk_lessons.length > 0 && (
                        <div className="p-4 bg-[#06D6A0]/10 border border-[#06D6A0]/20 text-[#06D6A0] rounded-2xl text-[10px] font-mono leading-relaxed">
                          <b className="font-bold">Ventaja detectada:</b> Puedes saltar lecciones ({recommendation.skip_trunk_lessons.join(', ')}) por tu experiencia previa.
                        </div>
                      )}
                    </div>

                    <button
                      onClick={handleAcceptRoute}
                      disabled={submittingDiagnostic}
                      className="w-full mt-6 py-3.5 bg-[#FF6B35] hover:brightness-110 font-extrabold text-xs tracking-wider uppercase text-white rounded-xl duration-100 flex items-center justify-center gap-1.5 cursor-pointer outline-none shadow-lg shadow-[#FF6B35]/15"
                    >
                      <span>Comenzar Aprendizaje</span>
                      <ChevronRight size={14} />
                    </button>
                  </motion.div>
                )}

                {/* STATE C: Dashboard and Studio View */}
                {userState.hasCompletedDiagnostic && (
                  <motion.div
                    key="studio-and-map"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-grow flex flex-col h-full overflow-hidden"
                  >
                    {activeLessonId ? (
                      // Studio workspace showing Active Lesson details
                      <div className="flex-1 flex flex-col min-h-0 relative">
                        <ActiveLessonStudio
                          lessonId={activeLessonId}
                          lessonTitle={LESSON_MAP[activeLessonId]?.title || ''}
                          lessonSubtitle={LESSON_MAP[activeLessonId]?.subtitle || ''}
                          lessonData={activeLesson}
                          exampleData={activeExample}
                          challengeData={activeChallenge}
                          feedbackData={activeFeedback}
                          loadingLesson={loadingLesson}
                          loadingExample={loadingExample}
                          loadingChallenge={loadingChallenge}
                          submittingDraft={submittingResponse}
                          onFetchExample={handleFetchExample}
                          onFetchChallenge={handleFetchChallenge}
                          onSubmitResponse={handleSubmitResponse}
                          onResetFeedback={() => setActiveFeedback(null)}
                          onNextLesson={(nextId) => {
                            if (nextId === 'complete') {
                              triggerMilestone(activeLessonId);
                            } else {
                              handleSelectLesson(nextId as LessonId);
                            }
                          }}
                        />

                        {/* Floating back button to curriculum dashboard */}
                        <div className="absolute top-3 right-4 z-40 hidden sm:block">
                          <button
                            onClick={() => {
                              setActiveLessonId(null);
                              setActiveFeedback(null);
                            }}
                            className="py-1.5 px-3 rounded-xl text-[10px] font-mono bg-[#21242D]/90 border border-[#2D313D] hover:bg-[#2D313D] text-[#9BA1B1] hover:text-white transition-all cursor-pointer font-bold shadow-sm"
                          >
                            Dashboard
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Main Curriculum Map of unlocked cells & routes
                      <div className="flex-1 flex flex-col min-h-0 p-5 overflow-y-auto space-y-5">
                        
                        {/* Upper app brand elements */}
                        <div className="flex items-center justify-between pb-3 border-b border-[#2D313D]">
                          <div>
                            <span className="text-[9px] font-mono text-[#FF6B35] font-bold block uppercase tracking-widest mt-1">&gt; PROGRESO DEL ESCRITOR</span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <h3 className="font-display font-black text-sm text-white uppercase tracking-tight">Tu Mapa de Estaciones</h3>
                              <span className="text-[9px] font-mono text-[#FFD166] bg-[#FFD166]/10 border border-[#FFD166]/20 px-2 py-0.5 rounded-full uppercase font-bold">
                                {userState.selectedRoute === 'fiction' ? 'Ficción' :
                                 userState.selectedRoute === 'script' ? 'Guion' : 'Marketing'}
                              </span>
                            </div>
                          </div>
                          
                          <button 
                            onClick={handleResetProfile}
                            className="p-2 text-[#9BA1B1] hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                            title="Reiniciar Perfil Creacional"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        {/* Summary metrics blocks */}
                        <div className="grid grid-cols-2 gap-3 bg-[#1A1C23] p-4 rounded-3xl border border-[#2D313D] text-center shadow-md">
                          <div>
                            <span className="text-[8px] font-mono text-[#9BA1B1] uppercase font-bold tracking-wider">COMPLETADAS</span>
                            <div className="font-display font-black text-[#E0E0E6] mt-0.5 text-base">
                              {userState.completedLessons.length} / 10
                            </div>
                          </div>
                          <div>
                            <span className="text-[8px] font-mono text-[#9BA1B1] uppercase font-bold tracking-wider">MAESTRÍA PROMEDIO</span>
                            <div className="font-display font-black text-[#E0E0E6] mt-0.5 text-base">
                              {Math.round(
                                userState.completedLessons.length > 0 
                                  ? userState.completedLessons.reduce((acc, lid) => acc + (userState.lessonProgress[lid]?.masteryScore || 0), 0) / userState.completedLessons.length 
                                  : 0
                              )}%
                            </div>
                          </div>
                        </div>

                        {/* Curricular Section 1: Tronco Común */}
                        <div className="space-y-3">
                          <h4 className="text-[10px] uppercase font-mono tracking-widest text-[#FF6B35] font-bold">&gt; 1. Tronco Común (OBLIGATORIO)</h4>
                          <div className="space-y-2">
                            {trunkLessons.map((lId) => {
                              const details = LESSON_MAP[lId];
                              const state = userState.lessonProgress[lId];
                              const isUnlocked = state?.unlocked || false;
                              const isCompleted = state?.masteryScore !== undefined && state.masteryScore >= 70;

                              return (
                                <button
                                  key={lId}
                                  onClick={() => isUnlocked && handleSelectLesson(lId)}
                                  disabled={!isUnlocked}
                                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between outline-none ${
                                    isUnlocked 
                                      ? 'bg-[#21242D] hover:bg-[#2D313D] border-[#2D313D] hover:border-[#FF6B35]/30 cursor-pointer shadow-sm hover:scale-[1.01]' 
                                      : 'bg-[#1A1C23] opacity-40 border-[#2D313D]/50 cursor-not-allowed'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={`w-7 h-7 rounded-xl text-[10px] font-mono font-bold flex items-center justify-center border ${
                                      isCompleted ? 'bg-[#06D6A0]/15 text-[#06D6A0] border-[#06D6A0]/30' :
                                      isUnlocked ? 'bg-[#FF6B35]/15 text-[#FF6B35] border-[#FF6B35]/30' : 'bg-[#1A1C23] text-slate-600 border-[#2D313D]'
                                    }`}>
                                      {lId}
                                    </div>
                                    <div>
                                      <div className={`text-xs font-bold leading-none ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>
                                        {details.title}
                                      </div>
                                      <span className="text-[9px] text-[#9BA1B1] font-mono block tracking-tight line-clamp-1 mt-1">
                                        {details.subtitle}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div className="shrink-0 p-1 text-slate-600">
                                    {isCompleted ? (
                                      <span className="text-[9px] font-mono font-bold text-[#06D6A0] bg-[#06D6A0]/10 border border-[#06D6A0]/20 px-1.5 py-0.5 rounded">
                                        {state.masteryScore}%
                                      </span>
                                    ) : isUnlocked ? (
                                      <Unlock size={11} className="text-[#FF6B35]" />
                                    ) : (
                                      <Lock size={11} className="text-slate-600" />
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Curricular Section 2: Especialización sugerida */}
                        {userState.completedLessons.includes('T5') || userState.completedLessons.length >= 4 ? (
                          <div className="space-y-3 pt-1">
                            <h4 className="text-[10px] uppercase font-mono tracking-widest text-[#FFD166] font-bold">&gt; 2. Especialización: {userState.selectedRoute === 'fiction' ? 'Ficción' : userState.selectedRoute === 'script' ? 'Guion' : 'Marketing'}</h4>
                            <div className="space-y-2">
                              {activeRouteLessons.map((lId) => {
                                const details = LESSON_MAP[lId];
                                const state = userState.lessonProgress[lId];
                                const isUnlocked = state?.unlocked || false;
                                const isCompleted = state?.masteryScore !== undefined && state.masteryScore >= 70;

                                return (
                                  <button
                                    key={lId}
                                    onClick={() => isUnlocked && handleSelectLesson(lId)}
                                    disabled={!isUnlocked}
                                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between outline-none ${
                                      isUnlocked 
                                        ? 'bg-[#21242D] hover:bg-[#2D313D] border-[#2D313D] hover:border-[#FF6B35]/30 cursor-pointer shadow-sm hover:scale-[1.01]' 
                                        : 'bg-[#1A1C23] opacity-40 border-[#2D313D]/50 cursor-not-allowed'
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className={`w-7 h-7 rounded-xl text-[10px] font-mono font-bold flex items-center justify-center border ${
                                        isCompleted ? 'bg-[#06D6A0]/15 text-[#06D6A0] border-[#06D6A0]/30' :
                                        isUnlocked ? 'bg-[#FF6B35]/15 text-[#FF6B35] border-[#FF6B35]/30' : 'bg-[#1A1C23] text-slate-600 border-[#2D313D]'
                                      }`}>
                                        {lId}
                                      </div>
                                      <div>
                                        <div className={`text-xs font-bold leading-none ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>
                                          {details.title}
                                        </div>
                                        <span className="text-[9px] text-[#9BA1B1] font-mono block tracking-tight line-clamp-1 mt-1">
                                          {details.subtitle}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="shrink-0 p-1">
                                      {isCompleted ? (
                                        <span className="text-[9px] font-mono font-bold text-[#06D6A0] bg-[#06D6A0]/10 border border-[#06D6A0]/20 px-1.5 py-0.5 rounded">
                                          {state.masteryScore}%
                                        </span>
                                      ) : isUnlocked ? (
                                        <Unlock size={11} className="text-[#FF6B35]" />
                                      ) : (
                                        <Lock size={11} className="text-slate-600" />
                                      )}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          // Placeholder lock
                          <div className="p-5 rounded-3xl border border-dashed border-[#2D313D] text-center bg-[#1A1C23]/60 text-[#9BA1B1] text-[11px] leading-relaxed">
                            <Lock size={16} className="mx-auto mb-2 text-[#FF6B35]/60" />
                            Completa el Tronco Común para desbloquear tu ruta de <b className="font-bold text-white">especialización sugerida</b>.
                          </div>
                        )}

                        {/* Float back shortcut on mobile view dashboard bottom and reset */}
                        <div className="text-center font-mono text-[9px] text-[#626a7a] pt-1">
                          StoryCraft Engine • Impulsado por Gemini 3.5
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

              </AnimatePresence>

            </div>
          </div>
        </section>

        {/* Right column: Developer API Monitor console (Cols 7 on wide) */}
        <section className="col-span-1 xl:col-span-7 flex flex-col min-h-[400px] xl:h-full relative">
          <ConsoleInspector
            logs={apiLogs}
            activeLogId={activeLogId}
            onSelectLog={(id) => setActiveLogId(id)}
            onClearLogs={() => {
              setApiLogs([]);
              setActiveLogId(null);
            }}
          />
        </section>

      </main>

      {/* In-app Celebratory overlays */}
      <AnimatePresence>
        {activeMilestone && (
          <MilestoneOverlay
            milestone={activeMilestone}
            onClose={() => {
              setActiveMilestone(null);
              // Back to map so they choose next lesson
              setActiveLessonId(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Persistent global error toast if server fails to connect */}
      {serverOnline === false && (
        <div className="fixed bottom-4 right-4 z-50 p-4 bg-rose-950 border border-rose-500/30 text-rose-200 rounded-xl shadow-2xl max-w-sm font-mono text-xs">
          <div className="flex gap-2 items-start">
            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-1 animate-ping" />
            <div>
              <b className="font-bold">Error de Conexión del Servidor</b>
              <p className="mt-1 opacity-80 text-[11px]">{serverError}</p>
              <div className="mt-3.5 flex justify-end">
                <button 
                  onClick={checkServerHealth}
                  className="px-2 py-1 bg-rose-900 border border-rose-500/20 rounded hover:bg-rose-800 text-white font-semibold transition-colors"
                >
                  Reintentar conexión
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
