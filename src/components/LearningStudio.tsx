"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  BookOpenCheck,
  CalendarClock,
  CheckCircle2,
  Eye,
  Filter,
  GraduationCap,
  Layers,
  PenLine,
  SlidersHorizontal
} from "lucide-react";
import { ExerciseRenderer } from "@/components/ExerciseRenderer";
import { exerciseTypeLabels, getLessonExerciseTypes, levelLabels } from "@/lib/content";
import type { EssayBlueprint, ExerciseType, LearningProfile, Lesson, WritingLevel } from "@/types/content";

interface LearningStudioProps {
  lessons: Lesson[];
  blueprints: EssayBlueprint[];
  mode: "practice" | "teach";
  initialLessonId?: string;
}

interface ProgressEntry {
  attempts: number;
  mastered: boolean;
  lastPracticed?: string;
  nextReview?: string;
}

type ProgressState = Record<string, ProgressEntry>;

const progressKey = "readerlab-writing-progress";

function formatDate(value?: string) {
  if (!value) return "Not scheduled";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(value));
}

function formatMasteryCount(count: number) {
  return `${count} ${count === 1 ? "principle" : "principles"} mastered`;
}

function markedText(value: string) {
  const pieces = value.split(/(\*\*[^*]+\*\*)/g);
  return pieces.map((piece, index) => {
    if (piece.startsWith("**") && piece.endsWith("**")) {
      return <strong key={`${piece}-${index}`}>{piece.slice(2, -2)}</strong>;
    }
    return <span key={`${piece}-${index}`}>{piece}</span>;
  });
}

