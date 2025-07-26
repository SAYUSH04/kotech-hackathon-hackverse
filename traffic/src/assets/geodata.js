import axios from 'axios';

export const getCoordinatesFromPlace = async (place) => {
  const apiKey = 'w2XxLALNZjSqMPhRzjNBlXB0NsG92vrf';

  try {
    const response = await axios.get(
      `https://api.tomtom.com/search/2/search/${encodeURIComponent(place)}.json`,
      {
        params: {
          key: apiKey,             // ✅ Pass only here
          limit: 1,
          countrySet: 'IN',        // ✅ Focus on India
          lat: 10.998207,          // ✅ Bias to Kottakkal
          lon: 75.989931,
          radius: 10000            // 10 km range
        }
      }
    );
    console.log(response)
    if (response.data.results.length > 0) {
      const position = response.data.results[0].position;
      console.log(position)
      return [position.lon, position.lat];  // format: [lng, lat]
    } else {
      return null;
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};
