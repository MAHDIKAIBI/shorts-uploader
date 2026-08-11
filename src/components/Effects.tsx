import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

// The Visceral IMAX Grade
export const CinematicGrade: React.FC = () => {
    const frame = useCurrentFrame();
    
    // Halation (Red glow on highlights)
    // We achieve this via a mix-blend-mode screen with a red-tinted blur of the video
    // Since we can't easily duplicate the video element here without context, 
    // we use a subtle overlay that simulates the gritty contrast.

    return (
        <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 100 }}>
            {/* Contrast Curve & Deep Blacks */}
            <AbsoluteFill style={{ 
                backgroundColor: 'rgba(0, 0, 10, 0.15)', 
                mixBlendMode: 'multiply' 
            }} />
            
            {/* Cinematic Vignette */}
            <AbsoluteFill style={{ 
                background: 'radial-gradient(circle, transparent 40%, rgba(0,0,0,0.8) 120%)' 
            }} />

            {/* Simulated 35mm Grain & Dust */}
            {Array.from({ length: 15 }).map((_, i) => {
                const driftY = (frame * (0.5 + (i % 3) * 0.2) + (i * 100)) % 1920;
                const driftX = Math.sin(frame * 0.02 + i) * 30 + (i * 100);
                
                return (
                    <div key={i} style={{ 
                        position: 'absolute', 
                        width: '3px', height: '3px', 
                        backgroundColor: '#D4AF37', 
                        borderRadius: '50%', 
                        top: `${1920 - driftY}px`, left: `${driftX}px`, 
                        boxShadow: '0 0 5px rgba(255,100,50,0.8)', 
                        mixBlendMode: 'screen',
                        opacity: 0.6
                    }} />
                );
            })}
            
            {/* Chromatic Aberration Edge Fringing (Simulated via box shadows on the edges) */}
            <AbsoluteFill style={{
                boxShadow: 'inset 5px 0 15px rgba(255,0,0,0.2), inset -5px 0 15px rgba(0,255,255,0.2)',
                mixBlendMode: 'screen'
            }} />
        </AbsoluteFill>
    );
};
