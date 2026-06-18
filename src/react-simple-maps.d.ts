declare module 'react-simple-maps' {
  import { ComponentType, SVGProps } from 'react';

  interface ProjectionConfig {
    scale?: number;
    center?: [number, number];
    rotate?: [number, number, number];
  }

  interface ComposableMapProps {
    projection?: string;
    projectionConfig?: ProjectionConfig;
    style?: React.CSSProperties;
    width?: number;
    height?: number;
    children?: React.ReactNode;
  }

  interface GeographiesProps {
    geography: string | object;
    children: (props: { geographies: Geography[] }) => React.ReactNode;
  }

  interface Geography {
    rsmKey: string;
    id?: string;
    properties: Record<string, unknown>;
    [key: string]: unknown;
  }

  interface GeographyStyleProp extends SVGProps<SVGPathElement> {
    outline?: string;
  }

  interface GeographyProps extends SVGProps<SVGPathElement> {
    geography: Geography;
    style?: {
      default?: GeographyStyleProp;
      hover?: GeographyStyleProp;
      pressed?: GeographyStyleProp;
    };
  }

  interface MarkerProps {
    coordinates: [number, number];
    children?: React.ReactNode;
    onClick?: () => void;
  }

  interface LineProps {
    from: [number, number];
    to: [number, number];
    stroke?: string;
    strokeWidth?: number;
    strokeDasharray?: string;
    strokeLinecap?: string;
    fill?: string;
  }

  interface ZoomableGroupProps {
    center?: [number, number];
    zoom?: number;
    minZoom?: number;
    maxZoom?: number;
    children?: React.ReactNode;
  }

  export const ComposableMap: ComponentType<ComposableMapProps>;
  export const Geographies: ComponentType<GeographiesProps>;
  export const Geography: ComponentType<GeographyProps>;
  export const Marker: ComponentType<MarkerProps>;
  export const Line: ComponentType<LineProps>;
  export const ZoomableGroup: ComponentType<ZoomableGroupProps>;
}
