import React from 'react';
import BreathBloom from '../ui/breath-bloom';

/**
 * RecoveryBreathSection
 * Pure visual-only animation:
 * Large, overlapping blue circular/petal shapes with rich blue gradients and
 * dark navy shading in smooth, organic, continuous breathing movement on a
 * simple, uniform dark navy background.
 * Absolutely zero UI, zero headers, zero timers, zero controls, zero borders, zero text.
 */
export default function RecoveryBreathSection() {
  return (
    <section
      aria-label="Breathing animation"
      className="relative w-full h-[70vh] min-h-[520px] max-h-[850px] bg-[#0d0f1e] overflow-hidden flex items-center justify-center m-0 p-0 border-0"
    >
      <BreathBloom
        height="100%"
        preset="abyss"
        interactive={false}
        guide={false}
        hint={false}
        params={{ spin: 2 }}
        label="Animated blue petals"
      />
    </section>
  );
}

export { RecoveryBreathSection as OrisRecoveryBreathSection };

