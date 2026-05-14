import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

interface Restaurant {
  _id: string;
  name: string;
  logoUrl?: string;
  address?: string;
}

const Home = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await api.get('/restaurants');
        setRestaurants(response.data);
      } catch (error) {
        console.error('Error fetching restaurants', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-orange-600 font-bold">Cargando restaurantes...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Bienvenido a TastyUX</h1>
        <p className="text-gray-600 mb-8">Selecciona un restaurante para ver su menú o administrarlo.</p>
        
        <div className="space-y-4">
          {restaurants.map(restaurant => (
            <div key={restaurant._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between">
              <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center overflow-hidden shrink-0">
                  {restaurant.logoUrl ? (
                    <img src={restaurant.logoUrl} alt={restaurant.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-orange-600">{restaurant.name.substring(0, 1).toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{restaurant.name}</h2>
                  <p className="text-gray-500 text-sm">{restaurant.address || 'Sin dirección'}</p>
                </div>
              </div>
              
              <div className="flex space-x-3 w-full sm:w-auto">
                <Link 
                  to={`/menu/${restaurant._id}`}
                  className="flex-1 sm:flex-none text-center bg-orange-500 text-white px-5 py-2 rounded-xl font-medium hover:bg-orange-600 transition-colors"
                >
                  Ver Menú
                </Link>
                <Link 
                  to={`/admin/${restaurant._id}`}
                  className="flex-1 sm:flex-none text-center bg-blue-600 text-white px-5 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  Admin
                </Link>
              </div>
            </div>
          ))}
          
          {restaurants.length === 0 && (
            <div className="text-center p-10 bg-white rounded-2xl border border-gray-200">
              <p className="text-gray-500">No hay restaurantes registrados en la base de datos.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
