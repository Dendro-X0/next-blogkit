import type { ReactElement } from "react";

const BLOGKIT_LOGO_DEFAULT_SIZE = 24 as const;
const BLOGKIT_LOGO_VIEWBOX_SIZE = 32 as const;
const BLOGKIT_LOGO_CORNER_RADIUS = 8 as const;
const BLOGKIT_LOGO_BACKGROUND_OPACITY = 0.08 as const;

export type BlogKitLogoProps = Readonly<{
  size?: number;
}>;

/**
 * BlogKitLogo renders the primary BlogKit brand mark, shared between
 * the in-app UI and the favicon.
 */
export function BlogKitLogo({ size = BLOGKIT_LOGO_DEFAULT_SIZE }: BlogKitLogoProps): ReactElement {
  const dimension: number = size;
  return (
    <svg
      width={dimension}
      height={dimension}
      viewBox={`0 0 ${BLOGKIT_LOGO_VIEWBOX_SIZE} ${BLOGKIT_LOGO_VIEWBOX_SIZE}`}
      aria-hidden="true"
      focusable="false"
      className="text-primary"
    >
      <rect
        width={BLOGKIT_LOGO_VIEWBOX_SIZE}
        height={BLOGKIT_LOGO_VIEWBOX_SIZE}
        rx={BLOGKIT_LOGO_CORNER_RADIUS}
        fill="currentColor"
        opacity={BLOGKIT_LOGO_BACKGROUND_OPACITY}
      />
      <path
        d="M9 9.5C9 8.673 9.673 8 10.5 8H16v14.5l-4.75-2.5L9 21.5V9.5z"
        fill="currentColor"
      />
      <path
        d="M23 9.5C23 8.673 22.327 8 21.5 8H16v14.5l4.75-2.5L23 21.5V9.5z"
        fill="currentColor"
      />
    </svg>
  );
}
