import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Calendar, User, MapPin } from 'lucide-react';

export default function DetailHazard({ isOpen, onClose, data, onSave }) {
  const [status, setStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Update status local state ketika data baru masuk
  useEffect(() => {
    if (data) {
      setStatus(data.status || data['Status'] || 'Open');
    }
  }, [data]);

  if (!isOpen || !data) return null;

  const handleSave = () => {
    setIsSaving(true);
    // Simulasi proses save
    setTimeout(() => {
        onSave(data, status); // Kirim data lama dan status baru ke index.js
        setIsSaving(false);
        onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-opacity animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden transform scale-100 transition-all">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <AlertCircle size={20} className="text-[#005DAA]" />
                Detail & Update Status
            </h3>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 transition-colors">
                <X size={20} />
            </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            
            {/* Informasi Utama */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">No. Pelaporan</label>
                    <div className="mt-1 font-bold text-gray-800 text-sm">
                        {data['no. pelaporan'] || data['No. Pelaporan'] || '-'}
                    </div>
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tanggal Kejadian</label>
                    <div className="mt-1 font-bold text-gray-800 text-sm flex items-center gap-2">
                        <Calendar size={14} className="text-[#005DAA]" />
                        {data['tanggal hazard'] || data['Tanggal Hazard'] || '-'}
                    </div>
                </div>
            </div>

            {/* Lokasi */}
            <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Lokasi / Unit</label>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg text-sm text-gray-700 border border-gray-200 flex items-start gap-2">
                    <MapPin size={16} className="text-[#005DAA] mt-0.5 shrink-0" />
                    <span>
                        {data.lokasi || data['Lokasi'] || '-'} <span className="text-gray-400 mx-1">|</span> 
                        <span className="font-semibold">{data.unit || data['Unit']}</span>
                    </span>
                </div>
            </div>

            {/* Uraian */}
            <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Uraian Hazard</label>
                <div className="mt-1 p-3 bg-blue-50/50 rounded-lg text-sm text-gray-800 border border-blue-100 leading-relaxed">
                    {data['uraian'] || data['Uraian'] || '-'}
                </div>
            </div>

            {/* PIC */}
            <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">PIC / Penanggung Jawab</label>
                <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <User size={16} className="text-[#005DAA]" />
                    {data.pic || data['PIC'] || '-'}
                </div>
            </div>

            <hr className="border-gray-100" />

            {/* FORM UBAH STATUS */}
            <div>
                <label className="text-sm font-bold text-[#005DAA] uppercase mb-2 block">Update Status</label>
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
                {status === 'Closed' && (
                    <p className="text-[11px] text-purple-600 mt-2 font-medium bg-purple-50 p-2 rounded-lg border border-purple-100 flex items-center gap-1">
                        <AlertCircle size={12} />
                        Perhatian: Status "Closed" akan menyembunyikan data ini dari daftar aktif.
                    </p>
                )}
            </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
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