import React from 'react';
import { X, Calendar, User, Eye, Edit3 } from 'lucide-react';

export default function DetailGrafik({ isOpen, onClose, unitName, data, onRowClick }) {
  if (!isOpen) return null;

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('close')) return 'bg-purple-100 text-purple-700 border-purple-200';
    if (s.includes('progress')) return 'bg-green-100 text-green-700 border-green-200';
    if (s.includes('open')) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-gray-100 text-gray-600 border-gray-200';
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 transition-opacity animate-in fade-in duration-200">
      <div className="bg-white rounded-[1.5rem] w-full max-w-6xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header Modal */}
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
            <div>
                <h2 className="text-2xl font-black text-[#005DAA] uppercase tracking-tight">{unitName}</h2>
                <div className="flex items-center gap-2 mt-1">
                    <span className="bg-blue-50 text-[#005DAA] text-xs px-2.5 py-0.5 rounded-full font-bold border border-blue-100">
                        {data.length} Data Found
                    </span>
                    <span className="text-gray-400 text-xs flex items-center gap-1">
                        <Edit3 size={12} />
                        Klik baris untuk melihat detail & update status
                    </span>
                </div>
            </div>
            <button 
                onClick={onClose}
                className="bg-gray-100 p-2 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors"
            >
                <X size={24} />
            </button>
        </div>

        {/* Body Table */}
        <div className="flex-1 overflow-auto p-6 bg-[#F8F9FA]">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-[#005DAA] text-white uppercase text-xs font-bold tracking-wider">
                        <tr>
                            <th className="px-6 py-4 w-12 text-center">No</th>
                            <th className="px-6 py-4 whitespace-nowrap">No. Pelaporan</th>
                            <th className="px-6 py-4 whitespace-nowrap">Tanggal</th>
                            <th className="px-6 py-4 w-1/3 min-w-[300px]">Uraian Hazard</th>
                            <th className="px-6 py-4 text-center whitespace-nowrap">Status</th>
                            <th className="px-6 py-4 min-w-[150px]">PIC</th>
                            <th className="px-6 py-4 text-center whitespace-nowrap">Bukti</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {data.length > 0 ? (
                            data.map((row, idx) => (
                                <tr 
                                    key={idx} 
                                    onClick={() => onRowClick && onRowClick(row)} // Pastikan fungsi dipanggil
                                    className="hover:bg-blue-50 transition-colors group cursor-pointer border-l-4 border-transparent hover:border-[#005DAA]"
                                >
                                    <td className="px-6 py-4 text-center font-medium text-gray-500">{idx + 1}</td>
                                    
                                    <td className="px-6 py-4 font-bold text-gray-700 whitespace-nowrap">
                                        {row['no. pelaporan'] || row['No. Pelaporan'] || '-'}
                                    </td>
                                    
                                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-gray-400"/>
                                            {row['tanggal hazard'] || row['Tanggal Hazard'] || '-'}
                                        </div>
                                    </td>
                                    
                                    <td className="px-6 py-4 text-gray-600 leading-relaxed">
                                        <div className="line-clamp-2" title={row['uraian'] || row['Uraian']}>
                                            {row['uraian'] || row['Uraian'] || '-'}
                                        </div>
                                    </td>
                                    
                                    {/* STATUS (DIPERBAIKI AGAR TIDAK TURUN BARIS) */}
                                    <td className="px-6 py-4 text-center whitespace-nowrap">
                                        <span className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase border shadow-sm w-full min-w-[120px] ${getStatusBadge(row.status || row['Status'])}`}>
                                            {row.status || row['Status'] || 'Unknown'}
                                            <Edit3 size={10} className="opacity-40" />
                                        </span>
                                    </td>
                                    
                                    <td className="px-6 py-4 text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <User size={14} className="text-gray-400 shrink-0"/>
                                            <span className="truncate max-w-[150px]" title={row.pic || row['PIC']}>
                                                {row.pic || row['PIC'] || '-'}
                                            </span>
                                        </div>
                                    </td>
                                    
                                    {/* BUKTI (STOP PROPAGATION AGAR TOMBOL LIHAT BISA DIKLIK TANPA MEMBUKA EDIT) */}
                                    <td className="px-6 py-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                        {(row['bukti pelaporan'] || row['Bukti Pelaporan']) ? (
                                            <a 
                                                href={row['bukti pelaporan'] || row['Bukti Pelaporan']} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-[#005DAA] hover:text-white hover:border-[#005DAA] transition-all text-xs font-bold"
                                            >
                                                <Eye size={14} /> Lihat
                                            </a>
                                        ) : (
                                            <span className="text-gray-300 text-xs italic">No File</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="px-6 py-12 text-center text-gray-400">
                                    Tidak ada data aktif untuk unit ini.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
        
        {/* Footer */}
        <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 text-right">
            <button 
                onClick={onClose}
                className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-bold text-sm transition-all"
            >
                Tutup
            </button>
        </div>
      </div>
    </div>
  );
}