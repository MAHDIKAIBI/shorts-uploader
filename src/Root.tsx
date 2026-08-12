import { Composition } from 'remotion';
import { MainComposition } from './Composition';
import './index.css';

// Each video is a short, so 1080x1920 at 60fps for maximum smoothness
// Average duration is around 15 seconds (900 frames) but this can be dynamic
export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="LordMahdiShort"
                component={MainComposition}
                fps={60}
                width={1080}
                height={1920}
                calculateMetadata={({ props }) => {
                    return {
                        durationInFrames: (props as any).durationInFrames || 900,
                        props
                    };
                }}
                defaultProps={{
                    videoUrl: '', 
                    durationInFrames: 900,
                    hook: 'Why did this happen under 100 tons of pressure?',
                    comment1: 'Wait for the spark...',
                    comment2: 'Did you see that?',
                    comment3: 'Watch closely!'
                }}
            />
        </>
    );
};
