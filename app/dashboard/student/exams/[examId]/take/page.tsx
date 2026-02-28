'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Loader2, Timer, CheckCircle, Save, AlertTriangle, ChevronRight, ChevronLeft, LayoutGrid } from 'lucide-react';
import { StudentQuestion, ExamAttemptResponse } from '@/lib/types';

// Timer Component
const ExamTimer = ({ endTime, onExpire }: { endTime: string | null; onExpire: () => void }) => {
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    useEffect(() => {
        if (!endTime) return;

        const interval = setInterval(() => {
            const end = new Date(endTime).getTime();
            const now = new Date().getTime();
            const diff = Math.floor((end - now) / 1000);

            if (diff <= 0) {
                setTimeLeft(0);
                clearInterval(interval);
                onExpire();
            } else {
                setTimeLeft(diff);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [endTime, onExpire]);

    if (timeLeft === null) return <span>--:--</span>;

    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;

    const isLow = timeLeft < 300; // 5 minutes

    return (
        <div className={`font-mono text-xl font-bold flex items-center gap-2 ${isLow ? 'text-red-500 animate-pulse' : 'text-slate-800'}`}>
            <Timer className="w-5 h-5" />
            {hours > 0 && <span>{hours.toString().padStart(2, '0')}:</span>}
            <span>{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</span>
        </div>
    );
};

export default function TakeExamPage({ params }: { params: { examId: string } }) {
    const router = useRouter();
    const qc = useQueryClient();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [attemptData, setAttemptData] = useState<ExamAttemptResponse | null>(null);
    const [questions, setQuestions] = useState<StudentQuestion[]>([]);
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [endTime, setEndTime] = useState<string | null>(null);

    // Initial Load
    useEffect(() => {
        let isMounted = true;
        const startExam = async () => {
            try {
                // Call start/resume endpoint
                const res = await api.post(`/exams/${params.examId}/attempt`);
                if (!isMounted) return;

                const data = res.data.data as ExamAttemptResponse;
                setAttemptData(data);
                setQuestions(data.questions);

                // Load existing answers if resumed
                if (data.answers) {
                    setAnswers(data.answers);
                }

                // Calculate end time
                const start = new Date(data.startedAt || new Date().toISOString()).getTime();
                const durationMs = data.duration * 60 * 1000;
                setEndTime(new Date(start + durationMs).toISOString());

                setIsLoading(false);
            } catch (err: any) {
                if (!isMounted) return;
                console.error("Failed to start exam:", err);
                const msg = err?.response?.data?.message || 'Failed to load exam';
                setError(msg);
                setIsLoading(false);

                // If attempt already submitted, redirect
                if (msg.includes('already taken') || msg.includes('submitted')) {
                    setTimeout(() => router.push('/dashboard/student/results'), 2000);
                }
            }
        };

        startExam();
        return () => { isMounted = false; };
    }, [params.examId, router]);

    // Save Progress Mutation
    const saveMutation = useMutation({
        mutationFn: async (currentAnswers: Record<string, number>) => {
            if (!attemptData?.attemptId) return;
            setIsSaving(true);
            await api.patch('/exams/save', {
                attemptId: attemptData.attemptId,
                answers: currentAnswers
            });
            setIsSaving(false);
        },
        onError: (err) => {
            console.error("Failed to save progress", err);
            setIsSaving(false);
        }
    });

    // Auto-save debouncer
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (Object.keys(answers).length > 0 && attemptData?.attemptId && !isSubmitting) {
                saveMutation.mutate(answers);
            }
        }, 2000); // Save 2s after last change

        return () => clearTimeout(timeout);
    }, [answers, attemptData?.attemptId, isSubmitting]); // Missing saveMutation in deps, but handled by reference

    // Submit Mutation
    const submitMutation = useMutation({
        mutationFn: async () => {
            if (!attemptData?.attemptId) return;
            setIsSubmitting(true);
            await api.post('/exams/submit', {
                attemptId: attemptData.attemptId,
                answers: answers
            });
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['my-attempts'] });
            router.push('/dashboard/student/results');
        },
        onError: (err: any) => {
            console.error("Failed to submit exam", err);
            setError(err?.response?.data?.message || 'Failed to submit exam. Please try again.');
            setIsSubmitting(false);
        }
    });

    const handleAnswer = (optionId: number) => {
        if (isSubmitting) return;
        const qId = questions[currentQIndex].id;
        setAnswers(prev => ({ ...prev, [qId]: optionId }));
    };

    const handleTimeExpire = useCallback(() => {
        if (!isSubmitting) {
            submitMutation.mutate();
        }
    }, [isSubmitting, submitMutation]);

    // Navigation
    const nextQ = () => {
        if (currentQIndex < questions.length - 1) setCurrentQIndex(prev => prev + 1);
    };
    const prevQ = () => {
        if (currentQIndex > 0) setCurrentQIndex(prev => prev - 1);
    };

    // Calculate progress
    const answeredCount = Object.keys(answers).length;
    const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

    if (isLoading) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                <p className="text-slate-500 animate-pulse">Preparing your exam...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center p-4 text-center">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Something went wrong</h2>
                <p className="text-slate-500 mb-6 max-w-md">{error}</p>
                <button onClick={() => router.back()}
                    className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors">
                    Go Back
                </button>
            </div>
        );
    }

    if (!questions.length || !attemptData) return null;

    const currentQ = questions[currentQIndex];

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-20 sm:pb-8 transition-colors">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex flex-col">
                            <h1 className="text-sm text-slate-500 dark:text-slate-400 font-medium truncate max-w-[150px] sm:max-w-md">
                                {attemptData.examTitle}
                            </h1>
                            <div className="flex items-center gap-2 mt-0.5">
                                <div className="h-1.5 w-24 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                                </div>
                                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{answeredCount}/{questions.length} answered</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {isSaving && (
                                <span className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-400 dark:text-slate-500 animate-pulse">
                                    <Save className="w-3.5 h-3.5" />
                                    Saving...
                                </span>
                            )}
                            <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors">
                                <ExamTimer endTime={endTime} onExpire={handleTimeExpire} />
                            </div>
                            <button
                                onClick={() => submitMutation.mutate()}
                                disabled={isSubmitting}
                                className="hidden sm:flex items-center gap-2 px-5 py-2 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                                style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' }}
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                Submit Exam
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-10 grid lg:grid-cols-[1fr_300px] gap-8 items-start">

                {/* Question Area */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 sm:p-10 relative overflow-hidden transition-colors">
                        {/* Decorative Background numbers */}
                        <div className="absolute -right-10 -top-10 text-[150px] font-bold text-slate-50/80 dark:text-slate-800/20 select-none pointer-events-none transition-colors">
                            {currentQIndex + 1}
                        </div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <span className="inline-block px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold uppercase tracking-wider transition-colors">
                                    Question {currentQIndex + 1}
                                </span>
                                <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                                    {currentQ.points} points
                                </span>
                            </div>

                            <h2 className="text-xl sm:text-2xl font-medium text-slate-800 dark:text-slate-200 leading-relaxed mb-8 transition-colors">
                                {currentQ.text}
                            </h2>

                            <div className="space-y-3">
                                {currentQ.options.map((opt) => {
                                    const isSelected = answers[currentQ.id] === opt.id;
                                    return (
                                        <label key={opt.id}
                                            className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all group ${isSelected
                                                ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-900/20'
                                                : 'border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                                }`}
                                            onClick={() => handleAnswer(opt.id)}
                                        >
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 transition-colors ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-slate-300 dark:border-slate-600 group-hover:border-blue-400'
                                                }`}>
                                                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                                            </div>
                                            <span className={`text-base ${isSelected ? 'font-medium text-slate-800 dark:text-slate-200' : 'text-slate-600 dark:text-slate-400'}`}>
                                                {opt.text}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Navigation Buttons (Bottom) */}
                    <div className="flex justify-between items-center">
                        <button
                            onClick={prevQ} disabled={currentQIndex === 0}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            <ChevronLeft className="w-5 h-5" />
                            Previous
                        </button>

                        {currentQIndex === questions.length - 1 ? (
                            <button
                                onClick={() => submitMutation.mutate()}
                                disabled={isSubmitting}
                                className="sm:hidden flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                                style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' }}>
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                                Submit
                            </button>
                        ) : (
                            <button
                                onClick={nextQ}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 dark:bg-slate-700 text-white font-semibold hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors shadow-lg shadow-slate-200 dark:shadow-none">
                                Next
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Navigator Sidebar (Desktop) */}
                <div className="hidden lg:block space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 sticky top-24 transition-colors">
                        <div className="flex items-center gap-2 mb-4 text-slate-800 dark:text-slate-200 font-semibold">
                            <LayoutGrid className="w-5 h-5 text-slate-400" />
                            Question Navigator
                        </div>

                        <div className="grid grid-cols-5 gap-2 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                            {questions.map((q, idx) => {
                                const isAnswered = answers[q.id] !== undefined;
                                const isCurrent = currentQIndex === idx;

                                return (
                                    <button
                                        key={q.id}
                                        onClick={() => setCurrentQIndex(idx)}
                                        className={`w-10 h-10 rounded-lg text-sm font-semibold transition-all flex items-center justify-center ${isCurrent
                                            ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400'
                                            : isAnswered
                                                ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                            }`}
                                    >
                                        {idx + 1}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                                <span>Answered</span>
                                <span className="bg-blue-500 w-3 h-3 rounded-full" />
                            </div>
                            <div className="flex items-center justify-between text-xs text-slate-400">
                                <span>Not Answered</span>
                                <span className="bg-slate-100 dark:bg-slate-800 w-3 h-3 rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>

            </main>

            {/* Mobile Footer for Submit */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 sm:hidden z-20 flex items-center justify-between gap-4 transition-colors">
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {answeredCount}/{questions.length} completed
                </div>
                {/* Only show Submit if on last question or any time? Let's show Next/Prev mostly, creating clutter with Submit here. */}
                {/* Actually, let the main buttons handle flow. Maybe just progress here. */}
            </div>
        </div>

    );
}
