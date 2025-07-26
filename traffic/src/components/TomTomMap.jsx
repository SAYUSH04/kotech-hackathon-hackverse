import React, { useEffect } from 'react';

const TomTomMap = () => {
  useEffect(() => {
    const tt = window.tt;

    const map = tt.map({
      key: "w2XxLALNZjSqMPhRzjNBlXB0NsG92vrf", // 🔑
      container: "map",
      center: [75.989931, 10.998207],
      zoom: 16
    });

    // // Simulated congestion marker
    // const marker = new tt.Marker({ color: 'red' })
    //   .setLngLat([75.989931, 10.998207])
    //   .addTo(map);

    return () => map.remove();
  }, []);

  return (
    <div>
      <h3>TomTom Map with Simulated Congestion</h3>
      <div id="map" style={{ height: '500px', width: '100%' }}></div>
    </div>
  );
};

export default TomTomMap;
