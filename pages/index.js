// pages/index.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '../lib/supabaseClient'; 

export default function Dashboard() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  // --- STATE DATA DARI DATABASE ---
  const [dataRevenue, setDataRevenue] = useState([]);
  const [dataTickets, setDataTickets] = useState([]);
  const [percentSelesai, setPercentSelesai] = useState(0);

  useEffect(() => {
    const loggedIn = sessionStorage.getItem('isLoggedIn');
    
    if (!loggedIn) {
      router.push('/loginPage/login');
    } else {
      setIsAuthorized(true);
      fetchAllData();
    }
  }, [router]);

  // --- FUNGSI AMBIL SEMUA DATA ---
  const fetchAllData = async () => {
    try {
      // 1. Ambil Data Target Pendapatan
      const { data: revData, error: revError } = await supabase
        .from('daily_targets')
        .select('date, target_revenue, actual_revenue')
        .order('date', { ascending: true })
        .limit(10);

      if (revError) throw revError;

      const formattedRev = revData.map((item) => ({
        day: item.date.split('-')[2], 
        target: item.target_revenue,
        actual: item.actual_revenue
      }));
      setDataRevenue(formattedRev);

      // 2. Ambil Data Tiket untuk Donut Chart
      const { data: ticketData, error: ticketError } = await supabase
        .from('tickets')
        .select('status');

      if (ticketError) throw ticketError;

      const total = ticketData.length;
      const selesai = ticketData.filter(t => t.status === 'Selesai').length;
      const onProgress = total - selesai;

      // Hitung persentase untuk teks di tengah donut
      const percentage = total > 0 ? Math.round((selesai / total) * 100) : 0;
      setPercentSelesai(percentage);

      setDataTickets([
        { name: 'Selesai', value: selesai, color: '#8b9af9' },
        { name: 'On Progress', value: onProgress, color: '#e0e7ff' }
      ]);

    } catch (error) {
      console.error("Gagal sinkronisasi data:", error.message);
    }
  };

  if (!isAuthorized) {
    return <div className="h-screen bg-white"></div>;
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-black mb-1 font-sans">Dashboard</h1>
      <p className="text-sm text-gray-500 mb-8 font-sans">Target Pendapatan & Data Aktual Lapangan (Real-time)</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
        
        {/* --- KIRI: GRAFIK BATANG (Bar Chart) --- */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
          <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm font-semibold text-gray-400">10 Data Terakhir Database</h2>
          </div>
          
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataRevenue} barGap={8}>
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 12, fill: '#9CA3AF'}} 
                  dy={10}
                />
                <Tooltip 
                  cursor={{fill: 'transparent'}} 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} 
                />
                <Bar dataKey="target" fill="#5865F2" radius={[4, 4, 0, 0]} barSize={10} /> 
                {/* REVISI WARNA ORANYE: #F26522 */}
                <Bar dataKey="actual" fill="#F26522" radius={[4, 4, 0, 0]} barSize={10} /> 
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex gap-6 mt-6 text-xs text-gray-500 font-medium">
            <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#5865F2]"></span> Target Pendapatan
            </div>
            {/* REVISI WARNA LEGENDA: #F26522 */}
            <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#F26522]"></span> Pendapatan Aktual
            </div>
          </div>
        </div>

        {/* --- KANAN: GRAFIK DONUT (Pie Chart) --- */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between min-h-[300px] transition-all hover:shadow-md">
          <div>
            <h2 className="text-sm font-semibold text-gray-800 mb-1">Penyelesaian Permasalahan Tiket</h2>
            <p className="text-xs text-gray-400 font-medium">Data Real dari Tabel Tiket</p>
          </div>

          <div className="h-48 w-full relative my-4 flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={dataTickets} 
                  innerRadius={60} 
                  outerRadius={80} 
                  startAngle={90}
                  endAngle={-270}
                  paddingAngle={0} 
                  dataKey="value"
                  stroke="none"
                >
                  {dataTickets.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-[#8b9af9]">{percentSelesai}%</span>
            </div>
          </div>

          <div className="flex justify-between px-2 text-xs font-bold mt-auto border-t border-gray-50 pt-4">
             <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#8b9af9]"></span>
                  <span className="text-gray-400 font-semibold">Selesai</span>
                </div>
                <span className="text-black font-bold ml-3">
                  {dataTickets.find(t => t.name === 'Selesai')?.value || 0} Tiket
                </span>
             </div>
             <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#e0e7ff]"></span>
                  <span className="text-gray-400 font-semibold">Belum/On Progress</span>
                </div>
                <span className="text-black font-bold ml-3">
                  {dataTickets.find(t => t.name === 'On Progress')?.value || 0} Tiket
                </span>
             </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}