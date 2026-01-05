import { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, ExternalLink, Search } from 'lucide-react';

// Default coordinates for Burundi cities
const BURUNDI_COORDINATES = {
  'Bujumbura': { lat: -3.3731, lng: 29.3644 },
  'Gitega': { lat: -3.4264, lng: 29.9246 },
  'Ngozi': { lat: -2.9075, lng: 29.8306 },
  'Rumonge': { lat: -3.9736, lng: 29.4386 },
  'Makamba': { lat: -4.1347, lng: 29.8039 },
  'Bururi': { lat: -3.9489, lng: 29.6244 },
  'Rutana': { lat: -3.9308, lng: 29.9919 },
  'Ruyigi': { lat: -3.4764, lng: 30.2486 },
  'Cankuzo': { lat: -3.2194, lng: 30.5528 },
  'Kayanza': { lat: -2.9222, lng: 29.6292 },
  'Kirundo': { lat: -2.5847, lng: 30.0969 },
  'Muyinga': { lat: -2.8453, lng: 30.3372 },
  'Muramvya': { lat: -3.2669, lng: 29.6078 },
  'Mwaro': { lat: -3.5167, lng: 29.7000 },
  'Cibitoke': { lat: -2.8869, lng: 29.1244 },
  'Bubanza': { lat: -3.0833, lng: 29.3833 },
  'Karuzi': { lat: -3.1000, lng: 30.1667 }
};

const LocationPicker = ({
  value = '',
  coordinates = null,
  onChange,
  onCoordinatesChange,
  label = 'Localisation',
  required = false,
  disabled = false,
  showMap = true,
  height = '200px'
}) => {
  const [selectedCity, setSelectedCity] = useState('');
  const [customLocation, setCustomLocation] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [coords, setCoords] = useState(coordinates || BURUNDI_COORDINATES['Bujumbura']);
  const [showFullMap, setShowFullMap] = useState(false);
  const mapRef = useRef(null);

  useEffect(() => {
    // Parse initial value
    if (value) {
      const cityMatch = Object.keys(BURUNDI_COORDINATES).find(city => 
        value.toLowerCase().includes(city.toLowerCase())
      );
      if (cityMatch) {
        setSelectedCity(cityMatch);
        setCoords(BURUNDI_COORDINATES[cityMatch]);
        const extra = value.replace(cityMatch, '').replace(', Burundi', '').replace(',', '').trim();
        if (extra) {
          setCustomLocation(extra);
        }
      } else {
        setIsCustom(true);
        setCustomLocation(value);
      }
    }
  }, []);

  useEffect(() => {
    if (coordinates) {
      setCoords(coordinates);
    }
  }, [coordinates]);

  const handleCityChange = (e) => {
    const city = e.target.value;
    if (city === 'Autre') {
      setIsCustom(true);
      setSelectedCity('');
    } else {
      setIsCustom(false);
      setSelectedCity(city);
      if (BURUNDI_COORDINATES[city]) {
        setCoords(BURUNDI_COORDINATES[city]);
        onCoordinatesChange?.(BURUNDI_COORDINATES[city]);
      }
      const fullLocation = customLocation 
        ? `${customLocation}, ${city}, Burundi` 
        : `${city}, Burundi`;
      onChange(fullLocation);
    }
  };

  const handleCustomLocationChange = (e) => {
    const loc = e.target.value;
    setCustomLocation(loc);
    const fullLocation = selectedCity 
      ? `${loc}, ${selectedCity}, Burundi`
      : isCustom 
        ? loc 
        : `${loc}, Burundi`;
    onChange(fullLocation);
  };

  const handleBackToList = () => {
    setIsCustom(false);
    setSelectedCity('Bujumbura');
    setCustomLocation('');
    setCoords(BURUNDI_COORDINATES['Bujumbura']);
    onChange('Bujumbura, Burundi');
    onCoordinatesChange?.(BURUNDI_COORDINATES['Bujumbura']);
  };

  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps?q=${coords.lat},${coords.lng}`;
    window.open(url, '_blank');
  };

  const openDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`;
    window.open(url, '_blank');
  };

  const getStaticMapUrl = () => {
    // Using OpenStreetMap static tiles
    const zoom = 13;
    return `https://staticmap.openstreetmap.de/staticmap.php?center=${coords.lat},${coords.lng}&zoom=${zoom}&size=600x300&maptype=mapnik&markers=${coords.lat},${coords.lng},red-pushpin`;
  };

  const getEmbedMapUrl = () => {
    return `https://www.openstreetmap.org/export/embed.html?bbox=${coords.lng - 0.02},${coords.lat - 0.015},${coords.lng + 0.02},${coords.lat + 0.015}&layer=mapnik&marker=${coords.lat},${coords.lng}`;
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className="label">
          {label} {required && '*'}
        </label>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* City Selector */}
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Ville</label>
          {isCustom ? (
            <div className="space-y-2">
              <input
                type="text"
                value={customLocation}
                onChange={handleCustomLocationChange}
                placeholder="Entrer l'adresse complète..."
                className="input"
                required={required}
                disabled={disabled}
              />
              <button
                type="button"
                onClick={handleBackToList}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                ← Retour aux villes du Burundi
              </button>
            </div>
          ) : (
            <select
              value={selectedCity}
              onChange={handleCityChange}
              className="input"
              required={required && !customLocation}
              disabled={disabled}
            >
              <option value="">Sélectionner une ville...</option>
              {Object.keys(BURUNDI_COORDINATES).map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
              <option value="Autre">── Autre localisation ──</option>
            </select>
          )}
        </div>

        {/* Additional Location Details */}
        {!isCustom && (
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Quartier / Adresse (optionnel)</label>
            <input
              type="text"
              value={customLocation}
              onChange={handleCustomLocationChange}
              placeholder="Ex: Quartier Asiatique, Avenue..."
              className="input"
              disabled={disabled}
            />
          </div>
        )}
      </div>

      {/* Map Display */}
      {showMap && coords && (
        <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
          {/* Map Preview */}
          <div className="relative" style={{ height }}>
            <iframe
              ref={mapRef}
              src={getEmbedMapUrl()}
              className="w-full h-full border-0"
              loading="lazy"
              title="Location Map"
            />
            
            {/* Map Overlay Actions */}
            <div className="absolute top-2 right-2 flex gap-2">
              <button
                type="button"
                onClick={openInGoogleMaps}
                className="p-2 bg-white rounded-lg shadow-md hover:bg-slate-50 transition-colors"
                title="Ouvrir dans Google Maps"
              >
                <ExternalLink className="w-4 h-4 text-slate-600" />
              </button>
              <button
                type="button"
                onClick={openDirections}
                className="p-2 bg-white rounded-lg shadow-md hover:bg-slate-50 transition-colors"
                title="Obtenir l'itinéraire"
              >
                <Navigation className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            {/* Location Label */}
            <div className="absolute bottom-2 left-2 right-12 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span className="truncate text-slate-700">
                  {value || `${selectedCity || 'Bujumbura'}, Burundi`}
                </span>
              </div>
            </div>
          </div>

          {/* Coordinates Display */}
          <div className="px-3 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>
              Coordonnées: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
            </span>
            <a
              href={`https://www.google.com/maps?q=${coords.lat},${coords.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Google Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
export { BURUNDI_COORDINATES };

