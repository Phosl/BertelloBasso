"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {usePathname} from "next/navigation";
import gsap from "gsap";
import {Menu, X} from "lucide-react";
import {TransitionLink} from "@/components/transitions/TransitionLink";

const links = [
  {href: "/prodotti", label: "Prodotti"},
  {href: "/storia", label: "La nostra storia"},
  {href: "/contatti", label: "Visite & contatti"},
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;
    const items = menu.querySelectorAll<HTMLElement>("[data-menu-item]");
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    gsap.killTweensOf([menu, ...items]);

    if (open) {
      gsap.set(menu, {visibility: "visible"});
      if (reduced) {
        gsap.set(menu, {clipPath: "inset(0)", opacity: 1});
        gsap.set(items, {opacity: 1, y: 0});
      } else {
        gsap.fromTo(
          menu,
          {clipPath: "inset(0 0 100% 0)"},
          {clipPath: "inset(0)", duration: 0.62, ease: "power4.inOut"},
        );
        gsap.fromTo(
          items,
          {opacity: 0, y: 26},
          {
            opacity: 1,
            y: 0,
            duration: 0.48,
            stagger: 0.055,
            delay: 0.2,
            ease: "power3.out",
          },
        );
      }
      window.requestAnimationFrame(() => closeRef.current?.focus());
    } else if (reduced) {
      gsap.set(menu, {visibility: "hidden", clipPath: "inset(0 0 100% 0)"});
    } else {
      gsap.to(menu, {
        clipPath: "inset(0 0 100% 0)",
        duration: 0.42,
        ease: "power3.inOut",
        onComplete: () => gsap.set(menu, {visibility: "hidden"}),
      });
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const toggle = toggleRef.current;
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab" || !menuRef.current) return;
      const focusable = Array.from(
        menuRef.current.querySelectorAll<HTMLElement>("a[href], button"),
      );
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.documentElement.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      toggle?.focus();
    };
  }, [close, open]);

  return (
    <>
      <header className="site-header">
        <TransitionLink
          aria-label="Pian della Carlotta, home"
          className="wordmark"
          href="/"
          onClick={close}
        >
          <span>Pian della</span>
          <strong>Carlotta</strong>
        </TransitionLink>
        <nav aria-label="Navigazione principale" className="desktop-nav">
          {links.map((link) => (
            <TransitionLink
              aria-current={
                pathname.startsWith(link.href) ? "page" : undefined
              }
              href={link.href}
              key={link.href}
              onClick={close}
              transitionLabel={link.label}
            >
              {link.label}
            </TransitionLink>
          ))}
        </nav>
        <button
          aria-controls="mobile-menu"
          aria-expanded={open}
          aria-label="Apri il menu"
          className="menu-toggle"
          onClick={() => setOpen(true)}
          ref={toggleRef}
          type="button"
        >
          <Menu aria-hidden="true" size={22} />
        </button>
      </header>

      <div
        aria-hidden={!open}
        aria-label="Menu di navigazione"
        aria-modal="true"
        className="mobile-menu"
        id="mobile-menu"
        ref={menuRef}
        role="dialog"
      >
        <div className="mobile-menu__top" data-menu-item>
          <span>Pian della Carlotta</span>
          <button
            aria-label="Chiudi il menu"
            onClick={close}
            ref={closeRef}
            type="button"
          >
            <X aria-hidden="true" size={24} />
          </button>
        </div>
        <nav aria-label="Navigazione mobile">
          <TransitionLink data-menu-item href="/" onClick={close}>
            <small>00</small>
            <strong>Home</strong>
          </TransitionLink>
          {links.map((link, index) => (
            <TransitionLink
              data-menu-item
              href={link.href}
              key={link.href}
              onClick={close}
              transitionLabel={link.label}
            >
              <small>0{index + 1}</small>
              <strong>{link.label}</strong>
            </TransitionLink>
          ))}
        </nav>
        <div className="mobile-menu__foot" data-menu-item>
          <span>42.78° N · 12.41° E</span>
          <TransitionLink href="/admin" onClick={close}>
            Area riservata
          </TransitionLink>
        </div>
      </div>
    </>
  );
}
