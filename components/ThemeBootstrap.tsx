"use client";

import { useEffect } from 'react';
import { applyReduceMotion, applyTheme, loadReduceMotion, loadTheme } from '@/lib/theme';

export function ThemeBootstrap() {
  useEffect(() => {
    const savedTheme = loadTheme('aurora');
    applyTheme(savedTheme);
    const savedReduce = loadReduceMotion();
    applyReduceMotion(savedReduce);
  }, []);

  return null;
}
