import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TaskStatus = "created" | "published" | "accepted" | "in_progress" | "completed" | "reviewed" | "cancelled";
export type UrgencyLevel = "low" | "medium" | "high" | "urgent" | "critical";
export type TaskSector = "real_world" | "web3_digital";

export interface TaskApplication {
  id: string;
  taskId: string;
  workerId: string;
  workerName: string;
  workerAvatar: string;
  workerRating: number;
  workerReputation: number;
  pitchText: string;
  portfolioTaskIds: string[];
  offerAmount: number;
  estimatedTime: string;
  status: "sent" | "reviewed" | "shortlisted" | "hired" | "rejected" | "completed";
  proofSubmitted: boolean;
  proofUrl?: string;
  createdAt: string;
}

export interface HelpTask {
  id: string;
  creatorId: string;
  creatorName: string;
  title: string;
  description: string;
  category: string;
  location: string | null;
  isVirtual: boolean;
  scheduledTime: string | null;
  isFlexible: boolean;
  estimatedDuration: number | null;
  rewardAmount: number | null;
  rewardDescription: string | null;
  status: TaskStatus;
  urgency: UrgencyLevel;
  sector: TaskSector;
  // Batch fields
  workerCount: number;
  slotsFilled: number;
  unitBudgetUsdc: number;
  // Escrow
  totalEscrowed: number;
  // Metadata
  acceptedHelperId: string | null;
  applications: TaskApplication[];
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  verificationTierRequired: 1 | 2 | 3;
}

