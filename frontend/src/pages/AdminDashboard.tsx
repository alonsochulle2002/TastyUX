import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FileSpreadsheet, Plus, Star, X } from 'lucide-react';
import api from '../services/api';

const AdminDashboard = () => {
  const { restaurantId } = useParams();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [recentItems, setRecentItems] = useState<any[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);

  const [newItem, setNewItem] = useState({ name: '', price: '', description: '', category: '' });
  const [newPromo, setNewPromo] = useState({ title: '', discount: '', description: '', validUntil: '' });
  const [categories, setCategories] = useState<string[]>([]);

  const fetchRestaurant = async () => {
    if (!restaurantId) return;
    try {
      const response = await api.get(`/menu/${restaurantId}`);
      setRestaurant(response.data.restaurant);
      
      const allItems: any[] = [];
      const extractedCategories: string[] = [];
      if (response.data.menu) {
        response.data.menu.forEach((cat: any) => {
          if (cat.name && !extractedCategories.includes(cat.name)) {
            extractedCategories.push(cat.name);
          }
          if (cat.items) allItems.push(...cat.items);
        });
      }
      setCategories(extractedCategories);
      setRecentItems(allItems.reverse().slice(0, 5));
    } catch (error) {
      console.error('Error fetching restaurant data', error);
    }
  };

  useEffect(() => {
    fetchRestaurant();
  }, [restaurantId]);

  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/menu/${restaurantId}/item`, newItem);
      setMessage('Ítem creado exitosamente');
      setIsItemModalOpen(false);
      setNewItem({ name: '', price: '', description: '', category: '' });
      fetchRestaurant();
    } catch (error: any) {
      setMessage('Error al crear ítem: ' + (error.response?.data?.message || error.message));
    }
  };

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
          <button 
            onClick={() => setIsItemModalOpen(true)}
            className="flex items-center justify-center space-x-2 py-3 rounded-xl border border-gray-300 text-gray-600 font-medium bg-white shadow-sm hover:bg-gray-50"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo item</span>
          </button>
          <button 
            onClick={() => setIsPromoModalOpen(true)}
            className="flex items-center justify-center space-x-2 py-3 rounded-xl border border-gray-300 text-gray-600 font-medium bg-white shadow-sm hover:bg-gray-50"
          >
            <Star className="w-4 h-4" />
            <span>Promo</span>
          </button>
        </div>
      </div>

      {/* Modal para Nuevo Ítem */}
      {isItemModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 relative shadow-xl">
            <button 
              onClick={() => setIsItemModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Añadir Nuevo Ítem</h2>
            <form className="space-y-4" onSubmit={handleItemSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del producto</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Ej. Hamburguesa Clásica"
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio (S/.)</label>
                  <input 
                    type="number" 
                    step="0.10"
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="0.00"
                    value={newItem.price}
                    onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                  <select 
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                    value={newItem.category}
                    onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                    required
                  >
                    <option value="" disabled>Selecciona una categoría</option>
                    {categories.map((c, i) => (
                      <option key={i} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea 
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Breve descripción del producto..."
                  rows={3}
                  value={newItem.description}
                  onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                ></textarea>
              </div>
              <button 
                type="submit"
                className="w-full bg-blue-600 text-white font-bold rounded-xl py-3 mt-2 hover:bg-blue-700 transition-colors"
              >
                Guardar Ítem
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Nueva Promoción */}
      {isPromoModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 relative shadow-xl">
            <button 
              onClick={() => setIsPromoModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Crear Promoción</h2>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); console.log('Guardar promo:', newPromo); setIsPromoModalOpen(false); }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título de la Promoción</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Ej. 2x1 en Bebidas"
                  value={newPromo.title}
                  onChange={(e) => setNewPromo({...newPromo, title: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descuento</label>
                  <input 
                    type="text" 
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Ej. 20% o S/. 5"
                    value={newPromo.discount}
                    onChange={(e) => setNewPromo({...newPromo, discount: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Válido hasta</label>
                  <input 
                    type="date" 
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    value={newPromo.validUntil}
                    onChange={(e) => setNewPromo({...newPromo, validUntil: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea 
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Condiciones de la promoción..."
                  rows={3}
                  value={newPromo.description}
                  onChange={(e) => setNewPromo({...newPromo, description: e.target.value})}
                ></textarea>
              </div>
              <button 
                type="submit"
                className="w-full bg-blue-600 text-white font-bold rounded-xl py-3 mt-2 hover:bg-blue-700 transition-colors"
              >
                Crear Promoción
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
