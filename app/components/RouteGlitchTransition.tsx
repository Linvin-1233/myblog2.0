"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const DURATION = 680;

// Why: glitch is a transition language, not a page texture. Start on an internal
// link click for immediate feedback, then restart when Next commits the new path.
export function RouteGlitchTransition() {
  const pathname = usePathname();
  const firstRender = useRef(true);
  const timerRef = useRef<number | null>(null);
  const [active, setActive] = useState(false);

  const trigger = () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    setActive(true);
    timerRef.current = window.setTimeout(() => {
      setActive(false);
      timerRef.current = null;
    }, DURATION);
  };

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    trigger();
  }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      const link = target instanceof Element ? target.closest("a") : null;
      if (!link || link.target === "_blank" || link.hasAttribute("download")) {
        return;
      }

      const url = new URL(link.href, window.location.href);
      if (url.origin === window.location.origin && url.pathname !== pathname) {
        trigger();
      }
    };

    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, [pathname]);

  return (
    <div
      aria-hidden="true"
      className={`route-glitch${active ? " route-glitch-active" : ""}`}
    >
      <div className="route-glitch-top">ROUTE_SWAP // FRAME_REASSEMBLY</div>
      <div className="route-glitch-word">CUT / PASTE / REPEAT</div>
      <span className="route-glitch-slice route-glitch-slice-a" />
      <span className="route-glitch-slice route-glitch-slice-b" />
      <span className="route-glitch-slice route-glitch-slice-c" />
      <div className="route-glitch-bottom">000 / 100 / OK</div>
    </div>
  );
}
