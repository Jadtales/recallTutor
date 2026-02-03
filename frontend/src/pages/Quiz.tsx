import React, { useState, useEffect } from 'react';
import { ArrowRight, Check, X, Loader2 } from 'lucide-react';

interface QuizQuestion {
    id: string;
    conceptId: string;
    conceptLabel: string;
    question: string;
    options: string[];
}

const Quiz: React.FC = () => {
    const [quizzes, setQuizzes] = useState<QuizQuestion[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [result, setResult] = useState<{ correct: boolean, correctAnswer: string } | null>(null);

    useEffect(() => {
        fetchDailyQuizzes();
    }, []);

    const fetchDailyQuizzes = async () => {
        try {
            const res = await fetch('http://localhost:3000/quiz/daily');
            const data = await res.json();
            setQuizzes(data);
        } catch (error) {
            console.error('Failed to fetch quizzes', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOptionSelect = (option: string) => {
        if (!isSubmitted) {
            setSelectedOption(option);
        }
    };

    const handleSubmit = async () => {
        if (!selectedOption || !quizzes[currentIndex]) return;

        const currentQuiz = quizzes[currentIndex];
        // const startTime = Date.now(); // In real app, track start time properly
        const latency = 2000; // Simulated latency for now

        try {
            const res = await fetch('http://localhost:3000/quiz/response', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    questionId: currentQuiz.id,
                    selectedOption,
                    latency
                }),
            });
            const data = await res.json();
            setResult(data);
            setIsSubmitted(true);
        } catch (error) {
            console.error('Failed to submit response', error);
        }
    };

    const handleNext = () => {
        setIsSubmitted(false);
        setSelectedOption(null);
        setResult(null);
        setCurrentIndex(prev => prev + 1);
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin" /></div>;
    }

    if (quizzes.length === 0) {
        return (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
                <h2>No quizzes due!</h2>
                <p>Great job keeping up with your revision.</p>
            </div>
        );
    }

    if (currentIndex >= quizzes.length) {
        return (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
                <h2>All done!</h2>
                <p>You've completed your daily revision.</p>
            </div>
        );
    }

    const question = quizzes[currentIndex];

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="glass-panel" style={{ padding: '3rem' }}>
                <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Question {currentIndex + 1} of {quizzes.length}</span>
                    <span style={{
                        background: 'rgba(59, 130, 246, 0.1)',
                        color: 'var(--accent-primary)',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '1rem',
                        fontSize: '0.875rem'
                    }}>
                        {question.conceptLabel}
                    </span>
                </div>

                <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', lineHeight: '1.4' }}>
                    {question.question}
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                    {question.options.map((option, index) => {
                        let borderColor = 'var(--border-color)';
                        let bgColor = 'rgba(255,255,255,0.02)';

                        if (isSubmitted && result) {
                            if (option === result.correctAnswer) {
                                borderColor = 'var(--success)';
                                bgColor = 'rgba(16, 185, 129, 0.1)';
                            } else if (option === selectedOption && !result.correct) {
                                borderColor = 'var(--error)';
                                bgColor = 'rgba(239, 68, 68, 0.1)';
                            }
                        } else if (selectedOption === option) {
                            borderColor = 'var(--accent-primary)';
                            bgColor = 'rgba(59, 130, 246, 0.1)';
                        }

                        return (
                            <div
                                key={index}
                                onClick={() => handleOptionSelect(option)}
                                style={{
                                    padding: '1.25rem',
                                    borderRadius: '0.75rem',
                                    border: `2px solid ${borderColor}`,
                                    background: bgColor,
                                    cursor: isSubmitted ? 'default' : 'pointer',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <span style={{ fontSize: '1.1rem' }}>{option}</span>
                                {isSubmitted && result && option === result.correctAnswer && <Check color="var(--success)" />}
                                {isSubmitted && result && option === selectedOption && !result.correct && <X color="var(--error)" />}
                            </div>
                        );
                    })}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    {!isSubmitted ? (
                        <button
                            className="btn-primary"
                            onClick={handleSubmit}
                            disabled={selectedOption === null}
                            style={{ opacity: selectedOption === null ? 0.5 : 1 }}
                        >
                            Submit Answer
                        </button>
                    ) : (
                        <button
                            className="btn-primary"
                            onClick={handleNext}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            Next Question <ArrowRight size={20} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Quiz;
