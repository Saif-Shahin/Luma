import React from 'react';
import MirrorDisplay from './components/Mirror/MirrorDisplay';
import TVRemote from './components/Remote/TVRemote';

function App() {
    return (
        <div className="flex h-screen w-screen bg-black overflow-hidden">
            {/* Mirror Display - Full Screen */}
            <div className="w-full h-full relative">
                <MirrorDisplay />
            </div>

            {/* TV Remote - Hidden (uncomment to show) */}
            {/* <div className="w-[30%] h-full bg-gradient-to-b from-gray-800 to-gray-900 border-l-2 border-gray-700">
                <TVRemote />
            </div> */}
        </div>
    );
}

export default App;
