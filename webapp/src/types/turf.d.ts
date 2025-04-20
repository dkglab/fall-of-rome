// src/types/turf.d.ts
declare module '@turf/turf' {
    import { FeatureCollection, Geometry, Feature } from 'geojson';
    
    // Main bbox function
    export function bbox(
      geojson: FeatureCollection | Feature | Geometry
    ): [number, number, number, number];
  
    // Common utility functions
    export function center(features: FeatureCollection): Feature;
    export function distance(point1: Feature, point2: Feature, options?: {units?: string}): number;
    export function area(geojson: Feature | FeatureCollection): number;
    export function length(geojson: Feature | FeatureCollection): number;
    export function point(coordinates: number[], properties?: object): Feature;
    export function lineString(coordinates: number[][], properties?: object): Feature;
    export function polygon(coordinates: number[][][], properties?: object): Feature;
    export function featureCollection(features: Feature[]): FeatureCollection;
    export function buffer(feature: Feature | FeatureCollection, radius: number, options?: object): FeatureCollection;
    export function envelope(geojson: FeatureCollection | Feature): Feature;
    export function centroid(geojson: Feature | FeatureCollection): Feature;
    
    // Add other Turf.js functions as needed
  }