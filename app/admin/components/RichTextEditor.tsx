"use client";

import { useEffect, useRef, useState } from "react";
import { Bold, Italic, Heading2, List, ListOrdered, Link as LinkIcon } from "lucide-react";
import { Label } from "@/app/components/ui/label";

interface RichTextEditorProps {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
}

const FONT_FAMILIES = [
  { label: "Font implicit", value: "" },
  { label: "Simplu (Geist)", value: "var(--font-sans)" },
  { label: "Elegant (Playfair)", value: "var(--font-serif)" },
] as const;

const FONT_SIZES = [
  { label: "Mărime text", value: "" },
  { label: "Mic", value: "14px" },
  { label: "Normal", value: "16px" },
  { label: "Mare", value: "20px" },
  { label: "Foarte mare", value: "26px" },
] as const;

const TOOLBAR = [
  { icon: Bold, label: "Bold", command: "bold" as const },
  { icon: Italic, label: "Italic", command: "italic" as const },
  { icon: Heading2, label: "Titlu", command: "formatBlock" as const, value: "H2" },
  { icon: List, label: "Listă cu puncte", command: "insertUnorderedList" as const },
  { icon: ListOrdered, label: "Listă numerotată", command: "insertOrderedList" as const },
];

/**
 * Editor vizual pentru conținutul articolelor — scrii text formatat (bold, titluri,
 * liste, fonturi) fără să vezi vreodată codul HTML. Butoanele de formatare sunt
 * active doar când e text selectat, ca să fie clar ce anume se formatează.
 * La salvare, textarea-ul ascuns trimite exact același HTML pe care îl aștepta
 * formularul înainte (câmpul "content").
 */
export default function RichTextEditor({ label, name, defaultValue, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const hiddenInputRef = useRef<HTMLTextAreaElement>(null);
  const lastRangeRef = useRef<Range | null>(null);
  const [hasSelection, setHasSelection] = useState(false);

  useEffect(() => {
    function onSelectionChange() {
      const sel = window.getSelection();
      const inside =
        !!sel &&
        !sel.isCollapsed &&
        sel.rangeCount > 0 &&
        !!editorRef.current?.contains(sel.getRangeAt(0).commonAncestorContainer);
      setHasSelection(inside);
      if (inside && sel) lastRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
    document.addEventListener("selectionchange", onSelectionChange);
    return () => document.removeEventListener("selectionchange", onSelectionChange);
  }, []);

  function sync() {
    if (editorRef.current && hiddenInputRef.current) {
      hiddenInputRef.current.value = editorRef.current.innerHTML;
    }
  }

  function runCommand(command: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    sync();
  }

  function addLink() {
    const url = window.prompt("Adresa linkului (ex: https://exemplu.md)");
    if (url) runCommand("createLink", url);
  }

  function wrapSelectionWithStyle(styleProp: "fontFamily" | "fontSize", value: string) {
    const range = lastRangeRef.current;
    if (!range || !editorRef.current?.contains(range.commonAncestorContainer)) return;

    const span = document.createElement("span");
    span.style[styleProp] = value;
    span.appendChild(range.extractContents());
    range.insertNode(span);

    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(range);
    }
    lastRangeRef.current = range.cloneRange();
    sync();
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={`field-${name}`}>{label}</Label>

      <div className="rounded-xl border-2 border-input bg-card overflow-hidden focus-within:border-accent focus-within:ring-3 focus-within:ring-accent/20">
        <div className="flex flex-wrap items-center gap-1.5 border-b border-border bg-muted/40 p-1.5">
          {TOOLBAR.map(({ icon: Icon, label: btnLabel, command, ...rest }) => (
            <button
              key={btnLabel}
              type="button"
              aria-label={btnLabel}
              title={hasSelection ? btnLabel : `${btnLabel} — selectează text mai întâi`}
              disabled={!hasSelection}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => runCommand(command, "value" in rest ? rest.value : undefined)}
              className="flex items-center justify-center w-8 h-8 rounded-lg text-foreground/70 hover:bg-card hover:text-accent transition-colors disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-foreground/70"
            >
              <Icon className="w-4 h-4" aria-hidden />
            </button>
          ))}
          <button
            type="button"
            aria-label="Link"
            title={hasSelection ? "Link" : "Link — selectează text mai întâi"}
            disabled={!hasSelection}
            onMouseDown={(e) => e.preventDefault()}
            onClick={addLink}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-foreground/70 hover:bg-card hover:text-accent transition-colors disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-foreground/70"
          >
            <LinkIcon className="w-4 h-4" aria-hidden />
          </button>

          <span className="w-px h-6 bg-border mx-0.5" aria-hidden />

          <select
            aria-label="Font"
            onChange={(e) => {
              if (e.target.value) wrapSelectionWithStyle("fontFamily", e.target.value);
              e.target.value = "";
            }}
            defaultValue=""
            className="h-8 rounded-lg border border-border bg-card px-2 text-xs text-foreground/70"
          >
            {FONT_FAMILIES.map((f) => (
              <option key={f.label} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>

          <select
            aria-label="Mărime text"
            onChange={(e) => {
              if (e.target.value) wrapSelectionWithStyle("fontSize", e.target.value);
              e.target.value = "";
            }}
            defaultValue=""
            className="h-8 rounded-lg border border-border bg-card px-2 text-xs text-foreground/70"
          >
            {FONT_SIZES.map((f) => (
              <option key={f.label} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        <div
          id={`field-${name}`}
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={sync}
          onBlur={sync}
          data-placeholder={placeholder}
          className="prose prose-sm max-w-none min-h-[220px] px-4 py-3 text-[15px] text-foreground leading-relaxed outline-none [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-primary [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-accent [&_a]:underline empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: defaultValue ?? "" }}
        />
      </div>

      <textarea ref={hiddenInputRef} name={name} defaultValue={defaultValue ?? ""} className="hidden" />
    </div>
  );
}
