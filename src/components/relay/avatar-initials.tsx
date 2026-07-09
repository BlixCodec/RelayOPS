import { useState } from "react";
import { cn } from "@/lib/utils";
import { portraitUrl } from "@/lib/relay/people";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const palette = [
  "bg-indigo-100 text-indigo-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-sky-100 text-sky-700",
  "bg-violet-100 text-violet-700",
];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return Math.abs(h);
}

export function AvatarInitials({
  name,
  size = 24,
  className,
  ring = true,
}: {
  name: string;
  size?: number;
  className?: string;
  ring?: boolean;
}) {
  const url = portraitUrl(name, size);
  const [failed, setFailed] = useState(false);
  const tone = palette[hash(name) % palette.length];

  if (url && !failed) {
    return (
      <img
        src={url}
        alt={name}
        width={size}
        height={size}
        onError={() => setFailed(true)}
        className={cn(
          "inline-block rounded-full object-cover",
          ring && "ring-1 ring-slate-200",
          className,
        )}
        style={{ width: size, height: size }}
        loading="lazy"
      />
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium leading-none",
        tone,
        ring && "ring-1 ring-slate-200",
        className,
      )}
      style={{
        width: size,
        height: size,
        fontSize: Math.max(9, Math.floor(size * 0.4)),
      }}
      aria-label={name}
    >
      {initials(name)}
    </span>
  );
}

export function AvatarWithTooltip({
  name,
  size = 22,
  active,
  ring = true,
}: {
  name: string;
  size?: number;
  active?: boolean;
  ring?: boolean;
}) {
  return (
    <Tooltip delayDuration={150}>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="relative inline-flex rounded-full outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          aria-label={name}
        >
          <AvatarInitials name={name} size={size} ring={ring} />
          {active ? (
            <span
              aria-hidden
              className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white"
            />
          ) : null}
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        align="center"
        sideOffset={6}
        collisionPadding={8}
        className="bg-slate-900 text-[11px] text-white"
      >
        {name}
        {active ? " · online" : ""}
      </TooltipContent>
    </Tooltip>
  );
}

export function AvatarCluster({
  names,
  max = 3,
  size = 22,
  activeNames = [],
}: {
  names: string[];
  max?: number;
  size?: number;
  activeNames?: string[];
}) {
  const shown = names.slice(0, max);
  const extra = names.length - shown.length;
  const activeSet = new Set(activeNames);
  return (
    <div className="flex items-center justify-center">
      <div className="flex -space-x-1.5">
        {shown.map((n) => (
          <AvatarWithTooltip key={n} name={n} size={size} active={activeSet.has(n)} />
        ))}
      </div>
      {extra > 0 ? (
        <span className="ml-1.5 text-[11px] font-medium text-slate-500">+{extra}</span>
      ) : null}
    </div>
  );
}

export { AvatarInitials as Avatar };
