import { memo } from 'react';
import './MountFujiBackground.css';

export const MountFujiBackground = memo(function MountFujiBackground() {
    return (
        <div className="fuji-artwork" aria-label="A modern CSS Illustration of Mount Fuji at Sunset">
            <div className="sky-gradient"></div>
            <div className="celestial">
                <div className="sun"></div>
            </div>
            <div className="clouds-back">
                <div className="cloud c1"></div>
                <div className="cloud c2"></div>
                <div className="cloud c3"></div>
                <div className="cloud c4"></div>
                <div className="cloud c5"></div>
            </div>
            <div className="mountain-group">
                <div className="mountain-base"></div>
                <div className="mountain-snow"></div>
                <div className="mountain-crater-shadow"></div>
            </div>
            <div className="foothill hill-left-back"></div>
            <div className="foothill hill-right-back"></div>
            <div className="mist-layer">
                <div className="mist-streak m1"></div>
                <div className="mist-streak m2"></div>
            </div>
            <div className="lake-group">
                <div className="lake-surface"></div>
                <div className="lake-reflection-mountain"></div>
                <div className="lake-reflection-sun"></div>
                <div className="lake-shimmer"></div>
            </div>
            <div className="torii-gate">
                <div className="torii-leg torii-leg-l"></div>
                <div className="torii-leg torii-leg-r"></div>
                <div className="torii-top"></div>
                <div className="torii-bar"></div>
            </div>
            <div className="clouds-front">
                <div className="cloud c6"></div>
                <div className="cloud c7"></div>
            </div>
            <div className="foothill hill-left-front"></div>
            <div className="foothill hill-right-front"></div>
            <div className="cherry-blossoms">
                <div className="petal p1"></div>
                <div className="petal p2"></div>
                <div className="petal p3"></div>
                <div className="petal p4"></div>
                <div className="petal p5"></div>
                <div className="petal p6"></div>
            </div>
        </div>
    );
});
