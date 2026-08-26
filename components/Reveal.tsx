"use client";

/* The .reveal / .reveal.in pair in globals.css needs something to add
   the .in class when an element scrolls into view. This is that, kept
   as a tag-transparent wrapper so the DOM shape stays exactly as it was
   in the single-file version: one element, one class list. */

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";

type Props = {
  as?: ElementType;
  className?: string;
  /** Stagger, in ms. The original delayed each card in a visible batch by 70ms. */
  delay?: number;
  children?: ReactNode;
  id?: string;
  style?: CSSProperties;
};

export default function Reveal({
  as: Tag = "div",
  className = "",
  delay = 0,
  style,
  children,
  ...rest
}: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true);
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  const classes = [className, "reveal", shown ? "in" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag
      ref={ref}
      className={classes}
      style={{ ...style, transitionDelay: delay ? `${delay}ms` : undefined }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
