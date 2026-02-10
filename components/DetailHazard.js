import React, { useState, useEffect } from 'react';
import { X, ExternalLink, ImageOff, Save, Loader2, Maximize2 } from 'lucide-react';

export default function DetailHazard({ isOpen, onClose, data, onSave }) {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [imgSrc, setImgSrc] = useState(null);
  const [isImgError, setIsImgError] = useState(false);

  // Reset state setiap kali modal dibuka / data berubah
  useEffect(() => {
    if (data) {
      setStatus(data.status || 'Open');
      setIsImgError(false);
      processImageLink(data.bukti_pelaporan);
    }
  }, [data]);

  // Fungsi Cerdas: Ubah link Google Drive jadi Direct Image
  const processImageLink = (url) => {
    if (!url || url === '-') {
      setImgSrc(null);
      return;
    }

    let finalUrl = url;

    // Deteksi Link Google Drive
    if (url.includes('drive.google.com')) {
      // Coba ambil ID File-nya
      const idMatch = url.match(/\/d\/(.+?)(\/|$|\?)/);
      if (idMatch && idMatch[1]) {
        // Trik: Gunakan lh3.googleusercontent.com agar bisa di-embed langsung
        finalUrl = `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
      }
    }

    setImgSrc(finalUrl);
  };

  const handleSaveClick = async () => {
    setLoading(true);
    await onSave(data, status); // Panggil fungsi save dari index.js
    setLoading(false);
    onClose();
  };

  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-5xl h-[85vh] flex overflow-hidden shadow-2xl relative">
        
        {/* TOMBOL CLOSE (Floating) */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-20 p-2 bg-white/80 hover:bg-white text-gray-600 hover:text-red-600 rounded-full shadow-sm transition-all backdrop-blur-md"
        >
          <X size={24} />
        </button>

        {/* --- KOLOM KIRI: INFO & STATUS --- */}
        <div className="w-full md:w-1/2 p-8 overflow-y-auto bg-gray-50 border-r border-gray-200">
          <div className="mb-6">
            <span className="bg-blue-100 text-[#005DAA] text-xs font-bold px-3 py-1 rounded-full border border-blue-200">
              {data.unit}
            </span>
            <h2 className="text-2xl font-black text-gray-800 mt-3 leading-tight">
              {data.uraian || "Tidak ada uraian"}
            </h2>
            <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
              <span className="font-semibold">No. Laporan:</span> {data.no_pelaporan}
            </p>
          </div>

          <div className="space-y-6">
            {/* Detail Grid */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 space-y-4">
              <DetailRow label="Tanggal Kejadian" value={data.tanggal_hazard} />
              <DetailRow label="Lokasi" value={data.lokasi} />
              <DetailRow label="PIC / Penanggung Jawab" value={data.pic} />
              <DetailRow label="Kategori Risiko" value={data.kategori_resiko} />
            </div>

            {/* EDIT STATUS SECTION */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
              <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                Update Status Tindak Lanjut
              </label>
              <div className="flex flex-col gap-3">
                <select 
                  value={status} 
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 font-medium focus:ring-2 focus:ring-[#005DAA] outline-none transition-all"
                >
                  <option value="Open">Open</option>
                  <option value="Work In Progress">Work In Progress</option>
                  <option value="Closed">Closed</option>
                </select>
                
                <button 
                  onClick={handleSaveClick}
                  disabled={loading}
                  className="w-full py-3 bg-[#005DAA] hover:bg-blue-800 text-white rounded-lg font-bold shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>}
                  {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* --- KOLOM KANAN: GAMBAR / BUKTI --- */}
        <div className="w-full md:w-1/2 bg-gray-900 flex flex-col relative group">
            
            {/* Header Gambar */}
            <div className="absolute top-0 left-0 w-full p-4 bg-gradient-to-b from-black/60 to-transparent z-10 flex justify-between items-start">
                <span className="text-white text-xs font-bold bg-black/40 px-3 py-1 rounded-full backdrop-blur-md border border-white/20">
                    Bukti Pelaporan
                </span>
                
                {/* Tombol Buka Tab Baru (Fallback kalau gambar rusak) */}
                {data.bukti_pelaporan && (
                    <a 
                        href={data.bukti_pelaporan} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-2 text-white bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-xs font-bold backdrop-blur-md transition-all"
                    >
                        <ExternalLink size={14} /> Buka Original
                    </a>
                )}
            </div>

            {/* AREA GAMBAR */}
            <div className="flex-1 flex items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
                {imgSrc && !isImgError ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                        <img 
                            src={imgSrc} 
                            alt="Bukti Hazard" 
                            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl transition-transform duration-300 group-hover:scale-[1.02]"
                            onError={() => setIsImgError(true)}
                        />
                    </div>
                ) : (
                    // Tampilan Jika Gambar Rusak / Tidak Ada
                    <div className="flex flex-col items-center justify-center text-gray-400 gap-3 text-center p-8 border-2 border-dashed border-gray-700 rounded-2xl">
                        <div className="bg-gray-800 p-4 rounded-full">
                            <ImageOff size={40} />
                        </div>
                        <div>
                            <p className="font-bold text-gray-300">Preview Tidak Tersedia</p>
                            <p className="text-xs mt-1 max-w-[250px] mx-auto opacity-70">
                                Link mungkin rusak, tidak memiliki akses publik, atau bukan format gambar langsung.
                            </p>
                        </div>
                        {data.bukti_pelaporan && (
                            <a 
                                href={data.bukti_pelaporan} 
                                target="_blank" 
                                rel="noreferrer"
                                className="mt-4 text-[#005DAA] bg-blue-50/10 hover:bg-blue-50/20 px-4 py-2 rounded-lg font-bold text-sm transition-all border border-[#005DAA]"
                            >
                                Coba Buka Link Asli
                            </a>
                        )}
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
}

// Helper untuk baris detail biar rapi
function DetailRow({ label, value }) {
  return (
    <div className="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
      <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">{label}</p>
      <p className="text-sm font-medium text-gray-800 break-words">
        {value ? value : <span className="text-gray-300 italic">Tidak ada data</span>}
      </p>
    </div>
  );
}