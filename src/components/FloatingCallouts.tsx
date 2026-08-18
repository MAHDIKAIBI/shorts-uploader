import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

export const FloatingCallouts: React.FC<{
    comment1: string;
    comment2: string;
    comment3: string;
}> = ({ comment1, comment2, comment3 }) => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();

    // Trigger points: 25%, 52%, 78% through video
    const t1 = Math.floor(durationInFrames * 0.25);
    const t2 = Math.floor(durationInFrames * 0.52);
    const t3 = Math.floor(durationInFrames * 0.78);

    const comments = [
        { text: comment1, trigger: t1, side: 'left'  as const, verticalPos: '22%' },
        { text: comment2, trigger: t2, side: 'right' as const, verticalPos: '42%' },
        { text: comment3, trigger: t3, side: 'left'  as const, verticalPos: '65%' },
    ];

    return (
        <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 60 }}>
            {comments.map((c, i) => (
                <CalloutBubble key={i} {...c} fps={fps} frame={frame} index={i} />
            ))}
        </AbsoluteFill>
    );
};

const CalloutBubble: React.FC<{
    text: string;
    trigger: number;
    side: 'left' | 'right';
    verticalPos: string;
    fps: number;
    frame: number;
    index: number;
}> = ({ text, trigger, side, verticalPos, fps, frame, index }) => {
    const elapsed = Math.max(0, frame - trigger);
    if (elapsed === 0) return null;

    // Slide in from the correct side
    const slideSpring = spring({
        fps,
        frame: elapsed,
        config: { damping: 16, stiffness: 240, mass: 0.8 },
    });

    const slideX = interpolate(slideSpring, [0, 1], [side === 'left' ? -320 : 320, 0]);

    // Scale pop
    const scaleSpring = spring({
        fps,
        frame: elapsed,
        config: { damping: 10, stiffness: 300 },
    });
    const scale = interpolate(scaleSpring, [0, 1], [0.7, 1]);

    // Hold for 2.2s then fade out
    const holdFrames = Math.floor(fps * 2.2);
    const fadeFrames = Math.floor(fps * 0.4);
    const opacity = interpolate(elapsed, [0, 6, holdFrames, holdFrames + fadeFrames], [0, 1, 1, 0], {
        extrapolateRight: 'clamp',
    });

    if (opacity === 0) return null;

    // Alternating accent colors: orange → cyan → white
    const accentColors = ['#ff5500', '#00d4ff', '#ffffff'];
    const accent = accentColors[index % accentColors.length];

    return (
        <div style={{
            position: 'absolute',
            top: verticalPos,
            left: side === 'left' ? '14px' : undefined,
            right: side === 'right' ? '14px' : undefined,
            opacity,
            transform: `translateX(${slideX}px) scale(${scale})`,
            transformOrigin: side === 'left' ? 'left center' : 'right center',
            maxWidth: '65%',
        }}>
            {/* Premium dark glass pill */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(10,10,14,0.92) 0%, rgba(18,18,24,0.88) 100%)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '40px',
                border: `1.5px solid ${accent}44`,
                boxShadow: `0 8px 32px rgba(0,0,0,0.7), 0 0 20px ${accent}22, inset 0 1px 0 rgba(255,255,255,0.08)`,
                padding: '14px 24px 14px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
            }}>
                {/* Accent dot */}
                <div style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: accent,
                    flexShrink: 0,
                    boxShadow: `0 0 12px ${accent}`,
                }} />
                <p style={{
                    margin: 0,
                    fontFamily: '"Helvetica Neue", Arial, sans-serif',
                    fontWeight: 800,
                    fontSize: '26px',
                    color: '#ffffff',
                    textShadow: '0 2px 8px rgba(0,0,0,0.9)',
                    letterSpacing: '-0.3px',
                    lineHeight: 1.2,
                }}>
                    {text}
                </p>
            </div>

            {/* Pointer tail */}
            <div style={{
                position: 'absolute',
                bottom: '-10px',
                [side === 'left' ? 'left' : 'right']: '30px',
                width: 0, height: 0,
                borderLeft: side === 'left' ? '10px solid transparent' : undefined,
                borderRight: side === 'right' ? '10px solid transparent' : undefined,
                borderTop: `12px solid rgba(10,10,14,0.92)`,
            }} />
        </div>
    );
};
