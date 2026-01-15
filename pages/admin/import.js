import { useState } from 'react';
import Layout from '../../components/Layout';
import { supabase } from '../../lib/supabaseClient';
import * as XLSX from 'xlsx';

export default function ImportFile() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState('');

  const handleFileChange = (e) => { setFile(e.target.files[0]); };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !date) return alert("Pilih file dan tanggal!");
    setLoading(true);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const data = XLSX.utils.sheet_to_json(wb.Sheets[wsname]);

      const formattedData = data.map(row => ({
        report_no: row['No. Pelaporan'],
        hazard_date: row['Tanggal Hazard'],
        unit: row['Unit'],
        description: row['Uraian'],
        location: row['Lokasi'],
        status: row['Status'],
        pic: row['PIC'],
        year: row['Tahun']
      }));

      const { error } = await supabase.from('hazards').insert(formattedData);
      
      if (!error) {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from('upload_history').insert({
          username: user.email,
          file_name: file.name,
          user_id: user.id
        });
        alert("Data Berhasil Diimport!");
      } else {
        alert("Gagal: " + error.message);
      }
      setLoading(false);
    };
    reader.readAsBinaryString(file);
  };

  return (
    <Layout>
      <h1 className="text-3xl font-bold text-black mb-1">Input File [cite: 695]</h1>
      <p className="text-sm text-gray-500 mb-10">Silahkan Input File Data Target Pendapatan & Data Aktual Lapangan [cite: 696]</p>
      <form onSubmit={handleUpload} className="max-w-xl space-y-6">
        <div>
          <label className="block text-sm font-bold text-black mb-2">Tanggal * [cite: 697]</label>
          <input type="date" required value={date} onChange={(e)=>setDate(e.target.value)} className="w-full border border-gray-400 rounded-lg px-4 py-2" />
        </div>
        <div>
          <label className="block text-sm font-bold text-black mb-2">Upload File * [cite: 698]</label>
          <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileChange} className="w-full border border-dashed border-gray-400 rounded-lg p-10 text-center cursor-pointer" />
        </div>
        <button type="submit" disabled={loading} className="bg-[#005DAA] text-white px-10 py-3 rounded-lg font-bold shadow-md">
          {loading ? "Memproses..." : "Simpan Data [cite: 699]"}
        </button>
      </form>
    </Layout>
  );
}