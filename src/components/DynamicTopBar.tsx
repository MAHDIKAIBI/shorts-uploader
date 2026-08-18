import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

export const DynamicTopBar: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Slide down in first 20 frames
    const entrance = spring({ fps, frame, config: { damping: 14, mass: 0.5 }, durationInFrames: 20 });
    const translateY = interpolate(entrance, [0, 1], [-120, 0]);

    // Fade out in last 0.75s
    const opacity = interpolate(
        frame,
        [durationInFrames - Math.floor(fps * 0.75), durationInFrames],
        [1, 0],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    // Tension bar: races to 88% in first 65% of video, crawls to 100%
    const tensionWidth = interpolate(
        frame,
        [0, durationInFrames * 0.65, durationInFrames],
        [0, 88, 100],
        { extrapolateRight: 'clamp' }
    );

    // Tension bar color: green → amber → red
    const r = interpolate(frame, [0, durationInFrames * 0.5, durationInFrames], [50, 255, 255]);
    const g = interpolate(frame, [0, durationInFrames * 0.5, durationInFrames], [220, 160, 0]);
    const b = interpolate(frame, [0, durationInFrames], [50, 0]);
    const barColor = `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;

    // PSI readout: counts up from 0 to 100 ton equivalent
    const psi = Math.round(interpolate(frame, [0, durationInFrames * 0.9], [0, 2206], { extrapolateRight: 'clamp' }));

    return (
        <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 50, opacity }}>
            <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0,
                height: '150px',
                background: 'linear-gradient(180deg, rgba(5,5,8,0.96) 0%, rgba(5,5,8,0.85) 80%, transparent 100%)',
                backdropFilter: 'blur(16px)',
                transform: `translateY(${translateY}px)`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '0 36px',
                gap: '14px',
            }}>

                {/* Top row: Lab label + PSI readout */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {/* Left: Channel branding */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: '8px', height: '8px', borderRadius: '50%',
                            backgroundColor: '#ff4400',
                            boxShadow: '0 0 10px rgba(255,68,0,0.9)',
                        }} />
                        <span style={{
                            fontFamily: '"Helvetica Neue", Arial, sans-serif',
                            fontSize: '22px',
                            fontWeight: 700,
                            color: 'rgba(255,255,255,0.6)',
                            letterSpacing: '3px',
                            textTransform: 'uppercase',
                        }}>
                            MAHDI LABS
                        </span>
                    </div>

                    {/* Right: Live PSI counter */}
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                        <span style={{
                            fontFamily: '"Courier New", monospace',
                            fontSize: '34px',
                            fontWeight: 900,
                            color: barColor,
                            textShadow: `0 0 20px ${barColor}`,
                            letterSpacing: '-1px',
                        }}>
                            {psi.toLocaleString()}
                        </span>
                        <span style={{
                            fontFamily: '"Helvetica Neue", Arial, sans-serif',
                            fontSize: '16px',
                            fontWeight: 600,
                            color: 'rgba(255,255,255,0.4)',
                            letterSpacing: '2px',
                        }}>PSI</span>
                    </div>
                </div>

                {/* Tension Meter */}
                <div style={{
                    width: '100%',
                    height: '5px',
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    borderRadius: '10px',
                    overflow: 'hidden',
                }}>
                    <div style={{
                        width: `${tensionWidth}%`,
                        height: '100%',
                        backgroundColor: barColor,
                        boxShadow: `0 0 20px ${barColor}, 0 0 40px ${barColor}44`,
                        borderRadius: '10px',
                        transition: 'none',
                    }} />
                </div>

            </div>
        </AbsoluteFill>
    );
};
