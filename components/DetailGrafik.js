import React, { useState } from 'react';
import { X, Calendar, User, Eye, Edit3, ChevronDown, LayoutDashboard, Search } from 'lucide-react';

export default function DetailGrafik({ isOpen, onClose, unitName, data, onRowClick }) {

  const [viewOpen, setViewOpen] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('close')) return 'bg-purple-100 text-purple-700 border-purple-200';
    if (s.includes('progress')) return 'bg-green-100 text-green-700 border-green-200';
    if (s.includes('open')) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-gray-100 text-gray-600 border-gray-200';
  };

  const filteredData = data.filter(row => {

    const keyword = search.toLowerCase();

    const matchSearch =
      row.no_pelaporan?.toLowerCase().includes(keyword) ||
      row.pic?.toLowerCase().includes(keyword) ||
      row.uraian?.toLowerCase().includes(keyword) ||
      row.unit?.toLowerCase().includes(keyword) ||
      row.lokasi?.toLowerCase().includes(keyword);

    const matchImage =
      filterType === 'withImage'
        ? row.bukti_pelaporan
        : filterType === 'withoutImage'
        ? !row.bukti_pelaporan
        : true;

    return matchSearch && matchImage;

  });

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">

      <div className="bg-white rounded-[1.5rem] w-full max-w-[95vw] h-[90vh] flex flex-col shadow-2xl overflow-hidden">

        {/* HEADER */}
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-start bg-white">

          <div>

            <h2 className="text-2xl font-black text-[#005DAA] uppercase">
              {unitName}
            </h2>

            <div className="flex items-center gap-3 mt-2">

              <span className="bg-blue-50 text-[#005DAA] text-xs px-2.5 py-0.5 rounded-full font-bold border border-blue-100">
                {filteredData.length} Data Found
              </span>

              <span className="text-gray-400 text-xs flex items-center gap-1">
                <Edit3 size={12} />
                Klik baris untuk melihat detail & update status
              </span>

            </div>

            {/* FILTER BAR */}
            <div className="flex items-center gap-4 mt-4">

              {/* DROPDOWN VIEW */}
              <div className="relative">

                <button
                  onClick={() => setViewOpen(!viewOpen)}
                  className="flex items-center gap-3 bg-white border border-gray-200 hover:border-gray-400 text-black px-4 py-2 rounded-lg shadow-sm text-sm font-bold"
                >
                  <LayoutDashboard size={16} />
                  View
                  <ChevronDown size={14} className={`${viewOpen ? "rotate-180" : ""}`} />
                </button>

                {viewOpen && (

                  <div className="absolute mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-50">

                    <button
                      onClick={() => {
                        setFilterType("all");
                        setViewOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-black"
                    >
                      Semua Data
                    </button>

                    <button
                      onClick={() => {
                        setFilterType("withImage");
                        setViewOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-black"
                    >
                      Ada Gambar
                    </button>

                    <button
                      onClick={() => {
                        setFilterType("withoutImage");
                        setViewOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-black"
                    >
                      Tidak Ada Gambar
                    </button>

                  </div>

                )}

              </div>

              {/* SEARCH */}
              <div className="relative">

                <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />

                <input
                  type="text"
                  placeholder="Search No Pelaporan, PIC, Uraian..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm w-80 text-black placeholder:text-black focus:ring-2 focus:ring-[#005DAA] outline-none"
                />

              </div>

            </div>

          </div>

          <button
            onClick={onClose}
            className="bg-gray-100 p-2 rounded-full hover:bg-red-50 hover:text-red-600"
          >
            <X size={24} />
          </button>

        </div>

        {/* TABLE */}
        <div className="flex-1 overflow-auto p-6 bg-[#F8F9FA]">

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

            <table className="w-full text-sm text-left text-black">

              <thead className="bg-[#005DAA] text-white uppercase text-xs font-bold tracking-wider">

                <tr>
                  <th className="px-6 py-4 text-center">No</th>
                  <th className="px-6 py-4">No Pelaporan</th>
                  <th className="px-6 py-4">Tanggal</th>
                  <th className="px-6 py-4 min-w-[350px]">Uraian Hazard</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4">PIC</th>
                  <th className="px-6 py-4 text-center">Gambar</th>
                  <th className="px-6 py-4 text-center">Bukti</th>
                </tr>

              </thead>

              <tbody className="divide-y divide-gray-100">

                {filteredData.length > 0 ? (

                  filteredData.map((row, idx) => (

                    <tr
                      key={idx}
                      onClick={() => onRowClick && onRowClick(row)}
                      className="hover:bg-blue-50 transition-colors cursor-pointer"
                    >

                      <td className="px-6 py-4 text-center font-medium">
                        {idx + 1}
                      </td>

                      <td className="px-6 py-4 font-bold">
                        {row.no_pelaporan || '-'}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          {row.tanggal_hazard || '-'}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="line-clamp-2">
                          {row.uraian || '-'}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center">

                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(row.status)}`}>
                          {row.status}
                        </span>

                      </td>

                      <td className="px-6 py-4">

                        <div className="flex items-center gap-2">
                          <User size={14} />
                          {row.pic || '-'}
                        </div>

                      </td>

                      <td className="px-6 py-4 text-center font-bold">

                        {row.bukti_pelaporan ? (
                          <span className="text-green-600">Ada</span>
                        ) : (
                          <span className="text-gray-400">Tidak</span>
                        )}

                      </td>

                      <td
                        className="px-6 py-4 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >

                        {row.bukti_pelaporan ? (

                          <a
                            href={row.bukti_pelaporan}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 bg-white border px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#005DAA] hover:text-white"
                          >
                            <Eye size={14} />
                            Lihat
                          </a>

                        ) : (

                          <span className="text-gray-300 text-xs italic">
                            No File
                          </span>

                        )}

                      </td>

                    </tr>

                  ))

                ) : (

                  <tr>

                    <td colSpan="8" className="px-6 py-12 text-center text-gray-400">
                      Tidak ada data ditemukan.
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>

        {/* FOOTER */}
        <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 text-right">

          <button
            onClick={onClose}
            className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-bold text-sm"
          >
            Tutup
          </button>

        </div>

      </div>

    </div>
  );
}