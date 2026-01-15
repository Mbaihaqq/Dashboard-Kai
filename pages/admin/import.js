import { useState } from 'react';
import Layout from '../../components/Layout';
import { supabase } from '../../lib/supabaseClient';
import * as XLSX from 'xlsx';

export default function ImportFile() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files) setFile(e.target.files[0]);
  };

  // Fungsi untuk membersihkan dan memvalidasi tanggal agar sesuai standar Database
  const formatDateForDB = (val) => {
    if (!val) return null;
    try {
      const date = new Date(val);
      return isNaN(date.getTime()) ? null : date.toISOString();
    } catch {
      return null;
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Silahkan pilih file terlebih dahulu!");
    
    setLoading(true);
    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary', cellDates: true });
        const wsname = wb.SheetNames[0];
        const rawData = XLSX.utils.sheet_to_json(wb.Sheets[wsname]);

        if (rawData.length === 0) throw new Error("File Excel tidak memiliki data.");

        // Pemetaan data berdasarkan header file HAZARD SRI
        const formattedData = rawData.map(row => ({
          report_no: row['No. Pelaporan']?.toString() || null,
          hazard_date: formatDateForDB(row['Tanggal Hazard']),
          unit: row['Unit'] || 'Lainnya',
          description: row['Uraian']?.toString() || '',
          location: row['Lokasi']?.toString() || '',
          status: row['Status'] || 'Open',
          pic: row['PIC']?.toString() || '',
          risk_category: row['Kategori Resiko'] || null,
          month: row['Bulan']?.toString() || null,
          year: row['Tahun'] ? parseInt(row['Tahun']) : new Date().getFullYear(),
          input_date: formatDateForDB(row['Tanggal Input Hazard'])
        }));

        // PROSES REPLACE: 1. Hapus Semua Data Lama 
        const { error: deleteError } = await supabase
          .from('hazards')
          .delete()
          .neq('id', 0); // Logika untuk menghapus semua baris

        if (deleteError) throw new Error("Gagal membersihkan data lama: " + deleteError.message);

        // PROSES REPLACE: 2. Masukkan Data Baru
        const { error: insertError } = await supabase
          .from('hazards')
          .insert(formattedData);

        if (insertError) throw insertError;

        // Catat Histori Penginputan
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from('upload_history').insert({
          username: user.email,
          file_name: file.name,
          user_id: user.id
        });

        alert(`Sukses! Data lama telah diganti dengan ${formattedData.length} data baru.`);
        setFile(null);
        e.target.reset();
      } catch (err) {
        console.error("Detail Error:", err);
        alert("Terjadi Kesalahan: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    reader.readAsBinaryString(file);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-black mb-1 font-sans">Input File</h1>
        <p className="text-sm text-gray-500 mb-10 font-sans">Unggah file Excel untuk memperbarui Hazard Report secara otomatis</p>
        
        <form onSubmit={handleUpload} className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
          <div className="mb-10">
            <label className="block text-xs font-black text-[#005DAA] mb-4 uppercase tracking-widest">
              Upload File (.xlsx / .csv) *
            </label>
            <div className="relative group">
              <div className="border-2 border-dashed border-gray-200 rounded-3xl p-16 text-center group-hover:border-[#F26522] transition-all bg-gray-50/50">
                <input 
                  type="file" 
                  accept=".xlsx, .xls, .csv" 
                  onChange={handleFileChange} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                />
                <div className="space-y-3">
                  <div className="bg-white w-16 h-16 rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 text-[#F26522]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                  </div>
                  <p className="font-bold text-gray-700 text-lg">
                    {file ? file.name : "Pilih file Excel Anda"}
                  </p>
                  <p className="text-xs text-gray-400">Pastikan kolom sesuai dengan template Hazard SRI</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <button 
              type="submit" 
              disabled={loading || !file} 
              className="bg-[#005DAA] text-white px-20 py-4 rounded-2xl font-black shadow-lg hover:bg-blue-800 transition-all disabled:bg-gray-200 disabled:text-gray-400 uppercase tracking-widest text-sm"
            >
              {loading ? "Memproses Data..." : "Simpan Data"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}