const SEED_TASKS: HelpTask[] = [
  {
    id: "task-001",
    creatorId: "user-seed-1",
    creatorName: "Adaeze Okonkwo",
    title: "Need 5 helpers to move office furniture to new building",
    description: "We're relocating our office in Lekki and need 5 strong helpers to carry desks, chairs, and equipment. Transport will be provided. Lunch included.",
    category: "physical_help",
    location: "Lekki Phase 1, Lagos",
    isVirtual: false,
    scheduledTime: new Date(Date.now() + 86400000).toISOString(),
    isFlexible: false,
    estimatedDuration: 240,
    rewardAmount: 15000,
    rewardDescription: "Per worker",
    status: "published",
    urgency: "urgent",
    sector: "real_world",
    workerCount: 5,
    slotsFilled: 2,
    unitBudgetUsdc: 10,
    totalEscrowed: 30000,
    acceptedHelperId: null,
    applications: [
      {
        id: "app-001",
        taskId: "task-001",
        workerId: "worker-1",
        workerName: "Emeka Nwankwo",
        workerAvatar: "https://i.pravatar.cc/150?u=emeka",
        workerRating: 4.8,
        workerReputation: 850,
        pitchText: "I've been helping with office relocations for 3 years now. I have experience with careful handling of electronics and heavy equipment. I can bring my own protective gloves and padding materials. Previously completed 12 similar tasks on HelpChain with perfect ratings.",
        portfolioTaskIds: ["task-old-1", "task-old-5"],
        offerAmount: 15000,
        estimatedTime: "4 hours",
        status: "hired",
        proofSubmitted: true,
        proofUrl: "https://example.com/proof1.jpg",
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: "app-002",
        taskId: "task-001",
        workerId: "worker-2",
        workerName: "Tunde Bakare",
        workerAvatar: "https://i.pravatar.cc/150?u=tunde",
        workerRating: 4.6,
        workerReputation: 620,
        pitchText: "Strong and reliable worker. I've handled moving tasks across Lagos Island and Mainland. I'm punctual and always bring the right attitude. I treat every item as if it were my own property. Let me prove my worth!",
        portfolioTaskIds: ["task-old-3"],
        offerAmount: 14000,
        estimatedTime: "4 hours",
        status: "hired",
        proofSubmitted: false,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: "app-003",
        taskId: "task-001",
        workerId: "worker-3",
        workerName: "Chisom Eze",
        workerAvatar: "https://i.pravatar.cc/150?u=chisom",
        workerRating: 4.9,
        workerReputation: 920,
        pitchText: "Top-rated mover on HelpChain! I have completed over 20 moving tasks with zero damage reports. I'm physically fit, reliable, and always arrive early. I also have experience with delicate office equipment like servers and monitors.",
        portfolioTaskIds: ["task-old-2", "task-old-4", "task-old-6"],
        offerAmount: 16000,
        estimatedTime: "3.5 hours",
        status: "shortlisted",
        proofSubmitted: false,
        createdAt: new Date(Date.now() - 1800000).toISOString(),
      },
      {
        id: "app-004",
        taskId: "task-001",
        workerId: "worker-4",
        workerName: "Blessing Okafor",
        workerAvatar: "https://i.pravatar.cc/150?u=blessing",
        workerRating: 4.5,
        workerReputation: 480,
        pitchText: "I'm available and ready to help with the move. I've done similar jobs before and understand the importance of careful handling. I'm based near Lekki so transportation won't be an issue for me.",
        portfolioTaskIds: [],
        offerAmount: 13000,
        estimatedTime: "5 hours",
        status: "sent",
        proofSubmitted: false,
        createdAt: new Date(Date.now() - 900000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    completedAt: null,
    verificationTierRequired: 2,
  },
  {
    id: "task-002",
    creatorId: "user-seed-2",
    creatorName: "James Obi",
    title: "Website redesign using React & Tailwind CSS",
    description: "Looking for a skilled frontend developer to redesign our company website. Must be proficient in React, TypeScript, and Tailwind CSS. Remote work acceptable.",
    category: "tech_help",
    location: null,
    isVirtual: true,
    scheduledTime: null,
    isFlexible: true,
    estimatedDuration: null,
    rewardAmount: 150000,
    rewardDescription: null,
    status: "published",
    urgency: "high",
    sector: "web3_digital",
    workerCount: 1,
    slotsFilled: 0,
    unitBudgetUsdc: 100,
    totalEscrowed: 0,
    acceptedHelperId: null,
    applications: [
      {
        id: "app-005",
        taskId: "task-002",
        workerId: "worker-5",
        workerName: "Sarah Chen",
        workerAvatar: "https://i.pravatar.cc/150?u=sarah",
        workerRating: 4.95,
        workerReputation: 1200,
        pitchText: "Senior React developer with 5+ years of experience. I've built dozens of production websites with React and Tailwind. Check my portfolio of HelpChain tasks — all 5-star reviews. I can deliver a stunning, responsive, performance-optimized site within 1 week.",
        portfolioTaskIds: ["task-old-7", "task-old-8"],
        offerAmount: 140000,
        estimatedTime: "7 days",
        status: "reviewed",
        proofSubmitted: false,
        createdAt: new Date(Date.now() - 43200000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 43200000).toISOString(),
    completedAt: null,
    verificationTierRequired: 1,
  },
  {
    id: "task-003",
    creatorId: "user-seed-3",
    creatorName: "Funke Adeleke",
    title: "Grocery delivery from Shoprite to my home",
    description: "I need someone to pick up my grocery list from Shoprite at The Palms and deliver to my home in Victoria Island. List of about 15 items.",
    category: "errands",
    location: "Victoria Island, Lagos",
    isVirtual: false,
    scheduledTime: new Date(Date.now() + 7200000).toISOString(),
    isFlexible: true,
    estimatedDuration: 90,
    rewardAmount: 5000,
    rewardDescription: null,
    status: "published",
    urgency: "medium",
    sector: "real_world",
    workerCount: 1,
    slotsFilled: 0,
    unitBudgetUsdc: 3.33,
    totalEscrowed: 0,
    acceptedHelperId: null,
    applications: [],
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    completedAt: null,
    verificationTierRequired: 2,
  },
  {
    id: "task-004",
    creatorId: "user-seed-1",
    creatorName: "Adaeze Okonkwo",
    title: "20 data entry workers needed for product catalog",
    description: "We need 20 workers to help enter 10,000 product records into our database. Each worker gets ~500 records. Work is remote and must be completed within 48 hours. Training video provided.",
    category: "tech_help",
    location: null,
    isVirtual: true,
    scheduledTime: null,
    isFlexible: false,
    estimatedDuration: 480,
    rewardAmount: 8000,
    rewardDescription: "Per worker (500 records)",
    status: "published",
    urgency: "high",
    sector: "web3_digital",
    workerCount: 20,
    slotsFilled: 7,
    unitBudgetUsdc: 5.33,
    totalEscrowed: 56000,
    acceptedHelperId: null,
    applications: [
      {
        id: "app-006", taskId: "task-004", workerId: "worker-6",
        workerName: "Amina Yusuf", workerAvatar: "https://i.pravatar.cc/150?u=amina",
        workerRating: 4.7, workerReputation: 710,
        pitchText: "I'm a fast and accurate data entry specialist with experience handling large catalogs. I can type 80 WPM with 99.5% accuracy. Completed similar tasks before with perfect scores.",
        portfolioTaskIds: [], offerAmount: 8000, estimatedTime: "6 hours",
        status: "hired", proofSubmitted: true, createdAt: new Date(Date.now() - 20000000).toISOString(),
      },
      {
        id: "app-007", taskId: "task-004", workerId: "worker-7",
        workerName: "David Ogundimu", workerAvatar: "https://i.pravatar.cc/150?u=david",
        workerRating: 4.3, workerReputation: 390,
        pitchText: "Ready to work! I have experience with Excel, Google Sheets, and database entry. I'm meticulous and won't miss any details. Available to start immediately.",
        portfolioTaskIds: [], offerAmount: 7500, estimatedTime: "8 hours",
        status: "hired", proofSubmitted: false, createdAt: new Date(Date.now() - 18000000).toISOString(),
      },
      {
        id: "app-008", taskId: "task-004", workerId: "worker-8",
        workerName: "Grace Ikechukwu", workerAvatar: "https://i.pravatar.cc/150?u=grace",
        workerRating: 4.9, workerReputation: 1050,
        pitchText: "I specialize in data entry and have completed over 30 similar projects. I use dual monitors for maximum efficiency and always double-check my work for accuracy.",
        portfolioTaskIds: ["task-old-9"], offerAmount: 8500, estimatedTime: "5 hours",
        status: "hired", proofSubmitted: true, createdAt: new Date(Date.now() - 15000000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    updatedAt: new Date(Date.now() - 15000000).toISOString(),
    completedAt: null,
    verificationTierRequired: 1,
  },
  {
    id: "task-005",
    creatorId: "user-seed-4",
    creatorName: "Chukwuemeka Nwosu",
    title: "Home deep cleaning — 3 bedroom apartment",
    description: "Need thorough cleaning of my 3-bedroom apartment in Ikeja. Kitchen, bathrooms, living room, and all bedrooms. Cleaning supplies will be provided.",
    category: "home_repairs",
    location: "Ikeja GRA, Lagos",
    isVirtual: false,
    scheduledTime: new Date(Date.now() + 172800000).toISOString(),
    isFlexible: true,
    estimatedDuration: 300,
    rewardAmount: 25000,
    rewardDescription: null,
    status: "published",
    urgency: "low",
    sector: "real_world",
    workerCount: 2,
    slotsFilled: 0,
    unitBudgetUsdc: 8.33,
    totalEscrowed: 0,
    acceptedHelperId: null,
    applications: [],
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
    completedAt: null,
    verificationTierRequired: 2,
  },
  {
    id: "task-006",
    creatorId: "user-seed-2",
    creatorName: "James Obi",
    title: "Smart contract audit on Solana",
    description: "Need a Solana developer to audit our escrow smart contract. Must have experience with Anchor framework and security best practices. NDA required.",
    category: "tech_help",
    location: null,
    isVirtual: true,
    scheduledTime: null,
    isFlexible: true,
    estimatedDuration: null,
    rewardAmount: 500000,
    rewardDescription: null,
    status: "published",
    urgency: "high",
    sector: "web3_digital",
    workerCount: 1,
    slotsFilled: 0,
    unitBudgetUsdc: 333.33,
    totalEscrowed: 0,
    acceptedHelperId: null,
    applications: [],
    createdAt: new Date(Date.now() - 14400000).toISOString(),
    updatedAt: new Date(Date.now() - 14400000).toISOString(),
    completedAt: null,
    verificationTierRequired: 3,
  },
  {
    id: "task-007",
    creatorId: "user-seed-5",
    creatorName: "Ngozi Eze",
    title: "Logo and brand identity design for new fintech startup",
    description: "We're launching a new fintech app and need a full brand identity: logo, color palette, typography guidelines, and business card design. Modern, trustworthy aesthetic preferred.",
    category: "design",
    location: null,
    isVirtual: true,
    scheduledTime: null,
    isFlexible: true,
    estimatedDuration: null,
    rewardAmount: 85000,
    rewardDescription: null,
    status: "published",
    urgency: "medium",
    sector: "web3_digital",
    workerCount: 1,
    slotsFilled: 0,
    unitBudgetUsdc: 56.67,
    totalEscrowed: 0,
    acceptedHelperId: null,
    applications: [
      {
        id: "app-010", taskId: "task-007", workerId: "worker-10",
        workerName: "Priya Sharma", workerAvatar: "https://i.pravatar.cc/150?u=priya",
        workerRating: 4.9, workerReputation: 980,
        pitchText: "I'm a brand designer with 7+ years of experience. I've created brand identities for 30+ startups across Africa and the Middle East. My work is clean, modern, and built to scale. I'd love to help bring your fintech vision to life!",
        portfolioTaskIds: [], offerAmount: 80000, estimatedTime: "5 days",
        status: "reviewed", proofSubmitted: false, createdAt: new Date(Date.now() - 21600000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 21600000).toISOString(),
    updatedAt: new Date(Date.now() - 21600000).toISOString(),
    completedAt: null,
    verificationTierRequired: 1,
  },
  {
    id: "task-008",
    creatorId: "user-seed-6",
    creatorName: "Ibrahim Musa",
    title: "Private IELTS tutoring (goal: 7.5 band score)",
    description: "I need an experienced IELTS tutor to help me prepare for my exam in 6 weeks. Focus on Writing Task 2 and Speaking. I'm currently at 6.5 and need to reach 7.5. Can do sessions in Abuja or online.",
    category: "tutoring",
    location: "Wuse 2, Abuja",
    isVirtual: false,
    scheduledTime: null,
    isFlexible: true,
    estimatedDuration: 90,
    rewardAmount: 40000,
    rewardDescription: "Per week (6 sessions/week)",
    status: "published",
    urgency: "high",
    sector: "real_world",
    workerCount: 1,
    slotsFilled: 0,
    unitBudgetUsdc: 26.67,
    totalEscrowed: 0,
    acceptedHelperId: null,
    applications: [],
    createdAt: new Date(Date.now() - 28800000).toISOString(),
    updatedAt: new Date(Date.now() - 28800000).toISOString(),
    completedAt: null,
    verificationTierRequired: 2,
  },
  {
    id: "task-009",
    creatorId: "user-seed-3",
    creatorName: "Funke Adeleke",
    title: "Wedding catering for 150 guests — traditional Nigerian menu",
    description: "Need an experienced catering team for my daughter's wedding reception in Port Harcourt. Menu includes jollof rice, egusi soup, pounded yam, small chops, and drinks. Full setup and cleanup required.",
    category: "cooking",
    location: "Port Harcourt, Rivers State",
    isVirtual: false,
    scheduledTime: new Date(Date.now() + 2592000000).toISOString(),
    isFlexible: false,
    estimatedDuration: 600,
    rewardAmount: 350000,
    rewardDescription: "Total package",
    status: "published",
    urgency: "medium",
    sector: "real_world",
    workerCount: 5,
    slotsFilled: 0,
    unitBudgetUsdc: 46.67,
    totalEscrowed: 0,
    acceptedHelperId: null,
    applications: [],
    createdAt: new Date(Date.now() - 36000000).toISOString(),
    updatedAt: new Date(Date.now() - 36000000).toISOString(),
    completedAt: null,
    verificationTierRequired: 2,
  },
  {
    id: "task-010",
    creatorId: "user-seed-7",
    creatorName: "Tunde Bakare",
    title: "Social media content creation — 30 posts/month",
    description: "Looking for a creative content creator to manage our restaurant's Instagram and Twitter. Need 30 posts per month with custom graphics and copy. Food photography skills a plus.",
    category: "marketing",
    location: null,
    isVirtual: true,
    scheduledTime: null,
    isFlexible: true,
    estimatedDuration: null,
    rewardAmount: 60000,
    rewardDescription: "Per month",
    status: "published",
    urgency: "low",
    sector: "web3_digital",
    workerCount: 1,
    slotsFilled: 0,
    unitBudgetUsdc: 40,
    totalEscrowed: 0,
    acceptedHelperId: null,
    applications: [],
    createdAt: new Date(Date.now() - 43200000).toISOString(),
    updatedAt: new Date(Date.now() - 43200000).toISOString(),
    completedAt: null,
    verificationTierRequired: 1,
  },
  {
    id: "task-011",
    creatorId: "user-seed-8",
    creatorName: "Amaka Chukwudi",
    title: "Plumber needed — burst pipe emergency at Victoria Island home",
    description: "We have a burst water pipe in the kitchen that is flooding the floor. Need an experienced plumber urgently in Victoria Island. Must have their own tools. Payment on completion.",
    category: "home_repairs",
    location: "Victoria Island, Lagos",
    isVirtual: false,
    scheduledTime: null,
    isFlexible: false,
    estimatedDuration: 120,
    rewardAmount: 20000,
    rewardDescription: null,
    status: "published",
    urgency: "urgent",
    sector: "real_world",
    workerCount: 1,
    slotsFilled: 0,
    unitBudgetUsdc: 13.33,
    totalEscrowed: 0,
    acceptedHelperId: null,
    applications: [],
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
    completedAt: null,
    verificationTierRequired: 2,
  },
  {
    id: "task-012",
    creatorId: "user-seed-5",
    creatorName: "Ngozi Eze",
    title: "English to Yoruba translation — legal document (15 pages)",
    description: "Need an accurate translation of a 15-page legal contract from English to Yoruba. Must be a fluent speaker with legal translation experience. Confidentiality required.",
    category: "translation",
    location: null,
    isVirtual: true,
    scheduledTime: null,
    isFlexible: true,
    estimatedDuration: null,
    rewardAmount: 45000,
    rewardDescription: null,
    status: "published",
    urgency: "medium",
    sector: "web3_digital",
    workerCount: 1,
    slotsFilled: 0,
    unitBudgetUsdc: 30,
    totalEscrowed: 0,
    acceptedHelperId: null,
    applications: [],
    createdAt: new Date(Date.now() - 50400000).toISOString(),
    updatedAt: new Date(Date.now() - 50400000).toISOString(),
    completedAt: null,
    verificationTierRequired: 2,
  },
];

interface TasksState {
  tasks: HelpTask[];
  createTask: (task: Omit<HelpTask, "id" | "createdAt" | "updatedAt" | "completedAt" | "applications" | "slotsFilled" | "totalEscrowed">) => string;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  submitApplication: (taskId: string, application: Omit<TaskApplication, "id" | "createdAt" | "status" | "proofSubmitted">) => void;
  updateApplicationStatus: (taskId: string, applicationId: string, status: TaskApplication["status"]) => void;
  submitProof: (taskId: string, applicationId: string, proofUrl: string) => void;
  massApproveProofs: (taskId: string) => void;
  getTaskById: (id: string) => HelpTask | undefined;
  getPublishedTasks: (sector?: TaskSector) => HelpTask[];
  getTasksByCreator: (creatorId: string) => HelpTask[];
  getTasksByWorker: (workerId: string) => HelpTask[];
}

export const useTasksStore = create<TasksState>()(
  persist(
    (set, get) => ({
      tasks: SEED_TASKS,

      createTask: (task) => {
        const id = `task-${Date.now()}`;
        const newTask: HelpTask = {
          ...task,
          id,
          applications: [],
          slotsFilled: 0,
          totalEscrowed: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          completedAt: null,
        };
        set((state) => ({ tasks: [newTask, ...state.tasks] }));
        return id;
      },

      updateTaskStatus: (taskId, status) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, status, updatedAt: new Date().toISOString(), completedAt: status === "completed" ? new Date().toISOString() : t.completedAt } : t
          ),
        }));
      },

      submitApplication: (taskId, application) => {
        const app: TaskApplication = {
          ...application,
          id: `app-${Date.now()}`,
          status: "sent",
          proofSubmitted: false,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, applications: [...t.applications, app], updatedAt: new Date().toISOString() } : t
          ),
        }));
      },

      updateApplicationStatus: (taskId, applicationId, status) => {
        set((state) => ({
          tasks: state.tasks.map((t) => {
            if (t.id !== taskId) return t;
            const updatedApps = t.applications.map((a) =>
              a.id === applicationId ? { ...a, status } : a
            );
            const hired = updatedApps.filter((a) => a.status === "hired").length;
            return { ...t, applications: updatedApps, slotsFilled: hired, updatedAt: new Date().toISOString() };
          }),
        }));
      },

      submitProof: (taskId, applicationId, proofUrl) => {
        set((state) => ({
          tasks: state.tasks.map((t) => {
            if (t.id !== taskId) return t;
            return {
              ...t,
              applications: t.applications.map((a) =>
                a.id === applicationId ? { ...a, proofSubmitted: true, proofUrl } : a
              ),
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      massApproveProofs: (taskId) => {
        set((state) => ({
          tasks: state.tasks.map((t) => {
            if (t.id !== taskId) return t;
            return {
              ...t,
              applications: t.applications.map((a) =>
                a.proofSubmitted && a.status === "hired" ? { ...a, status: "completed" as const } : a
              ),
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      getTaskById: (id) => get().tasks.find((t) => t.id === id),

      getPublishedTasks: (sector) => {
        const tasks = get().tasks.filter((t) => t.status === "published");
        if (sector) return tasks.filter((t) => t.sector === sector);
        return tasks;
      },

      getTasksByCreator: (creatorId) => get().tasks.filter((t) => t.creatorId === creatorId),

      getTasksByWorker: (workerId) =>
        get().tasks.filter((t) => t.applications.some((a) => a.workerId === workerId)),
    }),
    { name: "helpchain-tasks-v2" }
  )
);
