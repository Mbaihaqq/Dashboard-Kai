import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { supabase } from '../lib/supabaseClient';
import { Download } from 'lucide-react'; // Ikon untuk tombol Import/Export jika dibutuhkan

export default function Dashboard() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [unitsData, setUnitsData] = useState([]);
  const [summary, setSummary] = useState({ new: 0, open: 0, progress: 0, closed: 0 });
  const [lastUpdate, setLastUpdate] = useState('');

  useEffect(() => {
    // Cek Sesi Login
    const loggedIn = sessionStorage.getItem('isLoggedIn');
    const role = sessionStorage.getItem('userRole');

    if (!loggedIn) {
      router.push('/loginPage/login');
    } else {
      setIsAuthorized(true);
      fetchHazardStatistics();
      
      // Set waktu update terakhir
      const now = new Date();
      setLastUpdate(now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }));
    }
  }, [router]);

  const fetchHazardStatistics = async () => {
    try {
      let allData = [];
      let from = 0;
      let to = 999;
      let hasMore = true;

      // --- 1. TEKNIK NO-LIMIT DATA FETCHING ---
      while (hasMore) {
        const { data, error } = await supabase
          .from('hazards')
          .select('unit, status, created_at')
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

      // --- 2. HITUNG RINGKASAN ATAS (SUMMARY CARDS) ---
      // Logika: 
      // New = Open (Baru masuk hari ini/kemarin - opsional, disini kita samakan dengan Open agar data konsisten)
      // Open = Status 'Open'
      // Progress = Status 'Work In Progress'
      // Closed = Status 'Closed'
      
      const totalOpen = allData.filter(d => d.status === 'Open').length;
      const totalProgress = allData.filter(d => d.status === 'Work In Progress').length;
      const totalClosed = allData.filter(d => d.status === 'Closed').length;

      // Untuk "New Hazard", kita bisa ambil data yang input_date-nya < 7 hari, 
      // atau sementara disamakan dengan Open sesuai request visual.
      const totalNew = totalOpen; 

      setSummary({
        new: totalNew,
        open: totalOpen,
        progress: totalProgress,
        closed: totalClosed
      });

      // --- 3. HITUNG DATA PER UNIT (DONUT CHARTS) ---
      // Ambil daftar unit unik dari data Excel yang sudah diimport
      const allUniqueUnits = [...new Set(allData.map(item => item.unit))].filter(Boolean);

      const formattedUnits = allUniqueUnits.map(unitName => {
        const unitItems = allData.filter(d => d.unit === unitName);
        const total = unitItems.length;
        const closed = unitItems.filter(d => d.status === 'Closed').length;
        const progress = unitItems.filter(d => d.status === 'Work In Progress').length;
        const open = unitItems.filter(d => d.status === 'Open').length;
        
        // Rumus TL% (Completion Rate)
        const completion = total > 0 ? Math.round((closed / total) * 100) : 0;

        return {
          name: unitName,
          total,
          completion,
          // Warna Chart Sesuai Desain PDF Page 7
          chartData: [
            { name: 'Closed', value: closed, color: '#22c55e' }, // Hijau (Closed)
            { name: 'Progress', value: progress, color: '#ec4899' }, // Pink/Ungu (In Progress - Sesuai PDF)
            { name: 'Open', value: open, color: '#ef4444' } // Merah (Open)
          ]
        };
      });

      // Urutkan Unit dari A-Z
      setUnitsData(formattedUnits.sort((a, b) => a.name.localeCompare(b.name)));

    } catch (error) {
      console.error("Gagal memuat data:", error.message);
    }
  };

  if (!isAuthorized) return <div className="h-screen bg-[#F8F9FA]"></div>;

  return (
    <Layout>
      {/* HEADER & JUDUL */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded border border-gray-200 uppercase tracking-wider">
                Admin View
             </span>
          </div>
          <h1 className="text-3xl font-black text-[#005DAA] uppercase tracking-tight">Hazard Report</h1>
          <p className="text-sm text-gray-400 font-bold tracking-wide">DAOP 4 SEMARANG MONITORING SYSTEM</p>
        </div>
        
        <div className="flex flex-col items-end">
            <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-gray-50 transition mb-1">
                <Download size={14} /> Export Data
            </button>
            <p className="text-[10px] text-gray-400 font-medium">
                Last Update: <span className="text-[#005DAA] font-bold">{lastUpdate}</span>
            </p>
        </div>
      </div>

      {/* SUMMARY CARDS (WARNA-WARNI) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <SummaryCard 
          title="New Hazard" 
          value={summary.new} 
          subtitle="+8 from yesterday" 
          bg="bg-pink-50" 
          text="text-pink-600" 
          iconBg="bg-pink-100"
        />
        <SummaryCard 
          title="Open Hazard" 
          value={summary.open} 
          subtitle="+50 from yesterday" 
          bg="bg-orange-50" 
          text="text-orange-600" 
          iconBg="bg-orange-100"
        />
        <SummaryCard 
          title="In Progress" 
          value={summary.progress} 
          subtitle="+10 from yesterday" 
          bg="bg-purple-50" 
          text="text-purple-600" 
          iconBg="bg-purple-100"
        />
        <SummaryCard 
          title="Closed Hazard" 
          value={summary.closed} 
          subtitle="+1 from yesterday" 
          bg="bg-green-50" 
          text="text-green-600" 
          iconBg="bg-green-100"
        />
      </div>

      {/* GRID CHART UNIT (Fluid Grid) */}
      <h3 className="text-lg font-bold text-gray-700 mb-5 pl-1 border-l-4 border-[#005DAA]">
         Unit Analytics
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
        {unitsData.map((unit, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group">
            {/* Header Card Unit */}
            <div className="flex justify-between items-start mb-4 h-10">
                <h3 className="text-xs font-black text-[#005DAA] uppercase italic leading-tight line-clamp-2 w-3/4">
                  Unit {unit.name}
                </h3>
                <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                    {unit.total}
                </span>
            </div>
            
            {/* Donut Chart */}
            <div className="relative w-40 h-40 mx-auto">
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
              {/* Text TL% di Tengah */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-gray-800 leading-none group-hover:scale-110 transition-transform duration-300">
                    {unit.completion}%
                </span>
                <span className="text-[9px] font-black text-gray-400 uppercase mt-1 tracking-widest">
                    TL%
                </span>
              </div>
            </div>

            {/* Legend (Keterangan Bawah) */}
            <div className="grid grid-cols-3 gap-1 mt-6 text-[9px] font-bold text-gray-500 uppercase text-center border-t pt-4 border-gray-50">
              <div className="flex flex-col items-center gap-1">
                 <span className="w-2 h-2 rounded-full bg-red-500"></span>
                 <span>Open<br/><span className="text-black text-xs">{unit.chartData[2].value}</span></span>
              </div>
              <div className="flex flex-col items-center gap-1">
                 <span className="w-2 h-2 rounded-full bg-[#ec4899]"></span>
                 <span>Progres<br/><span className="text-black text-xs">{unit.chartData[1].value}</span></span>
              </div>
              <div className="flex flex-col items-center gap-1">
                 <span className="w-2 h-2 rounded-full bg-green-500"></span>
                 <span>Closed<br/><span className="text-black text-xs">{unit.chartData[0].value}</span></span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}

// Komponen Kecil untuk Summary Card Warna-Warni
function SummaryCard({ title, value, subtitle, bg, text, iconBg }) {
  return (
    <div className={`${bg} p-6 rounded-[2rem] shadow-sm border border-transparent hover:border-gray-200 transition-all`}>
      <div className={`w-10 h-10 ${iconBg} rounded-full flex items-center justify-center mb-4`}>
        {/* Ikon visual sederhana berupa lingkaran */}
        <div className={`w-4 h-4 rounded-full ${text} bg-current opacity-40`}></div>
      </div>
      <span className={`text-4xl font-black ${text} block mb-1`}>
        {value.toLocaleString('id-ID')}
      </span>
      <span className={`text-xs font-bold ${text} opacity-80 uppercase tracking-widest block mb-1`}>
        {title}
      </span>
      <span className={`text-[10px] ${text} opacity-60 font-medium`}>
        {subtitle}
      </span>
    </div>
  );
}