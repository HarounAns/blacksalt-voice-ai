'use client'

import { useState, useEffect } from 'react';

const API_URL = 'https://7al3ohcnml.execute-api.us-east-1.amazonaws.com';

export default function FAQManagement() {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updating, setUpdating] = useState(false);
    const [editingFaq, setEditingFaq] = useState(null);

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

    const handleFaqUpdate = async (index, updatedFaq) => {
        if (!updatedFaq.question.trim() || !updatedFaq.answer.trim()) {
            setEditingFaq(null);
            return;
        }

        try {
            setUpdating(true);
            const credentials = localStorage.getItem('auth_credentials');
            if (!credentials) {
                throw new Error('No credentials found');
            }

            const { username, password } = JSON.parse(credentials);
            const updatedFaqs = [...config.FAQ];
            updatedFaqs[index] = updatedFaq;

            const response = await fetch(`${API_URL}/config`, {
                method: 'PATCH',
                headers: {
                    username,
                    password,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    FAQ: updatedFaqs
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update FAQ');
            }

            const updatedConfig = await response.json();
            setConfig(updatedConfig);
            setEditingFaq(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setUpdating(false);
        }
    };

    const handleAddNewFaq = async () => {
        const hasEmptyFaq = config?.FAQ?.some(faq => 
            !faq.question.trim() && !faq.answer.trim()
        );

        if (hasEmptyFaq) {
            setError('Please fill out the existing empty FAQ first');
            return;
        }

        const newFaq = {
            question: '',
            answer: ''
        };
        
        try {
            setUpdating(true);
            const credentials = localStorage.getItem('auth_credentials');
            if (!credentials) {
                throw new Error('No credentials found');
            }

            const { username, password } = JSON.parse(credentials);
            const updatedFaqs = [...(config.FAQ || []), newFaq];

            const response = await fetch(`${API_URL}/config`, {
                method: 'PATCH',
                headers: {
                    username,
                    password,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    FAQ: updatedFaqs
                })
            });

            if (!response.ok) {
                throw new Error('Failed to add new FAQ');
            }

            const updatedConfig = await response.json();
            setConfig(updatedConfig);
            setEditingFaq(updatedConfig.FAQ.length - 1);
        } catch (err) {
            setError(err.message);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return <div className="text-center">Loading FAQs...</div>;
    }

    if (error) {
        return <div className="text-red-500 text-center">{error}</div>;
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="p-6 border border-black/[.08] dark:border-white/[.145] rounded-lg">
                <h2 className="text-2xl font-bold mb-6">FAQ Management</h2>
                <div className="space-y-6">
                    {config?.FAQ?.map((faq, index) => (
                        <div
                            key={index}
                            className="p-4 bg-black/[.02] dark:bg-white/[.02] rounded-lg space-y-2 relative"
                            onClick={() => !updating && setEditingFaq(index)}
                        >
                            {editingFaq === index ? (
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        value={faq.question}
                                        onChange={(e) => {
                                            const updatedFaqs = [...config.FAQ];
                                            updatedFaqs[index] = {
                                                ...faq,
                                                question: e.target.value
                                            };
                                            setConfig({ ...config, FAQ: updatedFaqs });
                                        }}
                                        onBlur={() => handleFaqUpdate(index, faq)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.target.blur();
                                            }
                                        }}
                                        className="w-full p-2 rounded border border-black/[.08] dark:border-white/[.145] bg-background"
                                        disabled={updating}
                                    />
                                    <textarea
                                        value={faq.answer}
                                        onChange={(e) => {
                                            const updatedFaqs = [...config.FAQ];
                                            updatedFaqs[index] = {
                                                ...faq,
                                                answer: e.target.value
                                            };
                                            setConfig({ ...config, FAQ: updatedFaqs });
                                        }}
                                        onBlur={() => handleFaqUpdate(index, faq)}
                                        className="w-full p-2 rounded border border-black/[.08] dark:border-white/[.145] bg-background min-h-[100px]"
                                        disabled={updating}
                                    />
                                </div>
                            ) : (
                                <>
                                    <div className="font-semibold">{faq.question}</div>
                                    <div className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{faq.answer}</div>
                                </>
                            )}
                            {updating && editingFaq === index && (
                                <div className="absolute right-4 top-4">
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-500 border-t-transparent" />
                                </div>
                            )}
                        </div>
                    ))}
                    
                    <button
                        onClick={handleAddNewFaq}
                        disabled={updating}
                        className="w-full mt-8 p-4 rounded-lg border-2 border-dashed 
                                 border-white/[.145] hover:bg-white/[.05] 
                                 transition-colors text-white/70 
                                 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <span className="text-xl">+</span>
                        <span>Add New FAQ</span>
                    </button>
                </div>
            </div>
        </div>
    );
}