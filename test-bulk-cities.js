const axios = require('axios');

const citiesData = [
  {
    "code": "AN",
    "name": "Andaman and Nicobar Islands",
    "cities": [
      "Port Blair",
      "Diglipur",
      "Mayabunder"
    ]
  },
  {
    "code": "AP",
    "name": "Andhra Pradesh",
    "cities": [
      "Visakhapatnam",
      "Vijayawada",
      "Guntur",
      "Nellore",
      "Kurnool"
    ]
  },
  {
    "code": "DL",
    "name": "Delhi",
    "cities": [
      "New Delhi",
      "Central Delhi",
      "North Delhi",
      "South Delhi",
      "East Delhi",
      "West Delhi"
    ]
  },
  {
    "code": "MH",
    "name": "Maharashtra",
    "cities": [
      "Mumbai",
      "Pune",
      "Nagpur",
      "Nashik",
      "Aurangabad",
      "Solapur"
    ]
  },
  {
    "code": "KA",
    "name": "Karnataka",
    "cities": [
      "Bangalore",
      "Mysore",
      "Hubli",
      "Mangalore",
      "Belgaum"
    ]
  }
];

async function testBulkCities() {
  try {
    console.log('Testing bulk city creation...');
    
    const response = await axios.post('http://localhost:3000/cities/bulk', {
      states: citiesData
    });
    
    console.log('Cities created successfully!');
    console.log(`Total cities created: ${response.data.length}`);
    console.log('\nCreated cities:');
    
    response.data.forEach((city, index) => {
      console.log(`${index + 1}. ${city.name} - ${city.state.name} (${city.state.code})`);
    });
    
  } catch (error) {
    console.error('Error creating cities:', error.response?.data || error.message);
  }
}

// Run the test
testBulkCities();
