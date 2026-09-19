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

const HTML_TEXT_PATTERN = /<\/?(?:div|h[1-6]|p|ul|ol|li|strong|b|em|i|u|br|blockquote|a)(?:\s[^>]*)?>/i;

const RichTextEditor = ({
  value,
  onChange,
  disabled = false,
  direction = "rtl",
  language = "ar",
  placeholder = "ابدأ الكتابة هنا…",
  ariaLabel = "محرر النص",
}) => {
  const containerRef = useRef(null);
  const editorRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const initialValueRef = useRef(value);
  const initialDisabledRef = useRef(disabled);
  const initialDirectionRef = useRef(direction);
  const initialLanguageRef = useRef(language);
  const initialPlaceholderRef = useRef(placeholder);
  const initialAriaLabelRef = useRef(ariaLabel);
  const [characterCount, setCharacterCount] = useState(0);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!containerRef.current || editorRef.current) return undefined;

    const container = containerRef.current;
    const editor = new Quill(container, {
      theme: "snow",
      placeholder: initialPlaceholderRef.current,
      modules: { toolbar: TOOLBAR, history: { delay: 800, maxStack: 100, userOnly: true } },
    });
    editorRef.current = editor;
    editor.root.setAttribute("dir", initialDirectionRef.current);
    editor.root.setAttribute("lang", initialLanguageRef.current);
    editor.root.setAttribute("aria-label", initialAriaLabelRef.current);
    editor.root.style.textAlign = initialDirectionRef.current === "rtl" ? "right" : "left";
    editor.root.innerHTML = initialValueRef.current || "";
    editor.enable(!initialDisabledRef.current);
    setCharacterCount(Math.max(0, editor.getText().trimEnd().length));

    const handleTextChange = (_delta, _oldDelta, source) => {
      setCharacterCount(Math.max(0, editor.getText().trimEnd().length));
      if (source === "user") onChangeRef.current(editor.root.innerHTML);
    };
    const handlePaste = (event) => {
      const pastedText = event.clipboardData?.getData("text/plain")?.trim();
      if (!pastedText || !HTML_TEXT_PATTERN.test(pastedText)) return;

      event.preventDefault();
      const range = editor.getSelection(true) || { index: editor.getLength() - 1, length: 0 };
      const lengthBeforePaste = editor.getLength();
      if (range.length) editor.deleteText(range.index, range.length, "user");
      editor.clipboard.dangerouslyPasteHTML(range.index, pastedText, "user");
      const insertedLength = editor.getLength() - lengthBeforePaste + range.length;
      editor.setSelection(range.index + insertedLength, 0, "silent");
    };
    editor.on("text-change", handleTextChange);
    editor.root.addEventListener("paste", handlePaste);

    return () => {
      editor.off("text-change", handleTextChange);
      editor.root.removeEventListener("paste", handlePaste);
      editor.getModule("toolbar")?.container?.remove();
      container.replaceChildren();
      container.removeAttribute("class");
      editorRef.current = null;
    };
  }, []);

  useEffect(() => {
    editorRef.current?.enable(!disabled);
  }, [disabled]);

  return (
    <div className={`rich-text-editor overflow-hidden rounded-xl border bg-white transition ${disabled ? "opacity-70" : "focus-within:border-[#123C91] focus-within:ring-3 focus-within:ring-[#123C91]/10"}`}>
      <div ref={containerRef} />
      <div className="flex items-center justify-between gap-3 border-t border-[#E5E7EB] bg-[#F8FAFC] px-4 py-2 text-[11px] text-[#667085]">
        <span>تنسيق النص وإضافة الروابط والوسائط</span>
        <span className="shrink-0" aria-live="polite">{characterCount.toLocaleString(language === "ar" ? "ar-EG" : "en-US")} {language === "ar" ? "حرف" : "characters"}</span>
      </div>
    </div>
  );
};

export default RichTextEditor;
