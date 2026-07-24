"use client";

import Link, {type LinkProps} from "next/link";
import {usePathname} from "next/navigation";
import {
  type AnchorHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";
import {usePageTransition} from "./PageTransitionProvider";

type TransitionLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    children: ReactNode;
    transitionLabel?: string;
  };

export function TransitionLink({
  children,
  href,
  onClick,
  transitionLabel,
  ...props
}: TransitionLinkProps) {
  const pathname = usePathname();
  const {navigate} = usePageTransition();
  const hrefString = typeof href === "string" ? href : href.pathname ?? "/";

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    const destination = hrefString.split(/[?#]/)[0] || "/";
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      props.download ||
      props.target === "_blank" ||
      destination === pathname ||
      document.documentElement.classList.contains("is-transitioning")
    ) {
      return;
    }

    event.preventDefault();
    navigate(hrefString, transitionLabel);
  }

  return (
    <Link href={href} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}
