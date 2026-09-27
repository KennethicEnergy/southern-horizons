"use client";

import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import { Placeholder } from "@tiptap/extensions";
import { useRef } from "react";
import { tiptapExtensions } from "@/lib/content/extensions";
import { useUploadStore } from "@/stores/upload-store";

function ToolbarButton({ label, active, onClick, children }: { label: string; active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      title={label}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`min-w-9 rounded-md px-2 py-1.5 text-sm ${active ? "bg-ink text-white" : "text-ink hover:bg-sky"}`}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const upload = useUploadStore((s) => s.upload);
  const fileRef = useRef<HTMLInputElement>(null);
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      quote: e.isActive("blockquote"),
      link: e.isActive("link"),
    }),
  });

  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link address", prev ?? "https://");
    if (url === null) return;
    if (url === "") return editor.chain().focus().unsetLink().run();
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-wrap gap-1 border-b border-line p-2" role="toolbar" aria-label="Formatting">
      <ToolbarButton label="Bold" active={state.bold} onClick={() => editor.chain().focus().toggleBold().run()}>
        <strong>B</strong>
      </ToolbarButton>
      <ToolbarButton label="Italic" active={state.italic} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <em>I</em>
      </ToolbarButton>
      <ToolbarButton label="Heading" active={state.h2} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        H2
      </ToolbarButton>
      <ToolbarButton label="Subheading" active={state.h3} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        H3
      </ToolbarButton>
      <ToolbarButton label="Bulleted list" active={state.bullet} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        • List
      </ToolbarButton>
      <ToolbarButton label="Numbered list" active={state.ordered} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        1. List
      </ToolbarButton>
      <ToolbarButton label="Quote" active={state.quote} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        Quote
      </ToolbarButton>
      <ToolbarButton label="Link" active={state.link} onClick={setLink}>
        Link
      </ToolbarButton>
      <ToolbarButton label="Insert image" onClick={() => fileRef.current?.click()}>
        Image
      </ToolbarButton>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={async (e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = "";
          const uploaded = await upload(files);
          for (const m of uploaded) editor.chain().focus().setImage({ src: m.url, alt: m.alt ?? "" }).run();
        }}
      />
    </div>
  );
}

export function RichTextEditor({
  value,
  onChange,
  invalid,
}: {
  value: Record<string, unknown>;
  onChange: (doc: Record<string, unknown>) => void;
  invalid?: boolean;
}) {
  const editor = useEditor({
    extensions: [...tiptapExtensions, Placeholder.configure({ placeholder: "Tell the story…" })],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: { class: "tiptap article prose prose-lg max-w-none px-5 py-4 prose-a:text-sea", "aria-label": "Post body" },
    },
    onUpdate: ({ editor: e }) => onChange(e.getJSON() as Record<string, unknown>),
  });

  return (
    <div className={`overflow-hidden rounded-lg border bg-white ${invalid ? "border-danger" : "border-line"}`}>
      {editor ? <Toolbar editor={editor} /> : null}
      <EditorContent editor={editor} />
    </div>
  );
}
