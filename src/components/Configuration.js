'use client'

import { useState, useEffect } from 'react';

const API_URL = 'https://7al3ohcnml.execute-api.us-east-1.amazonaws.com';

export default function Configuration() {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updating, setUpdating] = useState(false);
    const [editingFallback, setEditingFallback] = useState(false);
    const [pendingFallbackNumber, setPendingFallbackNumber] = useState('');

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const credentials = localStorage.getItem('auth_credentials');
                if (!credentials) {
                    setError('No credentials found');
                    return;
                }

                const { username, password } = JSON.parse(credentials);
                const response = await fetch(`${API_URL}/config`, {
                    headers: {
                        username,
                        password,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch configuration');
                }

                const data = await response.json();
                setConfig(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchConfig();
    }, []);

    const handleToggle = async () => {
        try {
            setUpdating(true);
            const credentials = localStorage.getItem('auth_credentials');
            if (!credentials) {
                throw new Error('No credentials found');
            }

            const { username, password } = JSON.parse(credentials);
            const response = await fetch(`${API_URL}/config`, {
                method: 'PATCH',
                headers: {
                    username,
                    password,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    FORWARD_TO_PAM: !config?.FORWARD_TO_PAM
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update configuration');
            }

            const updatedConfig = await response.json();
            setConfig(updatedConfig);
        } catch (err) {
            setError(err.message);
        } finally {
            setUpdating(false);
        }
    };

    const handleFallbackUpdate = async (newNumber) => {
        if (newNumber === config?.FALLBACK_NUMBER || !newNumber) {
            setPendingFallbackNumber('');
            return;
        }

        try {
            setUpdating(true);
            const credentials = localStorage.getItem('auth_credentials');
            if (!credentials) {
                throw new Error('No credentials found');
            }

            const { username, password } = JSON.parse(credentials);
            const response = await fetch(`${API_URL}/config`, {
                method: 'PATCH',
                headers: {
                    username,
                    password,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    FALLBACK_NUMBER: newNumber
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update fallback number');
            }

            const updatedConfig = await response.json();
            setConfig(updatedConfig);
        } catch (err) {
            setError(err.message);
            setPendingFallbackNumber(config?.FALLBACK_NUMBER || '');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return <div className="text-center">Loading configuration...</div>;
    }

    if (error) {
        return <div className="text-red-500 text-center">{error}</div>;
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className={`p-8 rounded-lg ${config?.FORWARD_TO_PAM ? 'bg-green-50 dark:bg-green-950' : 'bg-gray-50 dark:bg-gray-900'}`}>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className={`w-4 h-4 rounded-full ${config?.FORWARD_TO_PAM ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <h2 className="text-2xl font-bold">
                            {config?.FORWARD_TO_PAM ? 'Pam is Answering Calls' : 'You are Answering Calls'}
                        </h2>
                    </div>
                    <div className="relative">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={config?.FORWARD_TO_PAM}
                                onChange={handleToggle}
                                disabled={updating}
                                className="sr-only peer"
                            />
                            <div className={`w-14 h-7 rounded-full peer peer-checked:after:translate-x-7 after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all ${config?.FORWARD_TO_PAM ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        </label>
                        {updating && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-white"></div>
                            </div>
                        )}
                    </div>
                </div>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                    {config?.FORWARD_TO_PAM 
                        ? 'Your customers are being taken care of by our AI assistant'
                        : 'Calls are being forwarded directly to your number'
                    }
                </p>
            </div>

            <div className="p-6 border border-black/[.08] dark:border-white/[.145] rounded-lg space-y-6">
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Phone Numbers</h3>
                    <div className="space-y-4">
                        <div className="bg-black/[.02] dark:bg-white/[.02] p-4 rounded-lg">
                            <label className="block text-sm mb-1">Customer Phone Number</label>
                            <input
                                type="text"
                                value={config?.CUSTOMER_FACING_NUMBER || ''}
                                disabled
                                className="w-full p-2 rounded border border-black/[.08] dark:border-white/[.145] bg-background opacity-50 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-500 mt-1">The number customers call to reach BlackSalt</p>
                        </div>

                        <div className="bg-black/[.02] dark:bg-white/[.02] p-4 rounded-lg">
                            <label className="block text-sm mb-1">Pam's Phone Number</label>
                            <input
                                type="text"
                                value={config?.PAM_PHONE_NUMBER || ''}
                                disabled
                                className="w-full p-2 rounded border border-black/[.08] dark:border-white/[.145] bg-background opacity-50 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-500 mt-1">This number cannot be modified</p>
                        </div>

                        <div className="bg-black/[.02] dark:bg-white/[.02] p-4 rounded-lg relative">
                            <label className="block text-sm mb-1">Fallback Number (Your Number)</label>
                            <input
                                type="text"
                                value={pendingFallbackNumber || config?.FALLBACK_NUMBER || ''}
                                onChange={(e) => setPendingFallbackNumber(e.target.value)}
                                onBlur={(e) => handleFallbackUpdate(e.target.value.trim())}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.target.blur();
                                        handleFallbackUpdate(e.target.value.trim());
                                    }
                                }}
                                disabled={updating}
                                className="w-full p-3 rounded-lg border border-black/[.08] dark:border-white/[.145] bg-background"
                            />
                            {updating && (
                                <div className="absolute right-6 top-1/2 translate-y-[2px]">
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-500 border-t-transparent"/>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}