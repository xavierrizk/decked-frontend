import React, { useState } from 'react';

const FAQS = [
  // Getting Started
  { category: 'Getting Started', q: "What is DECK'D?", a: "DECK'D is a community platform where ravers and music fans rate, review, and discover DJ sets. Think of it like Letterboxd but for DJ mixes." },
  { category: 'Getting Started', q: 'How do I sign up?', a: "Click 'Sign Up' on the home page. Verify your email, then you're ready to start rating!" },
  { category: 'Getting Started', q: "Is DECK'D free?", a: "Yes! DECK'D is completely free to use. Rate sets, follow Artists, and connect with the community at no cost." },
  // Using DECK'D
  { category: "Using DECK'D", q: "How do I rate a set?", a: "Click on any set to view it. Click the stars to rate it 1–5 (you can give half stars). Optionally add a written review." },
  { category: "Using DECK'D", q: "Can I edit or delete my rating?", a: "Yes! Go to the set and click 'Delete' on your rating. You can then rate it again with a new one." },
  { category: "Using DECK'D", q: "What do the half stars mean?", a: "Half stars let you give more specific ratings, e.g. 4.5 stars for a set that was great but not perfect." },
  { category: "Using DECK'D", q: "How do I follow an Artist?", a: "Go to an Artist's profile and click the 'Follow' button. You'll see their new sets in your activity feed." },
  { category: "Using DECK'D", q: "What's the activity feed?", a: "Your feed shows new sets from Artists you follow. Visit /feed to see what's new from artists you care about." },
  // Artist Profiles
  { category: 'Artist Profiles', q: 'How do I create an Artist profile?', a: "Go to 'Become an Artist' and fill out a request. Include links to your Instagram, SoundCloud, etc. so we can verify you're a real Artist. We'll review and approve your profile." },
  { category: 'Artist Profiles', q: 'Why was my Artist profile rejected?', a: 'We verify Artists to keep the platform authentic. Common reasons: invalid social links, no history as an Artist, or incomplete information. You can re-request after 7 days.' },
  { category: 'Artist Profiles', q: 'What does the verified badge mean?', a: "A verified badge (✅) means we've confirmed this is an official Artist profile. It helps users trust the profile." },
  { category: 'Artist Profiles', q: 'Can I upload sets to my Artist profile?', a: "Once your Artist profile is approved, go to 'My Artists' and click 'Add Set'. You can link to a YouTube video and add details like location, genre, and duration." },
  // Ratings & Reviews
  { category: 'Ratings & Reviews', q: 'Can I rate a set multiple times?', a: 'No, you can only have one rating per set. You can delete your existing rating and submit a new one if you change your mind.' },
  { category: 'Ratings & Reviews', q: 'What should I write in a review?', a: "Be honest! Tell other ravers what you thought. Mention tracks you loved, the energy, the flow — anything that stood out. The community trusts your opinion." },
  { category: 'Ratings & Reviews', q: 'Can I see what other people rated?', a: "Yes! On every set page you'll see the average rating and all user reviews. Click on a user to see their profile and all their ratings." },
  // Account & Profile
  { category: 'Account & Profile', q: 'How do I edit my profile?', a: "Click your username in the navbar, then 'Edit Profile'. You can upload a profile picture, write a bio, add your location and more." },
  { category: 'Account & Profile', q: 'Can I delete my account?', a: "We don't have a self-service option yet. Email support@decked.com with your request and we'll delete your account within 7 days." },
  { category: 'Account & Profile', q: 'How do I friend someone?', a: "Go to their profile and click 'Add Friend'. They'll show up in your friends list and you can see what they're rating." },
  { category: 'Account & Profile', q: "What's the difference between following and friending?", a: "Follow = see new sets from Artists you love. Friend = connect with other users to see what they're rating and reviewing." },
  // Technical
  { category: 'Technical', q: 'What video formats do you support?', a: 'We currently support YouTube links. Paste a YouTube URL when creating a set.' },
  { category: 'Technical', q: "Is DECK'D available on mobile?", a: "Yes! DECK'D works great in your phone browser. Native iOS/Android apps are coming soon." },
  { category: 'Technical', q: 'Do you have an app?', a: "Not yet, but you can save DECK'D to your home screen. iOS: tap Share → Add to Home Screen. Android: tap Menu → Install app." },
  // Safety & Moderation
  { category: 'Safety & Moderation', q: "How does DECK'D handle inappropriate content?", a: "You can report sets, comments, or users using the report button. Our team reviews all reports and removes content that violates our guidelines." },
  { category: 'Safety & Moderation', q: 'What happens if I get reported?', a: 'Our team reviews every report. Violations result in a warning, suspension, or permanent ban depending on severity.' },
  // Support
  { category: 'Support', q: 'Who should I contact with questions?', a: "Email us at support@decked.com. We'll get back to you within 24 hours." },
  { category: 'Support', q: 'I found a bug. What do I do?', a: "Let us know! Email support@decked.com with details about the bug — what you were doing, what happened, and what device/browser you're on. We really appreciate it." },
];

