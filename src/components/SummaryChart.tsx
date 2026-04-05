import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const data = Array.from({ length: 24 }, (_, i) => ({
  time: `${String(i).padStart(2, '0')}:00`,
  clicks: 0,
  conversions: 0,
  payout: 0,
}));

export default function SummaryChart() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-2">
          <span className="text-gray-600 font-medium">Summary</span>
          <select className="border rounded px-2 py-1 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-orange-500">
            <option>Today</option>
            <option>Yesterday</option>
            <option>Month</option>
          </select>
        </div>
        <div className="flex space-x-2 text-gray-400">
          <button className="hover:text-gray-600">_</button>
          <button className="hover:text-gray-600">□</button>
          <button className="hover:text-gray-600">×</button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8 text-center">
        <div>
          <div className="text-red-500 text-sm font-medium mb-1">Approved Income</div>
          <div className="text-red-500 text-xl font-bold">$ 0.00</div>
        </div>
        <div>
          <div className="text-orange-400 text-sm font-medium mb-1">Pending Income</div>
          <div className="text-orange-400 text-xl font-bold">$ 0.00</div>
        </div>
        <div>
          <div className="text-green-500 text-sm font-medium mb-1">Conversions</div>
          <div className="text-green-500 text-xl font-bold">0</div>
        </div>
        <div>
          <div className="text-blue-400 text-sm font-medium mb-1">Clicks</div>
          <div className="text-blue-400 text-xl font-bold">0</div>
        </div>
      </div>

      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={false} stroke="#f0f0f0" />
            <XAxis 
              dataKey="time" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#999' }}
              interval={1}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#999' }}
              domain={[0, 100]}
              ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
            />
            <Tooltip />
            <Legend 
              verticalAlign="top" 
              align="center" 
              iconType="rect"
              wrapperStyle={{ paddingBottom: '20px' }}
            />
            <Line type="monotone" dataKey="clicks" stroke="#a3cfbb" strokeWidth={2} dot={false} name="Clicks" />
            <Line type="monotone" dataKey="conversions" stroke="#d1e7dd" strokeWidth={2} dot={false} name="Conversions" />
            <Line type="monotone" dataKey="payout" stroke="#f199bf" strokeWidth={2} dot={false} name="Payout" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
