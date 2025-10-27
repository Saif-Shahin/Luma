import React, { useEffect, useRef, useState } from 'react';

function CameraFeed() {
    const videoRef = useRef(null);
    const [hasPermission, setHasPermission] = useState(false);
    const [error, setError] = useState(null);
    const streamRef = useRef(null);

    useEffect(() => {
        const startCamera = async () => {
            try {
                console.log('Requesting camera access...');
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 1920 },
                        height: { ideal: 1080 },
                        facingMode: 'user',
                    },
                    audio: false,
                });

                console.log('Camera access granted, stream:', stream);
                console.log('Stream active:', stream.active);
                console.log('Video tracks:', stream.getVideoTracks());

                streamRef.current = stream;

                if (videoRef.current) {
                    console.log('Setting video srcObject');
                    videoRef.current.srcObject = stream;
                    setHasPermission(true);
                }
            } catch (err) {
                console.error('Error accessing camera:', err);
                setError(err.message || 'Camera access denied');
                setHasPermission(false);
            }
        };

        startCamera();

        // Cleanup function
        return () => {
            console.log('Cleaning up camera');
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => {
                    console.log('Stopping track:', track);
                    track.stop();
                });
            }
        };
    }, []);

    if (error) {
        return (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <div className="text-gray-400 text-center">
                    <p className="text-lg">Camera not available</p>
                    <p className="text-sm mt-2">{error}</p>
                    <p className="text-xs mt-4">The mirror will work without camera</p>
                </div>
            </div>
        );
    }

    if (!hasPermission) {
        return (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <div className="text-gray-400 text-lg">
                    Requesting camera access...
                </div>
            </div>
        );
    }

    return (
        <div className="absolute inset-0 overflow-hidden bg-black">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }} // Mirror the video horizontally
                onLoadedMetadata={(e) => {
                    console.log('Video metadata loaded');
                    console.log('Video dimensions:', e.target.videoWidth, 'x', e.target.videoHeight);
                }}
                onPlay={() => console.log('Video playing')}
                onCanPlay={() => console.log('Video can play')}
            />
        </div>
    );
}

export default CameraFeed;