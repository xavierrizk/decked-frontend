import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../api';

const COUNTRY_NAMES = {
  US: 'USA', CA: 'Canada', GB: 'UK', DE: 'Germany', FR: 'France',
  NL: 'Netherlands', ES: 'Spain', IT: 'Italy', AU: 'Australia',
  BR: 'Brazil', JP: 'Japan', KR: 'South Korea', CN: 'China',
  IN: 'India', MX: 'Mexico', AR: 'Argentina', BE: 'Belgium',
  CH: 'Switzerland', AT: 'Austria', PT: 'Portugal', CZ: 'Czech Republic',
  PL: 'Poland', RO: 'Romania', HU: 'Hungary', SE: 'Sweden',
  NO: 'Norway', DK: 'Denmark', FI: 'Finland', GR: 'Greece',
  TR: 'Turkey', RU: 'Russia', ZA: 'South Africa', NG: 'Nigeria',
  EG: 'Egypt', AE: 'UAE', IL: 'Israel', SG: 'Singapore',
  TH: 'Thailand', ID: 'Indonesia', MY: 'Malaysia', PH: 'Philippines',
  VN: 'Vietnam', CO: 'Colombia', CL: 'Chile', PE: 'Peru',
  NZ: 'New Zealand', IE: 'Ireland', HR: 'Croatia', RS: 'Serbia',
  UA: 'Ukraine', MA: 'Morocco', KE: 'Kenya', HK: 'Hong Kong',
  TW: 'Taiwan', PK: 'Pakistan', BD: 'Bangladesh', SK: 'Slovakia',
  BG: 'Bulgaria', LU: 'Luxembourg', IS: 'Iceland', LV: 'Latvia',
  LT: 'Lithuania', EE: 'Estonia', SI: 'Slovenia', CU: 'Cuba',
  JM: 'Jamaica', GH: 'Ghana', SN: 'Senegal', ET: 'Ethiopia',
  TZ: 'Tanzania', MZ: 'Mozambique', LK: 'Sri Lanka', NP: 'Nepal',
  MM: 'Myanmar', KH: 'Cambodia', UZ: 'Uzbekistan', KZ: 'Kazakhstan',
  EC: 'Ecuador', BO: 'Bolivia', PY: 'Paraguay', UY: 'Uruguay',
  VE: 'Venezuela', DO: 'Dominican Republic', PR: 'Puerto Rico',
  GT: 'Guatemala', CR: 'Costa Rica', PA: 'Panama', JO: 'Jordan',
  LB: 'Lebanon', SA: 'Saudi Arabia', KW: 'Kuwait', QA: 'Qatar',
  BH: 'Bahrain',
};

export default function CityAutocomplete({ value, onChange, placeholder = 'City, e.g. London, Berlin…', className = '' }) {
  const [inputText, setInputText]     = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen]               = useState(false);
  const [confirmed, setConfirmed]     = useState(!!value);
  const [error, setError]             = useState(false);
  const debounce = useRef(null);
  const wrapRef  = useRef(null);

  // Sync external value resets (e.g. form reset)
  useEffect(() => {
    setInputText(value || '');
    setConfirmed(!!value);
    setError(false);
  }, [value]);

  useEffect(() => {
    clearTimeout(debounce.current);
    setConfirmed(false);
    setError(false);
    if (!inputText || inputText.length < 1) { setSuggestions([]); setOpen(false); return; }
    debounce.current = setTimeout(async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/cities/search?q=${encodeURIComponent(inputText)}`);
        setSuggestions(data);
        setOpen(data.length > 0);
      } catch { setSuggestions([]); }
    }, 200);
  }, [inputText]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = e => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const select = (city) => {
    setInputText(city.name);
    setConfirmed(true);
    setError(false);
    setSuggestions([]);
    setOpen(false);
    onChange(city.name);
  };

  const handleBlur = () => {
    setTimeout(() => {
      if (!confirmed) {
        if (inputText.trim()) {
          // Text entered but nothing selected — clear it
          setInputText('');
          setError(true);
          onChange('');
        }
        setSuggestions([]);
        setOpen(false);
      }
    }, 150);
  };

  const handleChange = (e) => {
    setInputText(e.target.value);
    setConfirmed(false);
    setError(false);
  };

  const errorClass = error ? ' border-red-500/60' : '';

  return (
    <div ref={wrapRef} className="relative">
      <input
        type="text"
        value={inputText}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={() => { if (suggestions.length > 0) setOpen(true); }}
        placeholder={placeholder}
        className={className + errorClass}
        autoComplete="off"
      />
      {confirmed && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00D9FF] text-xs pointer-events-none">✓</span>
      )}
      {error && (
        <p className="text-red-400 text-[11px] mt-1">Please select a city from the list.</p>
      )}
      {open && suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 top-full mt-1 z-50 bg-[#111114] border border-white/10 rounded-lg overflow-hidden shadow-2xl">
          {suggestions.map((c, i) => (
            <li key={i}>
              <button
                type="button"
                onMouseDown={() => select(c)}
                className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/[0.06] transition-colors text-left"
              >
                <span className="text-white text-sm">{c.name}</span>
                <span className="text-gray-600 text-xs ml-3 flex-shrink-0">
                  {c.region ? `${c.region}, ` : ''}{COUNTRY_NAMES[c.country] || c.country}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
