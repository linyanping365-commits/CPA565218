export interface Offer {
  id: string;
  serialNumber: number;
  title: string;
  payout: string;
  countries: string[];
  status: 'Available' | 'APPROVAL';
  createdAt: string;
  updatedAt: string;
}

const formatDate = (date: Date) => {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const generateRandomDates = (seed: number) => {
  const start = new Date('2025-10-01T00:00:00').getTime();
  const end = new Date('2026-04-05T00:00:00').getTime();
  const creationTime = new Date(start + seededRandom(seed) * (end - start));
  
  const maxInterval = 5 * 24 * 60 * 60 * 1000;
  const updateTime = new Date(Math.min(creationTime.getTime() + seededRandom(seed + 1) * maxInterval, end));
  
  return {
    createdAt: formatDate(creationTime),
    updatedAt: formatDate(updateTime)
  };
};

// Simple seeded random generator for deterministic shuffling
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const generateOffers = (): Offer[] => {
  const allOffers: Offer[] = [];
  const totalCount = 2040; // 60 low + 1980 high
  
  // Create a pool of IDs from 1001 to 3040
  const idPool = Array.from({ length: totalCount }, (_, i) => 1001 + i);
  
  // Deterministically shuffle the ID pool using a fixed seed (e.g., 42)
  for (let i = idPool.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(i + 42) * (i + 1));
    [idPool[i], idPool[j]] = [idPool[j], idPool[i]];
  }

  // 60 offers between $10 and $15
  for (let i = 1; i <= 60; i++) {
    const basePrice = 10.25;
    const increment = (i * 0.73) % 4.50;
    const price = (basePrice + increment).toFixed(2);
    
    const dates = generateRandomDates(i * 10);
    allOffers.push({
      id: `low-${i}`,
      serialNumber: idPool[i - 1], // Use shuffled ID
      title: `(Web/Wap) #L${i} V2 (Biweekly) - Premium Offer - US/UK/CA - CC Submit`,
      payout: `$${price}`,
      countries: ['us', 'gb', 'ca'],
      status: 'Available',
      ...dates
    });
  }

  // 1980 offers between $16 and $40
  for (let i = 1; i <= 1980; i++) {
    // Use seeded random for prices too to keep them fixed
    const price = (seededRandom(i + 100) * 24 + 16).toFixed(2);
    const dates = generateRandomDates(i * 20 + 5000);
    allOffers.push({
      id: `high-${i}`,
      serialNumber: idPool[60 + i - 1], // Use shuffled ID
      title: `(Web/Wap) #H${i} V2 (Biweekly) - High Value Campaign - Global - CC Submit`,
      payout: `$${price}`,
      countries: ['us', 'kr', 'tw', 'hk'],
      status: 'APPROVAL',
      ...dates
    });
  }

  // Deterministically shuffle the final array order so they appear in random but fixed order
  for (let i = allOffers.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(i + 999) * (i + 1));
    [allOffers[i], allOffers[j]] = [allOffers[j], allOffers[i]];
  }

  return allOffers;
};

export const ALL_OFFERS = generateOffers();
