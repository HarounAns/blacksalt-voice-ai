import { useState, useEffect } from 'react';
import { format } from 'date-fns';

const API_URL = 'https://7al3ohcnml.execute-api.us-east-1.amazonaws.com';

export default function CallLogs() {
    const [calls, setCalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCall, setSelectedCall] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [paginationKey, setPaginationKey] = useState(null);

    const fetchCalls = async (key = null) => {
        try {
            const credentials = localStorage.getItem('auth_credentials');
            if (!credentials) {
                throw new Error('No credentials found');
            }

            const { username, password } = JSON.parse(credentials);
            
            const requestBody = {
                limit: 10,
                sort_order: "descending",
                ...(key && { pagination_key: key })
            };

            const response = await fetch(`${API_URL}/calls`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    username,
                    password
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error('Failed to fetch calls');
            }

            const data = await response.json();
            if (key) {
                setCalls(prevCalls => [...prevCalls, ...data]);
            } else {
                setCalls(data);
            }
            
            setHasMore(data.length === 10);
            if (data.length > 0) {
                setPaginationKey(data[data.length - 1].call_id);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCalls();
    }, []);

    const loadMore = () => {
        if (!hasMore || loading) return;
        fetchCalls(paginationKey);
    };

    if (loading && !calls.length) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/20"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-red-500 text-center p-4">
                Error: {error}
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-4">
            {/* Call List */}
            <div className="space-y-3">
                {calls.map((call) => (
                    <div 
                        key={call.call_id}
                        onClick={() => setSelectedCall(call)}
                        className="bg-white dark:bg-black/[.3] rounded-lg p-4 hover:bg-black/[.02] dark:hover:bg-white/[.02] transition-colors cursor-pointer"
                    >
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4">
                            <div className="flex-1">
                                <div className="text-sm text-gray-500">
                                    {format(new Date(call.start_timestamp), 'MMM d, yyyy • h:mm a')}
                                </div>
                                <div className="font-medium">
                                    {call.from_number}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                                    {call.call_analysis.call_summary}
                                </div>
                            </div>
                            <div className="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-0 shrink-0">
                                <div className="text-sm font-medium">
                                    {Math.round(call.duration_ms / 1000)}s
                                </div>
                                <div className="text-sm text-green-500">
                                    ${(call.call_cost.combined_cost / 100).toFixed(3)}
                                </div>
                                <div className={`w-2 h-2 rounded-full sm:ml-auto sm:mt-2 ${
                                    call.call_analysis.user_sentiment === 'Positive' 
                                        ? 'bg-green-500' 
                                        : 'bg-yellow-500'
                                }`}></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {hasMore && (
                <button
                    onClick={loadMore}
                    disabled={loading}
                    className="w-full p-3 sm:p-4 mt-6 border border-black/[.08] dark:border-white/[.145] rounded-lg 
                             hover:bg-black/[.02] dark:hover:bg-white/[.02] transition-colors
                             disabled:opacity-50 text-sm sm:text-base"
                >
                    {loading ? 'Loading...' : 'Load More'}
                </button>
            )}

            {/* Modal - Adjust for mobile */}
            {selectedCall && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 space-y-6">
                            {/* Header */}
                            <div className="flex justify-between items-start border-b border-black/[.08] dark:border-white/[.145] pb-4">
                                <div>
                                    <h2 className="text-2xl font-bold">Call Details</h2>
                                    <div className="text-gray-500">
                                        {format(new Date(selectedCall.start_timestamp), 'MMM d, yyyy • h:mm a')}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedCall(null)}
                                    className="text-gray-500 hover:text-gray-700 text-2xl"
                                >
                                    ×
                                </button>
                            </div>

                            {/* Audio Player */}
                            <div className="bg-black/[.02] dark:bg-white/[.02] p-4 rounded-lg">
                                <audio controls className="w-full" src={selectedCall.recording_url} />
                            </div>

                            {/* Transcript */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Transcript</h3>
                                <div className="space-y-2">
                                    {selectedCall.transcript_object.map((message, index) => (
                                        <div
                                            key={index}
                                            className={`p-3 rounded-lg ${message.role === 'agent'
                                                ? 'bg-blue-50 dark:bg-blue-900/20'
                                                : 'bg-gray-50 dark:bg-gray-800/50'
                                                }`}
                                        >
                                            <div className={`text-sm font-medium ${message.role === 'agent'
                                                ? 'text-blue-600 dark:text-blue-400'
                                                : 'text-gray-600 dark:text-gray-400'
                                                }`}>
                                                {message.role === 'agent' ? 'Agent' : 'Customer'}
                                            </div>
                                            <div>{message.content}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}