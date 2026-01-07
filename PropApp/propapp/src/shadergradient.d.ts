declare module '@shadergradient/react' {
    import { CSSProperties, FC, ReactNode } from 'react';

    export interface ShaderGradientCanvasProps {
        children?: ReactNode;
        style?: CSSProperties;
        [key: string]: unknown;
    }

    export interface ShaderGradientProps {
        animate?: 'on' | 'off';
        axesHelper?: 'on' | 'off';
        bgColor1?: string;
        bgColor2?: string;
        brightness?: number;
        cAzimuthAngle?: number;
        cDistance?: number;
        cPolarAngle?: number;
        cameraZoom?: number;
        color1?: string;
        color2?: string;
        color3?: string;
        destination?: 'onCanvas' | 'offCanvas';
        embedMode?: 'on' | 'off';
        envPreset?: 'city' | 'dawn' | 'lobby' | string;
        format?: 'gif' | 'png' | 'jpg' | string;
        fov?: number;
        frameRate?: number;
        gizmoHelper?: 'show' | 'hide';
        grain?: 'on' | 'off';
        lightType?: '3d' | 'env' | string;
        pixelDensity?: number;
        positionX?: number;
        positionY?: number;
        positionZ?: number;
        range?: 'enabled' | 'disabled';
        rangeEnd?: number;
        rangeStart?: number;
        reflection?: number;
        rotationX?: number;
        rotationY?: number;
        rotationZ?: number;
        shader?: 'defaults' | string;
        type?: 'plane' | 'sphere' | 'waterPlane' | string;
        uAmplitude?: number;
        uDensity?: number;
        uFrequency?: number;
        uSpeed?: number;
        uStrength?: number;
        uTime?: number;
        wireframe?: boolean;
        [key: string]: unknown;
    }

    export const ShaderGradientCanvas: FC<ShaderGradientCanvasProps>;
    export const ShaderGradient: FC<ShaderGradientProps>;
}
