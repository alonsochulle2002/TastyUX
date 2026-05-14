import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FileSpreadsheet, Plus, Star } from 'lucide-react';
import api from '../services/api';

const AdminDashboard = () => {
  const { restaurantId } = useParams();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [recentItems, setRecentItems] = useState<any[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const response = await api.get(`/menu/${restaurantId}`);
        setRestaurant(response.data.restaurant);
        
        // Extraer todos los items de las categorías
        const allItems: any[] = [];
        if (response.data.menu) {
          response.data.menu.forEach((cat: any) => {
            if (cat.items) allItems.push(...cat.items);
          });
        }
        setRecentItems(allItems.reverse().slice(0, 5)); // Mostrar los últimos 5
      } catch (error) {
        console.error('Error fetching restaurant data', error);
      }
    };
    if (restaurantId) fetchRestaurant();
  }, [restaurantId]);

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith('.xlsx')) {
      setMessage('Por favor, sube un archivo Excel (.xlsx)');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsUploading(true);
      setMessage('Subiendo y procesando...');
      const response = await api.post(`/menu/${restaurantId}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage(response.data.message || 'Carga exitosa');
    } catch (error: any) {
      setMessage('Error al subir el archivo: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsUploading(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <div className="bg-blue-700 text-white p-6 rounded-b-3xl shadow-lg flex items-center space-x-4">
        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center font-bold text-xl overflow-hidden">
          {restaurant?.logoUrl ? (
            <img src={restaurant.logoUrl} alt={restaurant?.name} className="w-full h-full object-cover" />
          ) : (
            <span>{restaurant?.name?.substring(0, 1).toUpperCase() || 'A'}</span>
          )}
        </div>
        <div>
          <h1 className="text-xl font-bold">Panel Admin</h1>
          <p className="text-blue-200 text-sm">{restaurant?.name || 'Cargando...'}</p>
        </div>
      </div>

      <div className="p-4 space-y-6 max-w-md mx-auto mt-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
            <span className="text-gray-500 text-xs font-medium">Items activos</span>
            <span className="text-2xl font-bold mt-1">3</span>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
            <span className="text-gray-500 text-xs font-medium">Promociones</span>
            <span className="text-2xl font-bold mt-1">0</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
          <h2 className="font-semibold text-gray-800 mb-2">Carga masiva via Excel</h2>
          <p className="text-xs text-gray-500 mb-4">Sube tu plantilla .xlsx para actualizar el menú</p>
          
          <div
            className={`border-2 border-dashed rounded-xl p-6 transition-colors ${
              isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".xlsx"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
            />
            <FileSpreadsheet className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-600">
              {isUploading ? 'Subiendo...' : 'Arrastra tu archivo aquí o haz clic'}
            </p>
          </div>
          
          {message && (
            <p className={`mt-4 text-sm font-medium ${message.includes('Error') ? 'text-red-500' : 'text-green-600'}`}>
              {message}
            </p>
          )}
        </div>

        <div>
          <h3 className="text-xs font-bold text-gray-400 tracking-wider mb-3 uppercase">Items Recientes</h3>
          <div className="space-y-3">
            {recentItems.length > 0 ? (
              recentItems.map((item, i) => (
                <div key={i} className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <span className="font-medium text-gray-700">{item.name}</span>
                  <span className="font-bold text-green-600">S/. {item.price.toFixed(2)}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                Aún no hay ítems en este menú.
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button className="flex items-center justify-center space-x-2 py-3 rounded-xl border border-gray-300 text-gray-600 font-medium bg-white shadow-sm hover:bg-gray-50">
            <Plus className="w-4 h-4" />
            <span>Nuevo item</span>
          </button>
          <button className="flex items-center justify-center space-x-2 py-3 rounded-xl border border-gray-300 text-gray-600 font-medium bg-white shadow-sm hover:bg-gray-50">
            <Star className="w-4 h-4" />
            <span>Promo</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
