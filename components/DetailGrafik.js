import React from 'react';
import { X, Calendar, User, Eye } from 'lucide-react';

export default function DetailGrafik({ isOpen, onClose, unitName, data }) {
  if (!isOpen) return null;

  // Helper warna status badge
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
                    <span className="text-gray-400 text-xs">Detail Hazard Report List</span>
                </div>
            </div>
            <button 
                onClick={onClose}
                className="bg-gray-100 p-2 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors"
            >
                <X size={24} />
            </button>
        </div>

        {/* Body Table (Scrollable) */}
        <div className="flex-1 overflow-auto p-6 bg-[#F8F9FA]">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-[#005DAA] text-white uppercase text-xs font-bold tracking-wider">
                        <tr>
                            <th className="px-6 py-4 w-16 text-center">No</th>
                            <th className="px-6 py-4">No. Pelaporan</th>
                            <th className="px-6 py-4">Tanggal Hazard</th>
                            <th className="px-6 py-4 w-1/3">Uraian Hazard</th>
                            <th className="px-6 py-4 text-center">Status</th>
                            <th className="px-6 py-4">PIC</th>
                            <th className="px-6 py-4 text-center">Bukti</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {data.length > 0 ? (
                            data.map((row, idx) => (
                                <tr key={idx} className="hover:bg-blue-50/30 transition-colors group">
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
                                    <td className="px-6 py-4 text-gray-600 leading-relaxed min-w-[300px]">
                                        {row['uraian'] || row['Uraian'] || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusBadge(row.status || row['Status'])}`}>
                                            {row.status || row['Status'] || 'Unknown'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <User size={14} className="text-gray-400"/>
                                            <span className="truncate max-w-[150px]" title={row.pic}>{row.pic || row['PIC'] || '-'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
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
                                    Tidak ada data hazard untuk unit ini.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
        
        {/* Footer Modal */}
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