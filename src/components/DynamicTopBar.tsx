import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

export const DynamicTopBar: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    
    // The bar slides down in the first 0.5 seconds
    const entrance = spring({
        fps,
        frame,
        config: { damping: 12, mass: 0.5 },
        durationInFrames: 20
    });
    
    const translateY = interpolate(entrance, [0, 1], [-150, 0]);
    
    // Tension meter fills up across the entire video
    const tensionWidth = interpolate(frame, [0, durationInFrames], [0, 100]);
    
    // Color shifts to red as it gets closer to the end
    const r = interpolate(frame, [0, durationInFrames], [0, 255]);
    const g = interpolate(frame, [0, durationInFrames], [255, 0]);
    const color = `rgb(${r}, ${g}, 0)`;

    return (
        <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 50 }}>
            {/* This black bar covers the original 'HydraulicPressMoments' logo (Usually top 150px) */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0,
                height: '180px',
                backgroundColor: 'rgba(10, 10, 10, 0.85)',
                backdropFilter: 'blur(20px)', // Glassmorphism effect
                borderBottom: '2px solid rgba(255,255,255,0.1)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                transform: `translateY(${translateY}px)`
            }}>
                <h1 style={{ 
                    fontFamily: 'system-ui, sans-serif', 
                    color: 'white', 
                    margin: 0,
                    fontSize: '40px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '4px',
                    textShadow: '0 0 20px rgba(255,255,255,0.5)'
                }}>
                    STRUCTURAL YIELD TEST
                </h1>
                
                {/* The Tension Meter */}
                <div style={{
                    width: '80%',
                    height: '8px',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    marginTop: '20px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        width: `${tensionWidth}%`,
                        height: '100%',
                        backgroundColor: color,
                        boxShadow: `0 0 15px ${color}`
                    }} />
                </div>
            </div>
        </AbsoluteFill>
    );
};
