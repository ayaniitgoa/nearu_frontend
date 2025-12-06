import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useCityStore = create(
  persist(
    (set) => ({
      selectedCity: null,
      cityData: null, // Store full city data (name, country, state)
      setCity: (city) => {
        // If city is a JSON string, parse it; otherwise use as string
        let cityData = null;
        let cityName = city;
        
        try {
          cityData = JSON.parse(city);
          cityName = cityData.name;
        } catch (e) {
          // If not JSON, treat as plain string
          cityName = city;
        }
        
        set({ 
          selectedCity: cityName,
          cityData: cityData || { name: cityName }
        });
      },
      clearCity: () => set({ selectedCity: null, cityData: null }),
    }),
    {
      name: 'skillbridge-city-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

