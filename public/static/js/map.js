// map.js — safe, feature-rich Leaflet initializer for mini-map and full map pages
// Features:
//  - single initialization guard (no double init)
//  - demo + API zones (circle or GeoJSON polygon support)
//  - legend control
//  - user "locate me" button and weather marker integration
//  - exposes window.safeSphereMap helpers for debugging

(function () {
  // guard: avoid re-initializing if included multiple times
  if (window.safeSphereMap && window.safeSphereMap.mapInstance) {
    console.log("map.js: map already initialized — skipping re-init.");
    return;
  }

  // CONFIG
  const DEFAULT_CENTER = [23.2156, 77.4305]; // Prestige Institute of Management and Research, Bhopal
  const DEFAULT_ZOOM = 7; // Zoom to show MP region
  const ZONES_API = "/api/zones/"; // expected array or GeoJSON
  const FETCH_TIMEOUT_MS = 5000;
  
  // HOSPITALS & COMMUNITY CENTERS IN MADHYA PRADESH
  const emergencyLocations = {
    hospitals: [
      // Bhopal - Multiple hospitals in RED ZONE
      { name: "AIIMS Bhopal", lat: 23.2156, lng: 77.4128, city: "Bhopal", phone: "0755-2672355", type: "Government" },
      { name: "Hamidia Hospital", lat: 23.2599, lng: 77.4126, city: "Bhopal", phone: "0755-2740381", type: "Government" },
      { name: "Chirayu Medical College", lat: 23.1685, lng: 77.4513, city: "Bhopal", phone: "0755-4097100", type: "Private" },
      { name: "Bansal Hospital", lat: 23.2156, lng: 77.4328, city: "Bhopal", phone: "0755-4027000", type: "Private" },
      { name: "People's Hospital Bhopal", lat: 23.2420, lng: 77.4050, city: "Bhopal", phone: "0755-2577000", type: "Private" },
      { name: "Siddhanta Red Cross Hospital", lat: 23.2350, lng: 77.4280, city: "Bhopal", phone: "0755-2551234", type: "Private" },
      { name: "Narmada Trauma Center", lat: 23.2180, lng: 77.3950, city: "Bhopal", phone: "0755-2660000", type: "Government" },
      
      // Indore - Multiple hospitals in RED ZONE
      { name: "MY Hospital Indore", lat: 22.7196, lng: 75.8577, city: "Indore", phone: "0731-2537777", type: "Government" },
      { name: "Bombay Hospital Indore", lat: 22.7532, lng: 75.8937, city: "Indore", phone: "0731-4222222", type: "Private" },
      { name: "CHL Hospital Indore", lat: 22.7279, lng: 75.8897, city: "Indore", phone: "0731-4044444", type: "Private" },
      { name: "Greater Kailash Hospital", lat: 22.7150, lng: 75.8650, city: "Indore", phone: "0731-2555555", type: "Private" },
      { name: "Medanta Hospital Indore", lat: 22.7380, lng: 75.8820, city: "Indore", phone: "0731-4777777", type: "Private" },
      
      // Gwalior - Multiple hospitals in RED ZONE
      { name: "Jaya Arogya Hospital", lat: 26.2183, lng: 78.1828, city: "Gwalior", phone: "0751-2423999", type: "Government" },
      { name: "Birla Hospital Gwalior", lat: 26.2124, lng: 78.1772, city: "Gwalior", phone: "0751-2341111", type: "Private" },
      { name: "Cancer Hospital Gwalior", lat: 26.2250, lng: 78.1900, city: "Gwalior", phone: "0751-2340000", type: "Government" },
      
      // Jabalpur - RED ZONE
      { name: "Netaji Subhash Chandra Bose Medical College", lat: 22.9734, lng: 78.6569, city: "Jabalpur", phone: "0761-2672855", type: "Government" },
      { name: "Sanjivani Hospital Jabalpur", lat: 23.1765, lng: 79.9339, city: "Jabalpur", phone: "0761-4005555", type: "Private" },
      { name: "Agrawal Hospital Jabalpur", lat: 23.1650, lng: 79.9250, city: "Jabalpur", phone: "0761-2620000", type: "Private" },
      
      // Sagar - YELLOW ZONE
      { name: "District Hospital Sagar", lat: 24.5854, lng: 77.7064, city: "Sagar", phone: "07582-226666", type: "Government" },
      { name: "Bundelkhand Medical College", lat: 24.5750, lng: 77.7150, city: "Sagar", phone: "07582-265000", type: "Government" },
      
      // Rewa - YELLOW ZONE
      { name: "District Hospital Rewa", lat: 24.5330, lng: 81.3019, city: "Rewa", phone: "07662-222222", type: "Government" },
      { name: "Shyam Shah Medical College", lat: 24.5280, lng: 81.2950, city: "Rewa", phone: "07662-233000", type: "Government" },
      
      // Chhindwara - GREEN ZONE
      { name: "District Hospital Chhindwara", lat: 21.1702, lng: 79.0950, city: "Chhindwara", phone: "07162-222222", type: "Government" },
      { name: "Chhindwara Medical Center", lat: 22.0570, lng: 78.9380, city: "Chhindwara", phone: "07162-245000", type: "Private" },
      { name: "Parasia Community Hospital", lat: 22.1950, lng: 78.7520, city: "Chhindwara", phone: "07162-250000", type: "Government" },
      
      // Seoni - GREEN ZONE
      { name: "District Hospital Seoni", lat: 22.0850, lng: 79.5500, city: "Seoni", phone: "07692-222000", type: "Government" },
      
      // Balaghat - GREEN ZONE
      { name: "District Hospital Balaghat", lat: 21.8050, lng: 80.1850, city: "Balaghat", phone: "07632-245000", type: "Government" }
    ],
    
    communityCenters: [
      // Bhopal - Community Centers & Cooling Centers
      { name: "Bhopal Municipal Corporation Community Hall", lat: 23.2599, lng: 77.4026, city: "Bhopal", capacity: "500 people", facilities: "Water, Electricity, Toilets, AC" },
      { name: "Nehru Stadium Shelter", lat: 23.2456, lng: 77.4128, city: "Bhopal", capacity: "1000 people", facilities: "Medical Aid, Food, Cooling" },
      { name: "TT Nagar Community Center", lat: 23.2350, lng: 77.4100, city: "Bhopal", capacity: "400 people", facilities: "AC, Water, First Aid" },
      { name: "Arera Hills Cooling Center", lat: 23.2280, lng: 77.4380, city: "Bhopal", capacity: "300 people", facilities: "AC, Water, Rest Area" },
      { name: "New Market Cooling Shelter", lat: 23.2520, lng: 77.4050, city: "Bhopal", capacity: "600 people", facilities: "AC, Water, Medical" },
      
      // Indore - Cooling Centers
      { name: "Indore Municipal Corporation Hall", lat: 22.7196, lng: 75.8477, city: "Indore", capacity: "800 people", facilities: "Water, Medical Aid, AC" },
      { name: "Nehru Stadium Indore", lat: 22.7096, lng: 75.8777, city: "Indore", capacity: "1500 people", facilities: "Full Facilities, Cooling" },
      { name: "Rajwada Cooling Center", lat: 22.7190, lng: 75.8570, city: "Indore", capacity: "500 people", facilities: "AC, Water, Rest" },
      
      // Gwalior - Cooling Centers
      { name: "Gwalior Community Center", lat: 26.2083, lng: 78.1728, city: "Gwalior", capacity: "600 people", facilities: "Water, Electricity, AC" },
      { name: "Lashkar Cooling Shelter", lat: 26.2150, lng: 78.1800, city: "Gwalior", capacity: "400 people", facilities: "AC, Water, Medical" },
      
      // Jabalpur
      { name: "Jabalpur Municipal Hall", lat: 22.9634, lng: 78.6469, city: "Jabalpur", capacity: "700 people", facilities: "Water, Food, Medical, AC" },
      { name: "Napier Town Cooling Center", lat: 23.1700, lng: 79.9300, city: "Jabalpur", capacity: "500 people", facilities: "AC, Water" },
      
      // Sagar - YELLOW ZONE
      { name: "Sagar Community Hall", lat: 24.5754, lng: 77.6964, city: "Sagar", capacity: "400 people", facilities: "Basic Facilities, Cooling" },
      
      // Rewa - YELLOW ZONE
      { name: "Rewa Community Center", lat: 24.5230, lng: 81.2919, city: "Rewa", capacity: "500 people", facilities: "Water, Electricity, AC" },
      
      // Chhindwara - GREEN ZONE
      { name: "Chhindwara Relief Center", lat: 22.0600, lng: 78.9400, city: "Chhindwara", capacity: "350 people", facilities: "Water, Medical, Cooling" }
    ]
  };
  
  // HEATWAVE ZONES FOR BHOPAL CITY - Strategic placement near hospitals/cooling centers
  // Small zones (800-1200m radius) - NO OVERLAPPING
  const demoZones = [
    // RED ZONES (Extreme Heat - near hospitals for emergency access)
    { type: "circle", lat: 23.1850, lng: 77.4380, radius: 900, level: "high", msg: "<strong style='color:#dc2626;font-size:15px;'>AYODHYA NAGAR - EXTREME HEAT</strong><br><br><strong>Temperature:</strong> 44-46°C<br><strong>Risk Level:</strong> CRITICAL<br><strong>Nearest Hospital:</strong> 2km<br><br><strong>Safety Actions:</strong><br>• Stay indoors 11 AM - 4 PM<br>• Emergency: Call 112" },
    { type: "circle", lat: 23.2650, lng: 77.4020, radius: 1000, level: "high", msg: "<strong style='color:#dc2626;font-size:15px;'>HABIBGANJ AREA - EXTREME HEAT</strong><br><br><strong>Temperature:</strong> 43-45°C<br><strong>Risk Level:</strong> CRITICAL<br><strong>Nearest Hospital:</strong> Hamidia Hospital 1.5km<br><br><strong>Safety Actions:</strong><br>• Seek AC shelters<br>• Frequent water breaks" },
    
    // YELLOW ZONES (High Heat - spread across city, near facilities)
    { type: "circle", lat: 23.2420, lng: 77.4050, radius: 900, level: "medium", msg: "<strong style='color:#d97706;font-size:15px;'>MP NAGAR ZONE 1 - HIGH HEAT</strong><br><br><strong>Temperature:</strong> 42-44°C<br><strong>Risk Level:</strong> MODERATE<br><strong>Facilities:</strong> Cooling centers nearby<br><br><strong>Precautions:</strong><br>• Drink 3-4L water daily<br>• Take breaks in shops" },
    { type: "circle", lat: 23.2050, lng: 77.4500, radius: 900, level: "medium", msg: "<strong style='color:#d97706;font-size:15px;'>KOLAR AREA - HIGH HEAT</strong><br><br><strong>Temperature:</strong> 41-43°C<br><strong>Risk Level:</strong> MODERATE<br><strong>Facilities:</strong> Medical facilities 1km<br><br><strong>Precautions:</strong><br>• Stay hydrated<br>• Avoid peak sun hours" },
    { type: "circle", lat: 23.1700, lng: 77.4100, radius: 900, level: "medium", msg: "<strong style='color:#d97706;font-size:15px;'>BAIRAGARH - HIGH HEAT</strong><br><br><strong>Temperature:</strong> 42-44°C<br><strong>Risk Level:</strong> MODERATE<br><strong>Facilities:</strong> Community center nearby<br><br><strong>Precautions:</strong><br>• Regular water intake<br>• Rest in shade" },
    
    // GREEN ZONES (Moderate - near hospitals, cooling centers, lake areas)
    { type: "circle", lat: 23.2520, lng: 77.4050, radius: 800, level: "safe", msg: "<strong style='color:#059669;font-size:15px;'>NEW MARKET - MODERATE HEAT</strong><br><br><strong>Temperature:</strong> 39-41°C<br><strong>Risk Level:</strong> LOW<br><br><strong>Facilities Nearby:</strong><br>• Hamidia Hospital - 500m<br>• Cooling centers - Multiple<br>• Water stations available<br><br><strong>Precautions:</strong><br>• Stay hydrated<br>• Normal activities OK" },
    { type: "circle", lat: 23.2450, lng: 77.3700, radius: 1000, level: "safe", msg: "<strong style='color:#059669;font-size:15px;'>UPPER LAKE AREA - MODERATE HEAT</strong><br><br><strong>Temperature:</strong> 38-40°C<br><strong>Risk Level:</strong> LOW<br><strong>Area:</strong> VIP Road, Boat Club<br><br><strong>Facilities:</strong><br>• Lake breeze cooling<br>• Shaded walkways<br>• Water available<br><br><strong>Precautions:</strong><br>• Regular water intake<br>• Outdoor activities safe" },
    { type: "circle", lat: 23.2180, lng: 77.4250, radius: 850, level: "safe", msg: "<strong style='color:#059669;font-size:15px;'>TT NAGAR - MODERATE HEAT</strong><br><br><strong>Temperature:</strong> 39-41°C<br><strong>Risk Level:</strong> LOW<br><br><strong>Facilities:</strong><br>• TT Nagar Cooling Center - 300m<br>• Medical facilities nearby<br>• Water stations<br><br><strong>Precautions:</strong><br>• Stay hydrated<br>• Normal precautions" },
    
    // PRESTIGE INSTITUTE SPECIFIC MARKER (Small, specific - no overlap)
    { type: "circle", lat: 23.2156, lng: 77.4305, radius: 600, level: "high", msg: "<div style='text-align:center;'><strong style='color:#dc2626;font-size:16px;'>📍 PRESTIGE INSTITUTE</strong></div><hr style='margin:10px 0;border:none;border-top:2px solid #dc2626;'><br><strong>Current Temperature:</strong> 35-40°C<br><strong>Status:</strong> EXTREME HEAT ALERT<br><strong>Location:</strong> Grasim Bypass Road<br><br><strong style='color:#dc2626;'>CAMPUS SAFETY:</strong><br><br>✓ Stay indoors during peak hours<br>✓ Drink water every 30 minutes<br>✓ Medical room - Ground floor<br>✓ Water coolers - All floors<br>✓ AC halls available<br><br><strong style='color:#dc2626;'>Emergency: Call 112</strong></div>" }
  ];


  // helpers
  function zoneColor(level) {
    if (!level) return "#888";
    return level === "high" ? "#dc2626" :      // Brighter red
           level === "medium" ? "#f59e0b" :    // Brighter orange/yellow
           "#10b981";                           // Brighter green
  }
  
  function zoneOpacity(level) {
    return level === "high" ? 0.45 :           // More visible for high risk
           level === "medium" ? 0.40 : 0.35;   // Medium visibility for others
  }

  function fetchWithTimeout(url, opts = {}, timeout = FETCH_TIMEOUT_MS) {
    return Promise.race([
      fetch(url, opts),
      new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), timeout))
    ]);
  }

  async function fetchZonesFromApi() {
    try {
      const res = await fetchWithTimeout(ZONES_API, { credentials: "same-origin" });
      if (!res.ok) throw new Error("zones API returned " + res.status);
      const data = await res.json();
      // Accept both GeoJSON FeatureCollection or array of zones
      if (data && data.type === "FeatureCollection") {
        return data; // return GeoJSON directly
      }
      if (Array.isArray(data)) return data;
      throw new Error("Unexpected zones format");
    } catch (err) {
      console.warn("map.js: failed to fetch zones from API, using demo zones:", err);
      return null;
    }
  }

  // create zone layer (group) and add to map
  function addZoneToMap(map, zone, layerGroup) {
    try {
      if (!zone) return null;

      if (zone.type === "polygon" && zone.geojson) {
        const style = { 
          color: zoneColor(zone.level), 
          fillColor: zoneColor(zone.level), 
          fillOpacity: zoneOpacity(zone.level),
          weight: 2
        };
        const gjLayer = L.geoJSON(zone.geojson, { style }).addTo(layerGroup);
        if (zone.msg) gjLayer.bindPopup(zone.msg, { maxWidth: 300, className: 'custom-popup' });
        return gjLayer;
      }

      // If it's a full GeoJSON feature (Feature or FeatureCollection)
      if (zone.type === "geojson" && zone.geojson) {
        const style = { 
          color: zoneColor(zone.level), 
          fillColor: zoneColor(zone.level), 
          fillOpacity: zoneOpacity(zone.level),
          weight: 2
        };
        const gjLayer = L.geoJSON(zone.geojson, { style }).addTo(layerGroup);
        if (zone.msg) gjLayer.bindPopup(zone.msg, { maxWidth: 300, className: 'custom-popup' });
        return gjLayer;
      }

      // Otherwise assume circle style
      const lat = parseFloat(zone.lat);
      const lng = parseFloat(zone.lng);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        const radius = Number(zone.radius) || 900;
        const color = zoneColor(zone.level);
        const circle = L.circle([lat, lng], { 
          color, 
          fillColor: color, 
          fillOpacity: zoneOpacity(zone.level),
          weight: 2,
          radius 
        }).addTo(layerGroup);
        if (zone.msg) circle.bindPopup(zone.msg, { maxWidth: 300, className: 'custom-popup' });
        return circle;
      }

      console.warn("map.js: unknown zone format", zone);
      return null;
    } catch (e) {
      console.warn("map.js addZoneToMap error", e);
      return null;
    }
  }

  // legend control
  function addLegend(map) {
    const legend = L.control({ position: "bottomright" });
    legend.onAdd = function () {
      const div = L.DomUtil.create("div", "map-legend");
      div.style.background = "rgba(255, 255, 255, 0.95)";
      div.style.backdropFilter = "blur(10px)";
      div.style.padding = "12px 14px";
      div.style.borderRadius = "10px";
      div.style.boxShadow = "0 8px 24px rgba(0,0,0,0.15)";
      div.style.border = "2px solid rgba(0,0,0,0.1)";
      div.innerHTML = `
        <strong style="font-size:14px;color:#1f2937;">🌡️ Heatwave Alert Levels</strong><br/>
        <div style="margin-top:10px;display:flex;align-items:center;gap:8px;">
          <span style="display:inline-block;width:16px;height:16px;background:${zoneColor('high')};border-radius:50%;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.2);"></span>
          <span style="font-size:13px;font-weight:600;color:#dc2626;">Extreme (45°C+)</span>
        </div>
        <div style="margin-top:8px;display:flex;align-items:center;gap:8px;">
          <span style="display:inline-block;width:16px;height:16px;background:${zoneColor('medium')};border-radius:50%;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.2);"></span>
          <span style="font-size:13px;font-weight:600;color:#d97706;">High (42-45°C)</span>
        </div>
        <div style="margin-top:8px;display:flex;align-items:center;gap:8px;">
          <span style="display:inline-block;width:16px;height:16px;background:${zoneColor('safe')};border-radius:50%;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.2);"></span>
          <span style="font-size:13px;font-weight:600;color:#059669;">Moderate (38-42°C)</span>
        </div>
      `;
      return div;
    };
    legend.addTo(map);
  }

  // small locate control
  function addLocateControl(map) {
    const LocateControl = L.Control.extend({
      options: { position: "topleft" },
      onAdd: function () {
        const container = L.DomUtil.create("div", "leaflet-bar leaflet-control");
        container.style.background = "white";
        container.style.cursor = "pointer";
        container.style.width = "34px";
        container.style.height = "34px";
        container.style.display = "flex";
        container.style.justifyContent = "center";
        container.style.alignItems = "center";
        container.title = "Locate me";
        container.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M17.7 6.3l1.4-1.4M4.9 19.1l1.4-1.4"/></svg>';
        L.DomEvent.on(container, "click", function (e) {
          e.stopPropagation();
          map.locate({ setView: true, maxZoom: 14 });
        });
        return container;
      }
    });
    map.addControl(new LocateControl());
  }

  // Add hospitals and community centers to map
  function addEmergencyLocations(map, layerGroup) {
    // Custom icons
    const hospitalIcon = L.divIcon({
      html: '<div style="background:#ef4444;color:white;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);">🏥</div>',
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const communityIcon = L.divIcon({
      html: '<div style="background:#3b82f6;color:white;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);">🏛️</div>',
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    // Add hospitals
    emergencyLocations.hospitals.forEach(hospital => {
      const marker = L.marker([hospital.lat, hospital.lng], { icon: hospitalIcon }).addTo(layerGroup);
      marker.bindPopup(`
        <div style="min-width:200px">
          <h3 style="margin:0 0 8px;font-size:14px;font-weight:700;color:#ef4444;">🏥 ${hospital.name}</h3>
          <p style="margin:4px 0;font-size:12px;"><strong>City:</strong> ${hospital.city}</p>
          <p style="margin:4px 0;font-size:12px;"><strong>Type:</strong> ${hospital.type}</p>
          <p style="margin:4px 0;font-size:12px;"><strong>Phone:</strong> <a href="tel:${hospital.phone}" style="color:#3b82f6;">${hospital.phone}</a></p>
          <p style="margin:8px 0 4px;padding:6px;background:#fef3c7;border-radius:4px;font-size:11px;"><strong>🌡️ Heat Emergency Services Available</strong><br>Treatment for heat exhaustion, dehydration, heatstroke</p>
          <button onclick="getDirections(${hospital.lat}, ${hospital.lng})" style="margin-top:8px;padding:6px 12px;background:#3b82f6;color:white;border:none;border-radius:6px;cursor:pointer;font-size:12px;width:100%;">Get Directions</button>
        </div>
      `);
    });

    // Add community centers
    emergencyLocations.communityCenters.forEach(center => {
      const marker = L.marker([center.lat, center.lng], { icon: communityIcon }).addTo(layerGroup);
      marker.bindPopup(`
        <div style="min-width:200px">
          <h3 style="margin:0 0 8px;font-size:14px;font-weight:700;color:#3b82f6;">❄️ ${center.name}</h3>
          <p style="margin:4px 0;padding:4px;background:#dbeafe;border-radius:4px;font-size:11px;font-weight:600;color:#1e40af;">COOLING CENTER - Heat Relief Available</p>
          <p style="margin:4px 0;font-size:12px;"><strong>City:</strong> ${center.city}</p>
          <p style="margin:4px 0;font-size:12px;"><strong>Capacity:</strong> ${center.capacity}</p>
          <p style="margin:4px 0;font-size:12px;"><strong>Facilities:</strong> ${center.facilities}</p>
          <p style="margin:6px 0 4px;font-size:11px;color:#059669;"><strong>✓ Free entry during heatwave</strong><br>✓ Cold water & ORS available<br>✓ Rest area with cooling</p>
          <button onclick="getDirections(${center.lat}, ${center.lng})" style="margin-top:8px;padding:6px 12px;background:#3b82f6;color:white;border:none;border-radius:6px;cursor:pointer;font-size:12px;width:100%;">Get Directions</button>
        </div>
      `);
    });
  }

  // Get directions using Google Maps
  window.getDirections = function(destLat, destLng) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          const url = `https://www.google.com/maps/dir/${userLat},${userLng}/${destLat},${destLng}`;
          window.open(url, '_blank');
        },
        (error) => {
          // If location access denied, just open destination
          const url = `https://www.google.com/maps/search/?api=1&query=${destLat},${destLng}`;
          window.open(url, '_blank');
        }
      );
    } else {
      // Fallback if geolocation not supported
      const url = `https://www.google.com/maps/search/?api=1&query=${destLat},${destLng}`;
      window.open(url, '_blank');
    }
  };

  // Find nearest locations based on user location
  function findNearestLocations(userLat, userLng, locations, count = 3) {
    const calculateDistance = (lat1, lng1, lat2, lng2) => {
      const R = 6371; // Earth's radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLng = (lng2 - lng1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    return locations
      .map(loc => ({
        ...loc,
        distance: calculateDistance(userLat, userLng, loc.lat, loc.lng)
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, count);
  }

  // Show user location and nearest facilities
  function showUserLocation(map, layerGroup) {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        // Add user location marker
        const userIcon = L.divIcon({
          html: '<div style="background:#10b981;color:white;width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;border:4px solid white;box-shadow:0 4px 12px rgba(0,0,0,0.4);animation:pulse 2s infinite;">📍</div><style>@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}</style>',
          className: '',
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        });

        const userMarker = L.marker([userLat, userLng], { icon: userIcon }).addTo(layerGroup);
        
        // Find nearest hospitals and community centers
        const nearestHospitals = findNearestLocations(userLat, userLng, emergencyLocations.hospitals, 3);
        const nearestCenters = findNearestLocations(userLat, userLng, emergencyLocations.communityCenters, 2);

        let popupContent = `
          <div style="min-width:250px">
            <h3 style="margin:0 0 8px;font-size:15px;font-weight:700;color:#10b981;">📍 Your Location</h3>
            <p style="margin:8px 0 4px;font-size:13px;font-weight:700;">Nearest Hospitals:</p>
        `;

        nearestHospitals.forEach((h, i) => {
          popupContent += `<p style="margin:2px 0;font-size:11px;">
            ${i+1}. ${h.name} - ${h.distance.toFixed(1)} km
            <a href="#" onclick="getDirections(${h.lat}, ${h.lng}); return false;" style="color:#3b82f6;margin-left:4px;">→</a>
          </p>`;
        });

        popupContent += `<p style="margin:8px 0 4px;font-size:13px;font-weight:700;">Nearest Shelters:</p>`;

        nearestCenters.forEach((c, i) => {
          popupContent += `<p style="margin:2px 0;font-size:11px;">
            ${i+1}. ${c.name} - ${c.distance.toFixed(1)} km
            <a href="#" onclick="getDirections(${c.lat}, ${c.lng}); return false;" style="color:#3b82f6;margin-left:4px;">→</a>
          </p>`;
        });

        popupContent += `</div>`;

        userMarker.bindPopup(popupContent).openPopup();
        map.setView([userLat, userLng], 12);
      },
      (error) => {
        alert('Unable to get your location. Please enable location services.');
        console.error('Geolocation error:', error);
      }
    );
  }

  // initialize map instance
  function initMap(el) {
    if (!el) return null;
    // set size if not provided
    if (!el.style.height) el.style.height = "360px";

    const map = L.map(el, { zoomControl: true }).setView(DEFAULT_CENTER, DEFAULT_ZOOM);
    // Using CartoDB tile server (more permissive, no referer required)
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: '© OpenStreetMap contributors © CARTO',
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);
    addLegend(map);
    addLocateControl(map);
    return map;
  }

  // main bootstrap
  document.addEventListener("DOMContentLoaded", async () => {
    // require Leaflet
    if (typeof L === "undefined") {
      console.error("map.js: Leaflet (L) is not loaded. Include Leaflet before map.js");
      return;
    }

    const el = document.getElementById("mini-map");
    if (!el) {
      // not every page must have a map; expose helper anyway
      window.safeSphereMap = window.safeSphereMap || { mapInstance: null, addZone: () => {} };
      console.log("map.js: #mini-map not present on this page — skipping init.");
      return;
    }

    // initialize only once
    if (window.safeSphereMap && window.safeSphereMap.mapInstance) {
      console.log("map.js: map already present on page.");
      return;
    }

    const map = initMap(el);
    const zonesLayer = L.layerGroup().addTo(map);

    // Add emergency locations (hospitals & community centers)
    addEmergencyLocations(map, zonesLayer);

    // try API zones, otherwise demo
    const apiZones = await fetchZonesFromApi();
    if (apiZones) {
      if (apiZones.type === "FeatureCollection") {
        // add GeoJSON features
        L.geoJSON(apiZones, {
          style: (feat) => ({ color: "#e53e3e", fillOpacity: 0.3 })
        }).addTo(zonesLayer);
      } else {
        apiZones.forEach(z => addZoneToMap(map, z, zonesLayer));
      }
    } else {
      demoZones.forEach(z => addZoneToMap(map, z, zonesLayer));
    }

    // Update locate button to show nearest facilities
    map.on('locationfound', function(e) {
      showUserLocation(map, zonesLayer);
    });

    // weather marker support
    let weatherMarker = null;
    function showWeatherMarker(lat, lon) {
      try {
        if (weatherMarker) zonesLayer.removeLayer(weatherMarker);
        weatherMarker = L.marker([lat, lon], { title: "Weather location" }).addTo(zonesLayer);
        weatherMarker.bindPopup("Latest weather location").openPopup();
      } catch (e) { console.warn("map.js showWeatherMarker", e); }
    }

    // if weather already provided
    if (window.latestWeatherCoords && window.latestWeatherCoords.lat) {
      const { lat, lon } = window.latestWeatherCoords;
      map.setView([lat, lon], 12);
      showWeatherMarker(lat, lon);
    }

    // listen to weather updates
    document.addEventListener("weather:updated", (ev) => {
      const d = ev?.detail;
      if (d && d.lat && d.lon) {
        map.setView([d.lat, d.lon], 12, { animate: true });
        showWeatherMarker(d.lat, d.lon);
      }
    });

    // expose helpers
    window.safeSphereMap = {
      mapInstance: map,
      zonesLayer,
      addZone: (z) => addZoneToMap(map, z, zonesLayer),
      clearZones: () => zonesLayer.clearLayers()
    };

    console.log("map.js: initialized successfully", map);
  });
})();
