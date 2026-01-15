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
      // Menarik data terbaru dari tabel hazards [cite: 52]
      const { data, error } = await supabase.from('hazards').select('*');
      if (error) throw error;

      if (!data || data.length === 0) return;

      // 1. Hitung Card Ringkasan (Top Summary) sesuai desain PDF
      setSummary({
        new: data.filter(d => d.status === 'Open').length,
        open: data.filter(d => d.status === 'Open').length,
        progress: data.filter(d => d.status === 'Work In Progress').length,
        closed: data.filter(d => d.status === 'Closed').length
      });

      // 2. Daftar Unit Resmi dari Template KAI
      const targetUnits = [
        'Operasi', 'Jalan Rel dan Jembatan', 'Bangunan', 
        'IT', 'Sinyal & Telekomunikasi', 'Sarana',
        'SDM', 'Kesehatan', 'Pengamanan'
      ];

      const formattedUnits = targetUnits.map(unitName => {
        const unitItems = data.filter(d => d.unit === unitName);
        const total = unitItems.length;
        const closed = unitItems.filter(d => d.status === 'Closed').length;
        const progress = unitItems.filter(d => d.status === 'Work In Progress').length;
        const open = unitItems.filter(d => d.status === 'Open').length;
        
        // Hitung TL% (Persentase Penyelesaian)
        const completion = total > 0 ? Math.round((closed / total) * 100) : 0;

        return {
          name: unitName,
          total,
          completion,
          chartData: [
            { name: 'Closed', value: closed, color: '#22c55e' }, // Hijau
            { name: 'Progress', value: progress, color: '#F26522' }, // Oranye KAI
            { name: 'Open', value: open, color: '#ef4444' } // Merah
          ]
        };
      });

      setUnitsData(formattedUnits);
    } catch (error) {
      console.error("Gagal sinkronisasi dashboard:", error.message);
    }
  };

  if (!isAuthorized) return <div className="h-screen bg-white"></div>;

  return (
    <Layout>
      {/* HEADER DASHBOARD */}
      <div className="mb-8 flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-black text-[#005DAA] uppercase">Hazard Report</h1>
          <p className="text-sm text-gray-400 font-bold">DAOP 4 SEMARANG MONITORING SYSTEM</p>
        </div>
        <div className="bg-gray-100 px-4 py-2 rounded-xl text-right">
          <p className="text-[10px] font-black text-gray-400 uppercase">Status Data</p>
          <p className="text-sm font-bold text-[#F26522]">Real-time Database</p>
        </div>
      </div>

      {/* 4 CARD RINGKASAN ATAS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="New Hazard" value={summary.new} color="bg-pink-100 text-pink-600 border-pink-200" />
        <StatCard title="Open Hazard" value={summary.open} color="bg-orange-100 text-orange-600 border-orange-200" />
        <StatCard title="In Progress" value={summary.progress} color="bg-purple-100 text-purple-600 border-purple-200" />
        <StatCard title="Closed" value={summary.closed} color="bg-green-100 text-green-600 border-green-200" />
      </div>

      {/* GRID GRAFIK PER UNIT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {unitsData.map((unit, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center hover:shadow-lg transition-all">
            <h3 className="text-sm font-black text-[#005DAA] mb-4 self-start uppercase italic">Unit {unit.name}</h3>
            
            <div className="relative w-44 h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={unit.chartData}
                    innerRadius={55}
                    outerRadius={75}
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
                <span className="text-3xl font-black text-gray-800">{unit.completion}%</span>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">TL%</span>
              </div>
            </div>

            {/* LEGENDA DATA SESUAI PDF */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-6 w-full text-[10px] font-black text-gray-500 uppercase">
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500"></span> Open: {unit.chartData[2].value}</div>
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#F26522]"></span> Progress: {unit.chartData[1].value}</div>
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500"></span> Closed: {unit.chartData[0].value}</div>
              <div className="flex items-center gap-2 border-l pl-2 border-gray-200"><span className="w-2 h-2 rounded-full bg-blue-900"></span> Total: {unit.total}</div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div className={`${color} p-5 rounded-3xl border flex flex-col items-center shadow-sm`}>
      <span className="text-4xl font-black mb-1">{value}</span>
      <span className="text-[10px] font-black uppercase tracking-widest opacity-70">{title}</span>
    </div>
  );
}