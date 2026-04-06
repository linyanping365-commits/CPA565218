export interface Offer {
  id: string;
  serialNumber: number;
  title: string;
  payout: string;
  countries: string[];
  status: 'Available';
  createdAt: string;
  updatedAt: string;
}

const formatDate = (date: Date) => {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const generateRandomDates = () => {
  const start = new Date('2025-10-01T00:00:00').getTime();
  const end = new Date('2026-04-05T00:00:00').getTime();
  const creationTime = new Date(start + Math.random() * (end - start));
  
  const maxInterval = 5 * 24 * 60 * 60 * 1000;
  const updateTime = new Date(Math.min(creationTime.getTime() + Math.random() * maxInterval, end));
  
  return {
    createdAt: formatDate(creationTime),
    updatedAt: formatDate(updateTime)
  };
};

const generateOffers = (): Offer[] => {
  const lowPayoutOffers: Offer[] = [];
  const highPayoutOffers: Offer[] = [];
  
  // 60 offers between $10 and $15 - FIXED SERIALS 1001-1060
  for (let i = 1; i <= 60; i++) {
    const price = (Math.random() * 5 + 10).toFixed(2);
    const dates = generateRandomDates();
    lowPayoutOffers.push({
      id: `low-${i}`,
      serialNumber: 1000 + i, // Permanent fixed number
      title: `(Web/Wap) #L${i} V2 (Biweekly) - Premium Offer - US/UK/CA - CC Submit`,
      payout: `$${price}`,
      countries: ['us', 'gb', 'ca'],
      status: 'Available',
      ...dates
    });
  }

  // 1980 offers between $16 and $40
  for (let i = 1; i <= 1980; i++) {
    const price = (Math.random() * 24 + 16).toFixed(2);
    const dates = generateRandomDates();
    highPayoutOffers.push({
      id: `high-${i}`,
      serialNumber: 1060 + i,
      title: `(Web/Wap) #H${i} V2 (Biweekly) - High Value Campaign - Global - CC Submit`,
      payout: `$${price}`,
      countries: ['us', 'kr', 'tw', 'hk'],
      status: 'Available',
      ...dates
    });
  }

  const allOffers = [...lowPayoutOffers, ...highPayoutOffers];

  // Shuffle the combined list so they appear in random order, 
  // but their serialNumber is already fixed.
  for (let i = allOffers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allOffers[i], allOffers[j]] = [allOffers[j], allOffers[i]];
  }

  return allOffers;
};

export const ALL_OFFERS = generateOffers();
