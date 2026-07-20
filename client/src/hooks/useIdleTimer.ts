import { useEffect, useRef, useState } from "react";

const EVENTS = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"];

export function useIdleTimer(onIdle: () => void, timeoutMs: number, active: boolean) {
  const [secondsLeft, setSecondsLeft] = useState(Math.floor(timeoutMs / 1000));
  const deadline = useRef(Date.now() + timeoutMs);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const onIdleRef = useRef(onIdle);
  onIdleRef.current = onIdle;

  useEffect(() => {
    if (!active) return;

    const reset = () => {
      deadline.current = Date.now() + timeoutMs;
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => onIdleRef.current(), timeoutMs);
    };

    reset();

    tickTimer.current = setInterval(() => {
      const left = Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000));
      setSecondsLeft(left);
    }, 1000);

    EVENTS.forEach((e) => window.addEventListener(e, reset, { passive: true }));

    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      if (tickTimer.current) clearInterval(tickTimer.current);
      EVENTS.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [active, timeoutMs]);

  return secondsLeft;
}
