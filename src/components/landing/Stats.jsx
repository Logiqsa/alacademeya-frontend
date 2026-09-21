import { useEffect, useRef } from "react";

const Counter = ({ value, label, duration = 2 }) => {
  const nodeRef = useRef(null);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return undefined;

    const numericValue = parseInt(value.replace(/[^0-9]/g, ""));
    const increment = numericValue / (duration * 60);
    let current = 0;
    let timer;
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      node.textContent = "0";
      timer = window.setInterval(() => {
        current += increment;
        if (current >= numericValue) {
          node.textContent = value;
          window.clearInterval(timer);
        } else {
          node.textContent = Math.floor(current).toLocaleString() + (value.includes("%") ? "%" : "");
        }
      }, 1000 / 60);
    };
    const observer = "IntersectionObserver" in window
      ? new IntersectionObserver(([entry]) => {
          if (entry.isIntersecting) {
            start();
            observer.disconnect();
          }
        }, { rootMargin: "-50px" })
      : null;
    if (observer) observer.observe(node);
    else start();
    return () => {
      observer?.disconnect();
      window.clearInterval(timer);
    };
  }, [value, duration]);

  return (
    <div className="flex flex-col items-center justify-center gap-2 text-center">
      <h3
        ref={nodeRef}
        className="
          font-['IBM_Plex_Sans_Arabic']
          font-bold
          text-[28px] md:text-[48px]
          leading-9 md:leading-14
          text-white
        "
      >
        0
      </h3>

      <p
        className="
          font-['IBM_Plex_Sans_Arabic']
          font-normal
          text-[14px] md:text-[24px]
          leading-5 md:leading-8
          text-white
        "
      >
        {label}
      </p>
    </div>
  );
};

export default function Stats({ stats }) {
  const formatted = (value) => Number(value || 0).toLocaleString("en-US");

  return (
    <section className="flex w-full items-center justify-center bg-[#1F2937]">
      <div className="w-full px-6 py-8 md:px-12 md:py-10">
        <div className="grid grid-cols-2 items-center gap-6 md:grid-cols-4">
          <Counter value={formatted(stats.teachers)} label="معلم" />
          <Counter value={formatted(stats.students)} label="طالب" />
          <Counter value={formatted(stats.courses)} label="دورة تدريبية" />
          <Counter
            value={`${formatted(stats.satisfaction)}%`}
            label="رضا المعلمين"
          />
        </div>
        <p className="mt-7 border-t border-white/10 pt-5 text-center font-['IBM_Plex_Sans_Arabic'] text-sm font-medium text-white/70 md:text-base">
          موثوق به من آلاف الطلاب والمعلمين
        </p>
      </div>
    </section>
  );
}
