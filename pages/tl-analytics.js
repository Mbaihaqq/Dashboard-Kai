import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabaseClient';
import { 
  Settings, TrainFront, RadioTower, 
  Building2, Wrench, Users, Search 
} from 'lucide-react';

export default function TLAnalytics() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastUpdate, setLastUpdate] = useState('-');

  useEffect(() => {
    const checkSession = async () => {
        const loggedIn = sessionStorage.getItem('isLoggedIn');
        if (!loggedIn) {
            router.push('/loginPage/login');
            return;
        }
        fetchAnalytics();
        
        // Ambil Last Update dari local storage biar sinkron sama dashboard
        const savedDate = localStorage.getItem('last_update_fixed');
        if (savedDate) setLastUpdate(savedDate);
    };
    checkSession();
  }, []);

  const fetchAnalytics = async () => {
    try {
        setLoading(true);
        // Ambil semua data hazard
        const { data, error } = await supabase.from('hazards').select('unit, status');
        if (error) throw error;

        processData(data);
    } catch (error) {
        console.error("Gagal load analytics:", error.message);
    } finally {
        setLoading(false);
    }
  };

  const processData = (data) => {
    // 1. Kelompokkan data berdasarkan Unit
    const grouped = {};
    
    data.forEach(item => {
        // Normalisasi nama unit (Title Case)
        let unitName = item.unit ? item.unit.trim() : 'Unknown';
        
        if (!grouped[unitName]) {
            grouped[unitName] = { total: 0, closed: 0 };
        }
        
        grouped[unitName].total += 1;
        if (item.status === 'Closed') {
            grouped[unitName].closed += 1;
        }
    });

    // 2. Hitung Persentase & Format Array
    const result = Object.keys(grouped).map(name => {
        const { total, closed } = grouped[name];
        const percentage = total === 0 ? 0 : Math.round((closed / total) * 100);
        
        return {
            name,
            percentage,
            total,
            closed
        };
    });

    // Urutkan (Opsional: bisa berdasarkan nama atau persentase)
    setAnalyticsData(result.sort((a, b) => a.name.localeCompare(b.name)));
  };

  // --- FILTER SEARCH ---
  const filteredData = analyticsData.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper Warna Progress Bar
  const getColor = (pct) => {
    if (pct >= 70) return { bar: 'bg-[#22C55E]', bg: 'bg-[#DCFCE7]' }; // Hijau
    if (pct >= 40) return { bar: 'bg-[#EAB308]', bg: 'bg-[#FEF9C3]' }; // Kuning
    return { bar: 'bg-[#EF4444]', bg: 'bg-[#FEE2E2]' }; // Merah
  };

  // Helper Ikon Unit
  const getIcon = (unitName) => {
    const lower = unitName.toLowerCase();
    if (lower.includes('operasi')) return <Settings size={24} />;
    if (lower.includes('jalan') || lower.includes('jembatan')) return <TrainFront size={24} />;
    if (lower.includes('sinyal') || lower.includes('telekomunikasi') || lower.includes('sintelis')) return <RadioTower size={24} />;
    if (lower.includes('bangunan')) return <Building2 size={24} />;
    if (lower.includes('sarana')) return <Wrench size={24} />;
    if (lower.includes('penumpang') || lower.includes('fasilitas')) return <Users size={24} />;
    return <Settings size={24} />; // Default
  };

  return (
    <Layout onSearch={setSearchTerm}>
      <div className="w-full px-6 py-4">
        
        {/* HEADER SECTION */}
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-black mb-2">TL % Analytics</h1>
            <div className="flex items-center gap-3 mb-2">
                <span className="border border-gray-400 text-gray-600 text-xs font-bold px-3 py-1 rounded-full bg-white">
                    KAI DAOP 4
                </span>
            </div>
            <p className="text-xs text-gray-500 font-medium">
                Last Updated : <br/> {lastUpdate}
            </p>
        </div>

        {/* LIST UNIT PROGRESS */}
        <div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 p-8 min-h-[500px]">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">TL % Analytics per Unit</h2>

            {loading ? (
                 <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#005DAA] mb-2"></div>
                    Memuat data...
                </div>
            ) : filteredData.length > 0 ? (
                <div className="space-y-8">
                    {filteredData.map((item, idx) => {
                        const colorStyle = getColor(item.percentage);
                        return (
                            <div key={idx} className="group">
                                {/* Nama Unit & Ikon */}
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="text-gray-800">
                                        {getIcon(item.name)}
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800 group-hover:text-[#005DAA] transition-colors">
                                        {item.name}
                                    </h3>
                                </div>

                                {/* Progress Bar Container */}
                                <div className="flex items-center gap-4">
                                    {/* Bar Background */}
                                    <div className={`flex-grow h-4 ${colorStyle.bg} rounded-full overflow-hidden relative`}>
                                        {/* Bar Fill (Animasi Width) */}
                                        <div 
                                            className={`h-full ${colorStyle.bar} rounded-full transition-all duration-1000 ease-out`}
                                            style={{ width: `${item.percentage}%` }}
                                        ></div>
                                    </div>
                                    
                                    {/* Persentase Text */}
                                    <div className="text-right w-24 flex-shrink-0">
                                        <span className="text-xl font-bold text-gray-800 block leading-none">
                                            {item.percentage}%
                                        </span>
                                        <span className="text-[10px] text-gray-400 uppercase font-bold">Completion</span>
                                    </div>
                                </div>
                                
                                {/* Detail Kecil (Closed / Total) */}
                                <p className="text-xs text-gray-400 mt-1 pl-9">
                                    {item.closed} Closed / {item.total} Total Hazard
                                </p>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <Search size={40} className="mb-2 opacity-20"/>
                    <p>Unit "{searchTerm}" tidak ditemukan.</p>
                </div>
            )}
        </div>

      </div>
    </Layout>
  );
}