import React, { useState } from 'react';
import { Settings } from '../types';
import Icon from './Icon';
import Loader from './Loader';

type OnboardingStep = 'canvas';

interface OnboardingProps {
    onComplete: (settings: Pick<Settings, 'canvasIcalUrl'>) => void;
    isLoading: boolean;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, isLoading }) => {
    const [step, setStep] = useState<OnboardingStep>('canvas');
    const [canvasIcalUrl, setCanvasIcalUrl] = useState('MOCK_ICAL_URL');

    const handleFinish = () => {
        onComplete({ canvasIcalUrl });
    };

    const renderStep = () => {
        switch (step) {
            case 'canvas':
                return (
                    <div>
                         <Icon name="calendar" className="w-12 h-12 mx-auto text-indigo-400 mb-4" />
                        <h2 className="text-2xl font-bold text-white text-center mb-2">Connect your Canvas Calendar</h2>
                        <p className="text-gray-400 text-center mb-6">Automatically sync assignments and deadlines from all your classes.</p>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="icalUrl" className="block text-sm font-medium text-gray-300">Canvas iCal URL</label>
                                <input
                                    type="url"
                                    id="icalUrl"
                                    value={canvasIcalUrl}
                                    onChange={(e) => setCanvasIcalUrl(e.target.value)}
                                    placeholder="Paste your iCal feed URL here"
                                    className="mt-1 block w-full bg-gray-900 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                                <p className="mt-2 text-xs text-gray-500">
                                    A mock URL is provided.
                                    <a href="https://community.canvaslms.com/t5/Student-Guide/How-do-I-subscribe-to-the-Calendar-feed-using-an-iCal-link-as/ta-p/523" target="_blank" rel="noopener noreferrer" className="ml-1 text-indigo-400 hover:underline">
                                        Find my Canvas iCal link
                                    </a>
                                </p>
                            </div>
                            <div className="flex items-center justify-between gap-3 pt-2">
                                <button onClick={handleFinish} className="flex-1 px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600">
                                    Skip for Now
                                </button>
                                <button onClick={handleFinish} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                                    Save and Finish
                                </button>
                            </div>
                        </div>
                    </div>
                );
        }
    };
    
    return (
        <div className="h-full w-full bg-gray-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-gray-800 rounded-xl shadow-lg p-8">
                {isLoading ? (
                    <div className="text-center">
                        <Loader message="Performing first sync..."/>
                        <p className="mt-2 text-gray-400 text-sm">Please wait a moment.</p>
                    </div>
                ) : renderStep()}
            </div>
        </div>
    );
};

export default Onboarding;
