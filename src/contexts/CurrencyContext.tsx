'use client';
import { createContext, useContext, useState, useEffect } from 'react';

export type Currency = 'EUR' | 'XOF' | 'GBP' | 'USD';

const RATES: Record<Currency, number> = {
  EUR: 1,
  XOF: 655.957,
  GBP: 0.84,
  USD: 1.07,
};

type CurrencyCtx = {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  format: (eur: number) => string;
  toEur: (amount: number) => number;
};

const Ctx = createContext<CurrencyCtx>({
  currency: 'EUR',
  setCurrency: () => {},
  format: (n) => `€${n}`,
  toEur: (n) => n,
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('EUR');

  useEffect(() => {
    const saved = localStorage.getItem('pietri_currency') as Currency;
    if (saved && RATES[saved]) setCurrencyState(saved);
  }, []);

  function setCurrency(c: Currency) {
    setCurrencyState(c);
    localStorage.setItem('pietri_currency', c);
  }

  function format(eur: number): string {
    const amount = eur * RATES[currency];
    if (currency === 'XOF') return `${Math.round(amount).toLocaleString('fr-FR')} FCFA`;
    if (currency === 'GBP') return `£${amount.toFixed(0)}`;
    if (currency === 'USD') return `$${amount.toFixed(0)}`;
    return `€${amount.toFixed(0)}`;
  }

  function toEur(amount: number): number {
    return amount / RATES[currency];
  }

  return <Ctx.Provider value={{ currency, setCurrency, format, toEur }}>{children}</Ctx.Provider>;
}

export function useCurrency() {
  return useContext(Ctx);
}
