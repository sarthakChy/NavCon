"use client";

import { useState, useRef, useEffect } from "react";

interface NavigationControlProps {
  map: any;
}

export default function NavigationControl({ map }: NavigationControlProps) {
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
    heading?: number | null;
  } | null>(null);
  const trackingPluginRef = useRef<any>(null);
  const watchIdRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  const startGPSTracking = (enableHighAccuracy = true) => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    // Clear previous if any (recursive calls might need this)
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          heading: position.coords.heading,
        };
        setCurrentLocation(newLocation);

        const now = Date.now();
        const timeSinceLastUpdate = now - lastUpdateRef.current;

        // Update more frequently (every 1s instead of 15s) for smoother movement
        if (timeSinceLastUpdate >= 1000 && trackingPluginRef.current) {
          console.log("Updating tracking position:", newLocation);

          trackingPluginRef.current.trackingCall({
            location: [newLocation.lng, newLocation.lat],
            reRoute: true,
            heading: newLocation.heading || true, // Use real GPS heading if available, else auto
            mapCenter: true,
            buffer: 30, // Reduced buffer for tighter tracking
            delay: 0, // Instant update, no animation delay
            etaRefresh: true,
            fitBounds: false, // Don't fit bounds on every update, user might have zoomed in
            callback: (data: any) => {
              console.log("Tracking update success:", data);
            },
          });

          lastUpdateRef.current = now;
        }
      },
      (error) => {
        // Safe logging of the error object
        console.error("GPS Error Raw Object:", error);
        console.error("GPS Error Code:", error?.code);
        console.error("GPS Error Message:", error?.message);

        // Fallback strategy: If High Accuracy fails, try Low Accuracy
        if (enableHighAccuracy) {
          console.warn(
            "High accuracy GPS failed. Attempting fallback to low accuracy..."
          );
          // delayed retry to avoid tight loop race conditions
          setTimeout(() => startGPSTracking(false), 1000);
          return;
        }

        let msg = "An unknown error occurred.";
        if (error) {
          switch (error.code) {
            case 1: // PERMISSION_DENIED
              msg = "User denied Geolocation access.";
              break;
            case 2: // POSITION_UNAVAILABLE
              msg = "Location unavailable. Check device settings/GPS.";
              if (window.location.hostname === "localhost") {
                msg +=
                  " (On Dev: Use Browser DevTools > Sensors to mock location)";
              }
              break;
            case 3: // TIMEOUT
              msg = "Location request timed out. Weak signal?";
              if (window.location.hostname === "localhost") {
                msg +=
                  " (On Dev: Use Browser DevTools > Sensors to mock location)";
              }
              break;
            default:
              msg = error.message || "Unknown error";
          }
        }

        // Only alert if we are still "trying" to track (haven't been stopped manually)
        if (isTracking) {
          alert(`Navigation Error: ${msg}\n\nTracking stopped.`);
          setIsTracking(false);
        }
      },
      {
        enableHighAccuracy: enableHighAccuracy,
        maximumAge: 0,
        timeout: 10000,
      }
    );
  };

  const stopGPSTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  const handleStartTracking = () => {
    console.log("=== Starting Navigation ===");

    if (!map || !window.mappls || !window.mappls.tracking) {
      alert("Map or tracking plugin not ready");
      return;
    }

    // Make sure we stop any previous tracking first
    if (trackingPluginRef.current) {
      console.log("Previous tracking detected, stopping it first...");
      handleStopTracking();
      // Wait for cleanup then start fresh
      setTimeout(() => {
        startFreshTracking();
      }, 500);
    } else {
      startFreshTracking();
    }
  };

  const startFreshTracking = () => {
    // Get the LATEST direction plugin data
    const directionData = (window as any).directionPluginData;
    console.log("Latest direction data:", directionData);

    if (!directionData) {
      alert("Please calculate a route in the direction panel first");
      return;
    }

    // Attempt to resolve Start/End coordinates robustly
    let startGeoposition = "";
    let endGeoposition = "";

    // Method 1: Try 'waypoints' (resolved coordinates [lng, lat])
    if (
      directionData.waypoints &&
      Array.isArray(directionData.waypoints) &&
      directionData.waypoints.length >= 2
    ) {
      const startWp = directionData.waypoints[0];
      const endWp = directionData.waypoints[directionData.waypoints.length - 1];

      // Mappls waypoints.location is usually [lng, lat]
      if (startWp.location && Array.isArray(startWp.location)) {
        startGeoposition = `${startWp.location[1]},${startWp.location[0]}`;
      }
      if (endWp.location && Array.isArray(endWp.location)) {
        endGeoposition = `${endWp.location[1]},${endWp.location[0]}`;
      }
    }

    // Method 2: Fallback to 'Request' object (user input, might be place name strings)
    if ((!startGeoposition || !endGeoposition) && directionData.Request) {
      console.warn(
        "Falling back to Request object for coordinates. This relies on input being lat,lng."
      );
      const inputs = Array.isArray(directionData.Request)
        ? directionData.Request
        : [];
      if (inputs.length >= 2) {
        if (!startGeoposition) startGeoposition = inputs[0].geoposition;
        if (!endGeoposition) endGeoposition = inputs[1].geoposition;
      }
    }

    // Validation
    const isCoord = (str: string) => /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(str);

    if (!startGeoposition || !endGeoposition) {
      console.error(
        "Could not determine start/end coordinates from:",
        directionData
      );
      alert(
        "Could not determine start/end coordinates. Please try searching via the map."
      );
      return;
    }

    // Note: If startGeoposition is a city name "Delhi", valid tracking might fail if it expects "lat,lng".
    // We strictly prefer coordinate strings.
    if (!isCoord(startGeoposition)) {
      console.warn(
        "Start location doesn't look like 'lat,lng':",
        startGeoposition
      );
      // It might still work if the plugin does internal geocoding, but 'Invalid LngLat' suggests it doesn't always.
    }

    console.log("Using route:", {
      start: startGeoposition,
      end: endGeoposition,
    });

    // Get current location for display and tracking updates
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const currentPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCurrentLocation(currentPos);

        // Create fresh tracking instance with latest route data
        const trackingOptions = {
          map: map,
          start: { geoposition: startGeoposition },
          end: { geoposition: endGeoposition },
          fitBounds: true,
          ccpIconWidth: 70,
          strokeWidth: 7,
          routeColor: "#3b82f6",
          connector: true,
          cPopup: '<div class="p-2"><strong>Your Location</strong></div>',
        };

        console.log("Creating new tracking instance with:", trackingOptions);
        trackingPluginRef.current = window.mappls.tracking(
          trackingOptions,
          (data: any) => {
            console.log("Tracking initialized with fresh route:", data);
            lastUpdateRef.current = Date.now();
          }
        );

        setIsTracking(true);
        startGPSTracking();
        console.log("=== Navigation Started Successfully ===");
      },
      (error) => {
        let msg = "Unknown error";
        switch (error.code) {
          case 1:
            msg = "Permission denied";
            break;
          case 2:
            msg = "Position unavailable";
            break;
          case 3:
            msg = "Timeout";
            break;
          default:
            msg = error.message;
        }
        console.error("Failed to get initial location for navigation:", error);
        alert(`Failed to get location: ${msg}. make sure GPS is enabled.`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleStopTracking = () => {
    console.log("Stopping tracking...");
    setIsTracking(false);
    stopGPSTracking();

    if (trackingPluginRef.current) {
      try {
        // Remove tracking plugin and all its layers
        if (typeof trackingPluginRef.current.remove === "function") {
          trackingPluginRef.current.remove();
          console.log("Tracking plugin removed");
        }
      } catch (e) {
        console.warn("Error removing tracking:", e);
      }
      trackingPluginRef.current = null;
    }

    // Force remove all tracking-related layers from the map
    if (map) {
      try {
        // Remove tracking route layer
        if (map.getLayer("tracking-route-layer")) {
          map.removeLayer("tracking-route-layer");
        }
        if (map.getSource("tracking-route-source")) {
          map.removeSource("tracking-route-source");
        }
        // Remove tracking marker layers
        const layers = map.getStyle().layers;
        if (layers) {
          layers.forEach((layer: any) => {
            if (layer.id && layer.id.includes("tracking")) {
              try {
                map.removeLayer(layer.id);
              } catch (e) {}
            }
          });
        }
        console.log("Cleaned up tracking layers from map");
      } catch (e) {
        console.warn("Error cleaning map layers:", e);
      }
    }

    setCurrentLocation(null);
    console.log("Tracking stopped and cleaned up");
  };

  useEffect(() => {
    return () => {
      stopGPSTracking();
      if (trackingPluginRef.current) {
        try {
          if (typeof trackingPluginRef.current.remove === "function") {
            trackingPluginRef.current.remove();
          }
        } catch (e) {}
      }
    };
  }, []);

  const requestLocationPermission = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        alert("Location permission granted!");
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        let msg = "Unknown error";
        switch (error.code) {
          case 1:
            msg = "Permission denied";
            break;
          case 2:
            msg = "Position unavailable";
            break;
          case 3:
            msg = "Timeout";
            break;
          default:
            msg = error.message;
        }
        alert(`Location Error: ${msg}`);
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="absolute bottom-20 right-4 z-30 flex flex-col gap-2">
      {!isTracking && (
        <button
          onClick={requestLocationPermission}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full shadow-lg transition-colors text-sm mb-2"
        >
          📍 Grant Permission
        </button>
      )}

      {!isTracking ? (
        <button
          onClick={handleStartTracking}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-colors flex items-center gap-2"
        >
          <span className="text-xl">▶️</span>
          <span>Start Navigation</span>
        </button>
      ) : (
        <div className="flex flex-col gap-2">
          {currentLocation && (
            <div className="bg-white rounded-lg shadow-lg p-3 text-sm">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-semibold">Tracking</span>
              </div>
              <div className="text-xs text-gray-600">
                {currentLocation.lat.toFixed(5)},{" "}
                {currentLocation.lng.toFixed(5)}
              </div>
            </div>
          )}
          <button
            onClick={handleStopTracking}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-colors flex items-center gap-2"
          >
            <span className="text-xl">⏹️</span>
            <span>Stop Navigation</span>
          </button>
        </div>
      )}
    </div>
  );
}
