
import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";

// --- TYPES & CONSTANTS ---
type RelationshipType = 'partner' | 'spouse' | 'anniversary' | 'long_distance' | 'crush' | 'friend' | 'parent' | 'sibling';

const RELATIONSHIP_OPTIONS: { value: RelationshipType; label: string }[] = [
  { value: 'partner', label: 'Partner/Significant Other' },
  { value: 'spouse', label: 'Spouse/Life Partner' },
  { value: 'anniversary', label: 'Anniversary Partner' },
  { value: 'long_distance', label: 'Long-distance Love' },
  { value: 'crush', label: 'A Secret Crush' },
  { value: 'friend', label: 'A Best Friend' },
  { value: 'parent', label: 'A Parent' },
  { value: 'sibling', label: 'A Sibling' },
];

interface GeneratedMessage {
  quote: string;
  author?: string;
}

interface SavedMessage extends GeneratedMessage {
  id: string;
  recipient: string;
  relationship: string;
  date: string;
}

// --- ICONS ---
const Icons = {
  Heart: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.5 3c1.372 0 2.615.553 3.5 1.442C11.885 3.553 13.128 3 14.5 3c2.786 0 5.25 2.322 5.25 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001Z" />
    </svg>
  ),
  Sparkles: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 1