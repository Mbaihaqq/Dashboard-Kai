// pages/profile/index.js
import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { supabase } from '../../lib/supabaseClient';
import Cropper from 'react-easy-crop';
import { Camera, X } from 'lucide-react';

export default function Profile() {
  const [userData, setUserData] = useState({ 
    id: '', username: '', nip: '', position: '', email: '', avatar_url: '' 
  });
  const [image, setImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [showCropper, setShowCropper] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (!error && data) {
        setUserData({ ...data, email: user.email });
      }
    }
  };

  const onFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.readAsDataURL(e.target.files[0]);
      reader.onload = () => {
        setImage(reader.result);
        setShowCropper(true);
      };
    }
  };

  const uploadAvatar = async () => {
    try {
      setUploading(true);
      const fileInput = document.getElementById('avatar-upload');
      if (!fileInput.files || fileInput.files.length === 0) return;

      const file = fileInput.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${userData.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userData.id);

      if (updateError) throw updateError;

      setUserData({ ...userData, avatar_url: publicUrl });
      setShowCropper(false);
      alert("Foto profil berhasil diperbarui!");
    } catch (error) {
      alert("Gagal unggah: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Layout>
      <div className="p-8 font-sans animate-fadeIn">
        <h1 className="text-3xl font-bold mb-8 text-black">Profil</h1>
        
        <div className="flex items-center gap-6 mb-12">
          {/* FOTO PROFIL CONTAINER */}
          <div className="relative group w-24 h-24">
            <div 
              onClick={() => setShowViewModal(true)} 
              className="w-24 h-24 bg-gray-100 rounded-full overflow-hidden border-2 border-gray-100 shadow-sm cursor-pointer transition-transform hover:scale-105"
            >
              <img 
                src={userData.avatar_url || "/avatar-placeholder.png"} 
                alt="Profile" 
                className="w-full h-full object-cover" 
              />
            </div>
            
            <label className="absolute bottom-0 right-0 bg-[#005DAA] p-1.5 rounded-full border-2 border-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="text-white" size={16} />
              <input id="avatar-upload" type="file" className="hidden" accept="image/*" onChange={onFileChange} />
            </label>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[#4B5563]">{userData.username || 'rafi'}</h2>
            <div className="flex items-center gap-2">
                <p className="text-gray-500 font-medium">{userData.email || 'rafi@kai.id'}</p>
                {/* ROLE BADGE DIHAPUS */}
            </div>
          </div>
        </div>

        {/* MODAL 1: VIEW PHOTO */}
        {showViewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm transition-all">
             <button onClick={() => setShowViewModal(false)} className="absolute top-6 right-6 text-white hover:text-red-400 transition-colors">
                <X size={40} />
              </button>
              <div className="max-w-xl w-full flex justify-center animate-zoomIn">
                  <img src={userData.avatar_url || "/avatar-placeholder.png"} className="max-h-[80vh] rounded-lg shadow-2xl border-4 border-white" alt="View Profile" />
              </div>
          </div>
        )}

        {/* MODAL 2: CROP PHOTO */}
        {showCropper && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl animate-slideUp">
              <h3 className="text-lg font-bold mb-4 text-[#4B5563]">Sesuaikan Foto Profil</h3>
              <div className="relative w-full h-64 bg-gray-200 rounded-lg overflow-hidden border border-gray-100">
                <Cropper image={image} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onZoomChange={setZoom} cropShape="round" />
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => setShowCropper(false)} className="px-4 py-2 text-gray-500 font-bold hover:text-gray-700 transition-colors">Batal</button>
                <button onClick={uploadAvatar} disabled={uploading} className="px-6 py-2 bg-[#005DAA] text-white rounded-lg font-bold hover:bg-blue-800 transition-colors shadow-md">
                  {uploading ? "Mengunggah..." : "Simpan Foto"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FORM DATA READ-ONLY */}
        <div className="space-y-6 max-w-md"> 
          <div className="group">
            <label className="block text-gray-600 mb-2 font-semibold">Username</label>
            <input readOnly value={userData.username} className="w-full border border-gray-200 rounded-lg p-3 bg-white text-[#4B5563] font-bold focus:outline-none shadow-sm transition-all group-hover:border-blue-200" />
          </div>

          {/* STATUS AKUN DIHAPUS */}

          <div className="group">
            <label className="block text-gray-600 mb-2 font-semibold">Nomor Induk Pegawai</label>
            <input readOnly value={userData.nip} className="w-full border border-gray-200 rounded-lg p-3 bg-white text-[#4B5563] font-bold focus:outline-none shadow-sm transition-all group-hover:border-blue-200" />
          </div>
          
          <div className="group">
            <label className="block text-gray-600 mb-2 font-semibold">Jabatan</label>
            <input readOnly value={userData.position} className="w-full border border-gray-200 rounded-lg p-3 bg-white text-[#4B5563] font-bold focus:outline-none shadow-sm transition-all group-hover:border-blue-200" />
          </div>
        </div>
      </div>
    </Layout>
  );
}