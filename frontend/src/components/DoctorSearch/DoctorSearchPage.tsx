import React, { useState, useEffect } from 'react';
import { MapComponent, LocationSearch, useGoogleMaps } from '../GoogleMaps';
import { DoctorCard } from './DoctorCard';
import { SearchFilters } from './SearchFilters';

interface Location {
  latitude: number;
  longitude: number;
}

interface LocationResult {
  address: string;
  location: Location;
  placeId: string;
}

interface Doctor {
  id: string;
  name: string;
  profilePicture?: string;
  specializations: string[];
  yearsOfExperience: number;
  rating: number;
  totalReviews: number;
  consultationFee: number;
  clinicName: string;
  clinicAddress: string;
  isAcceptingPatients: boolean;
  distance?: number;
}

interface SearchCriteria {
  name?: string;
  specialization?: string;
  location?: string;
  minRating?: number;
  maxConsultationFee?: number;
  isAcceptingPatients?: boolean;
  latitude?: number;
  longitude?: number;
  radius?: number;
}

interface SearchFiltersType {
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'rating' | 'experience' | 'fee';
  sortOrder?: 'asc' | 'desc';
}

export const DoctorSearchPage: React.FC = () => {
  const { isLoaded } = useGoogleMaps();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<Location | null>(null);

  // Auto-dismiss error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);
  const [mapCenter, setMapCenter] = useState<Location>({ latitude: 40.7128, longitude: -74.0060 }); // Default to NYC
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({});
  const [searchFilters, setSearchFilters] = useState<SearchFiltersType>({
    page: 1,
    limit: 10,
    sortBy: 'rating',
    sortOrder: 'desc'
  });
  const [showMap, setShowMap] = useState(true);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setUserLocation(location);
          setMapCenter(location);
          setSearchCriteria(prev => ({ ...prev, ...location }));
        },
        (error) => {
          console.warn('Error getting user location:', error);
        }
      );
    }
  }, []);

  // Search doctors
  const searchDoctors = async () => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(searchCriteria).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      Object.entries(searchFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/users/doctors/search?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to search doctors');
      }

      const data = await response.json();
      setDoctors(data.data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Initial search
  useEffect(() => {
    searchDoctors();
  }, [searchFilters]);

  // Handle location selection
  const handleLocationSelect = (result: LocationResult) => {
    setMapCenter(result.location);
    setSearchCriteria(prev => ({
      ...prev,
      location: result.address,
      latitude: result.location.latitude,
      longitude: result.location.longitude
    }));
  };

  // Handle search form submission
  const handleSearch = (criteria: SearchCriteria) => {
    setSearchCriteria(criteria);
    setSearchFilters(prev => ({ ...prev, page: 1 }));
    searchDoctors();
  };

  // Handle filter changes
  const handleFilterChange = (filters: SearchFiltersType) => {
    setSearchFilters(filters);
  };

  // Convert doctors to map markers
  const mapMarkers = doctors.map(doctor => ({
    id: doctor.id,
    position: mapCenter, // In a real app, you'd geocode the clinic address
    title: doctor.name,
    info: `${doctor.clinicName} - ${doctor.specializations.join(', ')}`,
    type: 'doctor' as const
  }));

  // Handle marker click
  const handleMarkerClick = (marker: any) => {
    const doctor = doctors.find(d => d.id === marker.id);
    if (doctor) {
      // Scroll to doctor card or show details
      const element = document.getElementById(`doctor-${doctor.id}`);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Find Doctors Near You</h1>
          
          {/* Location Search */}
          <div className="mb-6">
            <LocationSearch
              onLocationSelect={handleLocationSelect}
              placeholder="Search for a location..."
              className="max-w-md"
            />
          </div>

          {/* Search Filters */}
          <SearchFilters
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
            loading={loading}
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Map Section */}
          {showMap && isLoaded && (
            <div className="lg:w-1/2">
              <div className="sticky top-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Map View</h2>
                  <button
                    onClick={() => setShowMap(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <MapComponent
                  center={mapCenter}
                  zoom={13}
                  markers={mapMarkers}
                  onMarkerClick={handleMarkerClick}
                  height="500px"
                  className="rounded-lg shadow-md"
                />
              </div>
            </div>
          )}

          {/* Results Section */}
          <div className={showMap ? 'lg:w-1/2' : 'w-full'}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {doctors.length} Doctor{doctors.length !== 1 ? 's' : ''} Found
              </h2>
              {!showMap && isLoaded && (
                <button
                  onClick={() => setShowMap(true)}
                  className="flex items-center text-blue-600 hover:text-blue-800"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  Show Map
                </button>
              )}
            </div>

            {loading && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {!loading && !error && doctors.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No doctors found matching your criteria.</p>
              </div>
            )}

            {!loading && doctors.length > 0 && (
              <div className="space-y-4">
                {doctors.map(doctor => (
                  <DoctorCard
                    key={doctor.id}
                    doctor={doctor}
                    showDistance={!!userLocation}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};