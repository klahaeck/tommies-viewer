import ThreeJSTilesViewer from './components/ThreeJSTilesViewer';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* <header className="bg-gray-800 p-6 border-b border-gray-700">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white">3D Tiles Viewer</h1>
          <p className="text-gray-300 mt-2">
            Interactive 3D visualization using Three.js and 3D Tiles
          </p>
        </div>
      </header> */}
      
      <main className="w-full h-full">
        {/* <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Controls</h2>
          <ul className="text-gray-300 space-y-2">
            <li>• <strong>Left Click + Drag:</strong> Rotate camera</li>
            <li>• <strong>Right Click + Drag:</strong> Pan camera</li>
            <li>• <strong>Scroll:</strong> Zoom in/out</li>
            <li>• <strong>Touch:</strong> Pinch to zoom, drag to rotate</li>
          </ul>
        </div> */}
        
        {/* <div className="bg-gray-800 rounded-lg overflow-hidden"> */}
        <ThreeJSTilesViewer />
        {/* </div> */}
        
        {/* <div className="bg-gray-800 rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Cesium Ion Integration</h2>
          <p className="text-gray-300 mb-4">
            To use Cesium Ion datasets, set <code className="bg-gray-700 px-2 py-1 rounded">useIon={true}</code> and 
            provide your <code className="bg-gray-700 px-2 py-1 rounded">ionAssetId</code>. You'll need to get your own 
            ION_KEY from <a href="https://cesium.com/ion/signup" className="text-blue-400 hover:underline" target="_blank" rel="noopener">https://cesium.com/ion/signup</a>.
          </p>
          <div className="bg-gray-700 p-4 rounded">
            <code className="text-green-400">
              {`<ThreeJSTilesViewer 
  useIon={true}
  ionAssetId="1"
  className="w-full h-[600px]"
/>`}
            </code>
          </div>
        </div> */}
        
        {/* <div className="bg-gray-800 rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">About</h2>
          <p className="text-gray-300">
            This viewer demonstrates the Three.js 3D Tiles loader, which allows you to visualize 
            large-scale 3D geospatial datasets. The example uses a sample 3D Tiles dataset from 
            Cesium's open-source samples.
          </p>
        </div> */}
      </main>
    </div>
  );
}
