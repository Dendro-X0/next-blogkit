"use client";

import { trackEvent } from "@/analytics/client";
import Image from "next/image";
import Link from "next/link";
import { type ReactElement, useCallback } from "react";

interface AdBannerProps {
  readonly imageUrl: string;
  readonly linkUrl: string;
  readonly altText: string;
  readonly width: number;
  readonly height: number;
}

export function AdBanner({
  imageUrl,
  linkUrl,
  altText,
  width,
  height,
}: AdBannerProps): ReactElement {
  const handleClick = useCallback((): void => {
    trackEvent({ name: "ad_click", properties: { linkUrl, altText } });
  }, [linkUrl, altText]);

  return (
    <div className="my-4 flex justify-center">
      <Link href={linkUrl} target="_blank" rel="sponsored nofollow" onClick={handleClick}>
        <Image
          src={imageUrl}
          alt={altText}
          width={width}
          height={height}
          className="rounded-lg border"
        />
      </Link>
    </div>
  );
}
