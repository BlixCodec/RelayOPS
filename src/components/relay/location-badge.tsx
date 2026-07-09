import { useState } from "react";
import { cn } from "@/lib/utils";
import { iconFor, toneFor, monogram, logoDomainFor } from "@/lib/relay/branding";

export function LocationBadge({
  name,
  size = 22,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const Icon = iconFor(name);
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center text-slate-500", className)}
      style={{ width: size, height: size }}
      aria-hidden
      title={name}
    >
      <Icon style={{ width: size * 0.7, height: size * 0.7 }} strokeWidth={1.75} />
    </span>
  );
}

/**
 * CompanyLogo: prefers a real brand mark (via Clearbit's public logo endpoint,
 * no auth) as a visual placeholder for fictional customers. Falls back to a
 * tinted 2-letter monogram if no domain mapping exists or the image fails.
 */
export function CompanyLogo({
  name,
  size = 24,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const domain = logoDomainFor(name);
  const [failed, setFailed] = useState(false);

  if (domain && !failed) {
    return (
      <img
        src={`https://logo.clearbit.com/${domain}?size=${size * 2}`}
        alt={name}
        width={size}
        height={size}
        loading="lazy"
        onError={() => setFailed(true)}
        className={cn(
          "inline-block shrink-0 rounded-md bg-white object-contain ring-1 ring-slate-200/70",
          className,
        )}
        style={{ width: size, height: size }}
        title={name}
      />
    );
  }

  const tone = toneFor(name + "|logo");
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md font-semibold leading-none ring-1 ring-black/5",
        tone.bg,
        tone.text,
        className,
      )}
      style={{
        width: size,
        height: size,
        fontSize: Math.max(9, Math.floor(size * 0.42)),
      }}
      aria-label={name}
      title={name}
    >
      {monogram(name)}
    </span>
  );
}
