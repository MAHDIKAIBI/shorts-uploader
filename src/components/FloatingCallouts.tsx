import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

export const FloatingCallouts: React.FC<{
    comment1: string;
    comment2: string;
    comment3: string;
}> = ({ comment1, comment2, comment3 }) => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();

    // Stagger the appearances
    const t1 = Math.floor(durationInFrames * 0.2); // 20% in
    const t2 = Math.floor(durationInFrames * 0.5); // 50% in
    const t3 = Math.floor(durationInFrames * 0.8); // 80% in

    const comments = [
        { text: comment1, trigger: t1, top: '25%', left: '10%' },
        { text: comment2, trigger: t2, top: '45%', right: '10%' },
        { text: comment3, trigger: t3, top: '75%', left: '15%' }
    ];

    return (
        <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 60 }}>
            {comments.map((c, i) => {
                const p = Math.max(0, frame - c.trigger);
                if (p === 0) return null;
                
                // Pop animation
                const scale = spring({
                    fps,
                    frame: p,
                    config: { damping: 10, stiffness: 200 }
                });
                
                // Fade out after 2 seconds (60 frames)
                const opacity = interpolate(p, [0, 10, 60, 75], [0, 1, 1, 0], {
                    extrapolateRight: 'clamp'
                });
                
                if (opacity === 0) return null;

                return (
                    <div key={i} style={{
                        position: 'absolute',
                        top: c.top,
                        left: c.left,
                        right: c.right,
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        padding: '12px 24px',
                        borderRadius: '20px',
                        borderBottomLeftRadius: i % 2 === 0 ? '0px' : '20px',
                        borderBottomRightRadius: i % 2 !== 0 ? '0px' : '20px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                        transform: `scale(${scale})`,
                        opacity,
                        maxWidth: '60%'
                    }}>
                        <p style={{
                            margin: 0,
                            fontFamily: 'system-ui, sans-serif',
                            fontWeight: 700,
                            fontSize: '24px',
                            color: '#111'
                        }}>
                            {c.text}
                        </p>
                    </div>
                );
            })}
        </AbsoluteFill>
    );
};
