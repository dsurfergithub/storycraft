/**
 * StoryCraft System Types in Spanish
 */

export type LessonId =
  | 'T1' | 'T2' | 'T3' | 'T4' | 'T5'  // Tronco Común
  | 'F1' | 'F2' | 'F3' | 'F4' | 'F5'  // Ficción
  | 'G1' | 'G2' | 'G3' | 'G4' | 'G5'  // Guion
  | 'M1' | 'M2' | 'M3' | 'M4' | 'M5'; // Marketing

export type RouteType = 'fiction' | 'script' | 'marketing' | 'none';

export interface LessonInfo {
  id: LessonId;
  title: string;
  subtitle: string;
}

export const LESSON_MAP: Record<LessonId, LessonInfo> = {
  T1: { id: 'T1', title: 'Gancho', subtitle: 'Primera frase que genera pregunta' },
  T2: { id: 'T2', title: 'Conflicto', subtitle: 'Deseo vs obstáculo' },
  T3: { id: 'T3', title: 'Punto de vista', subtitle: 'Quién ve, quién cuenta' },
  T4: { id: 'T4', title: 'Mostrar vs contar', subtitle: 'Escena vs resumen' },
  T5: { id: 'T5', title: 'Ritmo', subtitle: 'Alternancia de tensión' },

  F1: { id: 'F1', title: 'Arco de personaje', subtitle: 'Cambio interno' },
  F2: { id: 'F2', title: 'Mundo y atmósfera', subtitle: 'Entorno como personaje' },
  F3: { id: 'F3', title: 'Diálogo literario', subtitle: 'Subtexto' },
  F4: { id: 'F4', title: 'Estructura', subtitle: '3 actos, kishōtenketsu' },
  F5: { id: 'F5', title: 'Voz narrativa', subtitle: 'El estilo como huella' },

  G1: { id: 'G1', title: 'Imagen icónica', subtitle: 'Pensar en plano, no en frase' },
  G2: { id: 'G2', title: 'Diálogo cinematográfico', subtitle: 'Qué se dice vs qué se calla' },
  G3: { id: 'G3', title: 'Escena como unidad', subtitle: 'Entrada tarde, salida pronto' },
  G4: { id: 'G4', title: 'Acto 2 y punto medio', subtitle: 'Evitar que se hunda' },
  G5: { id: 'G5', title: 'Beats y giros', subtitle: 'El ritmo de la sorpresa' },

  M1: { id: 'M1', title: 'Promesa y tensión', subtitle: 'Gancho con stakes reales' },
  M2: { id: 'M2', title: 'Persona-protagonista', subtitle: 'El cliente como héroe' },
  M3: { id: 'M3', title: 'Antes y después', subtitle: 'El cambio como producto' },
  M4: { id: 'M4', title: 'Prueba narrativa', subtitle: 'Testimonios como mini-historias' },
  M5: { id: 'M5', title: 'CTA narrativo', subtitle: 'Cierre que mueve a la acción' },
};

export interface DiagnosticQuestion {
  id: string;
  label: string;
  options: string[];
}

export interface DiagnosticResponse {
  type: 'diagnostic';
  questions: DiagnosticQuestion[];
}

export interface RecommendationResponse {
  type: 'recommendation';
  suggested_route: RouteType;
  reason: string;
  skip_trunk_lessons: LessonId[];
}

export interface LessonResponse {
  type: 'lesson';
  lesson_id: LessonId;
  title: string;
  concept: string;
  key_idea: string;
  why_it_matters: string;
}

export interface ExampleResponse {
  type: 'example';
  lesson_id: LessonId;
  scene: string;
  highlighted_line: string;
  why_it_works: string;
}

export interface ChallengeResponse {
  type: 'challenge';
  lesson_id: LessonId;
  prompt: string;
  constraint: string; // Brief visual instruction (max 150 chars)
  sparks: string[];
}

export interface FeedbackResponse {
  type: 'feedback';
  lesson_id: LessonId;
  works: string; // 1 positive sentence citing the user text
  improve: string; // 1 actionable suggestion
  rewrite_hint: string; // hint, not rewrite
  mastery_score: number;
  passed: boolean;
  next_suggestion: LessonId | 'complete';
}

export interface MilestoneResponse {
  type: 'milestone';
  message: string;
  celebration: string;
  unlock: string;
}

// User state interface
export interface UserState {
  hasCompletedDiagnostic: boolean;
  diagnosticAnswers: Record<string, string>;
  selectedRoute: RouteType;
  completedLessons: LessonId[];
  lessonProgress: Record<LessonId, {
    unlocked: boolean;
    masteryScore?: number;
    userSubmission?: string;
    feedback?: FeedbackResponse;
    completedAt?: string;
  }>;
}
