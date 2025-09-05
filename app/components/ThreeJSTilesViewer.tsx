'use client';

import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import {
  // GeoUtils,
  WGS84_ELLIPSOID,
  TilesRenderer
} from '3d-tiles-renderer';
import { TilesFadePlugin, TileCompressionPlugin, GLTFExtensionsPlugin, CesiumIonAuthPlugin, ReorientationPlugin } from '3d-tiles-renderer/plugins';
import {
	Scene,
	WebGLRenderer,
	PerspectiveCamera,
	// Raycaster,
	MathUtils,
} from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// ION_KEY for Cesium Ion access (you'll need to get your own key from https://cesium.com/ion/signup/)
const ION_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2NjMzMDZjOS1lZDc5LTQxODAtOGFlNS1hM2EyM2Q1ZjYzODAiLCJpZCI6MzM4MDA0LCJpYXQiOjE3NTY5MTI4OTd9.UXNI9BZivb9kIGzwnG8zR1WlslLfesznddICDhWh9So';

const LOCATIONS = [
  // { lat: 35.3606, lon: 138.7274 }, // Mt Fuji
  // { lat: 48.8584, lon: 2.2945 }, // Eiffel Tower
  // { lat: 41.8902, lon: 12.4922 }, // Colosseum
  // { lat: 43.8803, lon: -103.4538 }, // Mt Rushmore
  // { lat: 36.2679, lon: -112.3535 }, // Grand Canyon
  // { lat: -22.951890, lon: -43.210439 }, // Christ the Redeemer
  // { lat: 34.9947, lon: 135.7857 }, // Kiyomizu-dera
  // { lat: 35.6586, lon: 139.7454 }, // Tokyo Tower
  { lat: 44.9778, lon: -93.2650 }, // Minneapolis
  { lat: 44.9537, lon: -93.0900 }, // St. Paul
];

export default function ThreeJSTilesViewer() {
  const mountRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const tilesRef = useRef<TilesRenderer | null>(null);
  const index = useRef(0);
  const interval = useRef<NodeJS.Timeout | null>(null);

  function reinstantiateTiles(lat: number, lon: number) {
    if ( tilesRef.current ) {
      sceneRef.current?.remove( tilesRef.current.group );
      tilesRef.current.dispose();
      tilesRef.current = null;
    }
  
    const tiles = new TilesRenderer();
    tiles.registerPlugin( new CesiumIonAuthPlugin( { apiToken: ION_KEY, assetId: '2275207', autoRefreshToken: true } ) );
    tiles.registerPlugin( new TileCompressionPlugin() );
    tiles.registerPlugin( new TilesFadePlugin() );
    tiles.registerPlugin( new GLTFExtensionsPlugin( {
      // Note the DRACO compression files need to be supplied via an explicit source.
      // We use unpkg here but in practice should be provided by the application.
      dracoLoader: new DRACOLoader().setDecoderPath( '/draco/gltf/' )
    } ) );
    tiles.registerPlugin( new ReorientationPlugin( { lat: lat * MathUtils.DEG2RAD, lon: lon * MathUtils.DEG2RAD } ) );
  
    sceneRef.current?.add( tiles.group );
  
    tiles.setResolutionFromRenderer( cameraRef.current!, rendererRef.current! );
    tiles.setCamera( cameraRef.current! );
    tilesRef.current = tiles;
  }

  function changeLocation(lat: number, lon: number) {
    // const position = new THREE.Vector3();
    // WGS84_ELLIPSOID.getCartographicToPosition(lat * MathUtils.DEG2RAD, lon * MathUtils.DEG2RAD, 100, position);
    // cameraRef.current?.position.copy(position);
    // cameraRef.current?.lookAt(0, 0, 0);
    // controlsRef.current?.target.copy(position);
    // controlsRef.current?.update();
    reinstantiateTiles(lat, lon);
  }

  function init() {
    if (!mountRef.current || rendererRef.current) {
      return;
    }
    const scene = new Scene();
    sceneRef.current = scene;
  
    // primary camera view
    const renderer = new WebGLRenderer( { antialias: true } );
    renderer.setClearColor( 0x151c1f );
    rendererRef.current = renderer;
  
    mountRef.current.appendChild( renderer.domElement );
  
    const camera = new PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 100, 1600000 );
    camera.position.set( 1e3, 1e3, 1e3 ).multiplyScalar( 0.5 );
    cameraRef.current = camera;
  
    // controls
    const controls = new OrbitControls( camera, renderer.domElement );
    controls.minDistance = 20;
    controls.maxDistance = 1e4 * 2;
    controls.minPolarAngle = 0;
    controls.maxPolarAngle = 3 * Math.PI / 8;
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controls.enablePan = false;
    controlsRef.current = controls;

    // controls.target.set(41.8902, 12.4922, 0);

    reinstantiateTiles(LOCATIONS[index.current].lat, LOCATIONS[index.current].lon);
  
    onWindowResize();
    // window.addEventListener( 'resize', onWindowResize, false );
    // window.addEventListener( 'hashchange', initFromHash );
  
    // run hash functions
    // initFromHash();
  }

  function onWindowResize() {
    cameraRef.current!.aspect = window.innerWidth / window.innerHeight;
    rendererRef.current?.setSize( window.innerWidth, window.innerHeight );
  
    cameraRef.current!.updateProjectionMatrix();
    rendererRef.current?.setPixelRatio( window.devicePixelRatio );
  }

  function animate() {
    requestAnimationFrame( animate );
  
    if ( ! tilesRef.current ) return;
  
    controlsRef.current?.update();
  
    // update options
    tilesRef.current.setResolutionFromRenderer( cameraRef.current!, rendererRef.current! );
    tilesRef.current.setCamera( cameraRef.current! );
  
    // update tiles
    cameraRef.current!.updateMatrixWorld();
    tilesRef.current.update();
  
    render();
  }
  
  function render() {
    // render primary view
    rendererRef.current!.render( sceneRef.current!, cameraRef.current! );
  
    if ( tilesRef.current ) {
      const mat = tilesRef.current.group.matrixWorld.clone().invert();
      const vec = cameraRef.current!.position.clone().applyMatrix4( mat );
  
      const res = {};
      WGS84_ELLIPSOID.getPositionToCartographic( vec, res );
    }
  }

  useEffect(() => {
    init();
    animate();

    interval.current = setInterval(() => {
      // console.log('interval.current', interval.current);
      // console.log('index.current', index.current);
      index.current++;
      if (index.current >= LOCATIONS.length) {
        index.current = 0;
      }
      changeLocation(LOCATIONS[index.current].lat, LOCATIONS[index.current].lon);
    }, 5000);

    window.addEventListener('resize', onWindowResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', onWindowResize);
      if (interval.current) {
        clearInterval(interval.current);
      }
      if (mountRef.current && rendererRef.current?.domElement) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      if (tilesRef.current) {
        tilesRef.current.dispose();
      }
      rendererRef.current?.dispose();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className={`w-full h-full`}
    />
  );
}
