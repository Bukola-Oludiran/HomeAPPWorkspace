import { Link, Outlet } from 'react-router-dom';
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react';

export default function AgentLayout() {
    return (
        <>
            <ShaderGradientCanvas style={{ width: '100vw', height: '100vh', position: 'fixed', inset: 0, zIndex: 5 }}>
                <ShaderGradient
                    animate="on"
                    axesHelper="off"
                    bgColor1="#000000"
                    bgColor2="#000000"
                    brightness={1.2}
                    cAzimuthAngle={170}
                    cDistance={4.4}
                    cPolarAngle={70}
                    cameraZoom={1}
                    color1="#94ffd1"
                    color2="#6bf5ff"
                    color3="#ffffff"
                    destination="onCanvas"
                    embedMode="off"
                    envPreset="city"
                    format="gif"
                    fov={45}
                    frameRate={10}
                    gizmoHelper="hide"
                    grain="off"
                    lightType="3d"
                    pixelDensity={1}
                    positionX={0}
                    positionY={0.9}
                    positionZ={-0.3}
                    range="disabled"
                    rangeEnd={40}
                    rangeStart={0}
                    reflection={0.1}
                    rotationX={45}
                    rotationY={0}
                    rotationZ={0}
                    shader="defaults"
                    type="waterPlane"
                    uAmplitude={0}
                    uDensity={1.2}
                    uFrequency={0}
                    uSpeed={0.2}
                    uStrength={3.4}
                    uTime={0}
                    wireframe={false}
                />
            </ShaderGradientCanvas>
            {/* Gradient overlay */}
            <div className="fixed w-full h-full inset-0 z-6 bg-gradient-to-b from-black/30 via-[#f6f7f8]/70 to-[#f6f7f8] dark:from-black/50 dark:via-[#101922]/70 dark:to-[#101922]"></div>
            <div className="bg-[#f6f7f8] dark:bg-[#101922] min-h-screen flex flex-col font-[Manrope,Noto_Sans,sans-serif] text-slate-900 dark:text-white overflow-x-hidden">
                {/* Logo - positioned top left with Agent branding */}
                <div className="absolute top-6 left-6 md:left-10 z-40 flex items-center gap-3">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="size-10 bg-[#137fec] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#137fec]/20">
                            <span className="material-symbols-outlined">real_estate_agent</span>
                        </div>
                        <div className="hidden md:flex flex-col">
                            <h2 className="text-slate-900 dark:text-white text-xl font-bold leading-tight tracking-[-0.015em]">
                                PropertyApp
                            </h2>
                            <span className="text-xs text-[#137fec] font-semibold">Agent Portal</span>
                        </div>
                    </Link>
                </div>

                {/* Navbar is now rendered at App level */}

                {/* Main Content */}
                <main className="flex-1 pt-24 z-[10]">
                    <Outlet />
                </main>
            </div>
        </>
    );
}
