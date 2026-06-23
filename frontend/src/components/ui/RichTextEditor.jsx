import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import { useTranslation } from "react-i18next";
import { 
  Bold, Italic, Heading2, Heading3, 
  List, ListOrdered, Quote,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Undo, Redo, Image as ImageIcon, Video as YoutubeIcon
} from "lucide-react";

const MenuBar = ({ editor, onImageUpload }) => {
  const { t } = useTranslation();
  
  if (!editor) return null;

  const btnClass = (isActive) =>
    `p-1.5 rounded transition-colors ${
      isActive
        ? "bg-mkhe-primary/20 text-mkhe-primary"
        : "text-mkhe-text/60 hover:bg-mkhe-border/30 hover:text-mkhe-text"
    }`;

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-mkhe-border/30 bg-mkhe-bg/50">
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className={btnClass()}
        title={t("editor.undo", "Undo")}
      >
        <Undo className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className={btnClass()}
        title={t("editor.redo", "Redo")}
      >
        <Redo className="w-4 h-4" />
      </button>

      <div className="w-px h-4 bg-mkhe-border/30 mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={btnClass(editor.isActive("bold"))}
        title={t("editor.bold", "Bold")}
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={btnClass(editor.isActive("italic"))}
        title={t("editor.italic", "Italic")}
      >
        <Italic className="w-4 h-4" />
      </button>

      <div className="w-px h-4 bg-mkhe-border/30 mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={btnClass(editor.isActive("heading", { level: 2 }))}
        title={t("editor.heading2", "Heading 2")}
      >
        <Heading2 className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={btnClass(editor.isActive("heading", { level: 3 }))}
        title={t("editor.heading3", "Heading 3")}
      >
        <Heading3 className="w-4 h-4" />
      </button>

      <div className="w-px h-4 bg-mkhe-border/30 mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={btnClass(editor.isActive("bulletList"))}
        title={t("editor.bullet_list", "Bullet List")}
      >
        <List className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={btnClass(editor.isActive("orderedList"))}
        title={t("editor.ordered_list", "Ordered List")}
      >
        <ListOrdered className="w-4 h-4" />
      </button>

      <div className="w-px h-4 bg-mkhe-border/30 mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={btnClass(editor.isActive("blockquote"))}
        title={t("editor.blockquote", "Blockquote")}
      >
        <Quote className="w-4 h-4" />
      </button>

      <div className="w-px h-4 bg-mkhe-border/30 mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={btnClass(editor.isActive({ textAlign: 'left' }))}
        title={t("editor.align_left", "Align Left")}
      >
        <AlignLeft className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={btnClass(editor.isActive({ textAlign: 'center' }))}
        title={t("editor.align_center", "Align Center")}
      >
        <AlignCenter className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={btnClass(editor.isActive({ textAlign: 'right' }))}
        title={t("editor.align_right", "Align Right")}
      >
        <AlignRight className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        className={btnClass(editor.isActive({ textAlign: 'justify' }))}
        title={t("editor.align_justify", "Align Justify")}
      >
        <AlignJustify className="w-4 h-4" />
      </button>

      <div className="w-px h-4 bg-mkhe-border/30 mx-1" />

      {onImageUpload && (
        <button
          type="button"
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";
            input.onchange = async (e) => {
              const file = e.target.files[0];
              if (file) {
                try {
                  const url = await onImageUpload(file);
                  if (url) {
                    editor.chain().focus().setImage({ src: url }).run();
                  }
                } catch (error) {
                  console.error("Image upload failed", error);
                }
              }
            };
            input.click();
          }}
          className={btnClass()}
          title={t("editor.add_image", "Add Image")}
        >
          <ImageIcon className="w-4 h-4" />
        </button>
      )}

      <button
        type="button"
        onClick={() => {
          const url = prompt(t("editor.youtube_url", "Enter YouTube URL:"));
          if (url) {
            editor.commands.setYoutubeVideo({
              src: url,
              width: Math.max(320, parseInt(editor.view.dom.clientWidth, 10)) || 640,
              height: Math.max(180, parseInt(editor.view.dom.clientWidth, 10) * 9 / 16) || 360,
            });
          }
        }}
        className={btnClass()}
        title={t("editor.add_youtube", "Add YouTube Video")}
      >
        <YoutubeIcon className="w-4 h-4" />
      </button>

    </div>
  );
};

const RichTextEditor = ({ value, onChange, placeholder, onImageUpload }) => {
  const { t } = useTranslation();
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto mx-auto my-4',
        },
      }),
      Youtube.configure({
        inline: false,
        HTMLAttributes: {
          class: 'w-full aspect-video rounded-lg my-4',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Nhập nội dung...',
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm prose-stone max-w-none focus:outline-none min-h-[150px] p-4 text-mkhe-text leading-relaxed " +
          "[&>p]:mb-3 last:[&>p]:mb-0 [&_h2]:font-bold [&_h2]:text-xl [&_h2]:mb-3 [&_h2]:mt-5 [&_h3]:font-semibold [&_h3]:text-lg [&_h3]:mb-2 [&_h3]:mt-4 " +
          "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 " +
          "[&_blockquote]:border-l-4 [&_blockquote]:border-mkhe-primary/50 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-mkhe-text/80 [&_blockquote]:my-4 " +
          "[&_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.is-editor-empty:first-child::before]:text-mkhe-text/40 [&_.is-editor-empty:first-child::before]:float-left [&_.is-editor-empty:first-child::before]:h-0 [&_.is-editor-empty:first-child::before]:pointer-events-none",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Update editor content when value from props changes (e.g., loaded from API)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      // Only update if it's completely different to avoid cursor jumps
      if (value) {
        // A simple check to prevent recursive updates
        const currentHTML = editor.getHTML();
        if (currentHTML !== value && currentHTML !== `<p>${value}</p>`) {
            editor.commands.setContent(value);
        }
      }
    }
  }, [value, editor]);

  return (
    <div className="bg-mkhe-bg border border-mkhe-border/50 rounded-xl overflow-hidden focus-within:border-mkhe-primary transition-colors">
      <MenuBar editor={editor} onImageUpload={onImageUpload} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;
