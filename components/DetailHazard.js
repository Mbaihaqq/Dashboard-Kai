import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Calendar, User, MapPin, Eye, FileText, ExternalLink } from 'lucide-react';

export default function DetailHazard({ isOpen, onClose, data, onSave }) {
  const [status, setStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (data) {
      // Prioritaskan format lowercase (dari DB), fallback ke format Excel
      setStatus(data.status || data['Status'] || 'Open');
    }
  }, [data]);

  if (!isOpen || !data) return null;

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
        onSave(data, status);
        setIsSaving(false);
        onClose();
    }, 800);
  };

  // Helper untuk membaca field (bisa dari format DB lowercase atau Excel Uppercase)
  const getField = (keyLower, keyExcel) => {
    return data[keyLower] || data[keyExcel] || '-';
  };

  // Ambil URL Bukti
  const buktiUrl = data.bukti_pelaporan || data['Bukti Pelaporan'] || data['Link Bukti'];

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-opacity animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden transform scale-100 transition-all flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FileText size={20} className="text-[#005DAA]" />
                Detail Hazard
            </h3>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 transition-colors">
                <X size={20} />
            </button>
        </div>

        {/* Content (Scrollable) */}
        <div className="p-6 space-y-5 overflow-y-auto">
            
            {/* Baris 1: Info Utama */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">No. Pelaporan</label>
                    <div className="mt-1 font-bold text-gray-800 text-sm bg-gray-50 p-2 rounded border border-gray-200">
                        {getField('no_pelaporan', 'No. Pelaporan')}
                    </div>
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tanggal Kejadian</label>
                    <div className="mt-1 font-bold text-gray-800 text-sm bg-gray-50 p-2 rounded border border-gray-200 flex items-center gap-2">
                        <Calendar size={14} className="text-[#005DAA]" />
                        {getField('tanggal_hazard', 'Tanggal Hazard')}
                    </div>
                </div>
            </div>

            {/* Baris 2: Lokasi */}
            <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Lokasi / Unit</label>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg text-sm text-gray-700 border border-gray-200 flex items-start gap-2">
                    <MapPin size={16} className="text-[#005DAA] mt-0.5 shrink-0" />
                    <span>
                        {getField('lokasi', 'Lokasi')} <span className="text-gray-400 mx-1">|</span> 
                        <span className="font-semibold">{getField('unit', 'Unit')}</span>
                    </span>
                </div>
            </div>

            {/* Baris 3: Uraian */}
            <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Uraian Hazard</label>
                <div className="mt-1 p-3 bg-blue-50/30 rounded-lg text-sm text-gray-800 border border-blue-100 leading-relaxed">
                    {getField('uraian', 'Uraian')}
                </div>
            </div>

            {/* Baris 4: PIC */}
            <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">PIC</label>
                <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <User size={16} className="text-[#005DAA]" />
                    {getField('pic', 'PIC')}
                </div>
            </div>

            <hr className="border-gray-200" />

            {/* Baris 5: BUKTI FOTO (Preview Image) */}
            <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Bukti Pelaporan</label>
                {buktiUrl ? (
                    <div className="space-y-3">
                        {/* Container Gambar */}
                        <div className="relative group w-full h-64 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center">
                            <img 
                                src={buktiUrl} 
                                alt="Bukti Hazard" 
                                className="object-contain w-full h-full"
                                onError={(e) => {
                                    e.target.onerror = null; 
                                    e.target.src = "https://placehold.co/600x400?text=Gagal+Muat+Gambar";
                                }} 
                            />
                            {/* Overlay Button */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <a 
                                    href={buktiUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="bg-white text-gray-800 px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-gray-100"
                                >
                                    <ExternalLink size={14} /> Buka Ukuran Penuh
                                </a>
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-400 truncate">{buktiUrl}</p>
                    </div>
                ) : (
                    <div className="p-4 bg-gray-50 border border-dashed border-gray-300 rounded-xl text-center text-gray-400 text-sm">
                        Tidak ada file bukti yang dilampirkan.
                    </div>
                )}
            </div>

            <hr className="border-gray-200" />

            {/* FORM UPDATE STATUS */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <label className="text-sm font-bold text-[#005DAA] uppercase mb-2 block">Update Status Pengerjaan</label>
                <div className="relative">
                    <select 
                        value={status} 
                        onChange={(e) => setStatus(e.target.value)}
                        className={`w-full p-3 bg-white border-2 rounded-xl font-bold focus:ring-4 outline-none transition-all appearance-none cursor-pointer
                            ${status === 'Closed' ? 'border-purple-200 text-purple-700 focus:border-purple-500 focus:ring-purple-500/20' : 
                              status === 'Work In Progress' ? 'border-green-200 text-green-700 focus:border-green-500 focus:ring-green-500/20' : 
                              'border-yellow-200 text-yellow-700 focus:border-yellow-500 focus:ring-yellow-500/20'}
                        `}
                    >
                        <option value="Open">OPEN</option>
                        <option value="Work In Progress">WORK IN PROGRESS</option>
                        <option value="Closed">CLOSED</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        ▼
                    </div>
                </div>
            </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 shrink-0">
            <button 
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors text-sm"
            >
                Batal
            </button>
            <button 
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl font-bold text-white bg-[#005DAA] hover:bg-blue-800 shadow-md hover:shadow-lg transition-all text-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {isSaving ? 'Menyimpan...' : <><Save size={16} /> Simpan Perubahan</>}
            </button>
        </div>

      </div>
    </div>
  );
}