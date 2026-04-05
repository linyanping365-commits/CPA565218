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
  const offers: Offer[] = [];
  
  // 60 offers between $10 and $15
  for (let i = 1; i <= 60; i++) {
    const price = (Math.random() * 5 + 10).toFixed(2);
    const dates = generateRandomDates();
    offers.push({
      id: `low-${i}`,
      serialNumber: 0,
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
    offers.push({
      id: `high-${i}`,
      serialNumber: 0,
      title: `(Web/Wap) #H${i} V2 (Biweekly) - High Value Campaign - Global - CC Submit`,
      payout: `$${price}`,
      countries: ['us', 'kr', 'tw', 'hk'],
      status: 'Available',
      ...dates
    });
  }

  for (let i = offers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [offers[i], offers[j]] = [offers[j], offers[i]];
  }

  let currentSerial = 1001;
  for (let i = 0; i < offers.length; i++) {
    offers[i].serialNumber = currentSerial++;
  }

  return offers;
};

export const ALL_OFFERS = generateOffers();
