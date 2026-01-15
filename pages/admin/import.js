import { useState } from 'react';
import Layout from '../../components/Layout';
import { supabase } from '../../lib/supabaseClient';
import * as XLSX from 'xlsx';

export default function ImportFile() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => { setFile(e.target.files[0]); };

  // Fungsi pembantu untuk konversi tanggal Excel (angka) ke format JS
  const excelDateToJSDate = (serial) => {
    if (!serial || isNaN(serial)) return null;
    const date = new Date(Math.round((serial - 25569) * 86400 * 1000));
    return date.toISOString().split('T')[0];
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
        const data = XLSX.utils.sheet_to_json(wb.Sheets[wsname]);

        if (data.length === 0) throw new Error("File Excel kosong");

        const formattedData = data.map(row => {
          // Konversi tanggal: cek jika sudah object Date atau masih angka serial Excel
          let hDate = row['Tanggal Hazard'];
          if (typeof hDate === 'number') hDate = excelDateToJSDate(hDate);
          else if (hDate instanceof Date) hDate = hDate.toISOString().split('T')[0];

          return {
            report_no: row['No. Pelaporan'] || null,
            hazard_date: hDate,
            unit: row['Unit'] || 'Unknown',
            description: row['Uraian'] || '',
            location: row['Lokasi'] || '',
            status: row['Status'] || 'Open',
            pic: row['PIC'] || '',
            year: row['Tahun'] ? parseInt(row['Tahun']) : new Date().getFullYear()
          };
        });

        // Simpan data ke tabel hazards [cite: 13, 220]
        const { error: insertError } = await supabase.from('hazards').insert(formattedData);
        if (insertError) throw insertError;

        // Catat ke histori [cite: 191]
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from('upload_history').insert({
          username: user.email,
          file_name: file.name,
          user_id: user.id
        });

        alert("Berhasil! " + formattedData.length + " data telah diimport.");
        setFile(null);
      } catch (err) {
        console.error(err);
        alert("Gagal Import: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-black mb-1">Input File</h1>
        <p className="text-sm text-gray-500 mb-10">Unggah data Hazard Report DAOP 4 Semarang (.xlsx)</p>
        
        <form onSubmit={handleUpload} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="mb-8">
            <label className="block text-sm font-bold text-black mb-4 uppercase tracking-wider">Pilih File Excel</label>
            <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-[#005DAA] transition-colors">
              <input 
                type="file" 
                accept=".xlsx, .xls" 
                onChange={handleFileChange} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              />
              <div className="text-gray-400">
                <p className="font-bold text-lg">{file ? file.name : "Klik atau seret file ke sini"}</p>
                <p className="text-xs mt-2">Format yang didukung: .xlsx, .xls</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <button 
              type="submit" 
              disabled={loading || !file} 
              className="bg-[#005DAA] text-white px-12 py-3 rounded-lg font-bold shadow-lg hover:bg-blue-800 transition-all disabled:bg-gray-300"
            >
              {loading ? "Sedang Memproses..." : "Simpan ke Database"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}