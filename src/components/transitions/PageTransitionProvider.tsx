"use client";

import {usePathname, useRouter} from "next/navigation";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import gsap from "gsap";

type TransitionContextValue = {
  navigate: (href: string, label?: string) => void;
};

const TransitionContext = createContext<TransitionContextValue | null>(null);

export function usePageTransition() {
  const context = useContext(TransitionContext);
  if (!context) {
    throw new Error(
      "usePageTransition must be used inside PageTransitionProvider",
    );
  }
  return context;
}

function isAdminPath(path: string) {
  return path === "/admin" || path.startsWith("/admin/");
}

function labelFromPath(path: string) {
  const value = path.split("/").filter(Boolean).at(-1) ?? "Pian della Carlotta";
  return decodeURIComponent(value).replaceAll("-", " ");
}

export function PageTransitionProvider({children}: {children: ReactNode}) {
  const pathname = usePathname();
  const router = useRouter();
  const pageRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const timerRef = useRef<number | null>(null);
  const pendingRef = useRef<string | null>(null);
  const firstRenderRef = useRef(true);
  const transitioningRef = useRef(false);

  const reset = useCallback(() => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = null;
    pendingRef.current = null;
    transitioningRef.current = false;
    document.documentElement.classList.remove("is-transitioning");
    if (pageRef.current) {
      gsap.set(pageRef.current, {clearProps: "opacity,transform"});
    }
    if (veilRef.current) {
      gsap.set(veilRef.current, {
        display: "none",
        clipPath: "inset(100% 0 0 0)",
      });
    }
  }, []);

  const navigate = useCallback(
    (href: string, label?: string) => {
      if (transitioningRef.current) return;

      const destination = new URL(href, window.location.href);
      if (destination.origin !== window.location.origin) {
        window.location.assign(destination.href);
        return;
      }

      const target = `${destination.pathname}${destination.search}${destination.hash}`;
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (
        reduced ||
        isAdminPath(pathname) ||
        isAdminPath(destination.pathname) ||
        !pageRef.current ||
        !veilRef.current
      ) {
        window.scrollTo({top: 0, behavior: "auto"});
        router.push(target, {scroll: false});
        return;
      }

      transitioningRef.current = true;
      pendingRef.current = destination.pathname;
      document.documentElement.classList.add("is-transitioning");

      if (labelRef.current) {
        labelRef.current.textContent =
          label ?? labelFromPath(destination.pathname);
      }

      const page = pageRef.current;
      const veil = veilRef.current;
      const routeLabel = labelRef.current;
      const line = lineRef.current;

      gsap.set(veil, {display: "grid", clipPath: "inset(100% 0 0 0)"});
      if (routeLabel) gsap.set(routeLabel, {opacity: 0, y: 18});
      if (line) gsap.set(line, {scaleX: 0, transformOrigin: "left"});

      const commit = () => {
        window.scrollTo({top: 0, behavior: "auto"});
        router.push(target, {scroll: false});
        timerRef.current = window.setTimeout(() => {
          window.location.assign(destination.href);
        }, 8000);
      };

      timelineRef.current?.kill();
      timelineRef.current = gsap
        .timeline({onComplete: commit})
        .to(page, {opacity: 0.25, y: -20, duration: 0.55, ease: "power3.inOut"}, 0)
        .to(
          veil,
          {clipPath: "inset(0% 0 0 0)", duration: 0.65, ease: "power4.inOut"},
          0,
        )
        .to(
          routeLabel,
          {opacity: 1, y: 0, duration: 0.38, ease: "power3.out"},
          0.22,
        )
        .to(line, {scaleX: 1, duration: 0.48, ease: "power2.inOut"}, 0.18);
    },
    [pathname, router],
  );

  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }

    window.scrollTo({top: 0, behavior: "auto"});
    timelineRef.current?.kill();

    if (
      isAdminPath(pathname) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      reset();
      return;
    }

    const page = pageRef.current;
    const veil = veilRef.current;
    const expected = pendingRef.current === pathname;

    if (!page || !veil || !expected) {
      reset();
      return;
    }

    gsap.set(page, {opacity: 0, y: 22});
    timelineRef.current = gsap
      .timeline({onComplete: reset})
      .to(
        veil,
        {
          clipPath: "inset(0 0 100% 0)",
          duration: 0.72,
          ease: "power4.inOut",
        },
        0,
      )
      .to(page, {opacity: 1, y: 0, duration: 0.68, ease: "power3.out"}, 0.12);
  }, [pathname, reset]);

  useEffect(
    () => () => {
      timelineRef.current?.kill();
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      document.documentElement.classList.remove("is-transitioning");
    },
    [],
  );

  return (
    <TransitionContext.Provider value={{navigate}}>
      <div className="transition-shell">
        <div className="transition-page" key={pathname} ref={pageRef}>
          {children}
        </div>
        <div aria-hidden="true" className="transition-veil" ref={veilRef}>
          <div className="transition-veil__meta">
            <span>Pian della Carlotta</span>
            <span>Umbria · Italia</span>
          </div>
          <span className="transition-veil__label" ref={labelRef}>
            Pian della Carlotta
          </span>
          <span className="transition-veil__line">
            <span ref={lineRef} />
          </span>
        </div>
      </div>
    </TransitionContext.Provider>
  );
}
