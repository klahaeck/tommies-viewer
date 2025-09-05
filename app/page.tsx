// import ThreeJSTilesViewer from './components/ThreeJSTilesViewer';
import GoogleEarth from './components/GoogleEarth';

export default function Home() {
  // Get access tokens from environment variables
  const cesiumIonAccessToken = process.env.NEXT_PUBLIC_CESIUM_ION_ACCESS_TOKEN;
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  return (
    <div className="w-full h-screen overflow-hidden">
      <GoogleEarth 
        cesiumIonAccessToken={cesiumIonAccessToken}
        googleMapsApiKey={googleMapsApiKey}
        usePhotorealisticTiles={!!googleMapsApiKey}
        // onMapReady={(viewer) => {
        //   console.log('3D Earth viewer is ready!', viewer);
        // }}
      />
    </div>
  );
}
