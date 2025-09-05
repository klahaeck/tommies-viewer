'use client';

import { useEffect, useRef, useState } from 'react';
import * as Cesium from 'cesium';

// Types for coordinates and animation options
interface Coordinate {
  longitude: number;
  latitude: number;
  altitude?: number;
}

interface FlyingAnimationOptions {
  duration?: number; // Duration in milliseconds
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  lookAtTarget?: boolean; // Whether to look at the target coordinate
}

interface GoogleEarthComponentProps {
  className?: string;
  // onMapReady?: (viewer: any) => void;
  cesiumIonAccessToken?: string;
  googleMapsApiKey?: string;
  usePhotorealisticTiles?: boolean;
}

const GoogleEarth: React.FC<GoogleEarthComponentProps> = ({ 
  className = '', 
  // onMapReady,
  cesiumIonAccessToken,
  // googleMapsApiKey,
  // usePhotorealisticTiles = false
}) => {
  const cesiumContainer = useRef<HTMLDivElement>(null);
  const [viewer, setViewer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRotating, setIsRotating] = useState(false);
  const rotationListenerRef = useRef<any>(null);

  // Initialize Cesium
  useEffect(() => {
    const initializeCesium = async () => {
      try {
        // Dynamically import Cesium
        // const Cesium = await import('cesium');
        
        // Set Cesium base URL
        (window as any).CESIUM_BASE_URL = '/cesium/';
        
        // Set Ion access token if provided
        if (cesiumIonAccessToken) {
          Cesium.Ion.defaultAccessToken = cesiumIonAccessToken;
        }

        // Initialize Cesium viewer
        if (!cesiumContainer.current) {
          throw new Error('Cesium container not found');
        }
        
        const cesiumViewer = new Cesium.Viewer(cesiumContainer.current, {
          timeline: false,
          animation: false,
          homeButton: false,
          sceneModePicker: false,
          baseLayerPicker: false,
          navigationHelpButton: false,
          fullscreenButton: false,
          vrButton: false,
          infoBox: false,
          selectionIndicator: false,
          globe: false,
          geocoder: Cesium.IonGeocodeProviderType.GOOGLE,
          skyAtmosphere: new Cesium.SkyAtmosphere(),
        });

        // Add Photorealistic 3D Tiles
        try {
          const tileset = await Cesium.createGooglePhotorealistic3DTileset({
            // Only the Google Geocoder can be used with Google Photorealistic 3D Tiles.  Set the `geocode` property of the viewer constructor options to IonGeocodeProviderType.GOOGLE.
            onlyUsingWithGoogleGeocoder: true,
          });
          cesiumViewer.scene.primitives.add(tileset);
        } catch (error) {
          console.log(`Error loading Photorealistic 3D Tiles tileset.
          ${error}`);
        }

        // Set initial view to St. Thomas University
        cesiumViewer.camera.setView({
          destination: Cesium.Cartesian3.fromDegrees(-93.2650, 44.9778, 2),
          orientation: {
            heading: Cesium.Math.toRadians(0.0),
            pitch: Cesium.Math.toRadians(-20.0),
            roll: 0.0
          }
        });

        setViewer(cesiumViewer);
        setIsLoading(false);
        
        // if (onMapReady) {
        //   onMapReady(cesiumViewer);
        // }
      } catch (err) {
        console.error('Error initializing Cesium:', err);
        setError('Failed to initialize 3D Earth viewer');
        setIsLoading(false);
      }
    };

    initializeCesium();
  }, [cesiumIonAccessToken]);

  // Function to start camera rotation
  const startCameraRotation = (destination: any) => {
    if (!viewer) return;
    
    // Remove any existing rotation listener
    stopCameraRotation();
    
    const transform = Cesium.Transforms.eastNorthUpToFixedFrame(destination);
    viewer.scene.camera.lookAtTransform(
      transform,
      new Cesium.HeadingPitchRange(0, -Math.PI / 6, 250)
    );
    
    const rotationListener = () => {
      viewer.scene.camera.rotateRight(0.0005);
    };
    
    viewer.clock.onTick.addEventListener(rotationListener);
    rotationListenerRef.current = rotationListener;
    setIsRotating(true);
  };

  // Function to stop camera rotation
  const stopCameraRotation = () => {
    if (rotationListenerRef.current && viewer) {
      viewer.clock.onTick.removeEventListener(rotationListenerRef.current);
      rotationListenerRef.current = null;
      setIsRotating(false);
    }
  };

  // Cleanup rotation listener on unmount
  useEffect(() => {
    return () => {
      stopCameraRotation();
    };
  }, []);

  // Flying animation function
  const flyToCoordinates = async (
    coordinates: Coordinate[], 
    options: FlyingAnimationOptions = {}
  ): Promise<void> => {
    if (!viewer || coordinates.length === 0) {
      console.warn('Viewer not ready or no coordinates provided');
      return;
    }

    const {
      duration = 2000,
      easing = 'ease-in-out',
      lookAtTarget = true
    } = options;

    try {
      // Dynamically import Cesium to get access to its classes
      // const Cesium = await import('cesium');
      
      for (let i = 0; i < coordinates.length; i++) {
        const coord = coordinates[i];
        
        // Convert duration to seconds for Cesium
        const durationSeconds = duration / 1000;
        
        // Create destination position
        const destination = Cesium.Cartesian3.fromDegrees(
          coord.longitude, 
          coord.latitude, 
          coord.altitude || 100
        );

        // Set up camera orientation
        const orientation = {
          heading: Cesium.Math.toRadians(0.0),
          pitch: Cesium.Math.toRadians(-20.0),
          roll: 0.0
        };

        // Fly to the coordinate
        await new Promise<void>((resolve) => {
          viewer.camera.flyTo({
            maximumHeight: 2000,
            destination: destination,
            orientation: orientation,
            duration: durationSeconds,
            complete: () => {
              // Set up orbiting around the destination
              // const transform = Cesium.Transforms.eastNorthUpToFixedFrame(destination);
              // viewer.scene.camera.lookAtTransform(
              //   transform,
              //   new Cesium.HeadingPitchRange(0, -Math.PI / 4, 3000)
              // );
              startCameraRotation(destination);
              resolve();
            }
          });
        });
      }
    } catch (err) {
      console.error('Error during flying animation:', err);
    }
  };

  // Expose the flying function globally for external use
  useEffect(() => {
    if (viewer) {
      (window as any).flyToCoordinates = flyToCoordinates;
    }
  }, [viewer]);

  if (error) {
    return (
      <div className={`w-full h-screen flex items-center justify-center bg-gray-900 ${className}`}>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Error Loading Google Earth</h2>
          <p className="text-gray-300">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-screen bg-gray-900 ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-300">Loading 3D Earth...</p>
          </div>
        </div>
      )}
      
      <div 
        ref={cesiumContainer} 
        className="w-full h-full"
        style={{ minHeight: '100vh' }}
      />
      
      {/* Control panel */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white p-4 rounded-lg">
        {/* <h3 className="text-lg font-semibold mb-2">3D Earth Controls</h3>
        <div className="space-y-2 text-sm">
          <p>• <strong>Left Mouse:</strong> Rotate view</p>
          <p>• <strong>Right Mouse:</strong> Pan view</p>
          <p>• <strong>Scroll:</strong> Zoom in/out</p>
          <p>• <strong>Middle Mouse:</strong> Tilt view</p>
        </div> */}
        
        <div className="mt-0">
          <h4 className="font-semibold mb-2">Quick Locations</h4>
          <div className="space-y-1">
            <button
              onClick={() => flyToCoordinates([{ latitude: 44.9741131, longitude: -93.2775379, altitude: 400 }])}
              className="block w-full text-left px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
            >
              St. Thomas University
            </button>
            <button
              onClick={() => flyToCoordinates([{ latitude: 44.9510725, longitude: -92.9963698, altitude: 400 }])}
              className="block w-full text-left px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
            >
              3M
            </button>
            <button
              onClick={() => flyToCoordinates([{ latitude: 44.9746434, longitude: -93.2752608, altitude: 400 }])}
              className="block w-full text-left px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
            >
              Target
            </button>
            {/* <button
              onClick={() => flyToCoordinates([{ latitude: 44.9944359, longitude: -93.2938487, altitude: 300 }])}
              className="block w-full text-left px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
            >
              Home
            </button> */}
          </div>
        </div>
        
        {/* <div className="mt-4">
          <h4 className="font-semibold mb-2">Camera Controls</h4>
          <div className="space-y-1">
            <button
              onClick={stopCameraRotation}
              className={`block w-full text-left px-2 py-1 rounded text-xs ${
                isRotating 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-gray-600 cursor-not-allowed'
              }`}
              disabled={!isRotating}
            >
              {isRotating ? 'Stop Rotation' : 'No Rotation Active'}
            </button>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default GoogleEarth;