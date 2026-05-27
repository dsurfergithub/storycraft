import { useState } from 'react';
import { Sparkles, ChevronRight, Activity, Clock, Award, Bookmark } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DiagnosticQuestion, RouteType } from '../types';

interface DiagnosticQuizProps {
  questions: DiagnosticQuestion[];
  loading: boolean;
  onComplete: (answers: Record<string, string>) => void;
}

export default function DiagnosticQuiz({ questions, loading, onComplete }: DiagnosticQuizProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const currentQuestion = questions[currentStep];

  const handleSelectOption = (option: string) => {
    const updatedAnswers = { ...answers, [currentQuestion.id]: option };
    setAnswers(updatedAnswers);

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(updatedAnswers);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (loading && questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center min-h-[350px]">
        <div className="w-8 h-8 border-4 border-[#FF6B35] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-display font-bold text-[#E0E0E6]">Cargando diagnóstico de StoryCraft...</p>
        <p className="text-xs text-[#9BA1B1] mt-1 max-w-xs font-mono">Configurando variables curriculares del motor pedagógico.</p>
      </div>
    );
  }

  // Fallback diagnostic if questions haven't arrived yet
  const fallbackQuestions: DiagnosticQuestion[] = [
    { id: "experience", label: "¿Has escrito ficción o guiones antes?", options: ["Nunca", "A veces", "Mucho"] },
    { id: "goal", label: "¿Cuál es tu objetivo creativo principal?", options: ["Novela o cuento", "Guion", "Contenido de marca", "Solo curiosidad/aprender"] },
    { id: "time", label: "¿Cuánto tiempo al día puedes dedicarle?", options: ["5 min", "15 min", "Más de 15 min"] }
  ];

  const activeQuestions = questions.length > 0 ? questions : fallbackQuestions;
  const question = activeQuestions[currentStep] || fallbackQuestions[0];
  const progressPercent = ((currentStep + 1) / activeQuestions.length) * 100;

  return (
    <div className="p-6 md:p-8 flex flex-col h-full bg-[#1A1C23] rounded-3xl border border-[#2D313D] overflow-y-auto">
      {/* Quiz Progress Indicator */}
      <div className="mb-8 w-full">
        <div className="flex items-center justify-between text-xs text-[#9BA1B1] font-mono mb-2">
          <span className="flex items-center gap-1.5 font-bold text-[#FF6B35]">
            <Sparkles size={13} />
            DIAGNÓSTICO INICIAL {currentStep + 1}/{activeQuestions.length}
          </span>
          <span className="font-bold text-[#E0E0E6]">{Math.round(progressPercent)}%</span>
        </div>
        <div className="w-full h-1.5 bg-[#0F1014] rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ type: 'spring', stiffness: 80 }}
            className="h-full bg-gradient-to-r from-[#FF6B35] to-[#FFD166] rounded-full" 
          />
        </div>
      </div>

      {/* Main Question Animate */}
      <div className="flex-1 flex flex-col justify-center min-h-[200px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="flex flex-col"
          >
            <h3 className="font-display font-black text-lg md:text-xl text-[#E0E0E6] uppercase tracking-tight mb-6 leading-snug">
              {question.label}
            </h3>

            <div className="space-y-3.5 mb-6">
              {question.options.map((option, idx) => {
                const iconMap = [Activity, Clock, Award, Bookmark];
                const ButtonIcon = iconMap[idx % iconMap.length] || Activity;

                return (
                  <button
                    key={option}
                    onClick={() => handleSelectOption(option)}
                    className="w-full text-left p-4 rounded-2xl bg-[#21242D] hover:bg-[#2D313D] border border-[#2D313D] hover:border-[#FF6B35]/50 transition-all duration-200 group flex items-center justify-between shadow-sm outline-none cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-8 h-8 rounded-lg bg-[#0F1014] text-[#FF6B35] group-hover:bg-[#FF6B35]/10 group-hover:text-[#FF6B35] transition-colors flex items-center justify-center">
                        <ButtonIcon size={15} />
                      </div>
                      <span className="text-sm font-semibold text-[#E0E0E6] group-hover:text-white transition-colors">
                        {option}
                      </span>
                    </div>
                    <ChevronRight size={15} className="text-[#9BA1B1] group-hover:text-[#FF6B35] transform group-hover:translate-x-1 transition-all" />
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer controls */}
      <div className="mt-6 pt-5 border-t border-[#2D313D] flex justify-between items-center shrink-0 font-mono text-xs text-[#9BA1B1]">
        {currentStep > 0 ? (
          <button
            onClick={handleBack}
            className="px-3.5 py-1.5 rounded-xl border border-[#2D313D] text-[#E0E0E6] hover:text-white hover:bg-[#2D313D] transition-all cursor-pointer"
          >
            Volver
          </button>
        ) : (
          <span />
        )}
        <span>StoryCraft te guiará al finalizar</span>
      </div>
    </div>
  );
}
