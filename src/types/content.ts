export type WritingLevel = 1 | 2 | 3;

export type ExerciseType =
  | "categorize"
  | "multiple-choice"
  | "detector-rewrite"
  | "proofreader"
  | "sentence-combiner"
  | "reorder"
  | "builder"
  | "fallacy-spotter"
  | "matcher";

export type LearningProfile = "standard" | "dyslexia" | "adhd" | "low-sensory";

export interface ExerciseOption {
  id: string;
  label: string;
  value?: string;
  category?: string;
}

export interface ExerciseItem {
  id: string;
  prompt: string;
  source?: string;
  target?: string;
  options?: ExerciseOption[];
  correctOptionId?: string;
  correctOptionIds?: string[];
  feedback: string;
  model?: string;
  segments?: ExerciseOption[];
  correctOrder?: string[];
  slots?: Array<{
    id: string;
    label: string;
    correctOptionId: string;
  }>;
  answerLogic?: {
    mustInclude?: string[];
    mustAvoid?: string[];
    minWords?: number;
  };
}

export interface Exercise {
  id: string;
  type: ExerciseType;
  title: string;
  directions: string;
  items: ExerciseItem[];
}

export interface Lesson {
  id: string;
  title: string;
  level: WritingLevel;
  levelLabel: string;
  summary: string;
  principle: {
    ericRule: string;
    lrsRationale: string;
  };
  globalConstraints: string[];
  workedExamples: Array<{
    before: string;
    after: string;
    why: string;
  }>;
  exercises: Exercise[];
  essayTypeTags: string[];
  accessibilityFlags: string[];
  prerequisites: string[];
  evidenceTag: string;
}

export interface EssayBlueprint {
  id: string;
  title: string;
  bestFor: string;
  steps: string[];
  teachMoves: string[];
  practiceScaffold: string;
}
