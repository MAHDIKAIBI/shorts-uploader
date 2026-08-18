import React from 'react';
import {
    AbsoluteFill, OffthreadVideo, useVideoConfig, useCurrentFrame,
    spring, interpolate, staticFile
} from 'remotion';
import { CinematicGrade } from './components/Effects';
import { DynamicTopBar } from './components/DynamicTopBar';
import { FloatingCallouts } from './components/FloatingCallouts';

export const MainComposition: React.FC<{
    videoUrl: string;
    hook: string;
    comment1: string;
    comment2: string;
    comment3: string;
}> = ({ videoUrl, hook, comment1, comment2, comment3 }) => {
    const { durationInFrames, fps } = useVideoConfig();
    const frame = useCurrentFrame();

    const videoFilename = videoUrl ? videoUrl.split('/').pop() || 'video.mp4' : 'video.mp4';
    const src = staticFile(`videos/${videoFilename}`);

    // --- CINEMATIC ZOOM SYSTEM ---
    // Phase 1 (0% → 30%): Slow tension creep zoom in 1.0 → 1.12
    // Phase 2 (30% → 55%): Hard PUNCH zoom in to 1.25 (the moment of impact)
    // Phase 3 (55% → 100%): Slow drift zoom out back to 1.05 (aftermath breathe)
    const p1End = Math.floor(durationInFrames * 0.30);
    const p2Start = p1End;
    const p2End = Math.floor(durationInFrames * 0.55);
    const p3End = durationInFrames;

    const tensionZoom = frame <= p1End
        ? interpolate(frame, [0, p1End], [1.0, 1.12])
        : frame <= p2End
            ? interpolate(frame, [p2Start, p2End], [1.12, 1.28], { easing: (t) => t * t })
            : interpolate(frame, [p2End, p3End], [1.28, 1.05]);

    // Subtle drift: shift the origin slightly during punch to simulate camera lurch
    const originX = frame <= p2End
        ? interpolate(frame, [p2Start, p2End], [50, 52])
        : interpolate(frame, [p2End, p3End], [52, 50]);
    const originY = frame <= p2End
        ? interpolate(frame, [p2Start, p2End], [50, 53])
        : interpolate(frame, [p2End, p3End], [53, 50]);

    // Micro camera shake at impact moment (frames around p2 midpoint)
    const shakeWindow = Math.floor(durationInFrames * 0.42);
    const shakeEnd = shakeWindow + 18;
    const shakeProgress = frame >= shakeWindow && frame <= shakeEnd ? (frame - shakeWindow) : 0;
    const shakeX = shakeProgress > 0
        ? Math.sin(shakeProgress * 2.8) * interpolate(shakeProgress, [0, 18], [8, 0])
        : 0;
    const shakeY = shakeProgress > 0
        ? Math.cos(shakeProgress * 3.1) * interpolate(shakeProgress, [0, 18], [5, 0])
        : 0;

    return (
        <AbsoluteFill style={{ backgroundColor: 'black', overflow: 'hidden' }}>

            {/* 1. Base Video with Cinematic Zoom + Camera Shake */}
            <AbsoluteFill style={{
                transform: `scale(${tensionZoom}) translate(${shakeX}px, ${shakeY}px)`,
                transformOrigin: `${originX}% ${originY}%`
            }}>
                <OffthreadVideo
                    src={src}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            </AbsoluteFill>

            {/* 2. Hollywood Color Grade + Grain + Vignette */}
            <CinematicGrade frame={frame} durationInFrames={durationInFrames} />

            {/* 3. Cinematic Letterbox Bars (2.39:1 Anamorphic look) */}
            <LetterboxBars frame={frame} fps={fps} durationInFrames={durationInFrames} />

            {/* 4. Top HUD Bar */}
            <DynamicTopBar durationInFrames={durationInFrames} />

            {/* 5. Hook Text */}
            <HookText text={hook} />

            {/* 6. Floating Comment Callouts */}
            <FloatingCallouts comment1={comment1} comment2={comment2} comment3={comment3} />

        </AbsoluteFill>
    );
};

// Cinematic letterbox bars that slide in on open and out at the end
const LetterboxBars: React.FC<{ frame: number; fps: number; durationInFrames: number }> = ({ frame, fps, durationInFrames }) => {
    const enterSpring = spring({ fps, frame, config: { damping: 18, mass: 0.6 }, durationInFrames: 25 });
    const barH = interpolate(enterSpring, [0, 1], [0, 90]);

    // Fade out bars in last 1 second for clean ending
    const exitOpacity = interpolate(frame, [durationInFrames - fps, durationInFrames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

    return (
        <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 5, opacity: exitOpacity }}>
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0,
                height: `${barH}px`,
                background: 'linear-gradient(180deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 100%)',
            }} />
            <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                height: `${barH}px`,
                background: 'linear-gradient(0deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 100%)',
            }} />
        </AbsoluteFill>
    );
};

const HookText: React.FC<{ text: string }> = ({ text }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const scale = spring({ fps, frame, config: { damping: 10, stiffness: 220 } });
    const opacity = interpolate(frame, [0, 8, 55, 75], [0, 1, 1, 0], { extrapolateRight: 'clamp' });

    if (opacity === 0) return null;

    return (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', zIndex: 70, opacity, pointerEvents: 'none' }}>
            <div style={{
                transform: `scale(${scale})`,
                padding: '18px 36px',
                background: 'linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(20,20,20,0.85) 100%)',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.9), 0 0 40px rgba(255,60,0,0.15)',
                maxWidth: '78%',
                textAlign: 'center',
            }}>
                <p style={{
                    fontFamily: '"Helvetica Neue", Arial, sans-serif',
                    fontSize: '52px',
                    fontWeight: 900,
                    color: '#fff',
                    margin: 0,
                    lineHeight: 1.15,
                    letterSpacing: '-1px',
                    textShadow: '0 4px 20px rgba(0,0,0,0.8)',
                }}>
                    {text}
                </p>
            </div>
        </AbsoluteFill>
    );
};
