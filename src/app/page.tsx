import Link from "next/link";
import { BookOpenCheck, GraduationCap, Library, PenLine, Route, Sparkles } from "lucide-react";
import { essayBlueprints, evidenceCards, globalRuleSet, lessons } from "@/lib/content";

export default function HomePage() {
  const starter = lessons.find((lesson) => lesson.id === "active-passive") ?? lessons[0];
  const teachStarter = lessons.find((lesson) => lesson.id === "axes-paragraph") ?? lessons[0];

  return (
    <main className="home-grid">
      <section className="work-surface home-primary" aria-labelledby="home-title">
        <div className="image-rail" aria-hidden="true" />
        <div className="home-copy">
          <p className="eyebrow">One content engine, two front doors</p>
          <h1 id="home-title">ReaderLab Writing Studio</h1>
          <p>
            A structured writing app for Eric's tutoring practice: students practice core
            principles independently, while the Teach track gives the instructor a clean live-lesson
            console from the same lesson records.
          </p>
          <div className="front-door-grid" aria-label="Choose a front door">
            <Link className="front-door" href="/practice/">
              <PenLine aria-hidden="true" />
              <span>
                <strong>Practice</strong>
                Student self-serve path with instant feedback and mastery progress.
              </span>
            </Link>
            <Link className="front-door" href="/teach/">
              <GraduationCap aria-hidden="true" />
              <span>
                <strong>Teach</strong>
                Tutor-led path with answers, profile controls, and blueprint overlays.
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section className="dashboard-band" aria-label="Starter actions">
        <Link className="action-panel" href={`/lesson/${starter.id}/`}>
          <BookOpenCheck aria-hidden="true" />
          <span>
            <strong>Start a student lesson</strong>
            {starter.title}
          </span>
        </Link>
        <Link className="action-panel" href={`/teach/?lesson=${teachStarter.id}`}>
          <Route aria-hidden="true" />
          <span>
            <strong>Open a live tutoring module</strong>
            {teachStarter.title}
          </span>
        </Link>
        <Link className="action-panel" href="/library/">
          <Library aria-hidden="true" />
          <span>
            <strong>Browse the curriculum library</strong>
            {lessons.length} principles and {essayBlueprints.length} essay blueprints
          </span>
        </Link>
      </section>

      <section className="content-columns">
        <div className="work-surface">
          <p className="eyebrow">Evidence-shaped mechanics</p>
          <h2>Practice asks students to produce writing.</h2>
          <div className="evidence-grid">
            {evidenceCards.map((card) => (
              <article className="evidence-card" key={card.title}>
                <Sparkles aria-hidden="true" />
                <strong>{card.value}</strong>
                <h3>{card.title}</h3>
                <p>{card.note}</p>
              </article>
            ))}
          </div>
        </div>
        <div className="work-surface global-rules">
          <p className="eyebrow">Global revision constraints</p>
          <h2>Eric's rules travel with every lesson.</h2>
          <ul>
            {globalRuleSet.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
