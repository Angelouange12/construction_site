import { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';

// Cities in Burundi
const BURUNDI_CITIES = [
  'Bujumbura',
  'Gitega',
  'Ngozi',
  'Rumonge',
  'Makamba',
  'Bururi',
  'Rutana',
  'Ruyigi',
  'Cankuzo',
  'Kayanza',
  'Kirundo',
  'Muyinga',
  'Muramvya',
  'Mwaro',
  'Cibitoke',
  'Bubanza',
  'Karuzi'
];

const CitySelector = ({ 
  value, 
  onChange, 
  label = 'Ville', 
  required = false,
  disabled = false,
  showIcon = true,
  placeholder = 'Sélectionner une ville...',
  className = ''
}) => {
  const [isCustom, setIsCustom] = useState(false);
  const [customValue, setCustomValue] = useState('');

  useEffect(() => {
    // Check if current value is in the list
    if (value && !BURUNDI_CITIES.includes(value) && value !== 'Autre') {
      setIsCustom(true);
      setCustomValue(value);
    }
  }, []);

  const handleSelectChange = (e) => {
    const selectedValue = e.target.value;
    if (selectedValue === 'Autre') {
      setIsCustom(true);
      setCustomValue('');
      onChange('');
    } else {
      setIsCustom(false);
      setCustomValue('');
      onChange(selectedValue);
    }
  };

  const handleCustomChange = (e) => {
    const newValue = e.target.value;
    setCustomValue(newValue);
    onChange(newValue);
  };

  const handleBackToList = () => {
    setIsCustom(false);
    setCustomValue('');
    onChange('Bujumbura');
  };

  return (
    <div className={className}>
      {label && (
        <label className="label">
          {label} {required && '*'}
        </label>
      )}
      
      {isCustom ? (
        <div className="space-y-2">
          <div className="relative">
            {showIcon && (
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            )}
            <input
              type="text"
              value={customValue}
              onChange={handleCustomChange}
              placeholder="Entrer le nom de la ville..."
              className={`input ${showIcon ? 'pl-10' : ''}`}
              required={required}
              disabled={disabled}
            />
          </div>
          <button
            type="button"
            onClick={handleBackToList}
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            ← Retour à la liste
          </button>
        </div>
      ) : (
        <div className="relative">
          {showIcon && (
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          )}
          <select
            value={value || ''}
            onChange={handleSelectChange}
            className={`input ${showIcon ? 'pl-10' : ''}`}
            required={required}
            disabled={disabled}
          >
            <option value="">{placeholder}</option>
            {BURUNDI_CITIES.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
            <option value="Autre">── Autre (saisir manuellement) ──</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default CitySelector;
export { BURUNDI_CITIES };