export function LearningStudio({ blueprints, initialLessonId, lessons, mode }: LearningStudioProps) {
  const [selectedId, setSelectedId] = useState(initialLessonId ?? lessons[0].id);
  const [levelFilter, setLevelFilter] = useState<"all" | WritingLevel>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | ExerciseType>("all");
  const [blueprintId, setBlueprintId] = useState(blueprints[0].id);
  const [profile, setProfile] = useState<LearningProfile>("standard");
  const [showAnswers, setShowAnswers] = useState(mode === "teach");
  const [progress, setProgress] = useState<ProgressState>({});

  useEffect(() => {
    const lessonParam = new URLSearchParams(window.location.search).get("lesson");
    if (lessonParam && lessons.some((lesson) => lesson.id === lessonParam)) {
      setSelectedId(lessonParam);
    }

    const stored = window.localStorage.getItem(progressKey);
    if (!stored) return;
    try {
      setProgress(JSON.parse(stored));
    } catch {
      setProgress({});
    }
  }, [lessons]);

  useEffect(() => {
    window.localStorage.setItem(progressKey, JSON.stringify(progress));
  }, [progress]);

  const exerciseTypes = useMemo(
    () => Array.from(new Set(lessons.flatMap((lesson) => getLessonExerciseTypes(lesson)))),
    [lessons]
  );

  const selectedBlueprint = useMemo(
    () => blueprints.find((blueprint) => blueprint.id === blueprintId) ?? blueprints[0],
    [blueprintId, blueprints]
  );

  const filteredLessons = useMemo(() => {
    return lessons.filter((lesson) => {
      const matchesLevel = levelFilter === "all" || lesson.level === levelFilter;
      const matchesType = typeFilter === "all" || getLessonExerciseTypes(lesson).includes(typeFilter);
      const matchesBlueprint = mode === "practice" || lesson.essayTypeTags.includes(blueprintId);
      return matchesLevel && matchesType && matchesBlueprint;
    });
  }, [blueprintId, lessons, levelFilter, mode, typeFilter]);

  const selectedLesson = lessons.find((lesson) => lesson.id === selectedId) ?? filteredLessons[0] ?? lessons[0];
  const selectedProgress = progress[selectedLesson.id];
  const masteredCount = lessons.filter((lesson) => progress[lesson.id]?.mastered).length;
  const masteryPercent = Math.round((masteredCount / lessons.length) * 100);

  const markMastered = useCallback((lessonId: string) => {
    setProgress((current) => {
      const attempts = (current[lessonId]?.attempts ?? 0) + 1;
      const nextReview = new Date(Date.now() + 1000 * 60 * 60 * 24 * Math.min(14, 2 + attempts * 2));
      return {
        ...current,
        [lessonId]: {
          attempts,
          mastered: true,
          lastPracticed: new Date().toISOString(),
          nextReview: nextReview.toISOString()
        }
      };
    });
  }, []);

  function startLesson(lessonId: string) {
    setSelectedId(lessonId);
    setProgress((current) => ({
      ...current,
      [lessonId]: {
        attempts: current[lessonId]?.attempts ?? 0,
        mastered: current[lessonId]?.mastered ?? false,
        lastPracticed: new Date().toISOString(),
        nextReview: current[lessonId]?.nextReview
      }
    }));
  }

  return (
    <main className={`studio-page ${mode}`}>
      <section className="studio-top work-surface">
        <div>
          <p className="eyebrow">{mode === "practice" ? "Student practice" : "Live tutoring console"}</p>
          <h1>{mode === "practice" ? "Practice writing principles" : "Teach from the shared engine"}</h1>
          <p>
            {mode === "practice"
              ? "Choose a principle, complete a generative exercise, and build mastery without leaderboards or noise."
              : "Filter by level, essay blueprint, and learning profile; reveal worked examples and answers only when useful."}
          </p>
        </div>
        <div className="progress-panel" aria-label="Progress summary">
          <span className="progress-ring" style={{ "--progress": `${masteryPercent}%` } as React.CSSProperties}>
            {masteryPercent}%
          </span>
          <div>
            <strong>{formatMasteryCount(masteredCount)}</strong>
            <p>Next review: {formatDate(selectedProgress?.nextReview)}</p>
          </div>
        </div>
      </section>

      <section className="studio-layout">
        <aside className="lesson-sidebar" aria-label="Lesson filters and list">
          <div className="filter-panel">
            <div className="filter-title">
              <Filter aria-hidden="true" />
              <strong>Filters</strong>
            </div>
            <label>
              Level
              <select
                value={levelFilter}
                onChange={(event) =>
                  setLevelFilter(event.target.value === "all" ? "all" : (Number(event.target.value) as WritingLevel))
                }
              >
                <option value="all">All levels</option>
                <option value={1}>Foundational</option>
                <option value={2}>Intermediate</option>
                <option value={3}>Advanced</option>
              </select>
            </label>
            <label>
              Exercise type
              <select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value as "all" | ExerciseType)}
              >
                <option value="all">All exercise types</option>
                {exerciseTypes.map((type) => (
                  <option key={type} value={type}>
                    {exerciseTypeLabels[type]}
                  </option>
                ))}
              </select>
            </label>
            {mode === "teach" ? (
              <>
                <label>
                  Essay blueprint
                  <select value={blueprintId} onChange={(event) => setBlueprintId(event.target.value)}>
                    {blueprints.map((blueprint) => (
                      <option key={blueprint.id} value={blueprint.id}>
                        {blueprint.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Student profile
                  <select value={profile} onChange={(event) => setProfile(event.target.value as LearningProfile)}>
                    <option value="standard">Standard</option>
                    <option value="dyslexia">Dyslexia</option>
                    <option value="adhd">ADHD</option>
                    <option value="low-sensory">Low-sensory</option>
                  </select>
                </label>
              </>
            ) : null}
          </div>

          <div className="lesson-list" aria-label="Writing principles">
            {filteredLessons.map((lesson) => {
              const isSelected = lesson.id === selectedLesson.id;
              const isMastered = progress[lesson.id]?.mastered;
              return (
                <button
                  aria-current={isSelected ? "true" : undefined}
                  className={isSelected ? "selected" : ""}
                  key={lesson.id}
                  onClick={() => startLesson(lesson.id)}
                  type="button"
                >
                  <span>
                    <strong>{lesson.title}</strong>
                    <small>
                      Level {lesson.level}: {lesson.levelLabel}
                    </small>
                  </span>
                  {isMastered ? <CheckCircle2 aria-label="Mastered" /> : <BookOpenCheck aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        </aside>

        <section className="lesson-main" aria-label="Selected lesson">
          <article className="lesson-brief work-surface">
            <div className="lesson-heading-row">
              <div>
                <p className="eyebrow">
                  Level {selectedLesson.level} · {levelLabels[selectedLesson.level]}
                </p>
                <h2>{selectedLesson.title}</h2>
              </div>
              <span className="lesson-status">
                <BadgeCheck aria-hidden="true" />
                {selectedProgress?.mastered ? "Mastered" : "In progress"}
              </span>
            </div>
            <p className="summary">{selectedLesson.summary}</p>

            <div className="principle-grid">
              <div>
                <h3>Eric's rule</h3>
                <p>{selectedLesson.principle.ericRule}</p>
              </div>
              <div>
                <h3>LRS rationale</h3>
                <p>{selectedLesson.principle.lrsRationale}</p>
              </div>
            </div>

            <div className="constraint-strip" aria-label="Global constraints">
              {selectedLesson.globalConstraints.map((constraint) => (
                <span key={constraint}>{constraint}</span>
              ))}
            </div>
          </article>

          {mode === "teach" ? (
            <section className="teach-console work-surface" aria-label="Instructor controls">
              <div className="console-head">
                <div>
                  <p className="eyebrow">Instructor overlay</p>
                  <h2>{selectedBlueprint.title}</h2>
                </div>
                <button
                  aria-pressed={showAnswers}
                  className="secondary-action"
                  onClick={() => setShowAnswers((current) => !current)}
                  type="button"
                >
                  <Eye aria-hidden="true" />
                  {showAnswers ? "Hide answers" : "Show answers"}
                </button>
              </div>
              <div className="teach-grid">
                <div>
                  <h3>Blueprint steps</h3>
                  <ol>
                    {selectedBlueprint.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </div>
                <div>
                  <h3>Teaching moves</h3>
                  <ul>
                    {selectedBlueprint.teachMoves.map((move) => (
                      <li key={move}>{move}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3>Profile note</h3>
                  <p>
                    {profile === "dyslexia"
                      ? "Use wider spacing, short lines, oral rehearsal, and the model answer only after the attempt."
                      : profile === "adhd"
                        ? "Keep one visible task, set a short goal, and mark completion immediately."
                        : profile === "low-sensory"
                          ? "Use muted contrast, no timed pressure, and predictable transitions."
                          : "Use the default pacing, then adjust scaffolds based on the student's first attempt."}
                  </p>
                </div>
              </div>
            </section>
          ) : null}

          <section className="worked-examples work-surface" aria-label="Worked examples">
            <div className="section-title-row">
              <div>
                <p className="eyebrow">Worked examples</p>
                <h2>Revision with reasons</h2>
              </div>
              <Link className="inline-link" href="/library/">
                <Layers aria-hidden="true" />
                Library
              </Link>
            </div>
            {selectedLesson.workedExamples.map((example) => (
              <div className="example-row" key={`${example.before}-${example.after}`}>
                <div>
                  <strong>Before</strong>
                  <p>{example.before}</p>
                </div>
                <div>
                  <strong>After</strong>
                  <p>{markedText(example.after)}</p>
                </div>
                <div>
                  <strong>Why</strong>
                  <p>{example.why}</p>
                </div>
              </div>
            ))}
          </section>

          <ExerciseRenderer
            lesson={selectedLesson}
            mode={mode}
            onMastery={markMastered}
            showAnswers={showAnswers}
          />

          <section className="evidence-note work-surface">
            <CalendarClock aria-hidden="true" />
            <p>
              <strong>Evidence note:</strong> {selectedLesson.evidenceTag} Mastered lessons receive a
              local review date so retrieval practice can expand in Phase 2.
            </p>
          </section>
        </section>
      </section>
    </main>
  );
}
