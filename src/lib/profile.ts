const KEY = 'pietri_profile';

export type Profile = {
  prenom: string;
  nom: string;
  email: string;
  phone: string;
  whatsapp: string;
  notifSMS: boolean;
  notifEmail: boolean;
};

const DEFAULT: Profile = { prenom: '', nom: '', email: '', phone: '', whatsapp: '', notifSMS: true, notifEmail: true };

export function getProfile(): Profile {
  if (typeof window === 'undefined') return DEFAULT;
  try { return { ...DEFAULT, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { return DEFAULT; }
}

export function saveProfile(p: Profile) {
  localStorage.setItem(KEY, JSON.stringify(p));
}
