import { TimeOfDay } from '../../types';

export interface BackgroundConfig {
  base: string;
  orb1: string;
  orb2: string;
  orb3: string;
  textColor: string;
}

export const BG_CONFIG: Record<TimeOfDay, BackgroundConfig> = {
  dawn: {
    base: 'linear-gradient(135deg, #1a0a00 0%, #3d1a00 40%, #1a0510 100%)',
    orb1: 'radial-gradient(circle, rgba(255,140,60,0.35) 0%, transparent 70%)',
    orb2: 'radial-gradient(circle, rgba(255,80,100,0.2) 0%, transparent 70%)',
    orb3: 'radial-gradient(circle, rgba(255,200,100,0.15) 0%, transparent 70%)',
    textColor: 'rgba(255,220,180,0.9)',
  },
  day: {
    base: 'linear-gradient(160deg, #0a1628 0%, #0d2240 45%, #091830 100%)',
    orb1: 'radial-gradient(circle, rgba(60,140,255,0.25) 0%, transparent 70%)',
    orb2: 'radial-gradient(circle, rgba(100,180,255,0.15) 0%, transparent 70%)',
    orb3: 'radial-gradient(circle, rgba(30,80,200,0.2) 0%, transparent 70%)',
    textColor: 'rgba(200,230,255,0.95)',
  },
  dusk: {
    base: 'linear-gradient(135deg, #0d0520 0%, #2a0a2e 40%, #1a0010 100%)',
    orb1: 'radial-gradient(circle, rgba(200,60,255,0.25) 0%, transparent 70%)',
    orb2: 'radial-gradient(circle, rgba(255,80,60,0.2) 0%, transparent 70%)',
    orb3: 'radial-gradient(circle, rgba(100,0,180,0.2) 0%, transparent 70%)',
    textColor: 'rgba(255,200,240,0.9)',
  },
  night: {
    base: 'linear-gradient(160deg, #030508 0%, #0a0e1a 50%, #05080f 100%)',
    orb1: 'radial-gradient(circle, rgba(30,60,140,0.2) 0%, transparent 70%)',
    orb2: 'radial-gradient(circle, rgba(10,30,80,0.15) 0%, transparent 70%)',
    orb3: 'radial-gradient(circle, rgba(20,40,100,0.1) 0%, transparent 70%)',
    textColor: 'rgba(180,200,240,0.85)',
  },
};
