import * as React from "react";

interface BrandLogoProps {
  /** Înălțime în px; lățimea se calculează automat (logo orizontal). */
  height?: number;
  className?: string;
}

const LOGO_FILE = "logo-transparent-master.png";

function getLogoUrl(): string {
  return new URL(LOGO_FILE, window.location.href).href;
}

/** Logo oficial BSC — fișierul `public/logo-transparent-master.png`. */
export function BrandLogo({ height = 48, className }: BrandLogoProps) {
  return (
    <img
      src={getLogoUrl()}
      alt=""
      height={height}
      className={className}
      aria-hidden="true"
      decoding="sync"
    />
  );
}

/** Preîncarcă logo-ul ca să apară sigur în PDF la primul export. */
export function usePreloadBrandLogo(): void {
  React.useEffect(() => {
    const img = new Image();
    img.src = getLogoUrl();
  }, []);
}
