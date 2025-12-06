// City list for suggestions
export const CITIES = [
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Pune',
  'Ahmedabad',
  'Jaipur',
  'Surat',
  'Lucknow',
  'Kanpur',
  'Nagpur',
  'Indore',
  'Thane',
  'Bhopal',
  'Visakhapatnam',
  'Patna',
  'Vadodara',
  'Ghaziabad',
];

// Categories with subcategories
export const CATEGORIES = {
  'Tuition': ['Maths', 'Science', 'English', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Social Studies', 'History', 'Geography'],
  'Dance': ['Classical', 'Hip Hop', 'Bollywood', 'Contemporary', 'Bharatanatyam', 'Kathak', 'Salsa', 'Bachata', 'Ballroom'],
  'Singing': ['Classical', 'Western', 'Bollywood', 'Carnatic', 'Hindustani', 'Pop', 'Rock', 'Jazz'],
  'Sports': ['Cricket', 'Football', 'Basketball', 'Tennis', 'Badminton', 'Swimming', 'Volleyball', 'Table Tennis', 'Athletics', 'Martial Arts', 'Yoga', 'Gymnastics'],
  'Hobby': ['Photography', 'Painting', 'Drawing', 'Crafts', 'Pottery', 'Gardening', 'Chess', 'Reading'],
  'Music': ['Guitar', 'Piano', 'Violin', 'Drums', 'Flute', 'Tabla', 'Keyboard', 'Sitar'],
  'Art': ['Drawing', 'Painting', 'Sketching', 'Digital Art', 'Sculpture', 'Calligraphy'],
  'Yoga': ['Hatha Yoga', 'Vinyasa', 'Ashtanga', 'Power Yoga', 'Meditation', 'Pranayama'],
  'Fitness': ['Gym Training', 'Cardio', 'Strength Training', 'Zumba', 'Aerobics', 'CrossFit', 'Pilates'],
  'Cooking': ['Baking', 'Indian Cuisine', 'Continental', 'Italian', 'Chinese', 'Desserts', 'Vegan Cooking'],
  'Language': ['English', 'Hindi', 'French', 'Spanish', 'German', 'Japanese', 'Mandarin', 'Sanskrit'],
  'Other': ['General', 'Mixed'],
};

// Get all main categories
export const MAIN_CATEGORIES = Object.keys(CATEGORIES);

// Get subcategories for a category
export function getSubcategories(category) {
  return CATEGORIES[category] || [];
}

// Check if a string is a main category
export function isMainCategory(category) {
  return MAIN_CATEGORIES.includes(category);
}

// Check if a string is a subcategory
export function isSubcategory(subcategory) {
  return Object.values(CATEGORIES).flat().includes(subcategory);
}

// Get main category for a subcategory
export function getMainCategoryForSubcategory(subcategory) {
  for (const [mainCategory, subcategories] of Object.entries(CATEGORIES)) {
    if (subcategories.includes(subcategory)) {
      return mainCategory;
    }
  }
  return null;
}

// Mock distance function
export function getMockDistance() {
  const distances = ['0.5 km', '1.2 km', '2.5 km', '3.8 km', '5.1 km', '7.3 km'];
  return distances[Math.floor(Math.random() * distances.length)];
}
