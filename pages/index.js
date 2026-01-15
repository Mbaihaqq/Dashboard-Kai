import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { supabase } from '../lib/supabaseClient';

export default function Dashboard() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [unitsData, setUnitsData] = useState([]);
  const [summary, setSummary] = useState({ new: 0, open: 0, progress: 0, closed: 0 });

  useEffect(() => {
    const loggedIn = sessionStorage.getItem('isLoggedIn');
    if (!loggedIn) {
      router.push('/loginPage/login');
    } else {
      setIsAuthorized(true);
      fetchHazardStatistics();
    }
  }, [router]);

  const fetchHazardStatistics = async () => {
    try {
      let allData = [];
      let from = 0;
      let to = 999;
      let hasMore = true;

      // LOGIKA NO LIMIT: Melakukan fetch berulang (pagination) sampai semua data terbaca 
      while (hasMore) {
        const { data, error } = await supabase
          .from('hazards')
          .select('*')
          .range(from, to);

        if (error) throw error;

        if (data && data.length > 0) {
          allData = [...allData, ...data];
          from += 1000;
          to += 1000;
        } else {
          hasMore = false;
        }
      }

      if (allData.length === 0) return;

      // 1. Hitung Ringkasan Total untuk Card Atas 
      const totalOpen = allData.filter(d => d.status === 'Open').length;
      const totalProgress = allData.filter(d => d.status === 'Work In Progress').length;
      const totalClosed = allData.filter(d => d.status === 'Closed').length;

      setSummary({
        new: totalOpen,
        open: totalOpen,
        progress: totalProgress,
        closed: totalClosed
      });

      // 2. LOGIKA UNIT DINAMIS: Mengambil semua unit unik yang ada di data 
      const allUniqueUnits = [...new Set(allData.map(item => item.unit))].filter(Boolean);

      const formattedUnits = allUniqueUnits.map(unitName => {
        const unitItems = allData.filter(d => d.unit === unitName);
        const total = unitItems.length;
        const closed = unitItems.filter(d => d.status === 'Closed').length;
        const progress = unitItems.filter(d => d.status === 'Work In Progress').length;
        const open = unitItems.filter(d => d.status === 'Open').length;
        
        // Hitung persentase penyelesaian (TL%) per unit 
        const completion = total > 0 ? Math.round((closed / total) * 100) : 0;

        return {
          name: unitName,
          total,
          completion,
          chartData: [
            { name: 'Closed', value: closed, color: '#22c55e' },
            { name: 'Progress', value: progress, color: '#F26522' },
            { name: 'Open', value: open, color: '#ef4444' }
          ]
        };
      });

      // Urutkan unit secara alfabetis agar tampilan rapi 
      setUnitsData(formattedUnits.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (error) {
      console.error("Gagal memuat dashboard:", error.message);
    }
  };

  if (!isAuthorized) return <div className="h-screen bg-white"></div>;

  return (
    <Layout>
      <div className="mb-8 flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-black text-[#005DAA] uppercase italic">Hazard Report Dashboard</h1>
          <p className="text-sm text-gray-400 font-bold uppercase tracking-tighter">DAOP 4 Semarang Monitoring</p>
        </div>
      </div>

      {/* Ringkasan Stats Atas  */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard title="Total Open" value={summary.open} color="bg-orange-50 text-orange-600 border-orange-100" />
        <StatCard title="Total Progress" value={summary.progress} color="bg-blue-50 text-[#005DAA] border-blue-100" />
        <StatCard title="Total Closed" value={summary.closed} color="bg-green-50 text-green-600 border-green-100" />
        <StatCard title="Grand Total" value={summary.open + summary.progress + summary.closed} color="bg-gray-50 text-gray-800 border-gray-200" />
      </div>

      {/* Grid Unit Dinamis (Menampilkan Semua Unit yang Ada) [cite: 3, 5, 8] */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
        {unitsData.map((unit, idx) => (
          <div key={idx} className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center hover:shadow-xl transition-all duration-300">
            <h3 className="text-[11px] font-black text-[#005DAA] mb-4 self-start uppercase italic leading-tight h-8 line-clamp-2">
              Unit {unit.name}
            </h3>
            
            <div className="relative w-40 h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={unit.chartData}
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {unit.chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-gray-800 leading-none">{unit.completion}%</span>
                <span className="text-[9px] font-black text-gray-400 uppercase mt-1 tracking-widest">TL%</span>
              </div>
            </div>

            {/* Detail Statistik per Unit  */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-6 w-full text-[9px] font-black text-gray-500 uppercase border-t pt-4 border-gray-50">
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500"></span> Open: {unit.chartData[2].value}</div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#F26522]"></span> Progress: {unit.chartData[1].value}</div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500"></span> Closed: {unit.chartData[0].value}</div>
              <div className="flex items-center gap-1.5 font-bold text-[#005DAA]"><span className="w-2 h-2 rounded-full bg-[#005DAA]"></span> Total: {unit.total}</div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div className={`${color} p-5 rounded-[2rem] border-2 flex flex-col items-center justify-center shadow-sm`}>
      <span className="text-4xl font-black mb-1">{value.toLocaleString('id-ID')}</span>
      <span className="text-[10px] font-black uppercase tracking-widest opacity-80">{title}</span>
    </div>
  );
}