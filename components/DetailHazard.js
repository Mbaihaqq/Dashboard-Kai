import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Calendar, User, MapPin, Eye, FileText } from 'lucide-react';

export default function DetailHazard({ isOpen, onClose, data, onSave }) {
  const [status, setStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (data) {
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

  // Helper untuk cek apakah ada file bukti
  const buktiUrl = data['bukti pelaporan'] || data['Bukti Pelaporan'];

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-opacity animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden transform scale-100 transition-all">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FileText size={20} className="text-[#005DAA]" />
                Detail & Update Status
            </h3>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 transition-colors">
                <X size={20} />
            </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            
            {/* Baris 1: Info Utama */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">No. Pelaporan</label>
                    <div className="mt-1 font-bold text-gray-800 text-sm bg-gray-50 p-2 rounded border border-gray-200">
                        {data['no. pelaporan'] || data['No. Pelaporan'] || '-'}
                    </div>
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tanggal Kejadian</label>
                    <div className="mt-1 font-bold text-gray-800 text-sm bg-gray-50 p-2 rounded border border-gray-200 flex items-center gap-2">
                        <Calendar size={14} className="text-[#005DAA]" />
                        {data['tanggal hazard'] || data['Tanggal Hazard'] || '-'}
                    </div>
                </div>
            </div>

            {/* Baris 2: Lokasi */}
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

            {/* Baris 3: Uraian */}
            <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Uraian Hazard</label>
                <div className="mt-1 p-3 bg-blue-50/30 rounded-lg text-sm text-gray-800 border border-blue-100 leading-relaxed">
                    {data['uraian'] || data['Uraian'] || '-'}
                </div>
            </div>

            {/* Baris 4: PIC & Bukti (Ditambahkan) */}
            <div className="grid grid-cols-2 gap-4 items-center">
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">PIC</label>
                    <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <User size={16} className="text-[#005DAA]" />
                        <span className="truncate" title={data.pic || data['PIC']}>{data.pic || data['PIC'] || '-'}</span>
                    </div>
                </div>
                
                <div className="text-right">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Bukti Foto</label>
                    {buktiUrl ? (
                        <a 
                            href={buktiUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-1.5 rounded-lg hover:bg-[#005DAA] hover:text-white hover:border-[#005DAA] transition-all text-xs font-bold shadow-sm"
                        >
                            <Eye size={14} /> Lihat File Bukti
                        </a>
                    ) : (
                        <span className="text-xs text-gray-400 italic">Tidak ada file</span>
                    )}
                </div>
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
                
                {/* Pesan Peringatan jika Closed */}
                {status === 'Closed' && (
                    <div className="mt-3 flex items-start gap-2 bg-purple-50 text-purple-700 px-3 py-2 rounded-lg text-xs border border-purple-100 animate-in fade-in slide-in-from-top-1">
                        <AlertCircle size={14} className="mt-0.5 shrink-0" />
                        <p><strong>Perhatian:</strong> Mengubah status menjadi <b>Closed</b> berarti hazard ini dianggap selesai dan akan hilang dari daftar aktif (Open/In Progress).</p>
                    </div>
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