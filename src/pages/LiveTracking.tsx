import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Navigation,
  Crosshair,
  Wifi,
  WifiOff,
  AlertTriangle,
  RefreshCw,
  Plus,
  Eye,
  CheckCircle,
  Clock,
  Layers
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Field, Observation } from '../types';

export const LiveTracking: React.FC<{ onOpenNewField: () => void }> = ({ onOpenNewField }) => {
  const { fields, scans, isOnline, pendingSyncCount, refreshData, t, tCrop, tStatus } = useApp();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);

  const [isTrackingLocation, setIsTrackingLocation] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationTimestamp, setLocationTimestamp] = useState<string | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [fieldObservations, setFieldObservations] = useState<Observation[]>([]);
  const [newNote, setNewNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Centered around Nashik / Maharashtra agricultural belt by default
      const defaultLat = fields[0]?.latitude || 19.9975;
      const defaultLng = fields[0]?.longitude || 73.7898;

      const map = L.map(mapContainerRef.current, {
        center: [defaultLat, defaultLng],
        zoom: 13,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear previous markers
    const markersLayer = L.layerGroup().addTo(map);

    // Add field boundaries & markers
    fields.forEach((field) => {
      // Determine color
      const isCritical = field.healthStatus === 'critical';
      const isModerate = field.healthStatus === 'moderate';
      const color = isCritical ? '#e11d48' : isModerate ? '#d97706' : '#16a34a';

      // Custom marker icon
      const customIcon = L.divIcon({
        className: 'custom-field-pin',
        html: `<div style="background-color: ${color}; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 11px;">🌱</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([field.latitude, field.longitude], { icon: customIcon }).addTo(
        markersLayer
      );

      marker.bindPopup(`
        <div style="font-family: system-ui; padding: 4px;">
          <h4 style="font-weight: 700; margin: 0 0 4px 0; font-size: 13px;">${field.name}</h4>
          <p style="margin: 0; font-size: 11px; color: #475569;">${t('crop_label')}: <b>${tCrop(field.cropType)}</b> (${field.area} ${t('ac')})</p>
          <p style="margin: 4px 0 0 0; font-size: 11px; font-weight: 600; color: ${color}; text-transform: uppercase;">${t('status_label')}: ${tStatus(field.healthStatus)}</p>
        </div>
      `);

      marker.on('click', () => {
        setSelectedField(field);
      });

      // If boundary exists, draw polygon
      if (field.boundaryJson) {
        try {
          const coords = JSON.parse(field.boundaryJson);
          if (Array.isArray(coords) && coords.length >= 3) {
            L.polygon(coords, {
              color,
              weight: 2,
              fillColor: color,
              fillOpacity: 0.2
            }).addTo(markersLayer);
          }
        } catch {
          // ignore parsing error
        }
      }
    });

    if (fields.length > 0 && !selectedField) {
      setSelectedField(fields[0]);
    }

    return () => {
      markersLayer.clearLayers();
    };
  }, [fields]);

  // Load observations when selected field changes
  useEffect(() => {
    if (selectedField) {
      api
        .getFieldTimeline(selectedField.id)
        .then((res) => {
          setFieldObservations(res.observations || []);
        })
        .catch(() => {});
    }
  }, [selectedField]);

  // Live Location Tracker
  const handleToggleTracking = () => {
    if (isTrackingLocation) {
      // Stop tracking
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setIsTrackingLocation(false);
      setGpsError(null);
      if (userMarkerRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(userMarkerRef.current);
        userMarkerRef.current = null;
      }
      if (accuracyCircleRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(accuracyCircleRef.current);
        accuracyCircleRef.current = null;
      }
    } else {
      // Start tracking with explicit permission
      if (!navigator.geolocation) {
        setGpsError('Geolocation is not supported on this browser.');
        return;
      }

      setGpsError(null);
      setIsTrackingLocation(true);

      const id = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const accuracy = pos.coords.accuracy;

          setUserLocation({ lat, lng });
          setLocationTimestamp(new Date().toLocaleTimeString());

          if (mapInstanceRef.current) {
            const map = mapInstanceRef.current;

            // Update or create user marker
            if (!userMarkerRef.current) {
              const pulseIcon = L.divIcon({
                className: 'user-live-pin',
                html: `<div style="background-color: #2563eb; width: 22px; height: 22px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 6px rgba(37,99,235,0.3); animation: pulse 2s infinite;"></div>`,
                iconSize: [22, 22],
                iconAnchor: [11, 11]
              });
              userMarkerRef.current = L.marker([lat, lng], { icon: pulseIcon }).addTo(map);
              userMarkerRef.current.bindPopup(`<b>${t('live_scout_position')}</b>`);
            } else {
              userMarkerRef.current.setLatLng([lat, lng]);
            }

            // Accuracy circle
            if (!accuracyCircleRef.current) {
              accuracyCircleRef.current = L.circle([lat, lng], {
                radius: accuracy,
                color: '#2563eb',
                fillOpacity: 0.1,
                weight: 1
              }).addTo(map);
            } else {
              accuracyCircleRef.current.setLatLng([lat, lng]);
              accuracyCircleRef.current.setRadius(accuracy);
            }

            map.panTo([lat, lng]);
          }
        },
        (err) => {
          setGpsError(`GPS permission required: ${err.message}`);
          setIsTrackingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
      );

      watchIdRef.current = id;
    }
  };

  const handleAddQuickScoutNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedField || !newNote.trim()) return;

    try {
      setSavingNote(true);
      await api.createField({
        // post observation via api observations endpoint
      });
      // Direct call
      await fetch(`/api/fields/${selectedField.id}/observations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          observationType: 'visual_scouting',
          status: 'normal',
          notes: newNote.trim(),
          latitude: userLocation?.lat || selectedField.latitude,
          longitude: userLocation?.lng || selectedField.longitude
        })
      });
      setNewNote('');
      const updated = await api.getFieldTimeline(selectedField.id);
      setFieldObservations(updated.observations || []);
      await refreshData();
    } catch (err) {
      console.error(err);
    } finally {
      setSavingNote(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header with live tracking controls & status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            {t('live_map_title')}
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
              {t('badge_osm')}
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            {t('live_map_sub')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Live Device GPS Toggle */}
          <button
            onClick={handleToggleTracking}
            className={`px-4 py-2.5 rounded-2xl font-semibold text-xs transition-all flex items-center gap-2 shadow-sm ${
              isTrackingLocation
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Crosshair className={`w-4 h-4 ${isTrackingLocation ? 'animate-spin' : ''}`} />
            <span>{isTrackingLocation ? t('stop_live_gps') : t('track_my_location')}</span>
          </button>

          <button
            onClick={onOpenNewField}
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            {t('add_field_btn')}
          </button>
        </div>
      </div>

      {/* GPS Status pill if tracking active */}
      {isTrackingLocation && userLocation && (
        <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex flex-wrap items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" />
            <span className="font-bold">{t('live_gps_active')}</span>
            <span className="font-mono">
              {userLocation.lat.toFixed(6)}° N, {userLocation.lng.toFixed(6)}° E
            </span>
          </div>
          <span className="text-blue-700 font-medium">{t('updated')} {locationTimestamp}</span>
        </div>
      )}

      {gpsError && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{gpsError}</span>
        </div>
      )}

      {/* Map + Detail Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Map Container */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm flex flex-col h-[520px]">
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-700" />
              <span>{t('monitored_plots_count', { count: fields.length })}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span> {t('healthy')}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> {t('watchlist')}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block"></span> {t('critical')}
              </span>
            </div>
          </div>
          <div ref={mapContainerRef} className="flex-1 w-full z-10" />
        </div>

        {/* Selected Field Details & Field Scouting Feed */}
        <div className="lg:col-span-4 space-y-4">
          {selectedField ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-4">
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-base text-slate-900">{selectedField.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {tCrop(selectedField.cropType)} • {selectedField.area} {t('acres')}
                  </p>
                </div>
                <span
                  className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    selectedField.healthStatus === 'critical'
                      ? 'bg-rose-100 text-rose-700'
                      : selectedField.healthStatus === 'moderate'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {tStatus(selectedField.healthStatus)}
                </span>
              </div>

              {/* Coordinates & Planting */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">{t('coordinates')}</span>
                  <p className="font-mono text-slate-700 mt-0.5 truncate">
                    {selectedField.latitude.toFixed(4)}, {selectedField.longitude.toFixed(4)}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">{t('planted_date')}</span>
                  <p className="font-medium text-slate-700 mt-0.5">
                    {selectedField.plantingDate || 'Aug 2026'}
                  </p>
                </div>
              </div>

              {/* Quick Field Scouting Note Entry */}
              <form onSubmit={handleAddQuickScoutNote} className="space-y-2 pt-2">
                <label className="text-[11px] font-bold text-slate-700 block">
                  {t('record_scouting_note')}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={t('scouting_placeholder')}
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-emerald-600"
                  />
                  <button
                    type="submit"
                    disabled={savingNote || !newNote.trim()}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold disabled:opacity-50"
                  >
                    {savingNote ? t('saving') : t('save')}
                  </button>
                </div>
              </form>

              {/* Recent Observations for this field */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {t('recent_field_logs')} ({fieldObservations.length})
                </h4>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {fieldObservations.length === 0 ? (
                    <p className="text-xs text-slate-400 py-3 text-center">
                      {t('no_obs_logged')}
                    </p>
                  ) : (
                    fieldObservations.map((obs) => (
                      <div
                        key={obs.id}
                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between text-[10px]">
                          <span
                            className={`font-bold uppercase ${
                              obs.status === 'urgent_action_required'
                                ? 'text-rose-600'
                                : 'text-emerald-700'
                            }`}
                          >
                            {obs.observationType.replace('_', ' ')}
                          </span>
                          <span className="text-slate-400">
                            {new Date(obs.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-slate-700 font-medium leading-snug">{obs.notes}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-8 text-center text-xs text-slate-400">
              {t('select_field_map_prompt')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
