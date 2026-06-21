import blueprintsData from "@/content/essayBlueprints.json";
import lessonsData from "@/content/lessons.json";
import type { EssayBlueprint, ExerciseType, Lesson, WritingLevel } from "@/types/content";

export const lessons = lessonsData as Lesson[];
export const essayBlueprints = blueprintsData as EssayBlueprint[];

export const levelLabels: Record<WritingLevel, string> = {
  1: "Foundational",
  2: "Intermediate",
  3: "Advanced"
};

export const exerciseTypeLabels: Record<ExerciseType, string> = {
  "categorize": "Categorize",
  "multiple-choice": "Targeted choice",
  "detector-rewrite": "Detect + rewrite",
  "proofreader": "Proofread",
  "sentence-combiner": "Sentence combine",
  "reorder": "Reorder",
  "builder": "Builder",
  "fallacy-spotter": "Fallacy spotter",
  "matcher": "Match"
};

export const globalRuleSet = [
  "Avoid passive voice when the actor matters",
  "Avoid second person in academic prose",
  "Avoid contractions",
  "Avoid nominalizations when they bury action",
  "Avoid hedging and vague intensifiers",
  "Use precise active verbs",
  "Preserve authentic voice",
  "Bold every changed word during revision",
  "Explain every revision"
];

export const evidenceCards = [
  {
    title: "Generative practice first",
    value: "Sentence combining",
    note: "The MVP favors combining, rewriting, and reordering over isolated grammar drills."
  },
  {
    title: "Strategy routines",
    value: "AXES + checklist",
    note: "Practice makes the planning and revision strategy visible before students draft alone."
  },
  {
    title: "Spaced review ready",
    value: "Review dates",
    note: "Mastered principles receive a local next-review date so Phase 2 can add retrieval scheduling."
  },
  {
    title: "Neurodivergent-friendly",
    value: "Calm controls",
    note: "Typography, spacing, contrast, and motion controls are available from the first screen."
  }
];

export function getLessonById(id: string) {
  return lessons.find((lesson) => lesson.id === id) ?? lessons[0];
}

export function getBlueprintById(id: string) {
  return essayBlueprints.find((blueprint) => blueprint.id === id) ?? essayBlueprints[0];
}

export function getLessonExerciseTypes(lesson: Lesson) {
  return Array.from(new Set(lesson.exercises.map((exercise) => exercise.type)));
}

export function getAllExerciseTypes() {
  return Array.from(new Set(lessons.flatMap((lesson) => getLessonExerciseTypes(lesson))));
}
