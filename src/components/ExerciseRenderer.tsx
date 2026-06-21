"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ClipboardCheck, RotateCcw, Send, Shuffle, Wand2 } from "lucide-react";
import type { Exercise, ExerciseItem, Lesson } from "@/types/content";

interface ExerciseRendererProps {
  lesson: Lesson;
  mode: "practice" | "teach";
  onMastery: (lessonId: string) => void;
  showAnswers: boolean;
}

type Status = "idle" | "correct" | "try-again";

function normalize(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
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

function checkTextAnswer(item: ExerciseItem, answer: string) {
  const clean = normalize(answer);
  const logic = item.answerLogic;
  if (!logic) return clean.length > 0;

  const hasRequired = (logic.mustInclude ?? []).every((fragment) => clean.includes(normalize(fragment)));
  const avoidsBanned = (logic.mustAvoid ?? []).every((fragment) => !clean.includes(normalize(fragment)));
  const enoughWords = logic.minWords ? clean.split(" ").filter(Boolean).length >= logic.minWords : true;
  return hasRequired && avoidsBanned && enoughWords;
}

function Feedback({ item, status }: { item: ExerciseItem; status: Status }) {
  if (status === "idle") return null;

  return (
    <div className={`feedback ${status}`}>
      <CheckCircle2 aria-hidden="true" />
      <p>{status === "correct" ? item.feedback : "Keep revising. Check the actor, action, and reader cue."}</p>
    </div>
  );
}

export function ExerciseRenderer({ lesson, mode, onMastery, showAnswers }: ExerciseRendererProps) {
  const [choiceAnswers, setChoiceAnswers] = useState<Record<string, string>>({});
  const [textAnswers, setTextAnswers] = useState<Record<string, string>>({});
  const [statuses, setStatuses] = useState<Record<string, Status>>({});
  const [orders, setOrders] = useState<Record<string, string[]>>({});
  const [builders, setBuilders] = useState<Record<string, Record<string, string>>>({});

  useEffect(() => {
    setChoiceAnswers({});
    setTextAnswers({});
    setStatuses({});
    setOrders({});
    setBuilders({});
  }, [lesson.id]);

  const allItems = useMemo(() => lesson.exercises.flatMap((exercise) => exercise.items), [lesson.exercises]);
  const correctCount = allItems.filter((item) => statuses[item.id] === "correct").length;

  useEffect(() => {
    if (allItems.length > 0 && correctCount === allItems.length) {
      onMastery(lesson.id);
    }
  }, [allItems.length, correctCount, lesson.id, onMastery]);

  function setItemStatus(item: ExerciseItem, status: Status) {
    setStatuses((current) => ({ ...current, [item.id]: status }));
  }

  function resetItem(item: ExerciseItem) {
    setChoiceAnswers((current) => {
      const next = { ...current };
      delete next[item.id];
      return next;
    });
    setTextAnswers((current) => ({ ...current, [item.id]: "" }));
    setOrders((current) => ({ ...current, [item.id]: [] }));
    setBuilders((current) => ({ ...current, [item.id]: {} }));
    setItemStatus(item, "idle");
  }

  function renderChoiceExercise(exercise: Exercise, item: ExerciseItem) {
    const selected = choiceAnswers[item.id];
    const status = statuses[item.id] ?? "idle";

    return (
      <div className="exercise-item" key={item.id}>
        <p className="prompt">{item.prompt}</p>
        {item.source ? <blockquote>{item.source}</blockquote> : null}
        <div className="option-grid">
          {item.options?.map((option) => {
            const isSelected = selected === option.id;
            const isCorrect = option.id === item.correctOptionId;
            return (
              <button
                aria-pressed={isSelected}
                className={isSelected ? "selected" : ""}
                key={option.id}
                onClick={() => {
                  setChoiceAnswers((current) => ({ ...current, [item.id]: option.id }));
                  setItemStatus(item, isCorrect ? "correct" : "try-again");
                }}
                type="button"
              >
                {option.label}
              </button>
            );
          })}
        </div>
        <Feedback item={item} status={status} />
        {showAnswers || status === "correct" ? <ModelAnswer item={item} /> : null}
      </div>
    );
  }

  function renderRewriteExercise(exercise: Exercise, item: ExerciseItem) {
    const selected = choiceAnswers[item.id];
    const text = textAnswers[item.id] ?? "";
    const status = statuses[item.id] ?? "idle";
    const selectedCorrectly = selected === item.correctOptionId;

    return (
      <div className="exercise-item" key={item.id}>
        <p className="prompt">{item.prompt}</p>
        {item.source ? <blockquote>{item.source}</blockquote> : null}
        <div className="option-grid compact">
          {item.options?.map((option) => (
            <button
              aria-pressed={selected === option.id}
              className={selected === option.id ? "selected" : ""}
              key={option.id}
              onClick={() => setChoiceAnswers((current) => ({ ...current, [item.id]: option.id }))}
              type="button"
            >
              Flag: {option.label}
            </button>
          ))}
        </div>
        <label className="writing-input">
          Your rewrite
          <textarea
            onChange={(event) =>
              setTextAnswers((current) => ({ ...current, [item.id]: event.target.value }))
            }
            placeholder="Rewrite with the actor, action, and reader expectation in mind."
            value={text}
          />
        </label>
        <div className="exercise-actions">
          <button
            className="primary-action"
            onClick={() => {
              const isCorrect = selectedCorrectly && checkTextAnswer(item, text);
              setItemStatus(item, isCorrect ? "correct" : "try-again");
            }}
            type="button"
          >
            <Send aria-hidden="true" />
            Check rewrite
          </button>
          <button className="secondary-action" onClick={() => resetItem(item)} type="button">
            <RotateCcw aria-hidden="true" />
            Reset
          </button>
        </div>
        <Feedback item={item} status={status} />
        {showAnswers || status === "correct" ? <ModelAnswer item={item} /> : null}
      </div>
    );
  }

  function renderTextExercise(exercise: Exercise, item: ExerciseItem) {
    const text = textAnswers[item.id] ?? "";
    const status = statuses[item.id] ?? "idle";

    return (
      <div className="exercise-item" key={item.id}>
        <p className="prompt">{item.prompt}</p>
        {item.source ? <blockquote>{item.source}</blockquote> : null}
        <label className="writing-input">
          Your combined sentence
          <textarea
            onChange={(event) =>
              setTextAnswers((current) => ({ ...current, [item.id]: event.target.value }))
            }
            placeholder="Combine the ideas into one reader-friendly sentence."
            value={text}
          />
        </label>
        <div className="exercise-actions">
          <button
            className="primary-action"
            onClick={() => setItemStatus(item, checkTextAnswer(item, text) ? "correct" : "try-again")}
            type="button"
          >
            <Send aria-hidden="true" />
            Check sentence
          </button>
          <button className="secondary-action" onClick={() => resetItem(item)} type="button">
            <RotateCcw aria-hidden="true" />
            Reset
          </button>
        </div>
        <Feedback item={item} status={status} />
        {showAnswers || status === "correct" ? <ModelAnswer item={item} /> : null}
      </div>
    );
  }

  function renderReorderExercise(exercise: Exercise, item: ExerciseItem) {
    const order = orders[item.id] ?? [];
    const status = statuses[item.id] ?? "idle";
    const remaining = item.segments?.filter((segment) => !order.includes(segment.id)) ?? [];
    const chosen = order
      .map((id) => item.segments?.find((segment) => segment.id === id))
      .filter(Boolean) as NonNullable<ExerciseItem["segments"]>;

    return (
      <div className="exercise-item" key={item.id}>
        <p className="prompt">{item.prompt}</p>
        <div className="reorder-zone" aria-label="Chosen order">
          {chosen.length ? (
            chosen.map((segment) => (
              <button
                key={segment.id}
                onClick={() =>
                  setOrders((current) => ({
                    ...current,
                    [item.id]: order.filter((id) => id !== segment.id)
                  }))
                }
                type="button"
              >
                {segment.label}
              </button>
            ))
          ) : (
            <span>Choose sentence parts below.</span>
          )}
        </div>
        <div className="option-grid">
          {remaining.map((segment) => (
            <button
              key={segment.id}
              onClick={() => setOrders((current) => ({ ...current, [item.id]: [...order, segment.id] }))}
              type="button"
            >
              {segment.label}
            </button>
          ))}
        </div>
        <div className="exercise-actions">
          <button
            className="primary-action"
            onClick={() => {
              const isCorrect = JSON.stringify(order) === JSON.stringify(item.correctOrder ?? []);
              setItemStatus(item, isCorrect ? "correct" : "try-again");
            }}
            type="button"
          >
            <Shuffle aria-hidden="true" />
            Check order
          </button>
          <button className="secondary-action" onClick={() => resetItem(item)} type="button">
            <RotateCcw aria-hidden="true" />
            Reset
          </button>
        </div>
        <Feedback item={item} status={status} />
        {showAnswers || status === "correct" ? <ModelAnswer item={item} /> : null}
      </div>
    );
  }

  function renderBuilderExercise(exercise: Exercise, item: ExerciseItem) {
    const selected = builders[item.id] ?? {};
    const status = statuses[item.id] ?? "idle";

    return (
      <div className="exercise-item" key={item.id}>
        <p className="prompt">{item.prompt}</p>
        <div className="builder-grid">
          {item.slots?.map((slot) => (
            <label key={slot.id}>
              {slot.label}
              <select
                onChange={(event) =>
                  setBuilders((current) => ({
                    ...current,
                    [item.id]: { ...(current[item.id] ?? {}), [slot.id]: event.target.value }
                  }))
                }
                value={selected[slot.id] ?? ""}
              >
                <option value="">Choose a piece</option>
                {item.options?.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
        <div className="exercise-actions">
          <button
            className="primary-action"
            onClick={() => {
              const isCorrect = (item.slots ?? []).every(
                (slot) => selected[slot.id] === slot.correctOptionId
              );
              setItemStatus(item, isCorrect ? "correct" : "try-again");
            }}
            type="button"
          >
            <ClipboardCheck aria-hidden="true" />
            Check build
          </button>
          <button className="secondary-action" onClick={() => resetItem(item)} type="button">
            <RotateCcw aria-hidden="true" />
            Reset
          </button>
        </div>
        <Feedback item={item} status={status} />
        {showAnswers || status === "correct" ? <ModelAnswer item={item} /> : null}
      </div>
    );
  }

  function renderItem(exercise: Exercise, item: ExerciseItem) {
    if (exercise.type === "detector-rewrite") return renderRewriteExercise(exercise, item);
    if (exercise.type === "sentence-combiner") return renderTextExercise(exercise, item);
    if (exercise.type === "reorder") return renderReorderExercise(exercise, item);
    if (exercise.type === "builder") return renderBuilderExercise(exercise, item);
    return renderChoiceExercise(exercise, item);
  }

  return (
    <section className="exercise-panel" aria-label="Interactive exercises">
      <div className="exercise-panel-head">
        <div>
          <p className="eyebrow">{mode === "teach" ? "Live exercise" : "Practice task"}</p>
          <h2>{lesson.title}</h2>
        </div>
        <span className="mastery-chip">
          <Wand2 aria-hidden="true" />
          {correctCount}/{allItems.length} complete
        </span>
      </div>

      {lesson.exercises.map((exercise) => (
        <article className="exercise-block" key={exercise.id}>
          <div className="exercise-title-row">
            <h3>{exercise.title}</h3>
            <span>{exercise.type.replaceAll("-", " ")}</span>
          </div>
          <p className="directions">{exercise.directions}</p>
          {exercise.items.map((item) => renderItem(exercise, item))}
        </article>
      ))}
    </section>
  );
}

function ModelAnswer({ item }: { item: ExerciseItem }) {
  if (!item.model) return null;

  return (
    <div className="model-answer">
      <strong>Model</strong>
      <p>{markedText(item.model)}</p>
    </div>
  );
}
