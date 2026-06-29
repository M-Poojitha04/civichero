import React, { useState, useEffect } from "react";
import { getKeywordSpecificImage, CATEGORY_DEFAULT_IMAGES } from "../utils/imageMatcher";

interface IncidentImageProps {
  src?: string;
  alt: string;
  category: string;
  type?: "before" | "after";
  title?: string;
  description?: string;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  onLoadComplete?: (success: boolean) => void;
}

export const IncidentImage: React.FC<IncidentImageProps> = ({
  src,
  alt,
  category,
  type = "before",
  title = "",
  description = "",
  className = "",
  style,
  id,
  onLoadComplete
}) => {
  // Compute target local static source based on input parameters (category and text keyword search)
  const matchedFallback = getKeywordSpecificImage(category, title, description, type as "before" | "after");

  // Bypass any external URLs to guarantee instant offline loading of matching clean images
  const finalSrc = src && src.trim() !== "" && !src.includes("unsplash.com") && !src.includes("picsum.photos")
    ? src
    : matchedFallback;

  const [currentSrc, setCurrentSrc] = useState<string>(finalSrc);

  useEffect(() => {
    setCurrentSrc(finalSrc);
  }, [finalSrc]);

  const handleLoad = () => {
    onLoadComplete?.(true);
  };

  const handleError = () => {
    // If there is any load error on the custom source path, immediately fallback to matched local static path or category default
    if (currentSrc !== matchedFallback) {
      setCurrentSrc(matchedFallback);
    } else {
      const cat = (CATEGORY_DEFAULT_IMAGES[category as keyof typeof CATEGORY_DEFAULT_IMAGES]
        ? category
        : "Road Issue") as keyof typeof CATEGORY_DEFAULT_IMAGES;
      setCurrentSrc(type === "before" ? CATEGORY_DEFAULT_IMAGES[cat].before : CATEGORY_DEFAULT_IMAGES[cat].after);
      onLoadComplete?.(false);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950 flex items-center justify-center" id={id}>
      <img
        src={currentSrc}
        alt={alt || "Incident Image"}
        className={`w-full h-full object-contain transition-opacity duration-200 opacity-100 ${className}`} 
        style={style}
        onLoad={handleLoad}
        onError={handleError}
        referrerPolicy="no-referrer"
        loading="eager"
      />
    </div>
  );
};
export { getKeywordSpecificImage, CATEGORY_DEFAULT_IMAGES };
