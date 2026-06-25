import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Menu, Star, Phone, Home, X } from 'lucide-react';
import api from '../services/api';

interface Item {
  _id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
}

interface Category {
  _id: string;
  name: string;
  items: Item[];
}

interface Restaurant {
  _id: string;
  name: string;
  tradeName?: string;
  address?: string;
  telephone?: string;
  logoUrl?: string;
}

const PublicMenu = () => {
  const { restaurantId } = useParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await api.get(`/menu/${restaurantId}`);
        const validCategories = (response.data.menu || []).filter((cat: any) => cat.items && cat.items.length > 0);
        setCategories(validCategories);
        setRestaurant(response.data.restaurant);
        if (validCategories.length > 0) {
          setActiveCategory(validCategories[0]._id);
        }
      } catch (error) {
        console.error('Error fetching menu', error);
      } finally {
        setLoading(false);
      }
    };
    if (restaurantId) fetchMenu();
  }, [restaurantId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-orange-50 text-orange-600 font-bold">Cargando la carta...</div>;
  }

  return (
    <div className="min-h-screen bg-orange-50 pb-20 font-sans">
      <div className="bg-[#e05626] text-white p-6 pt-10 rounded-b-[40px] shadow-lg relative overflow-hidden max-w-md md:max-w-3xl lg:max-w-[80%] mx-auto">
        <div className="absolute top-0 right-0 opacity-10 transform translate-x-10 -translate-y-10">
           <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
             <circle cx="100" cy="100" r="100" fill="white"/>
           </svg>
        </div>
        <div className="flex justify-between items-center mb-6">
          <span className="font-medium text-lg">{currentTime}</span>
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>
        <div className="text-center relative z-10">
          <div className="w-20 h-20 bg-white rounded-full mx-auto flex items-center justify-center shadow-md mb-4 border-4 border-orange-400 overflow-hidden">
            {restaurant?.logoUrl ? (
              <img src={restaurant.logoUrl} alt={restaurant?.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-[#e05626]">
                {restaurant?.name?.substring(0, 2).toUpperCase() || 'LT'}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold">{restaurant?.name || 'Restaurante'}</h1>
          <p className="text-orange-200 text-sm">{restaurant?.address || 'Piura, Peru'} • Abierto ahora</p>
        </div>
      </div>

      <div className="max-w-md md:max-w-3xl lg:max-w-[80%] mx-auto mt-6 px-4">
        <div className="flex flex-wrap justify-center gap-3 pb-2 mb-4">
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setActiveCategory(cat._id)}
              className={`whitespace-nowrap px-5 py-2 rounded-full font-medium transition-colors ${
                activeCategory === cat._id 
                  ? 'bg-[#e05626] text-white shadow-md' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-orange-100'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {categories.find(c => c._id === activeCategory)?.items.map((item) => (
            <div key={item._id} className="bg-white rounded-2xl p-4 flex items-center shadow-sm border border-gray-100 transition-transform hover:scale-[1.02]">
              <div 
                className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-orange-100 flex items-center justify-center mr-4 shrink-0 overflow-hidden cursor-pointer"
                onClick={() => {
                  if (item.image_url) setPreviewImage(item.image_url);
                }}
              >
                 {item.image_url ? (
                   <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                 ) : (
                   <span className="text-2xl">🍽️</span>
                 )}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800">{item.name}</h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                <div className="mt-2 font-bold text-[#e05626]">S/. {item.price.toFixed(2)}</div>
              </div>
            </div>
          ))}
          {(!categories.find(c => c._id === activeCategory)?.items || categories.find(c => c._id === activeCategory)?.items.length === 0) && (
            <div className="text-center text-gray-500 py-10 bg-white rounded-2xl border border-gray-100">
              No hay items en esta categoría aún.
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around p-3 pb-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div 
          onClick={() => navigate('/')} 
          className="flex flex-col items-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          <Home className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">Inicio</span>
        </div>
        <div className="flex flex-col items-center text-[#e05626]">
          <Menu className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-bold">Menú</span>
        </div>
        <div className="flex flex-col items-center text-gray-400 hover:text-gray-600 transition-colors">
          <Star className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">Promos</span>
        </div>
        <div className="flex flex-col items-center text-gray-400 hover:text-gray-600 transition-colors">
          <Phone className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">Contacto</span>
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50" onClick={() => setPreviewImage(null)}>
          <button 
            className="absolute top-4 right-4 text-white hover:text-gray-300"
            onClick={() => setPreviewImage(null)}
          >
            <X className="w-8 h-8" />
          </button>
          <img 
            src={previewImage} 
            alt="Vista previa" 
            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};

export default PublicMenu;
