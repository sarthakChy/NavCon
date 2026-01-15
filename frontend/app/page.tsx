"use client";

import { useState } from "react";
import MapplsMap from "@/components/mappls-map";
import MapPlugins from "@/components/map-plugins";
import NavigationControl from "@/components/navigation-control";

export default function Home() {
  const [map, setMap] = useState<any>(null);

  const handleMapLoad = (mapInstance: any) => {
    setMap(mapInstance);
    console.log("Map instance loaded and ready for plugins");
  };

  return (
    <main className="w-full h-screen relative">
      <MapplsMap className="w-full h-full" onMapLoad={handleMapLoad} />

      {/* Map Plugin Controls */}
      {map && (
        <>
          <MapPlugins
            map={map}
            onNearbyResults={(results) => {
              console.log("Nearby results received:", results);
            }}
          />
          <NavigationControl map={map} />
        </>
      )}
    </main>
  );
}
