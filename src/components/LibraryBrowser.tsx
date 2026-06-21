"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BookOpenCheck, FileText, Filter, Layers, PenLine } from "lucide-react";
import { exerciseTypeLabels, getLessonExerciseTypes, levelLabels } from "@/lib/content";
import type { EssayBlueprint, ExerciseType, Lesson, WritingLevel } from "@/types/content";

interface LibraryBrowserProps {
  lessons: Lesson[];
  blueprints: EssayBlueprint[];
}

export function LibraryBrowser({ blueprints, lessons }: LibraryBrowserProps) {
  const [level, setLevel] = useState<"all" | WritingLevel>("all");
  const [exerciseType, setExerciseType] = useState<"all" | ExerciseType>("all");
  const [query, setQuery] = useState("");

  const exerciseTypes = useMemo(
    () => Array.from(new Set(lessons.flatMap((lesson) => getLessonExerciseTypes(lesson)))),
    [lessons]
  );

  const filteredLessons = useMemo(() => {
    const cleanQuery = query.toLowerCase().trim();
    return lessons.filter((lesson) => {
      const matchesLevel = level === "all" || lesson.level === level;
      const matchesType = exerciseType === "all" || getLessonExerciseTypes(lesson).includes(exerciseType);
      const searchable = `${lesson.title} ${lesson.summary} ${lesson.principle.ericRule} ${lesson.principle.lrsRationale}`.toLowerCase();
      return matchesLevel && matchesType && (!cleanQuery || searchable.includes(cleanQuery));
    });
  }, [exerciseType, lessons, level, query]);

  return (
    <main className="library-page">
      <section className="library-hero work-surface">
        <div>
          <p className="eyebrow">Content engine</p>
          <h1>Writing principle library</h1>
          <p>
            Every card is a structured lesson record used by both Practice and Teach. The same data
            stores Eric's rule, the LRS rationale, exercise type, essay blueprint tags, and accessibility flags.
          </p>
        </div>
        <div className="library-stats">
          <span>
            <strong>{lessons.length}</strong>
            principles
          </span>
          <span>
            <strong>{blueprints.length}</strong>
            blueprints
          </span>
          <span>
            <strong>{exerciseTypes.length}</strong>
            exercise types
          </span>
        </div>
      </section>

      <section className="library-layout">
        <aside className="filter-panel library-filter" aria-label="Library filters">
          <div className="filter-title">
            <Filter aria-hidden="true" />
            <strong>Find lessons</strong>
          </div>
          <label>
            Search
            <input
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Try active voice, AXES, LRS..."
              type="search"
              value={query}
            />
          </label>
          <label>
            Level
            <select
              onChange={(event) =>
                setLevel(event.target.value === "all" ? "all" : (Number(event.target.value) as WritingLevel))
              }
              value={level}
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
              onChange={(event) => setExerciseType(event.target.value as "all" | ExerciseType)}
              value={exerciseType}
            >
              <option value="all">All exercise types</option>
              {exerciseTypes.map((type) => (
                <option key={type} value={type}>
                  {exerciseTypeLabels[type]}
                </option>
              ))}
            </select>
          </label>
        </aside>

        <section className="library-results" aria-label="Lesson results">
          {filteredLessons.map((lesson) => (
            <article className="lesson-card" key={lesson.id}>
              <div className="lesson-card-top">
                <span>
                  Level {lesson.level}: {levelLabels[lesson.level]}
                </span>
                <BookOpenCheck aria-hidden="true" />
              </div>
              <h2>{lesson.title}</h2>
              <p>{lesson.summary}</p>
              <div className="mini-tags">
                {getLessonExerciseTypes(lesson).map((type) => (
                  <span key={type}>{exerciseTypeLabels[type]}</span>
                ))}
              </div>
              <div className="lesson-card-actions">
                <Link href={`/lesson/${lesson.id}/`}>
                  <PenLine aria-hidden="true" />
                  Practice
                </Link>
                <Link href={`/teach/?lesson=${lesson.id}`}>
                  <Layers aria-hidden="true" />
                  Teach
                </Link>
              </div>
            </article>
          ))}
        </section>
      </section>

      <section className="blueprint-section work-surface" aria-label="Essay blueprints">
        <div className="section-title-row">
          <div>
            <p className="eyebrow">Cross-cutting layer</p>
            <h2>Essay blueprint overlays</h2>
          </div>
          <FileText aria-hidden="true" />
        </div>
        <div className="blueprint-grid">
          {blueprints.map((blueprint) => (
            <article className="blueprint-card" key={blueprint.id}>
              <h3>{blueprint.title}</h3>
              <p>{blueprint.bestFor}</p>
              <strong>Practice scaffold</strong>
              <p>{blueprint.practiceScaffold}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