const CATEGORIES = ['All', ...Array.from(new Set(FAQS.map(f => f.category)))];

export default function HelpPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [openIndex, setOpenIndex] = useState(null);

  const filtered = FAQS.filter(f => {
    const matchesCategory = activeCategory === 'All' || f.category === activeCategory;
    const matchesSearch =
      !search ||
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const grouped = CATEGORIES.filter(c => c !== 'All').reduce((acc, cat) => {
    const items = filtered.filter(f => f.category === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#0d0d0f] px-4 pb-20">
      <div className="max-w-3xl mx-auto">

        {/* Hero */}
        <div className="pt-16 pb-10 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-600/20 border border-brand-600/30 text-[#00D9FF] text-xs font-semibold mb-5">
            ✦ Help Center
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3" style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: '-0.02em' }}>
            How can we help?
          </h1>
          <p className="text-gray-500 text-base mb-8">
            Find answers to common questions about DECK'D.
          </p>

          {/* Search bar */}
          <div className="relative max-w-xl mx-auto">
            <div className="flex items-center gap-3 bg-[#111114] border border-white/10 focus-within:border-[#00D9FF]/50 rounded-2xl px-5 py-3.5 transition-all duration-200">
              <svg className="w-4 h-4 text-gray-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search questions…"
                className="flex-1 bg-transparent text-white placeholder-gray-600 outline-none text-sm"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0"
                  aria-label="Clear search"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 flex-wrap justify-center mb-10">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-brand-600 border-brand-600 text-white'
                  : 'bg-white/[0.03] border-white/[0.07] text-gray-400 hover:border-white/20 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* No results */}
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-white font-semibold text-lg mb-2">
              No results for "{search}"
            </p>
            <p className="text-gray-500 text-sm">
              Try a different search or email{' '}
              <a
                href="mailto:support@decked.com"
                className="text-[#00D9FF] hover:text-[#00D9FF] underline underline-offset-2 transition-colors"
              >
                support@decked.com
              </a>
            </p>
          </div>
        )}

        {/* FAQ sections */}
        {filtered.length > 0 && (
          activeCategory === 'All' ? (
            Object.entries(grouped).map(([cat, items]) => (
              <div key={cat}>
                <p className="text-xs font-bold text-[#00D9FF] uppercase tracking-widest mb-3 mt-8">
                  {cat}
                </p>
                <div className="bg-[#111114] border border-white/[0.07] rounded-2xl overflow-hidden divide-y divide-white/[0.05]">
                  {items.map(faq => {
                    const globalIndex = FAQS.indexOf(faq);
                    return (
                      <div key={globalIndex}>
                        <button
                          onClick={() => setOpenIndex(openIndex === globalIndex ? null : globalIndex)}
                          className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left hover:bg-white/[0.02] transition-colors"
                        >
                          <span className="text-white font-semibold text-sm md:text-base">{faq.q}</span>
                          <svg
                            className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform duration-200 ${openIndex === globalIndex ? 'rotate-180' : ''}`}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {openIndex === globalIndex && (
                          <div className="px-6 pb-5 text-gray-400 text-sm leading-relaxed border-t border-white/[0.05]">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-[#111114] border border-white/[0.07] rounded-2xl overflow-hidden divide-y divide-white/[0.05]">
              {filtered.map(faq => {
                const globalIndex = FAQS.indexOf(faq);
                return (
                  <div key={globalIndex}>
                    <button
                      onClick={() => setOpenIndex(openIndex === globalIndex ? null : globalIndex)}
                      className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left hover:bg-white/[0.02] transition-colors"
                    >
                      <span className="text-white font-semibold text-sm md:text-base">{faq.q}</span>
                      <svg
                        className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform duration-200 ${openIndex === globalIndex ? 'rotate-180' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {openIndex === globalIndex && (
                      <div className="px-6 pb-5 text-gray-400 text-sm leading-relaxed border-t border-white/[0.05]">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* Bottom CTA */}
        {filtered.length > 0 && (
          <div className="bg-brand-600/10 border border-brand-600/20 rounded-2xl p-8 text-center mt-12">
            <h2 className="text-white font-bold text-xl mb-2">Still need help?</h2>
            <p className="text-gray-400 text-sm mb-5">
              Can't find what you're looking for? Reach out and we'll help.
            </p>
            <a
              href="mailto:support@decked.com"
              className="inline-block px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Email support@decked.com
            </a>
          </div>
        )}

      </div>
    </div>
  );
}
