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
      const { data, error } = await supabase.from('hazards').select('*');
      if (error) throw error;
      if (!data || data.length === 0) return;

      // 1. Ringkasan Atas
      setSummary({
        new: data.filter(d => d.status === 'Open').length,
        open: data.filter(d => d.status === 'Open').length,
        progress: data.filter(d => d.status === 'Work In Progress').length,
        closed: data.filter(d => d.status === 'Closed').length
      });

      // 2. LOGIKA DINAMIS: Mengambil semua Unit unik yang ada di data
      const allUniqueUnits = [...new Set(data.map(item => item.unit))].filter(Boolean);

      const formattedUnits = allUniqueUnits.map(unitName => {
        const unitItems = data.filter(d => d.unit === unitName);
        const total = unitItems.length;
        const closed = unitItems.filter(d => d.status === 'Closed').length;
        const progress = unitItems.filter(d => d.status === 'Work In Progress').length;
        const open = unitItems.filter(d => d.status === 'Open').length;
        
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

      // Urutkan berdasarkan nama agar tampilan rapi
      setUnitsData(formattedUnits.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (error) {
      console.error("Gagal sinkronisasi dashboard:", error.message);
    }
  };

  if (!isAuthorized) return <div className="h-screen bg-white"></div>;

  return (
    <Layout>
      <div className="mb-8 flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-black text-[#005DAA] uppercase">Hazard Report</h1>
          <p className="text-sm text-gray-400 font-bold">DAOP 4 SEMARANG MONITORING SYSTEM</p>
        </div>
      </div>

      {/* Ringkasan Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="New Hazard" value={summary.new} color="bg-pink-100 text-pink-600 border-pink-200" />
        <StatCard title="Open Hazard" value={summary.open} color="bg-orange-100 text-orange-600 border-orange-200" />
        <StatCard title="In Progress" value={summary.progress} color="bg-purple-100 text-purple-600 border-purple-200" />
        <StatCard title="Closed" value={summary.closed} color="bg-green-100 text-green-600 border-green-200" />
      </div>

      {/* Tampilan Grid Otomatis Menyesuaikan Jumlah Unit */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {unitsData.map((unit, idx) => (
          <div key={idx} className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center hover:shadow-lg transition-all">
            <h3 className="text-[11px] font-black text-[#005DAA] mb-4 self-start uppercase italic leading-tight h-8">
              Unit {unit.name}
            </h3>
            
            <div className="relative w-36 h-36">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={unit.chartData}
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {unit.chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-gray-800">{unit.completion}%</span>
                <span className="text-[9px] font-black text-gray-400 uppercase">TL%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-5 w-full text-[9px] font-black text-gray-500 uppercase">
              <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> O: {unit.chartData[2].value}</div>
              <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#F26522]"></span> P: {unit.chartData[1].value}</div>
              <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> C: {unit.chartData[0].value}</div>
              <div className="flex items-center gap-1.5 font-bold text-[#005DAA]"><span className="w-1.5 h-1.5 rounded-full bg-blue-900"></span> T: {unit.total}</div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div className={`${color} p-4 rounded-3xl border flex flex-col items-center shadow-sm`}>
      <span className="text-3xl font-black mb-1">{value}</span>
      <span className="text-[9px] font-black uppercase tracking-widest opacity-70">{title}</span>
    </div>
  );
}