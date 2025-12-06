// Using country-state-city library (npm install country-state-city)
// This library provides comprehensive country, state, and city data without hardcoding

import { Country, State, City } from 'country-state-city';

export const geoApi = {
  // Get all countries (synchronous - library method is sync)
  getCountries() {
    try {
      const countries = Country.getAllCountries();
      return countries.map(country => ({
        name: country.name,
        code: country.isoCode,
      })).sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Error fetching countries:', error);
      return [];
    }
  },

  // Get states for a country (synchronous)
  getStates(countryCode) {
    try {
      if (!countryCode) return [];
      
      const states = State.getStatesOfCountry(countryCode);
      return states.map(state => state.name).sort();
    } catch (error) {
      console.error('Error fetching states:', error);
      return [];
    }
  },

  // Get cities for a state/country (synchronous)
  getCities(countryCode, stateName = null) {
    try {
      if (!countryCode) return [];
      
      let cities = [];
      
      if (stateName) {
        // Get state code from state name
        const states = State.getStatesOfCountry(countryCode);
        const state = states.find(s => s.name === stateName);
        
        if (state) {
          cities = City.getCitiesOfState(countryCode, state.isoCode);
        }
      } else {
        // Get all cities for the country
        const states = State.getStatesOfCountry(countryCode);
        
        // Get cities from all states
        for (const state of states) {
          const stateCities = City.getCitiesOfState(countryCode, state.isoCode);
          cities = [...cities, ...stateCities];
        }
        
        // Remove duplicates and sort
        const uniqueCities = cities
          .map(city => city.name)
          .filter((name, index, self) => self.indexOf(name) === index)
          .sort();
        
        return uniqueCities;
      }
      
      return cities.map(city => city.name).sort();
    } catch (error) {
      console.error('Error fetching cities:', error);
      return [];
    }
  },

  // Search cities (for autocomplete)
  searchCities(query, countryCode = 'IN', stateName = null) {
    const allCities = this.getCities(countryCode, stateName);
    if (!query) return allCities.slice(0, 10);
    
    return allCities
      .filter(city => 
        city.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 10);
  },
};
