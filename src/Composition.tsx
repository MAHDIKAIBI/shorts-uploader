import React from 'react';
import { AbsoluteFill, OffthreadVideo, useVideoConfig, useCurrentFrame, spring, interpolate, staticFile } from 'remotion';
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
    const { durationInFrames } = useVideoConfig();
    
    // Fallback to local asset if no URL provided (for local dev)
    const src = videoUrl || 'video.mp4'; 

    return (
        <AbsoluteFill style={{ backgroundColor: 'black' }}>
            {/* 1. Base Video Element */}
            <OffthreadVideo 
                src={staticFile(src)}
                style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover' 
                }} 
            />
            
            {/* 2. Visual Effects (IMAX Grade, Halation, Grain) */}
            <CinematicGrade />
            
            {/* 3. The Dynamic Top Bar (covers original text) */}
            <DynamicTopBar durationInFrames={durationInFrames} />
            
            {/* 4. The Main Hook (Center Screen, first 2 seconds) */}
            <FloatingCallouts 
                comment1={comment1} 
                comment2={comment2} 
                comment3={comment3} 
            />
            
            {/* Big Hook Text initially */}
            <HookText text={hook} />
        </AbsoluteFill>
    );
};

const HookText: React.FC<{ text: string }> = ({ text }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    
    const scale = spring({ fps, frame, config: { damping: 12 } });
    const opacity = interpolate(frame, [0, 10, 50, 70], [0, 1, 1, 0], { extrapolateRight: 'clamp' });
    
    if (opacity === 0) return null;
    
    return (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', zIndex: 70, opacity, pointerEvents: 'none' }}>
            <h1 style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: '60px',
                fontWeight: 900,
                color: '#fff',
                textAlign: 'center',
                textShadow: '0 10px 30px rgba(0,0,0,0.8), 0 0 20px rgba(255,0,0,0.5)',
                transform: `scale(${scale})`,
                width: '80%',
                lineHeight: 1.2
            }}>
                {text}
            </h1>
        </AbsoluteFill>
    );
};
