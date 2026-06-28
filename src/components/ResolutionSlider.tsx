import React, { useState, useEffect } from "react";
import { IncidentImage } from "./IncidentImage";

interface ResolutionSliderProps {
  beforeSrc?: string;
  afterSrc?: string;
  category: string;
  title?: string;
  description?: string;
  heightClass?: string; // e.g. "h-[220px]" or "h-56"
  beforeLabel?: string;
  afterLabel?: string;
  id?: string;
}

export const ResolutionSlider: React.FC<ResolutionSliderProps> = ({
  beforeSrc,
  afterSrc,
  category,
  title = "",
  description = "",
  heightClass = "h-[220px]",
  beforeLabel = "Before Repair (Complaint logged)",
  afterLabel = "After Repair (Verified)",
  id
}) => {
  const [sliderPos, setSliderPos] = useState(50);

  // If afterSrc is missing or blank, duplicate the before image temporarily as instructed
const hasAfter = !!afterSrc?.trim();

const finalAfterSrc = hasAfter ? afterSrc : beforeSrc;


return (
  <div
    className={`relative w-full ${heightClass} rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 select-none shadow-inner`}
    id={id}
  >
    <div className="relative w-full h-full">

      {/* BEFORE IMAGE */}
      <div className="absolute inset-0">
        <IncidentImage
          src={beforeSrc}
          alt="Before Repair"
          category={category}
          type="before"
          title={title}
          description={description}
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* AFTER IMAGE */}
      <div
        className="absolute inset-0"
        style={{
          clipPath: `polygon(${sliderPos}% 0, 100% 0, 100% 100%, ${sliderPos}% 100%)`,
        }}
      >
        <IncidentImage
          src={finalAfterSrc}
          alt="After Repair"
          category={category}
          type="after"
          title={title}
          description={description}
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* BEFORE BADGE */}
      <div className="absolute bottom-3 left-3 z-50 pointer-events-none">
        <span className="bg-red-600/95 text-white font-mono text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded shadow">
          {beforeLabel}
        </span>
      </div>

      {/* AFTER BADGE */}
      <div className="absolute bottom-3 right-3 z-50 pointer-events-none">
        <span className="bg-emerald-600/95 text-white font-mono text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded shadow">
          {afterSrc?.trim() ? afterLabel : "Pending Repair"}
        </span>
      </div>

      {/* SLIDER BAR */}
      <div
        className="absolute top-0 bottom-0 w-[3px] bg-cyan-400 z-40 cursor-ew-resize"
        style={{ left: `${sliderPos}%` }}
      >
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-cyan-400 border-2 border-slate-900 shadow-xl flex items-center justify-center">
          <span className="text-sm font-black text-slate-900">◀▶</span>
        </div>
      </div>

      {/* RANGE INPUT */}
      <input
        type="range"
        min="0"
        max="100"
        value={sliderPos}
        onChange={(e) => setSliderPos(Number(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-50"
      />

    </div>
  </div>
);
};
