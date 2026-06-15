import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import API_URL from '../api';

const STEPS = [
  {
    emoji: '🎵',
    title: 'Welcome to Decked!',
    subtitle: 'Rate the sets that decked you',
    description:
      "You've just joined a community of ravers who rate, review, and discover DJ sets. Let us show you around.",
    cta: "Let's Go →",
  },
  {
    emoji: '🔍',
    title: 'Discover DJs',
    subtitle: 'Browse the community',
    description:
      'Explore DJ profiles, browse their sets, and find artists you love. Every DJ on Decked has been approved by our team.',
    cta: 'Next →',
    tip: 'Tip: Use the Discover page to find trending DJs and top-rated sets.',
    tipLink: '/discover',
    tipLinkLabel: 'Go to Discover',
  },
  {
    emoji: '⭐',
    title: 'Rate Sets',
    subtitle: 'Your opinion matters',
    description:
      'Open any set and give it 1–5 stars. Add a written review to share your thoughts. Ratings are public and help other ravers find the best sets.',
    cta: 'Next →',
    tip: 'Tip: Be honest — the community trusts your ratings.',
  },
  {
    emoji: '👥',
    title: 'Follow DJs',
    subtitle: 'Stay connected',
    description:
      "Follow your favourite DJs and they'll appear in your activity feed. Never miss a new set from artists you love.",
    cta: 'Next →',
    tip: 'Tip: You can follow DJs directly from their profile page.',
  },
  {
    emoji: '📰',
    title: 'Your Activity Feed',
    subtitle: 'Personalised for you',
    description:
      'Your feed shows new sets from DJs you follow, recent ratings from friends, and activity from the community.',
    cta: 'Next →',
    tip: 'Tip: The more DJs you follow, the better your feed.',
    tipLink: '/feed',
    tipLinkLabel: 'View your feed',
  },
  {
    emoji: '🎉',
    title: "You're All Set!",
    subtitle: 'Ready to explore',
    description:
      "That's everything you need to know. Start exploring Decked, rate some sets, and find your next obsession.",
    cta: 'Start Exploring',
    isFinal: true,
  },
];

export default function OnboardingFlow() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState('forward');
  const [animating, setAnimating] = useState(false);
  const [contentVisible, setContentVisible] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    if (localStorage.getItem('onboarding_shown') === 'true') return;

    axios
      .get(`${API_URL}/api/auth/onboarding-status`, {
        headers: { Authorization: 'Bearer ' + token },
      })
      .then((r) => {
        if (!r.data.onboarding_completed) {
          setShow(true);
        }
      })
      .catch(() => {});
  }, []);

  const handleComplete = useCallback(async () => {
    localStorage.setItem('onboarding_shown', 'true');
    setShow(false);
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      await axios.patch(
        `${API_URL}/api/auth/onboarding/complete`,
        {},
        { headers: { Authorization: 'Bearer ' + token } }
      );
    } catch (e) {}
  }, []);

  const goTo = useCallback(
    (nextStep, dir) => {
      if (animating) return;
      setAnimating(true);
      setContentVisible(false);
      setDirection(dir);
      setTimeout(() => {
        setStep(nextStep);
        setContentVisible(true);
        setAnimating(false);
      }, 220);
    },
    [animating]
  );

  const handleNext = useCallback(() => {
    if (step < STEPS.length - 1) {
      goTo(step + 1, 'forward');
    } else {
      handleComplete();
    }
  }, [step, goTo, handleComplete]);

  const handleBack = useCallback(() => {
    if (step > 0) goTo(step - 1, 'back');
  }, [step, goTo]);

  if (!show) return null;

  const current = STEPS[step];
  const isFinal = !!current.isFinal;

  const slideStyle = {
    transition: 'opacity 220ms ease, transform 220ms ease',
    opacity: contentVisible ? 1 : 0,
    transform: contentVisible
      ? 'translateX(0)'
      : direction === 'forward'
      ? 'translateX(40px)'
      : 'translateX(-40px)',
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Card */}
      <div className="relative w-full max-w-lg bg-[#0d0d0f] border border-white/[0.07] rounded-3xl shadow-2xl overflow-hidden">
        {/* Top accent bar */}
        <div className="h-1 bg-gradient-to-r from-brand-600 to-purple-400" />

        {/* Header row */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          <span className="text-xs text-gray-500">
            Step {step + 1} of {STEPS.length}
          </span>

          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`inline-block rounded-full transition-all duration-300 ${
                  i <= step
                    ? 'w-2 h-2 bg-brand-500'
                    : 'w-1.5 h-1.5 bg-white/20'
                }`}
              />
            ))}
          </div>

          {/* X close */}
          <button
            onClick={handleComplete}
            className="text-gray-500 hover:text-gray-300 transition-colors text-lg leading-none"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Step content */}
        <div className="px-8 pt-4 pb-8" style={slideStyle}>
          {/* Emoji circle */}
          <div className="w-20 h-20 rounded-2xl bg-brand-600/10 flex items-center justify-center text-4xl mx-auto mb-6">
            {current.emoji}
          </div>

          {/* Subtitle pill */}
          <div className="flex justify-center mb-3">
            <span className="text-xs font-semibold text-[#00D9FF] bg-brand-600/10 px-3 py-1 rounded-full inline-block">
              {current.subtitle}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-extrabold text-white text-center mb-3">
            {current.title}
          </h2>

          {/* Description */}
          <p className="text-gray-400 text-base text-center leading-relaxed mb-6">
            {current.description}
          </p>

          {/* Tip box */}
          {current.tip && (
            <div className="bg-white/[0.04] border border-white/[0.07] rounded-xl px-4 py-3 mb-6 text-sm text-gray-400">
              💡 {current.tip}
              {current.tipLink && (
                <>
                  {' '}
                  <a
                    href={current.tipLink}
                    onClick={handleComplete}
                    className="text-[#00D9FF] hover:text-[#00D9FF] underline transition-colors"
                  >
                    {current.tipLinkLabel}
                  </a>
                </>
              )}
            </div>
          )}

          {/* Bottom nav */}
          <div className="flex items-center justify-between mt-2">
            {/* Left: skip (non-final) */}
            {!isFinal ? (
              <button
                onClick={handleComplete}
                className="text-sm text-gray-600 hover:text-gray-400 transition-colors"
              >
                Skip
              </button>
            ) : (
              <span />
            )}

            {/* Right: back + cta */}
            <div className="flex items-center gap-3">
              {step > 0 && (
                <button
                  onClick={handleBack}
                  disabled={animating}
                  className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
                >
                  ← Back
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={animating}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isFinal
                    ? 'bg-brand-600 hover:bg-brand-500 text-white'
                    : 'border border-brand-600 text-[#00D9FF] hover:bg-brand-500/20'
                }`}
              >
                {current.cta}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
