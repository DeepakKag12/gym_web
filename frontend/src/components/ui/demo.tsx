"use client"

import FlashlightTextReveal from "./flashlight-text-reveal"

// Move the pointer to shine the light. Leave it and the light searches alone.
export default function Demo() {
  return (
    // w-full: 21st centres demos in a flex wrapper that would shrink this to 0px.
    <div className="w-full">
      <FlashlightTextReveal />
    </div>
  )
}
