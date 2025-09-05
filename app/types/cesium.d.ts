declare module 'cesium' {
  export interface Cartesian3 {
    static fromDegrees(longitude: number, latitude: number, height?: number): Cartesian3;
  }

  export interface Math {
    static toRadians(degrees: number): number;
  }

  export interface Camera {
    setView(options: {
      destination: Cartesian3;
      orientation?: {
        heading: number;
        pitch: number;
        roll: number;
      };
    }): void;
    
    flyTo(options: {
      destination: Cartesian3;
      orientation?: {
        heading: number;
        pitch: number;
        roll: number;
      };
      duration?: number;
      complete?: () => void;
    }): void;
  }

  export interface Globe {
    enableLighting: boolean;
    dynamicAtmosphereLighting: boolean;
  }

  export interface Scene {
    globe: Globe;
  }

  export interface ViewerOptions {
    terrainProvider?: any;
    timeline?: boolean;
    animation?: boolean;
    homeButton?: boolean;
    sceneModePicker?: boolean;
    baseLayerPicker?: boolean;
    navigationHelpButton?: boolean;
    fullscreenButton?: boolean;
    vrButton?: boolean;
    geocoder?: boolean | any;
    infoBox?: boolean;
    selectionIndicator?: boolean;
    globe?: boolean;
    skyAtmosphere?: any;
  }

  export interface Cesium3DTileset {
    readyPromise?: Promise<Cesium3DTileset>;
    ready: boolean;
    showCreditsOnScreen: boolean;
    maximumScreenSpaceError: number;
    maximumMemoryUsage: number;
    cullWithChildrenBounds: boolean;
    dynamicScreenSpaceError: boolean;
    dynamicScreenSpaceErrorDensity: number;
    dynamicScreenSpaceErrorFactor: number;
    dynamicScreenSpaceErrorHeightFalloff: number;
  }

  export interface Primitives {
    add(tileset: Cesium3DTileset): Cesium3DTileset;
  }

  export interface Scene {
    globe: Globe;
    primitives: Primitives;
  }

  export interface Viewer {
    camera: Camera;
    scene: Scene;
    zoomTo(target: any): void;
  }

  export class Viewer {
    constructor(container: HTMLElement, options?: ViewerOptions);
  }

  export class Cesium3DTileset {
    constructor(options: {
      url: string;
      showCreditsOnScreen?: boolean;
      maximumScreenSpaceError?: number;
      maximumMemoryUsage?: number;
      cullWithChildrenBounds?: boolean;
      dynamicScreenSpaceError?: boolean;
      dynamicScreenSpaceErrorDensity?: number;
      dynamicScreenSpaceErrorFactor?: number;
      dynamicScreenSpaceErrorHeightFalloff?: number;
      [key: string]: any; // Allow additional properties
    });
  }

  export class Cartesian3 {
    static fromDegrees(longitude: number, latitude: number, height?: number): Cartesian3;
  }

  export class Math {
    static toRadians(degrees: number): number;
  }

  export namespace Ion {
    let defaultAccessToken: string;
  }

}
