import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, value, min = 0, max = 100, ...props }, ref) => {
  // Support both array and number for value (Radix uses array)
  const val = Array.isArray(value) ? value[0] : value ?? 0;
  const percent = ((val - min) / (max - min)) * 100;
  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className
      )}
      value={value}
      min={min}
      max={max}
      {...props}
    >
      <SliderPrimitive.Track
        className="relative h-2 w-full grow overflow-hidden rounded-full"
        style={{
          background: `linear-gradient(90deg, #a259ff 0%, #a259ff ${percent}%, #ff5cdb ${percent}%, #ff5cdb 100%)`,
        }}
      >
        <SliderPrimitive.Range className="absolute h-full" style={{ background: 'transparent' }} />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        style={{
          height: '20px',
          width: '20px',
          borderRadius: '50%',
          background: 'black',
          border: '3px solid #a259ff ', // Tailwind pink-500
          boxSizing: 'border-box',
          display: 'block',
          position: 'relative',
          zIndex: 10,
        }}
      />
    </SliderPrimitive.Root>
  );
})
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
