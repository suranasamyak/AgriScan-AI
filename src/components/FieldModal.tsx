import React, { useState } from 'react';
import { X, MapPin, Navigation, Sprout, Calendar, Layers, FileText } from 'lucide-react';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';
import { Field } from '../types';

interface FieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const FieldModal: React.FC<FieldModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { refreshData } = useApp();
  const [name, setName] = useState('');
  const [cropType, setCropType] = useState('Tomato');
  const [area, setArea] = useState('2.5');
  const [plantingDate, setPlantingDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [latitude, setLatitude] = useState('19.9975');
  const [longitude, setLongitude] = useState('73.7898');
  const [notes, setNotes] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const crops = [
    'Tomato',
    'Cotton',
    'Soybean',
    'Wheat',
    'Rice',
    'Potato',
    'Maize',
    'Sugarcane',
    'Chilli',
    'Onion',
    'Grape'
  ];

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setGettingLocation(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(6));
        setLongitude(pos.coords.longitude.toFixed(6));
        setGettingLocation(false);
      },
      (err) => {
        setError(`Location access denied or timed out (${err.message}). Coordinates remain at field reference.`);
        setGettingLocation(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Field name is required.');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);

      const lat = parseFloat(latitude) || 19.9975;
      const lng = parseFloat(longitude) || 73.7898;

      // Generate a quadrilateral boundary around the coordinates
      const delta = 0.0012;
      const boundary = [
        [lat - delta, lng - delta],
        [lat + delta, lng - delta],
        [lat + delta, lng + delta],
        [lat - delta, lng + delta]
      ];

      await api.createField({
        name: name.trim(),
        cropType,
        area: parseFloat(area) || 1.0,
        plantingDate,
        latitude: lat,
        longitude: lng,
        boundaryJson: JSON.stringify(boundary),
        notes: notes.trim()
      });

      await refreshData();
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to register field.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-[#143324] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-400/30">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Register Agricultural Field</h2>
              <p className="text-xs text-emerald-300">Add plot for AI health tracking & satellite weather</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-900/40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Field Name / Identifier *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Malegaon Plot - Tomato Block B"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 text-sm font-medium focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Crop Type *
              </label>
              <select
                value={cropType}
                onChange={(e) => setCropType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 text-sm font-medium focus:outline-none bg-white"
              >
                {crops.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Field Area (Acres) *
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                required
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 text-sm font-medium focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Sowing / Planting Date
            </label>
            <input
              type="date"
              value={plantingDate}
              onChange={(e) => setPlantingDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 text-sm font-medium focus:outline-none"
            />
          </div>

          {/* GPS Coordinates & Auto Location */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/70 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-700" />
                Geographic Coordinates
              </span>
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={gettingLocation}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors disabled:opacity-60"
              >
                <Navigation className={`w-3.5 h-3.5 ${gettingLocation ? 'animate-spin' : ''}`} />
                {gettingLocation ? 'Acquiring GPS...' : 'Use My GPS'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-slate-600">Latitude</label>
                <input
                  type="text"
                  required
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-mono font-medium focus:outline-none focus:border-emerald-600 bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-600">Longitude</label>
                <input
                  type="text"
                  required
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-mono font-medium focus:outline-none focus:border-emerald-600 bg-white"
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-500">
              Enables Open-Meteo microclimate weather and spatial cluster mapping.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Agronomic Notes & Variety Details (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Drip irrigated, black loam soil, certified F1 hybrid seed."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 text-xs font-medium focus:outline-none"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-900/20 disabled:opacity-60 flex items-center gap-1.5"
            >
              {submitting ? 'Registering...' : 'Save Field'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
