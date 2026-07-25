"use client";

import {useEffect} from "react";
import Link from "@tiptap/extension-link";
import {EditorContent, useEditor} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {Bold, Italic, Link as LinkIcon, List, ListOrdered, Redo, Undo} from "lucide-react";
import type {RichTextDocument} from "@/lib/cms/types";

export function RichTextEditor({
  value,
  onChange,
}: {
  value: RichTextDocument;
  onChange: (value: RichTextDocument) => void;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        blockquote: false,
        code: false,
        codeBlock: false,
        horizontalRule: false,
        strike: false,
      }),
      Link.configure({
        openOnClick: false,
        protocols: ["http", "https", "mailto"],
      }),
    ],
    content: value,
    onUpdate: ({editor: current}) => {
      onChange(current.getJSON() as RichTextDocument);
    },
  });

  useEffect(() => {
    if (!editor || editor.isFocused) return;
    const current = JSON.stringify(editor.getJSON());
    if (current !== JSON.stringify(value)) {
      editor.commands.setContent(value, {emitUpdate: false});
    }
  }, [editor, value]);

  if (!editor) return <div className="admin-skeleton admin-skeleton--form" />;
  const currentEditor = editor;

  function setLink() {
    const previous = currentEditor.getAttributes("link").href as string | undefined;
    const href = window.prompt("Incolla l’indirizzo del collegamento", previous ?? "https://");
    if (href === null) return;
    if (!href.trim()) {
      currentEditor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    currentEditor.chain().focus().extendMarkRange("link").setLink({href}).run();
  }

  const buttons = [
    {label: "Grassetto", icon: Bold, active: editor.isActive("bold"), action: () => editor.chain().focus().toggleBold().run()},
    {label: "Corsivo", icon: Italic, active: editor.isActive("italic"), action: () => editor.chain().focus().toggleItalic().run()},
    {label: "Elenco", icon: List, active: editor.isActive("bulletList"), action: () => editor.chain().focus().toggleBulletList().run()},
    {label: "Elenco numerato", icon: ListOrdered, active: editor.isActive("orderedList"), action: () => editor.chain().focus().toggleOrderedList().run()},
    {label: "Collegamento", icon: LinkIcon, active: editor.isActive("link"), action: setLink},
    {label: "Annulla", icon: Undo, active: false, action: () => editor.chain().focus().undo().run()},
    {label: "Ripeti", icon: Redo, active: false, action: () => editor.chain().focus().redo().run()},
  ];

  return (
    <div className="rich-text-editor">
      <div className="rich-text-editor__toolbar" role="toolbar" aria-label="Formattazione testo">
        {buttons.map(({label, icon: Icon, active, action}) => (
          <button aria-pressed={active} key={label} onClick={action} title={label} type="button">
            <Icon aria-hidden="true" size={19} />
            {label}
          </button>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
