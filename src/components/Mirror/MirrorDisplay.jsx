import React from 'react';
import { useApp } from '../../context/AppContext';
import Welcome from '../Setup/Welcome';
import BrightnessSetup from '../Setup/BrightnessSetup';
import SetupPrompt from '../Setup/SetupPrompt';
import CalendarSync from '../Setup/CalendarSync';
import LocationSetup from '../Setup/LocationSetup';
import TimeFormat from '../Setup/TimeFormat';
import TempFormat from '../Setup/TempFormat';
import SetupComplete from '../Setup/SetupComplete';
import SettingsMenu from '../Settings/SettingsMenu';
import MainMirror from './MainMirror';

function MirrorDisplay() {
    const { state } = useApp();
    const { currentScreen, currentSetupStep, displayOn, brightness } = state;

    // Apply brightness filter
    const brightnessStyle = {
        filter: `brightness(${brightness}%)`,
    };

    // Render appropriate screen
    const renderScreen = () => {
        if (!displayOn) {
            return (
                <div className="w-full h-full bg-black flex items-center justify-center">
                </div>
            );
        }

        if (currentScreen === 'setup') {
            switch (currentSetupStep) {
                case 'welcome':
                    return <Welcome />;
                case 'setup-prompt':
                    return <SetupPrompt />;
                case 'brightness-setup':
                    return <BrightnessSetup />;
                case 'calendar':
                    return <CalendarSync />;
                case 'location':
                    return <LocationSetup />;
                case 'time-format':
                    return <TimeFormat />;
                case 'temp-format':
                    return <TempFormat />;
                case 'complete':
                    return <SetupComplete />;
                default:
                    return <Welcome />;
            }
        } else if (currentScreen === 'settings') {
            return <SettingsMenu />;
        } else {
            return <MainMirror />;
        }
    };

    return (
        <div className="w-full h-full bg-black" style={brightnessStyle}>
            {renderScreen()}
        </div>
    );
}

export default MirrorDisplay;