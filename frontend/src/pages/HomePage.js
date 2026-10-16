import React from 'react';
import { useSettings } from '../context/SettingsContext';
import {
  GymPreloader,
  HeroSection,
  StatementCounters,
  ProgramsCarousel,
  FacilityZonesDeck,
  ParallaxBanner,
  TransformationsMatrix,
  CoachesLineup,
  MembershipPricing,
  FreeTrialForm,
} from '../components/landing';
import { Navbar, Footer } from '../components/layout';
import { SmoothScroller } from '../components/ui';

/**
 * HomePage — FitNation by Ajeet Master Landing Experience
 * Modern kinetic motion, 3D procedural dumbbell visualizer, mechanical counters,
 * periodized training carousel, interactive facility zones, and curtain footer.
 */
export default function HomePage() {
  const site = useSettings();
  const brandName = site?.gymName || 'FitNation by Ajeet';

  return (
    <SmoothScroller>
      <div className="min-h-screen bg-white text-oris-secondary relative font-sans selection:bg-[#3365e2] selection:text-white">
        {/* ── Section 0: Fullscreen Preloader with Dual SVG Logo Mask ── */}
        <GymPreloader brandName="FITNATION" />

        {/* ── Section 1: Fixed Sliding Navigation Bar ── */}
        <Navbar brandName="FITNATION" ctaText="Join FitNation" />

        {/* ── Section 2: Sticky Hero + 2D Dot Matrix + Hardware-Accelerated 3D Visualizer ── */}
        <HeroSection
          title="Forge your ultimate physique with elite coaching"
          subtitle="We engineer periodized athletic training that builds unbreakable strength, high-output conditioning, and lifelong physical resilience."
          sideDescription="Our training protocols are designed to support athletes across diverse goals, from foundational movement screening to peak strength periodization. Every program is customized to your body mechanics, metabolic rate, and timeline."
          memberCount="500+"
          memberLabel="Satisfied athletes"
        />

        {/* ── Surface Wrapper for Clean White Sections ── */}
        <div className="relative z-10 bg-white">
          {/* ── Section 3: Statement & Mechanical Slot Counters ── */}
          <StatementCounters
            statement={`At ${brandName}, we believe physical transformation begins with disciplined periodization. Our certified coaching delivers results through progressive overload, scientific nutrition, and unwavering personal accountability.`}
          />

          {/* ── Section 4: Built for Your Lasting Progress Carousel ── */}
          <ProgramsCarousel
            headline="Built for Your Lasting Progress"
            subheading="Every workout is engineered with scientific periodization, progressive overload, and continuous guidance to maximize athletic capacity and physical longevity."
          />

          {/* ── Section 5: Signature Programs (Pinned Stacking Cards Deck) ── */}
          <FacilityZonesDeck
            heading="Signature Training Programs"
            subheading="Rigorous, periodized disciplines designed for athletes seeking tangible physical dominance."
          />

          {/* ── Section 6: Parallax Facility Band + Kinetic Letter Scrub ── */}
          <ParallaxBanner
            text="At FitNation by Ajeet, our training environment is calibrated for athletic excellence: from Olympic barbells and custom power cages to metabolic conditioning rigs and contrast therapy, every square foot is calibrated for your peak output."
          />

          {/* ── Section 7: Transformation Stories (3-Strip Matrix with Split Reveal) ── */}
          <TransformationsMatrix
            manifesto="From modern lifting racks to structured macro protocols, every discipline is engineered around athlete progression, clinical coaching, and lasting physical mastery."
          />

          {/* ── Section 8: Coaches & Leadership (Expanding Panoramic Cards) ── */}
          <CoachesLineup
            heading="Passion Meets Purpose"
            subheading="Behind every athlete transformation is a team united by one goal: engineering physical excellence without compromises."
          />

          {/* ── Section 9: Membership Plans (Verified Tiers) ── */}
          <MembershipPricing
            headline="Uncompromising Training, Zero Excuses"
            subheading="Transparent membership tiers with no hidden registration costs. Choose your commitment and start your transformation today."
          />

          {/* ── Section 10: Free Trial / Pass Claim Form ── */}
          <FreeTrialForm
            headline="Take the first step toward elite athletic fitness"
            subheading="Leave your details and Coach Ajeet Kag or our training coordinator will call you back within 15 minutes. Your first trial assessment and movement screen are 100% free."
          />
        </div>

        {/* ── Section 11: Fixed Curtain Footer ── */}
        <Footer />
      </div>
    </SmoothScroller>
  );
}
