import type { QuoteFormData, Quote } from '../types/QuoteData';

export function calculateRates(form: QuoteFormData): Quote {
  const baseRate = 20;
  const weightRate = 0.5;
  const serviceCharge = 4;
  const insurance = 2;
  const taxes = 2;

  const weightCharge = form.weight * weightRate;
  const total = baseRate + weightCharge + serviceCharge + insurance + taxes;

  return {
    from: form.from,
    to: form.to,
    date: form.date,
    mode: form.mode,
    baseRate,
    weightCharge,
    serviceCharge,
    insurance,
    taxes,
    total,
  };
}