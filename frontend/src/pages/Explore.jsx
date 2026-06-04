import React, { useEffect, useState } from 'react';
import { apiRequest, getUploadUrl } from '../api';

export default function Explore() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search Filters
  const [query, setQuery] = useState('');
  const [district, setDistrict] = useState('');
  const [interest, setInterest] = useState('');
  const [budget, setBudget] = useState('');

  // Selected Destination & Weather Modal
  const [selectedDest, setSelectedDest] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  // Interest Categories
  const interests = [
    'Beaches', 'Mountains', 'Camping', 'Wildlife', 
    'Historical places', 'Adventure', 'Nature', 'Cultural destinations'
  ];

  // Sri Lankan Districts list
  const districts = [
    'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya', 
    'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar', 
    'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee', 
    'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla', 
    'Moneragala', 'Ratnapura', 'Kegalle'
  ];

  useEffect(() => {
    fetchDestinations();
  }, [query, district, interest, budget]);

  const fetchDestinations = async () => {
    try {
      const res = await apiRequest('destinations', 'list', 'GET', {
        query,
        district,
        interest_category: interest,
        budget_category: budget
      });
      setDestinations(res.destinations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDestinationClick = async (dest) => {
    setSelectedDest(dest);
    setWeatherData(null);
    setWeatherLoading(true);

    try {
      // Call public Open-Meteo weather API using destination coordinates
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${dest.latitude}&longitude=${dest.longitude}&current=temperature_2m,relative_humidity_2m,rain&daily=temperature_2m_max,temperature_2m_min,rain_sum&timezone=auto`
      );
      const data = await response.json();
      setWeatherData(data);
    } catch (err) {
      console.error("Failed to fetch weather data", err);
    } finally {
      setWeatherLoading(false);
    }
  };

  const getWeatherRecommendation = (currentRain, dailyData) => {
    if (!dailyData) return '';
    const totalRainWeek = dailyData.rain_sum.reduce((a, b) => a + b, 0);
    
    if (totalRainWeek === 0) {
      return "☀️ Excellent time to visit! Dry and clear skies predicted for the next 7 days.";
    } else if (totalRainWeek < 15) {
      return "🌤️ Great travel conditions. Occasional light showers possible, but mostly pleasant.";
    } else if (totalRainWeek < 50) {
      return "🌦️ Moderate rain expected. Good for indoor tours, nature trails, or waterfalls, but pack an umbrella!";
    } else {
      return "⚠️ Heavy monsoonal rain predicted. Hiking and beach activities are not recommended during this week.";
    }
  };

  return (
    <div className="container py-5 animate-fade-in">
      <div className="text-center mb-5">
        <h1 className="fw-bold text-gradient display-4">Explore Sri Lanka</h1>
        <p className="text-muted lead">Search destinations by interest, district, and check real-time weather conditions instantly.</p>
      </div>

      {/* FILTER PANEL */}
      <div className="card glass-card p-4 border-0 mb-5">
        <div className="row g-3">
          <div className="col-md-3">
            <label className="form-label small fw-bold">Search Keywords</label>
            <input 
              type="text" 
              className="form-control rounded-3 border-light-subtle shadow-sm py-2" 
              placeholder="e.g. Ella, Mirissa..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <label className="form-label small fw-bold">Select District</label>
            <select className="form-select rounded-3 border-light-subtle shadow-sm py-2" value={district} onChange={(e) => setDistrict(e.target.value)}>
              <option value="">All Districts</option>
              {districts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label small fw-bold">Interest Category</label>
            <select className="form-select rounded-3 border-light-subtle shadow-sm py-2" value={interest} onChange={(e) => setInterest(e.target.value)}>
              <option value="">All Interests</option>
              {interests.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label small fw-bold">Budget Category</label>
            <select className="form-select rounded-3 border-light-subtle shadow-sm py-2" value={budget} onChange={(e) => setBudget(e.target.value)}>
              <option value="">Any Budget</option>
              <option value="budget">Budget-Friendly</option>
              <option value="mid-range">Mid-Range</option>
              <option value="luxury">Premium / Luxury</option>
            </select>
          </div>
        </div>
      </div>

      {/* DESTINATION LISTINGS */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-emerald" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : destinations.length > 0 ? (
        <div className="row g-4">
          {destinations.map((dest) => (
            <div className="col-md-6 col-lg-4" key={dest.id}>
              <div 
                className="card glass-card h-100 border-0 overflow-hidden cursor-pointer"
                onClick={() => handleDestinationClick(dest)}
                style={{ cursor: 'pointer' }}
                data-bs-toggle="modal"
                data-bs-target="#destinationModal"
              >
                <div style={{ height: '220px', overflow: 'hidden', position: 'relative' }}>
                  <img 
                    src={dest.image.startsWith('http') ? dest.image : `https://images.unsplash.com/photo-1588598130836-8e562c161ab8?auto=format&fit=crop&w=600&q=80`} 
                    alt={dest.name} 
                    className="w-100 h-100 object-fit-cover transition"
                    style={{ objectFit: 'cover', transition: 'transform 0.5s ease' }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  />
                  <span className="badge bg-success bg-opacity-95 position-absolute top-0 end-0 m-3 px-3 py-2 rounded-pill shadow-sm">
                    {dest.interest_category}
                  </span>
                </div>
                <div className="card-body p-4 d-flex flex-column justify-content-between">
                  <div>
                    <span className="text-emerald small fw-bold text-uppercase"><i className="bi bi-geo-alt-fill"></i> {dest.district} District</span>
                    <h4 className="fw-bold mt-1 text-gradient">{dest.name}</h4>
                    <p className="text-muted small line-clamp-3 mb-0">{dest.description.substring(0, 120)}...</p>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                    <span className="badge bg-secondary bg-opacity-10 text-dark text-capitalize px-3 py-2">{dest.budget_category}</span>
                    <button className="btn btn-outline-gradient btn-sm rounded-pill px-3">View Details & Weather</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-5 card glass-card border-0">
          <i className="bi bi-compass fs-1 text-muted"></i>
          <h4 className="fw-bold mt-3">No Destinations Found</h4>
          <p className="text-muted">Try adjusting your filters or search keywords.</p>
        </div>
      )}

      {/* DETAIL & WEATHER MODAL */}
      <div className="modal fade" id="destinationModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content rounded-4 border-0">
            {selectedDest && (
              <>
                <div className="modal-header border-0 pb-0">
                  <h3 className="modal-title fw-bold text-gradient">{selectedDest.name}</h3>
                  <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body p-4">
                  <div className="row g-4">
                    <div className="col-md-6">
                      <img 
                        src={selectedDest.image.startsWith('http') ? selectedDest.image : `https://images.unsplash.com/photo-1588598130836-8e562c161ab8?auto=format&fit=crop&w=800&q=80`} 
                        alt={selectedDest.name} 
                        className="w-100 rounded-4 object-fit-cover shadow-sm border"
                        style={{ maxHeight: '250px', objectFit: 'cover' }}
                      />
                      <div className="mt-3">
                        <span className="badge bg-primary bg-opacity-10 text-primary me-2 text-capitalize px-3 py-2">{selectedDest.budget_category}</span>
                        <span className="badge bg-success bg-opacity-10 text-success px-3 py-2">{selectedDest.interest_category}</span>
                      </div>
                      <h5 className="fw-bold mt-4 text-gradient"><i className="bi bi-activity"></i> Key Activities</h5>
                      <p className="text-muted small">{selectedDest.activities}</p>
                      <h5 className="fw-bold mt-3 text-gradient"><i className="bi bi-card-text"></i> About</h5>
                      <p className="text-muted small">{selectedDest.description}</p>
                    </div>

                    <div className="col-md-6">
                      <div className="card border-0 bg-light p-4 rounded-4 h-100 shadow-sm border border-emerald border-opacity-10">
                        <h4 className="fw-bold mb-3 text-gradient"><i className="bi bi-cloud-sun text-emerald"></i> Climate & Weather Forecast</h4>
                        
                        {weatherLoading && (
                          <div className="text-center py-4">
                            <div className="spinner-border text-teal" role="status">
                              <span className="visually-hidden">Loading Weather...</span>
                            </div>
                            <p className="small text-muted mt-2">Connecting to Weather API...</p>
                          </div>
                        )}

                        {weatherData && !weatherLoading && (
                          <div>
                            <div className="weather-widget mb-3 text-center">
                              <span className="badge bg-white bg-opacity-20 rounded-pill px-3 py-1 mb-2 text-uppercase small" style={{ letterSpacing: '1px' }}>Current Weather</span>
                              <h2 className="display-3 fw-bold mb-0 text-white">{weatherData.current.temperature_2m}°C</h2>
                              <div className="d-flex justify-content-center gap-3 mt-2 text-white-50 small">
                                <span><i className="bi bi-droplet-half"></i> Humidity: {weatherData.current.relative_humidity_2m}%</span>
                                <span>•</span>
                                <span>{weatherData.current.rain > 0 ? "🌧️ Raining" : "☀️ Clear skies"}</span>
                              </div>
                            </div>

                            <div className="card bg-success bg-opacity-10 text-success border-0 p-3 rounded-3 mb-3 small">
                              <p className="mb-0 fw-bold text-center">{getWeatherRecommendation(weatherData.current.rain, weatherData.daily)}</p>
                            </div>

                            <h6 className="fw-bold mb-3 mt-4 text-secondary text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>7-Day Prediction</h6>
                            <div className="row g-2">
                              {weatherData.daily.time.slice(0, 7).map((day, idx) => {
                                const date = new Date(day);
                                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                                return (
                                  <div className="col-3 text-center" key={day}>
                                    <div className="forecast-item bg-white border border-light shadow-sm rounded-3 p-2">
                                      <span className="d-block fw-bold text-muted mb-1" style={{ fontSize: '10px' }}>{dayName}</span>
                                      <span className="d-block fw-bold text-dark fs-6">{Math.round(weatherData.daily.temperature_2m_max[idx])}°</span>
                                      <span className="text-muted d-block" style={{ fontSize: '10px' }}>{Math.round(weatherData.daily.temperature_2m_min[idx])}°</span>
                                      <span className="d-block text-emerald mt-1 fw-bold" style={{ fontSize: '10px' }}>
                                        {weatherData.daily.rain_sum[idx] > 0 ? `🌧️ ${weatherData.daily.rain_sum[idx]}mm` : "☀️"}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
