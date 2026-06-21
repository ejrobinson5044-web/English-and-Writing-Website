"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, LetterText, Moon, PanelTopClose, Settings2, Type } from "lucide-react";
import type { LearningProfile } from "@/types/content";

type TextSize = "standard" | "large" | "extra";
type Contrast = "calm" | "strong";

interface AccessPrefs {
  textSize: TextSize;
  contrast: Contrast;
  dyslexiaFont: boolean;
  quietMode: boolean;
  focusMode: boolean;
  profile: LearningProfile;
}

const defaultPrefs: AccessPrefs = {
  textSize: "standard",
  contrast: "calm",
  dyslexiaFont: false,
  quietMode: true,
  focusMode: false,
  profile: "standard"
};

const storageKey = "readerlab-accessibility";

export function AccessibilityPanel() {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<AccessPrefs>(defaultPrefs);

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return;

    try {
      setPrefs({ ...defaultPrefs, ...JSON.parse(stored) });
    } catch {
      setPrefs(defaultPrefs);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.textSize = prefs.textSize;
    root.dataset.contrast = prefs.contrast;
    root.dataset.dyslexiaFont = String(prefs.dyslexiaFont);
    root.dataset.quietMode = String(prefs.quietMode);
    root.dataset.focusMode = String(prefs.focusMode);
    root.dataset.learningProfile = prefs.profile;
    window.localStorage.setItem(storageKey, JSON.stringify(prefs));
  }, [prefs]);

  const profileNote = useMemo(() => {
    if (prefs.profile === "dyslexia") return "Wider spacing and optional OpenDyslexic stack.";
    if (prefs.profile === "adhd") return "One task at a time with progress cues.";
    if (prefs.profile === "low-sensory") return "Muted contrast and motion minimized.";
    return "Balanced defaults for most learners.";
  }, [prefs.profile]);

  function patch(next: Partial<AccessPrefs>) {
    setPrefs((current) => ({ ...current, ...next }));
  }

  return (
    <div className="accessibility">
      <button
        aria-expanded={open}
        className="tool-button"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <Settings2 aria-hidden="true" />
        Access
      </button>

      {open ? (
        <section className="access-panel" aria-label="Accessibility controls">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Learning profile</p>
              <h2>Display controls</h2>
            </div>
            <button className="icon-text-button" onClick={() => setOpen(false)} type="button">
              <PanelTopClose aria-hidden="true" />
              Close
            </button>
          </div>

          <label>
            Profile
            <select
              value={prefs.profile}
              onChange={(event) => {
                const profile = event.target.value as LearningProfile;
                patch({
                  profile,
                  dyslexiaFont: profile === "dyslexia" ? true : prefs.dyslexiaFont,
                  quietMode: profile === "low-sensory" || profile === "adhd" ? true : prefs.quietMode
                });
              }}
            >
              <option value="standard">Standard</option>
              <option value="dyslexia">Dyslexia support</option>
              <option value="adhd">ADHD support</option>
              <option value="low-sensory">Low-sensory</option>
            </select>
          </label>
          <p className="profile-note">{profileNote}</p>

          <div className="segmented" aria-label="Text size">
            {(["standard", "large", "extra"] as TextSize[]).map((size) => (
              <button
                aria-pressed={prefs.textSize === size}
                key={size}
                onClick={() => patch({ textSize: size })}
                type="button"
              >
                <Type aria-hidden="true" />
                {size === "extra" ? "Extra large" : size}
              </button>
            ))}
          </div>

          <div className="toggle-grid">
            <label>
              <input
                checked={prefs.dyslexiaFont}
                onChange={(event) => patch({ dyslexiaFont: event.target.checked })}
                type="checkbox"
              />
              <span>
                <LetterText aria-hidden="true" />
                OpenDyslexic stack
              </span>
            </label>
            <label>
              <input
                checked={prefs.quietMode}
                onChange={(event) => patch({ quietMode: event.target.checked })}
                type="checkbox"
              />
              <span>
                <Moon aria-hidden="true" />
                Quiet mode
              </span>
            </label>
            <label>
              <input
                checked={prefs.focusMode}
                onChange={(event) => patch({ focusMode: event.target.checked })}
                type="checkbox"
              />
              <span>
                <Eye aria-hidden="true" />
                Focus mode
              </span>
            </label>
            <label>
              <input
                checked={prefs.contrast === "strong"}
                onChange={(event) => patch({ contrast: event.target.checked ? "strong" : "calm" })}
                type="checkbox"
              />
              <span>
                <Eye aria-hidden="true" />
                Strong contrast
              </span>
            </label>
          </div>
        </section>
      ) : null}
    </div>
  );
}
