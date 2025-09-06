"use client";

import { trackEvent } from "@/analytics/client";
import Link from "next/link";
import { type ReactElement, type ReactNode, useCallback } from "react";

interface AffiliateLinkProps {
  readonly href: string;
  readonly children: ReactNode;
  readonly className?: string;
}

export function AffiliateLink({ href, children, className }: AffiliateLinkProps): ReactElement {
  const handleClick = useCallback((): void => {
    trackEvent({ name: "affiliate_click", properties: { href } });
  }, [href]);

  return (
    <Link
      href={href}
      target="_blank"
      rel="sponsored nofollow"
      className={className}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}
