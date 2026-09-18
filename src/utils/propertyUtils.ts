import { PropertyTransaction } from '../types';

export function formatSGD(amount: number): string {
  if (isNaN(amount) || amount === 0) return 'S$ 0';
  return new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency: 'SGD',
    maximumFractionDigits: 0,
  }).format(amount).replace('SGD', 'S$');
}

export function formatPSF(psf: number): string {
  if (isNaN(psf) || psf === 0) return '— psf';
  return `S$${Math.round(psf).toLocaleString()} psf`;
}

export function formatNumber(num: number): string {
  return Math.round(num).toLocaleString();
}

/**
 * Calculates official Singapore Buyer's Stamp Duty (BSD) for residential properties (post Feb 2023 tier update).
 */
export function calculateBSD(price: number): { totalBsd: number; effectiveRate: number; breakdown: { tier: string; amount: number }[] } {
  if (price <= 0) return { totalBsd: 0, effectiveRate: 0, breakdown: [] };

  const tiers = [
    { limit: 180000, rate: 0.01, label: 'First S$180,000 @ 1%' },
    { limit: 180000, rate: 0.02, label: 'Next S$180,000 @ 2%' },
    { limit: 640000, rate: 0.03, label: 'Next S$640,000 @ 3%' },
    { limit: 500000, rate: 0.04, label: 'Next S$500,000 @ 4%' },
    { limit: 1500000, rate: 0.05, label: 'Next S$1,500,000 @ 5%' },
    { limit: Infinity, rate: 0.06, label: 'Remainder exceeding S$3,000,000 @ 6%' },
  ];

  let remaining = price;
  let totalBsd = 0;
  const breakdown: { tier: string; amount: number }[] = [];

  for (const t of tiers) {
    if (remaining <= 0) break;
    const taxableInTier = Math.min(remaining, t.limit);
    const tax = taxableInTier * t.rate;
    totalBsd += tax;
    breakdown.push({ tier: t.label, amount: tax });
    remaining -= taxableInTier;
  }

  const effectiveRate = Number(((totalBsd / price) * 100).toFixed(2));

  return { totalBsd, effectiveRate, breakdown };
}

export function calculateSummaryMetrics(transactions: PropertyTransaction[]) {
  if (!transactions || transactions.length === 0) {
    return {
      count: 0,
      medianPrice: 0,
      medianPsf: 0,
      avgPrice: 0,
      avgPsf: 0,
      minPrice: 0,
      maxPrice: 0,
      ccrCount: 0,
      rcrCount: 0,
      ocrCount: 0,
    };
  }

  const sortedPrices = [...transactions].map((t) => t.transactedPrice).sort((a, b) => a - b);
  const sortedPsfs = [...transactions].map((t) => t.unitPricePsf).sort((a, b) => a - b);

  const mid = Math.floor(sortedPrices.length / 2);
  const medianPrice =
    sortedPrices.length % 2 !== 0
      ? sortedPrices[mid]
      : (sortedPrices[mid - 1] + sortedPrices[mid]) / 2;

  const medianPsf =
    sortedPsfs.length % 2 !== 0
      ? sortedPsfs[mid]
      : (sortedPsfs[mid - 1] + sortedPsfs[mid]) / 2;

  const sumPrice = sortedPrices.reduce((acc, curr) => acc + curr, 0);
  const sumPsf = sortedPsfs.reduce((acc, curr) => acc + curr, 0);

  let ccrCount = 0;
  let rcrCount = 0;
  let ocrCount = 0;

  transactions.forEach((t) => {
    if (t.marketSegment === 'CCR') ccrCount++;
    else if (t.marketSegment === 'RCR') rcrCount++;
    else if (t.marketSegment === 'OCR') ocrCount++;
  });

  return {
    count: transactions.length,
    medianPrice,
    medianPsf,
    avgPrice: Math.round(sumPrice / transactions.length),
    avgPsf: Math.round(sumPsf / transactions.length),
    minPrice: sortedPrices[0] || 0,
    maxPrice: sortedPrices[sortedPrices.length - 1] || 0,
    ccrCount,
    rcrCount,
    ocrCount,
  };
}
