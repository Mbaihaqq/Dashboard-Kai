import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabaseClient';
// IMPORT IKON
import { 
  Settings, TrainFront, RadioTower, 
  Building2, Wrench, Users, BarChart3 
} from 'lucide-react';

export default function TLAnalytics() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [unitsData, setUnitsData] = useState([]);
  const [lastUpdate, setLastUpdate] = useState('-'); // Default strip
  const [sortType, setSortType] = useState('highest');
  const [totalRows, setTotalRows] = useState(0); 

  useEffect(() => {
    const checkSession = async () => {
      const loggedIn = sessionStorage.getItem('isLoggedIn');
      if (!loggedIn) {
        router.push('/loginPage/login');
        return;
      }

      setIsAuthorized(true);

      // --- LOGIKA LAST UPDATE (SINKRON DENGAN DASHBOARD) ---
      // Ambil tanggal yang disimpan saat upload file di Dashboard utama
      const savedDate = localStorage.getItem('last_update_fixed');
      if (savedDate) {
        setLastUpdate(savedDate);
      }

      fetchHazardStatistics();
    };

    checkSession();
  }, []);

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // === FETCH DATA ===
  const fetchHazardStatistics = async () => {
    try {
      let allData = [];
      let from = 0;
      let to = 999;
      let hasMore = true;

      // Loop fetch semua data
      while (hasMore) {
        const { data, error } = await supabase
          .from('hazards')
          .select('unit, status')
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

      setTotalRows(allData.length); 

      if (!allData.length) return;

      const allUniqueUnits = [
        ...new Set(allData.map(item => item.unit?.trim()))
      ].filter(Boolean);

      const formattedUnits = allUniqueUnits.map(unitName => {
        const unitItems = allData.filter(
          d => d.unit?.trim() === unitName
        );

        const total = unitItems.length;

        const closed = unitItems.filter(
          d => d.status?.toLowerCase().trim() === 'closed'
        ).length;

        const open = unitItems.filter(
          d => d.status?.toLowerCase().trim() === 'open'
        ).length;

        const progress = unitItems.filter(
          d => d.status?.toLowerCase().trim() === 'work in progress'
        ).length;

        const completion =
          total > 0
            ? Math.round((closed / total) * 100)
            : 0;

        return {
          name: unitName,
          total,
          closed,
          open,
          progress,
          completion
        };
      });

      setUnitsData(formattedUnits);
      
      // HAPUS BARIS INI AGAR TIDAK UPDATE OTOMATIS SAAT REFRESH
      // setLastUpdate(formatDateTime(new Date())); 

    } catch (error) {
      console.error("Error TL Analytics:", error.message);
    }
  };

  // === SORTING FUNCTION ===
  const getSortedData = () => {
    let sorted = [...unitsData];

    if (sortType === 'highest') {
      sorted.sort((a, b) => b.completion - a.completion);
    } else if (sortType === 'lowest') {
      sorted.sort((a, b) => a.completion - b.completion);
    } else if (sortType === 'az') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    }

    return sorted;
  };

  // === COLOR RULE ===
  const getColor = (pct) => {
    if (pct >= 80) return 'bg-green-500';
    if (pct >= 50) return 'bg-yellow-400';
    return 'bg-red-500';
  };

  const getStatusLabel = (pct) => {
    if (pct >= 80)
      return { text: "Excellent", style: "text-green-600 bg-green-50" };
    if (pct >= 50)
      return { text: "Perlu Perhatian", style: "text-yellow-600 bg-yellow-50" };
    return { text: "Butuh Tindakan", style: "text-red-600 bg-red-50" };
  };

  // === ICON HELPER ===
  const getIcon = (unitName) => {
    const lower = unitName.toLowerCase();
    if (lower.includes('operasi')) return <Settings size={20} />;
    if (lower.includes('jalan') || lower.includes('jembatan')) return <TrainFront size={20} />;
    if (lower.includes('sinyal') || lower.includes('telekomunikasi') || lower.includes('sintelis')) return <RadioTower size={20} />;
    if (lower.includes('bangunan')) return <Building2 size={20} />;
    if (lower.includes('sarana')) return <Wrench size={20} />;
    if (lower.includes('penumpang') || lower.includes('fasilitas')) return <Users size={20} />;
    return <BarChart3 size={20} />; 
  };

  if (!isAuthorized)
    return <div className="h-screen bg-[#F8F9FA]"></div>;

  return (
    <Layout>
      <div className="w-full px-6 py-6 bg-[#F8F9FA] min-h-screen">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-black">
              TL % Analytics
            </h1>
            <div className="flex items-center gap-2 mt-2">
                <span className="border border-gray-300 text-gray-600 text-xs px-3 py-1 rounded-full font-medium">
                KAI DAOP 4
                </span>
                {totalRows > 0 && (
                    <span className="bg-blue-50 text-[#005DAA] text-xs px-3 py-1 rounded-full font-bold">
                        Total Data: {totalRows.toLocaleString()}
                    </span>
                )}
            </div>
            
            <p className="text-xs text-gray-400 mt-3">
              Last Updated : {lastUpdate}
            </p>
          </div>

          {/* SORT DROPDOWN */}
          <div>
            <select
              value={sortType}
              onChange={(e) => setSortType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-black font-medium focus:outline-none focus:ring-1 focus:ring-[#005DAA]"
            >
              <option value="highest">Completion Tertinggi</option>
              <option value="lowest">Completion Terendah</option>
              <option value="az">Nama Unit (A–Z)</option>
            </select>
          </div>
        </div>

        {/* MAIN CARD */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

          {getSortedData().map((unit, idx) => {
            const status = getStatusLabel(unit.completion);

            return (
              <div key={idx} className="mb-10 last:mb-0">

                {/* HEADER ROW */}
                <div className="flex justify-between items-center mb-4">

                  {/* KIRI: NAMA UNIT + ICON */}
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-50 rounded-lg text-gray-500 border border-gray-100">
                        {getIcon(unit.name)}
                    </div>
                    
                    <div>
                        <h3 className="text-sm font-bold tracking-wide text-gray-800 uppercase mt-1">
                        {unit.name}
                        </h3>

                        <span
                        className={`inline-block mt-1 text-[11px] px-3 py-1 rounded-full font-semibold ${status.style}`}
                        >
                        {status.text}
                        </span>
                    </div>
                  </div>

                  {/* KANAN: PERSENTASE */}
                  <div className="text-right">
                    <div className="text-3xl font-extrabold text-gray-800">
                      {unit.completion}%
                    </div>
                    <div className="text-xs text-gray-400 tracking-wide">
                      Completion Rate
                    </div>
                  </div>

                </div>

                {/* PROGRESS BAR */}
                <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden shadow-inner mb-4">
                  <div
                    className={`${getColor(unit.completion)} h-3 rounded-full transition-all duration-700 ease-out`}
                    style={{ width: `${unit.completion}%` }}
                  ></div>
                </div>

                {/* DATA SUMMARY */}
                <div className="flex gap-6 text-sm font-medium pl-[52px]"> 

                  <div>
                    <span className="text-gray-500">Total :</span>{" "}
                    <span className="text-black font-bold">{unit.total}</span>
                  </div>

                  <div>
                    <span className="text-gray-500">Closed :</span>{" "}
                    <span className="text-green-600 font-bold">{unit.closed}</span>
                  </div>

                  <div>
                    <span className="text-gray-500">Open :</span>{" "}
                    <span className="text-yellow-600 font-bold">{unit.open}</span>
                  </div>

                  <div>
                    <span className="text-gray-500">Progress :</span>{" "}
                    <span className="text-blue-600 font-bold">{unit.progress}</span>
                  </div>

                </div>

              </div>
            );
          })}

        </div>
      </div>
    </Layout>
  );
}