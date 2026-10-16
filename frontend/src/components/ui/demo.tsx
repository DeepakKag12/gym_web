"use client"

import React from "react"
import BreathBloom from "./breath-bloom"

export default function Demo() {
  return (
    // w-full matters: 21st centres demos in a flex wrapper, and a flex item
    // left at width:auto shrinks the bloom to 0px wide.
    <div className="relative w-full">
      <BreathBloom>
        <div className="flex h-full flex-col justify-between p-6 sm:p-10">
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.32em] text-[#e2e8ff]/55">
            <span>breath bloom / no. 06</span>
            <span className="hidden sm:inline">4s in · 4s hold · 4s out</span>
          </div>
          <div className="max-w-xs pb-10">
            <h1 className="text-3xl font-semibold leading-tight tracking-tight text-[#e2e8ff] sm:text-4xl">
              Slow down
              <br />
              for one breath.
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[#e2e8ff]/55">
              Follow the petals. Or take over — sideways spreads them, down grows them.
            </p>
          </div>
        </div>
      </BreathBloom>
    </div>
  )
}
