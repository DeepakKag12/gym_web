import React, { useEffect, useState, useMemo } from 'react';
import { useSettings } from '../context/SettingsContext';
import { cachedGet } from '../utils/api';
import {
  GymPreloader,
  HeroSection,
  StatementCounters,
  ProgramsCarousel,
  FacilityZonesDeck,
  ParallaxBanner,
  TransformationsMatrix,
  RecoveryBreathSection,
  CoachesLineup,
  MembershipPricing,
  FreeTrialForm,
} from '../components/landing';
import { Navbar, Footer } from '../components/layout';
import { SmoothScroller } from '../components/ui';

/**
 * HomePage — FitNation by Ajeet Master Landing Experience
 * Dynamic landing configuration linked with Admin Dashboard & Gym Profile.
 * Modern kinetic motion, 3D procedural dumbbell visualizer, mechanical counters,
 * periodized training carousel, interactive facility zones, and curtain footer.
 */
export default function HomePage() {
  const site = useSettings();
  const brandName = site?.gymName || 'FitNation by Ajeet';
  const [landingConfig, setLandingConfig] = useState(null);

  useEffect(() => {
    cachedGet('/landing', { cache: 300 })
      .then((res) => {
        if (res?.data) setLandingConfig(res.data);
      })
      .catch(() => {});
  }, []);

  const signatureCards = useMemo(() => {
    if (landingConfig?.featuredPrograms?.length >= 3) {
      return landingConfig.featuredPrograms.map((p, idx) => ({
        id: idx + 1,
        title: p.title || '',
        tags: Array.isArray(p.tags) ? p.tags : [],
        description: p.description || '',
        bgColor: p.bgColor || (idx % 2 === 1 ? '#3365e2' : '#13314a'),
        image: p.image || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1200&auto=format&fit=crop',
      }));
    }
    return undefined; // uses DEFAULT_STACKING_PROGRAMS in FacilityZonesDeck
  }, [landingConfig?.featuredPrograms]);

  const coachesList = useMemo(() => {
    const fallbackTeam = [
      {
        name: 'Ajeet Kag',
        title: 'Founder & Head Strength Coach',
        specialty: 'Powerlifting & Biomechanics',
        src: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?q=80&w=900&auto=format&fit=crop',
      },
      {
        name: 'Vikram Singh',
        title: 'Conditioning Director',
        specialty: 'HIIT & Athletic Capacity',
        src: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=900&auto=format&fit=crop',
      },
      {
        name: 'Pooja Sharma',
        title: 'Mobility & Hypertrophy Specialist',
        specialty: 'Movement Screening & Hypertrophy',
        src: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=900&auto=format&fit=crop',
      },
      {
        name: 'Rahul Verma',
        title: 'Performance Nutritionist',
        specialty: 'Macro Protocols & Body Recomp',
        src: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=900&auto=format&fit=crop',
      },
    ];

    if (landingConfig?.team?.length) {
      const configured = landingConfig.team.map((t, idx) => ({
        name: t.name || fallbackTeam[idx % 4].name,
        title: t.role || fallbackTeam[idx % 4].title,
        specialty: t.specialty || fallbackTeam[idx % 4].specialty,
        src: t.photo || fallbackTeam[idx % 4].src,
      }));
      const merged = [...configured];
      for (let i = configured.length; i < 4; i++) {
        merged.push(fallbackTeam[i]);
      }
      return merged;
    }
    return fallbackTeam;
  }, [landingConfig?.team]);

  return (
    <SmoothScroller>
      <div className="min-h-screen bg-white text-oris-secondary relative font-sans selection:bg-[#3365e2] selection:text-white">
        {/* ── Section 0: Fullscreen Preloader with Dual SVG Logo Mask ── */}
        <GymPreloader brandName="FITNATION" />

        {/* ── Section 1: Fixed Sliding Navigation Bar ── */}
        <Navbar brandName="FITNATION" ctaText="Join FitNation" />

        {/* ── Section 2: Sticky Hero + 2D Dot Matrix + Hardware-Accelerated 3D Visualizer ── */}
        <HeroSection
          title={landingConfig?.hero?.headline || "Forge your ultimate physique with elite coaching"}
          subtitle={landingConfig?.hero?.subtext || "We engineer periodized athletic training that builds unbreakable strength, high-output conditioning, and lifelong physical resilience."}
          sideDescription={landingConfig?.about?.statement || "Our training protocols are designed to support athletes across diverse goals, from foundational movement screening to peak strength periodization. Every program is customized to your body mechanics, metabolic rate, and timeline."}
          memberCount={landingConfig?.hero?.socialProofCount || "500+"}
          memberLabel={landingConfig?.hero?.socialProofText || "Satisfied athletes"}
        />

        {/* ── Surface Wrapper for Clean White Sections ── */}
        <div className="relative z-10 bg-white">
          {/* ── Section 3: Statement & Mechanical Slot Counters ── */}
          <StatementCounters
            statement={landingConfig?.about?.statement || `At ${brandName}, we believe physical transformation begins with disciplined periodization. Our certified coaching delivers results through progressive overload, scientific nutrition, and unwavering personal accountability.`}
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
            cards={signatureCards}
          />

          {/* ── Section 6: Parallax Facility Band + Kinetic Letter Scrub ── */}
          <ParallaxBanner
            imageSrc={site?.parallaxImage || landingConfig?.parallax?.image || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2000&auto=format&fit=crop'}
            text={landingConfig?.parallax?.quote || "At FitNation by Ajeet, our training environment is calibrated for athletic excellence: from Olympic barbells and custom power cages to metabolic conditioning rigs and contrast therapy, every square foot is calibrated for your peak output."}
          />

          {/* ── Section 7: Transformation Stories (3-Strip Matrix with Split Reveal) ── */}
          <TransformationsMatrix
            manifesto="From modern lifting racks to structured macro protocols, every discipline is engineered around athlete progression, clinical coaching, and lasting physical mastery."
          />

          {/* ── Section 8: Mind-Body Focus & Active Recovery (Breath Bloom Module) ── */}
          <RecoveryBreathSection />

          {/* ── Section 9: Coaches & Leadership (Expanding Panoramic Cards) ── */}
          <CoachesLineup
            heading="Passion Meets Purpose"
            subheading="Behind every athlete transformation is a team united by one goal: engineering physical excellence without compromises."
            coaches={coachesList}
          />

          {/* ── Section 9: Membership Plans (Verified Tiers) ── */}
          <MembershipPricing
            headline="Uncompromising Training, Zero Excuses"
            subheading="Transparent membership tiers with no hidden registration costs. Choose your commitment and start your transformation today."
          />

          {/* ── Section 10: Free Trial / Pass Claim Form ── */}
          <FreeTrialForm
            bgImage={site?.ctaBannerImage || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1600&auto=format&fit=crop'}
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
