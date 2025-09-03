'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { TilesRenderer, GlobeControls } from '3d-tiles-renderer';
import { CesiumIonAuthPlugin, GLTFExtensionsPlugin, TilesFadePlugin, UpdateOnChangePlugin } from '3d-tiles-renderer/plugins';

// ION_KEY for Cesium Ion access (you'll need to get your own key from https://cesium.com/ion/signup/)
const ION_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2NjMzMDZjOS1lZDc5LTQxODAtOGFlNS1hM2EyM2Q1ZjYzODAiLCJpZCI6MzM4MDA0LCJpYXQiOjE3NTY5MTI4OTd9.UXNI9BZivb9kIGzwnG8zR1WlslLfesznddICDhWh9So';

// interface ThreeJSTilesViewerProps {
//   tilesetUrl?: string;
//   className?: string;
//   useIon?: boolean;
//   ionAssetId?: string;
// }

export default function ThreeJSTilesViewer() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<GlobeControls | null>(null);
  const tilesRendererRef = useRef<TilesRenderer | null>(null);

  const animate = () => {
    controlsRef.current?.update();
    tilesRendererRef.current?.update();

    if (sceneRef.current && cameraRef.current && rendererRef.current) {
      rendererRef.current.render( sceneRef.current, cameraRef.current );
    }

    // requestAnimationFrame(animate);
  };

  // Handle window resize
  const handleResize = () => {
    if (!mountRef.current || !cameraRef.current || !rendererRef.current || !tilesRendererRef.current) return;
    
    cameraRef.current.aspect = window.innerWidth / window.innerHeight;
    cameraRef.current.updateProjectionMatrix();

    rendererRef.current.setSize( window.innerWidth, window.innerHeight );

    tilesRendererRef.current?.setResolutionFromRenderer( cameraRef.current, rendererRef.current );
  };

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene
    const scene = new THREE.Scene();
    // scene.background = new THREE.Color(0x000000);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 100 );
    camera.position.set( - 1, 1, 1 ).normalize().multiplyScalar( 10 );
    camera.position.set( - 8000000, 10000000, - 14720000 );
    camera.lookAt( 0, 0, 0 );
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setAnimationLoop( animate );
    rendererRef.current = renderer;

    // Loader
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath( '/draco/' );
    dracoLoader.setDecoderConfig( { type: 'js' } );

    // Tiles
    const tiles = new TilesRenderer();
    tiles.registerPlugin( new CesiumIonAuthPlugin( { apiToken: ION_KEY, assetId: '2275207', autoRefreshToken: true } ) );
    tiles.registerPlugin( new GLTFExtensionsPlugin( { dracoLoader } ) );
    tiles.registerPlugin( new TilesFadePlugin() );
    tiles.registerPlugin( new UpdateOnChangePlugin() );
    tiles.setCamera( camera );
    tiles.setResolutionFromRenderer( camera, renderer );
    scene.add( tiles.group );
    tilesRendererRef.current = tiles;

    // rotate the globe so the north pole is up
    tiles.group.rotation.x = - Math.PI / 2;

    // Controls
    const controls = new GlobeControls( scene, camera, renderer.domElement, tiles );
    controls.enableDamping = true;
    controlsRef.current = controls;

    // Add the renderer to the DOM
    mountRef.current.appendChild(renderer.domElement);

    // Start the animation loop
    // animate();

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      if (tilesRendererRef.current) {
        tilesRendererRef.current.dispose();
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className={`w-full h-full`}
    />
  );
}
