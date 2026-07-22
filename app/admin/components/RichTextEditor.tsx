"use client";

import { useRef } from "react";
import { Bold, Italic, Heading2, List, ListOrdered, Link as LinkIcon } from "lucide-react";
import { Label } from "@/app/components/ui/label";

interface RichTextEditorProps {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
}

const TOOLBAR = [
  { icon: Bold, label: "Bold", command: "bold" },
  { icon: Italic, label: "Italic", command: "italic" },
  { icon: Heading2, label: "Titlu", command: "formatBlock", value: "H2" },
  { icon: List, label: "Listă cu puncte", command: "insertUnorderedList" },
  { icon: ListOrdered, label: "Listă numerotată", command: "insertOrderedList" },
] as const;

/**
 * Editor vizual pentru conținutul articolelor — scrii text formatat (bold, titluri,
 * liste) fără să vezi vreodată codul HTML. La salvare, textarea-ul ascuns trimite
 * exact același HTML pe care îl aștepta formularul înainte (câmpul "content").
 */
export default function RichTextEditor({ label, name, defaultValue, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const hiddenInputRef = useRef<HTMLTextAreaElement>(null);

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

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={`field-${name}`}>{label}</Label>

      <div className="rounded-xl border-2 border-input bg-card overflow-hidden focus-within:border-accent focus-within:ring-3 focus-within:ring-accent/20">
        <div className="flex items-center gap-1 border-b border-border bg-muted/40 p-1.5">
          {TOOLBAR.map(({ icon: Icon, label: btnLabel, command, ...rest }) => (
            <button
              key={btnLabel}
              type="button"
              aria-label={btnLabel}
              title={btnLabel}
              onClick={() => runCommand(command, "value" in rest ? rest.value : undefined)}
              className="flex items-center justify-center w-8 h-8 rounded-lg text-foreground/70 hover:bg-card hover:text-accent transition-colors"
            >
              <Icon className="w-4 h-4" aria-hidden />
            </button>
          ))}
          <button
            type="button"
            aria-label="Link"
            title="Link"
            onClick={addLink}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-foreground/70 hover:bg-card hover:text-accent transition-colors"
          >
            <LinkIcon className="w-4 h-4" aria-hidden />
          </button>
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
