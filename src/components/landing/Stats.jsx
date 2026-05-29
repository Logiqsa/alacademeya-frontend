import { useEffect, useRef } from "react";
import { useInView } from "framer-motion";

const Counter = ({ value, label, duration = 2 }) => {
  const nodeRef = useRef(null);
  const isInView = useInView(nodeRef, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const numericValue = parseInt(value.replace(/[^0-9]/g, ""));
      const increment = numericValue / (duration * 60);

      let current = start;
      const timer = setInterval(() => {
        current += increment;

        if (current >= numericValue) {
          nodeRef.current.textContent = value;
          clearInterval(timer);
        } else {
          nodeRef.current.textContent =
            Math.floor(current).toLocaleString() +
            (value.includes("%") ? "%" : "");
        }
      }, 1000 / 60);
    }
  }, [isInView, value, duration]);

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

export default function Stats() {
  return (
    <section className="w-full bg-[#1F2937] flex justify-center items-center">
      <div
        className="
          w-full
          px-6 py-8 md:px-12 md:py-10
          grid grid-cols-2 md:grid-cols-4
          gap-6
          items-center
        "
      >
        <Counter value="40" label="معلم" />
        <Counter value="12,000" label="طالب" />
        <Counter value="1,000" label="دورة تدريبية" />
        <Counter value="97%" label="رضا العلماء" />
      </div>
    </section>
  );
}