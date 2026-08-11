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
                durationInFrames={900}
                fps={60}
                width={1080}
                height={1920}
                defaultProps={{
                    videoUrl: '', // To be passed via render script
                    hook: 'Why did this 9mm bullet do THIS under 100 tons of pressure?',
                    comment1: 'Wait for the spark...',
                    comment2: 'Did you see that?',
                    comment3: 'Watch the brass casing closely!'
                }}
            />
        </>
    );
};
