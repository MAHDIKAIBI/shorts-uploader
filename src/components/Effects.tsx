import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

interface CinematicGradeProps {
    frame: number;
    durationInFrames: number;
}

export const CinematicGrade: React.FC<CinematicGradeProps> = ({ frame, durationInFrames }) => {

    // Vignette pulses slightly at impact moment (40-55% of video)
    const impactStart = Math.floor(durationInFrames * 0.40);
    const impactEnd = Math.floor(durationInFrames * 0.55);
    const vignetteStrength = frame >= impactStart && frame <= impactEnd
        ? interpolate(frame, [impactStart, (impactStart + impactEnd) / 2, impactEnd], [0.75, 0.95, 0.75])
        : 0.75;

    // Film grain: random per-frame noise using deterministic pseudo-random (avoids React key issues)
    const grainOpacity = 0.04 + ((frame * 13 + 7) % 11) * 0.003;

    return (
        <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 10 }}>

            {/* === TEAL/ORANGE HOLLYWOOD COLOR GRADE === */}
            {/* Applied directly via CSS filter on a full-cover div using mix-blend-mode */}

            {/* Lift shadows to teal (cool blue-green in the darks) */}
            <AbsoluteFill style={{
                background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0, 30, 40, 0.35) 100%)',
                mixBlendMode: 'multiply',
            }} />

            {/* Push highlights to orange/amber (warm skin/metal tones) */}
            <AbsoluteFill style={{
                background: 'radial-gradient(ellipse at 50% 40%, rgba(255, 120, 20, 0.12) 0%, transparent 65%)',
                mixBlendMode: 'screen',
            }} />

            {/* Contrast S-curve: crush the blacks */}
            <AbsoluteFill style={{
                backgroundColor: 'rgba(0, 0, 5, 0.18)',
                mixBlendMode: 'multiply',
            }} />

            {/* Saturation boost: vivid orange on metals/warm objects */}
            <AbsoluteFill style={{
                background: 'linear-gradient(180deg, rgba(255, 80, 0, 0.06) 0%, rgba(0, 60, 80, 0.08) 100%)',
                mixBlendMode: 'color',
            }} />

            {/* === CINEMATIC VIGNETTE === */}
            <AbsoluteFill style={{
                background: `radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,${vignetteStrength}) 120%)`,
                transition: 'none',
            }} />

            {/* === FILM GRAIN === */}
            <AbsoluteFill style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 700' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                backgroundSize: 'cover',
                opacity: grainOpacity,
                mixBlendMode: 'overlay',
            }} />

            {/* === CHROMATIC ABERRATION EDGE FRINGE === */}
            <AbsoluteFill style={{
                boxShadow: 'inset 8px 0 25px rgba(0,200,255,0.12), inset -8px 0 25px rgba(255,50,0,0.12)',
                mixBlendMode: 'screen',
            }} />

            {/* === SUBTLE TOP FLARE (lens light leak) === */}
            <AbsoluteFill style={{
                background: 'linear-gradient(180deg, rgba(255,140,30,0.07) 0%, transparent 18%)',
                mixBlendMode: 'screen',
            }} />

        </AbsoluteFill>
    );
};
