export type UserRole = 'RA' | 'CHURCH_ADMIN' | 'ASSOCIATION_OFFICER' | 'SYSTEM_ADMIN';
export type UserStatus = 'PENDING_ACTIVATION' | 'ACTIVE' | 'SUSPENDED';

export interface Rank {
    id: string;
    name: string;
    level: number;
}

export interface Church {
    id: string;
    name: string;
    code: string;
    city?: string;
    state?: string;
    address?: string;
    phone?: string;
    email?: string;
}

export interface User {
    id: string;
    raNumber: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    role: UserRole;
    status: UserStatus;
    churchId: string;
    rankId?: string;
    churches?: Church;
    ranks?: Rank;
    createdAt: string;
}

export interface Exam {
    id: string;
    title: string;
    rankId: string;
    duration: number;
    passMark: number;
    questionCount: number;
    status: 'DRAFT' | 'PUBLISHED' | 'COMPLETED';
    resultsReleased: boolean;
    description?: string;
    examDate?: string;
    ranks?: Rank;
}

export interface Question {
    id: string;
    examId: string;
    text: string;
    options: Record<string, string>;
    correctAnswer: 'A' | 'B' | 'C' | 'D';
    marks: number;
}

export interface ExamAttempt {
    id: string;
    userId: string;
    examId: string;
    score: number | null;
    totalPoints: number | null;
    status: 'STARTED' | 'SUBMITTED' | 'GRADED';
    startedAt: string;
    submittedAt?: string;
    completedAt?: string;
    passed?: boolean | null;
    exams?: Exam;
    users?: {
        id: string;
        firstName: string;
        lastName: string;
        raNumber: string;
    };
}

export interface DashboardStats {
    totalRAs: number;
    totalChurches: number;
    activeExams: number;
    examsTaken: number;
}

export interface StudentOption {
    id: number;
    text: string;
}

export interface StudentQuestion {
    id: string;
    text: string;
    points: number;
    type: string;
    options: StudentOption[];
}

export interface ExamAttemptResponse {
    attemptId: string;
    examTitle: string;
    duration: number; // minutes
    questions: StudentQuestion[];
    resumed?: boolean;
    startedAt?: string;
    answers?: Record<string, number>;
}
