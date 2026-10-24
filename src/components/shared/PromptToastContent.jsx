import { useState } from "react";

const PromptToastContent = ({ toastId, title, message, placeholder, confirmLabel, finish }) => {
  const [value, setValue] = useState("");
  const submit = () => {
    const normalized = value.trim();
    if (normalized) finish(toastId, normalized);
  };

  return (
    <div dir="rtl" className="w-[min(92vw,420px)] rounded-2xl border border-[#E5E7EB] bg-white p-4 text-right shadow-2xl">
      <strong className="block text-base text-[#1F2937]">{title}</strong>
      {message ? <p className="mt-1.5 text-sm leading-6 text-[#667085]">{message}</p> : null}
      <textarea
        autoFocus
        rows={3}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            submit();
          }
        }}
        placeholder={placeholder}
        className="mt-3 w-full resize-none rounded-xl border border-[#D0D5DD] px-3 py-2 text-sm text-[#1F2937] outline-none focus:border-[#123C91] focus:ring-2 focus:ring-[#123C91]/10"
      />
      <div className="mt-4 flex justify-end gap-2">
        <button type="button" onClick={() => finish(toastId, null)} className="rounded-lg border border-[#D0D5DD] px-4 py-2 text-sm font-semibold text-[#344054]">إلغاء</button>
        <button type="button" disabled={!value.trim()} onClick={submit} className="delete-action rounded-lg px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50">{confirmLabel}</button>
      </div>
    </div>
  );
};

export default PromptToastContent;
