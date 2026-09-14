import { useEffect, useRef, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

const TOOLBAR = [
  [{ header: [1, 2, 3, false] }],
  ["bold", "italic", "underline", "strike"],
  [{ color: [] }, { background: [] }],
  [{ align: [] }, { direction: "rtl" }],
  [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
  ["blockquote", "code-block"],
  ["link", "image", "video"],
  ["clean"],
];

const BlogRichTextEditor = ({ value, onChange, disabled = false }) => {
  const containerRef = useRef(null);
  const editorRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const initialValueRef = useRef(value);
  const initialDisabledRef = useRef(disabled);
  const [characterCount, setCharacterCount] = useState(0);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!containerRef.current || editorRef.current) return undefined;

    const editor = new Quill(containerRef.current, {
      theme: "snow",
      placeholder: "ابدأ كتابة محتوى المقال هنا…",
      modules: { toolbar: TOOLBAR, history: { delay: 800, maxStack: 100, userOnly: true } },
    });
    editorRef.current = editor;
    editor.root.setAttribute("dir", "rtl");
    editor.root.setAttribute("lang", "ar");
    editor.root.setAttribute("aria-label", "محتوى المقال");
    editor.root.innerHTML = initialValueRef.current || "";
    editor.enable(!initialDisabledRef.current);
    setCharacterCount(Math.max(0, editor.getText().trimEnd().length));

    const handleTextChange = (_delta, _oldDelta, source) => {
      setCharacterCount(Math.max(0, editor.getText().trimEnd().length));
      if (source === "user") onChangeRef.current(editor.root.innerHTML);
    };
    editor.on("text-change", handleTextChange);

    return () => {
      editor.off("text-change", handleTextChange);
      editorRef.current = null;
    };
  }, []);

  useEffect(() => {
    editorRef.current?.enable(!disabled);
  }, [disabled]);

  return (
    <div className={`blog-rich-editor overflow-hidden rounded-xl border bg-white transition ${disabled ? "opacity-60" : "focus-within:border-[#123C91] focus-within:ring-3 focus-within:ring-[#123C91]/10"}`}>
      <div ref={containerRef} />
      <div className="flex items-center justify-between border-t border-[#E5E7EB] bg-[#F8FAFC] px-4 py-2 text-[11px] text-[#667085]">
        <span>يمكنك تنسيق النص وإضافة الروابط والصور والفيديو</span>
        <span aria-live="polite">{characterCount.toLocaleString("ar-EG")} حرف</span>
      </div>
    </div>
  );
};

export default BlogRichTextEditor;
