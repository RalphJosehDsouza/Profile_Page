import { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft, Mail, ExternalLink, Github, Linkedin,
  FileText, User, Briefcase, Code, Download,
  MapPin, ChevronRight, Cpu, Zap,
  Terminal,
} from "lucide-react";
import IntroScene3D from "./IntroScene3D";

// ─── Types ───────────────────────────────────────────────────────────────────

type View =
  | "intro"
  | "caseFile"
  | "evidenceBoard"
  | "projectDetail"
  | "about"
  | "experience"
  | "resume"
  | "contact";

// ─── Global CSS injected once via App ────────────────────────────────────────

const GLOBAL_STYLES = `
  @keyframes flickerLamp {
    0%,100%  { opacity:1; }
    3%       { opacity:0.6; }
    6%       { opacity:1; }
    10%      { opacity:0.35; }
    13%      { opacity:1; }
    50%      { opacity:0.88; }
    53%      { opacity:0.15; }
    56%      { opacity:1; }
    76%      { opacity:0.75; }
    79%      { opacity:1; }
  }
  @keyframes flickerGlow {
    0%,100%  { box-shadow: 0 0 70px 35px rgba(212,146,42,0.38), 0 0 160px 80px rgba(212,146,42,0.16); }
    3%       { box-shadow: 0 0 30px 15px rgba(212,146,42,0.22), 0 0  70px 35px rgba(212,146,42,0.10); }
    6%       { box-shadow: 0 0 90px 45px rgba(212,146,42,0.44), 0 0 180px 90px rgba(212,146,42,0.20); }
    10%      { box-shadow: 0 0 10px  5px rgba(212,146,42,0.12), 0 0  20px 10px rgba(212,146,42,0.06); }
    13%      { box-shadow: 0 0 70px 35px rgba(212,146,42,0.38), 0 0 160px 80px rgba(212,146,42,0.16); }
    53%      { box-shadow: 0 0  5px  2px rgba(212,146,42,0.08), 0 0  10px  5px rgba(212,146,42,0.04); }
    56%      { box-shadow: 0 0 70px 35px rgba(212,146,42,0.38), 0 0 160px 80px rgba(212,146,42,0.16); }
  }
  @keyframes doorSwing {
    0%   { transform: perspective(1600px) rotateY(0deg); }
    100% { transform: perspective(1600px) rotateY(-78deg); }
  }
  @keyframes fadeInUp {
    from { opacity:0; transform:translateY(28px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity:0; }
    to   { opacity:1; }
  }
  @keyframes stampDrop {
    0%   { transform:rotate(-12deg) scale(2.2); opacity:0; }
    60%  { transform:rotate(-12deg) scale(0.92); opacity:1; }
    80%  { transform:rotate(-12deg) scale(1.04); }
    100% { transform:rotate(-12deg) scale(1); opacity:1; }
  }
  @keyframes drawString {
    from { stroke-dashoffset: 800; }
    to   { stroke-dashoffset: 0; }
  }
  @keyframes pinDrop {
    0%   { transform:translateY(-20px) scale(1.4); opacity:0; }
    70%  { transform:translateY(2px) scale(0.95); opacity:1; }
    100% { transform:translateY(0) scale(1); opacity:1; }
  }
  @keyframes scanMove {
    0%   { background-position: 0 0; }
    100% { background-position: 0 100%; }
  }
  @keyframes pulseGlow {
    0%,100% { opacity: 0.55; }
    50%     { opacity: 0.9; }
  }
  @keyframes subtleFloat {
    0%,100% { transform: translateY(0); }
    50%     { transform: translateY(-3px); }
  }
  @keyframes typewriter {
    from { width: 0; }
    to   { width: 100%; }
  }
  @keyframes blink {
    0%,100% { opacity:1; }
    50%     { opacity:0; }
  }
  @keyframes slideInLeft {
    from { opacity:0; transform:translateX(-40px); }
    to   { opacity:1; transform:translateX(0); }
  }
  @keyframes ribbonWave {
    0%,100% { transform: rotate(45deg) scale(1); }
    50%     { transform: rotate(45deg) scale(1.05); }
  }

  .lamp-flicker  { animation: flickerLamp 5s ease-in-out infinite; }
  .lamp-glow     { animation: flickerGlow 5s ease-in-out infinite; }
  .door-open     { animation: doorSwing 1.4s cubic-bezier(.4,0,.2,1) forwards; transform-origin: left center; }
  .fade-in-up    { animation: fadeInUp  0.7s ease-out forwards; }
  .fade-in       { animation: fadeIn    0.6s ease-out forwards; }
  .stamp-drop    { animation: stampDrop 0.45s ease-out forwards; }
  .pin-drop      { animation: pinDrop   0.35s ease-out forwards; }
  .draw-string   { stroke-dasharray:800; stroke-dashoffset:800; animation: drawString 1.8s ease-out forwards; }
  .pulse-glow    { animation: pulseGlow 3s ease-in-out infinite; }
  .subtle-float  { animation: subtleFloat 4s ease-in-out infinite; }
  .slide-in-left { animation: slideInLeft 0.6s ease-out forwards; }

  ::-webkit-scrollbar            { width:6px; height:6px; }
  ::-webkit-scrollbar-track      { background:rgba(10,8,5,0.5); }
  ::-webkit-scrollbar-thumb      { background:rgba(212,146,42,0.35); border-radius:3px; }
  ::-webkit-scrollbar-thumb:hover { background:rgba(212,146,42,0.55); }

  .scanlines {
    background-image: repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.04) 3px,rgba(0,0,0,0.04) 4px);
    pointer-events:none;
  }
  .vignette {
    background: radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(0,0,0,0.85) 100%);
    pointer-events:none;
  }
  .dark-wood {
    background-color:#120e07;
    background-image:
      linear-gradient(103deg, transparent 38%, rgba(30,18,3,0.7) 38.6%, transparent 39.2%),
      linear-gradient(97deg,  transparent 54%, rgba(20,12,2,0.5) 54.6%, transparent 55.2%),
      linear-gradient(108deg, transparent 68%, rgba(40,25,5,0.4) 68.6%, transparent 69.2%);
  }
  .cork-bg {
    background-color:#7a5c1e;
    background-image:
      radial-gradient(ellipse at 18% 25%, rgba(100,75,20,0.75) 0%, transparent 48%),
      radial-gradient(ellipse at 78% 65%, rgba(80,55,10,0.60) 0%, transparent 42%),
      radial-gradient(ellipse at 50% 88%, rgba(120,90,30,0.35) 0%, transparent 50%),
      radial-gradient(ellipse at 35% 55%, rgba(90,65,15,0.45) 0%, transparent 40%),
      radial-gradient(ellipse at 65% 15%, rgba(110,80,25,0.50) 0%, transparent 45%);
  }
  .paper-bg {
    background-color:#d4c49a;
    background-image:
      radial-gradient(ellipse at 25% 18%, rgba(180,160,100,0.45) 0%, transparent 55%),
      radial-gradient(ellipse at 82% 72%, rgba(155,135,75,0.35) 0%, transparent 48%);
  }
  .noir-btn {
    background:#1a1208;
    border:1px solid rgba(212,146,42,0.25);
    color:#d4922a;
    font-family:"Special Elite", serif;
    letter-spacing:0.12em;
    transition: background 0.25s, border-color 0.25s, opacity 0.25s, transform 0.2s;
    cursor:pointer;
  }
  .noir-btn:hover { background:#241a0c; border-color:rgba(212,146,42,0.55); transform: translateY(-1px); }
  .noir-btn:active { transform: translateY(0); }

  .evidence-card {
    transition: transform 0.3s cubic-bezier(.25,.46,.45,.94), box-shadow 0.3s ease;
  }
  .evidence-card:hover {
    z-index: 20 !important;
  }

  .coffee-stain {
    position: absolute;
    border-radius: 50%;
    background: radial-gradient(ellipse, rgba(120,80,20,0.12) 0%, rgba(120,80,20,0.06) 40%, transparent 70%);
    pointer-events: none;
  }

  .board-note {
    background: #f5e6a3;
    box-shadow: 2px 3px 8px rgba(0,0,0,0.4);
    font-family: 'Special Elite', serif;
    font-size: 0.55rem;
    letter-spacing: 0.18em;
    color: #3d2a0a;
    padding: 4px 10px;
    position: absolute;
    z-index: 12;
    pointer-events: none;
  }

  .ribbon-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    width: 52px;
    height: 52px;
    overflow: hidden;
    z-index: 15;
    pointer-events: none;
  }
  .ribbon-badge span {
    position: absolute;
    display: block;
    width: 80px;
    padding: 2px 0;
    background: #8b1a1a;
    color: #e8dcc8;
    font-family: 'Special Elite', serif;
    font-size: 0.42rem;
    letter-spacing: 0.15em;
    text-align: center;
    transform: rotate(45deg);
    top: 12px;
    right: -22px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.4);
  }
`;

// ─── Data ────────────────────────────────────────────────────────────────────

const PERSON = {
  name: "RALPH JOSEPH DSOUZA",
  codename: "OPERATIVE-RJD",
  title: "Full Stack Developer & AI/ML Engineer",
  subtitle: "Engineering intelligent systems, from distributed architectures to neural networks.",
  location: "Mumbai, India",
  email: "dsouzaralph603@gmail.com",
  linkedin: "https://www.linkedin.com/in/ralph-joseph-dsouza/",
  github: "https://github.com/RalphJosehDsouza",
  portfolio: "#",
  bio: `A versatile operative with deep expertise across the full technology spectrum — from architecting
distributed systems and real-time applications to engineering machine learning pipelines and
computer vision models. Specializes in TypeScript, Python, and the modern AI/ML stack.

Known for building production-grade platforms under extreme time pressure (hackathons), designing
fault-tolerant distributed architectures, and pushing the boundaries of federated learning research.
Has executed operations spanning fintech risk analysis, legal technology, automated outreach systems,
and intelligent content generation. Currently seeking high-impact assignments where engineering
excellence meets cutting-edge AI.`,
  skills: [
    "React / Next.js", "TypeScript", "Python", "Node.js",
    "TensorFlow / PyTorch", "Federated Learning", "Computer Vision",
    "Odoo / ERP", "MongoDB / PostgreSQL", "Docker",
    "REST APIs", "Distributed Systems",
  ],
  tools: ["VS Code", "Git", "Jupyter Notebook", "Postman", "Linux"],
};

const PROJECTS = [
  {
    id: "p1", codename: "OPERATION: PHANTOM",
    title: "Asynchronous Federated Learning", caseNumber: "FILE-001",
    status: "ONGOING", year: "2025", category: "AI/ML",
    tech: ["TypeScript", "Python", "TensorFlow", "Distributed Systems", "Privacy ML"],
    description: "Research implementation of asynchronous federated learning protocols for privacy-preserving distributed machine learning. Enables collaborative model training across decentralized nodes without ever exposing raw data — a critical advancement for healthcare, finance, and edge computing scenarios.",
    evidence: [
      "Privacy-preserving ML architecture with zero data exposure",
      "Asynchronous node coordination protocol for heterogeneous devices",
      "Decentralized training pipeline with fault tolerance",
      "Convergence guarantees under non-IID data distributions",
    ],
    github: "https://github.com/RalphJosehDsouza/Asynchronous_FL_model",
    live: "#",
    x: 3, y: 4, rotate: -1.5,
    isNew: false,
  },
  {
    id: "p2", codename: "OPERATION: ORACLE",
    title: "MultiModal Credit Risk Dashboard", caseNumber: "FILE-002",
    status: "CLOSED", year: "2025", category: "AI/ML",
    tech: ["Jupyter", "Python", "Scikit-Learn", "Pandas", "Data Visualization"],
    description: "Intelligent credit risk analysis platform combining multiple data modalities — tabular financial data, document analysis, and behavioral patterns — to generate comprehensive risk assessments. Features interactive dashboards with real-time risk scoring and explainable AI outputs for compliance teams.",
    evidence: [
      "Multi-modal data fusion pipeline across 3+ data types",
      "Interactive risk visualization dashboard with drill-down",
      "ML-powered risk scoring engine with explainability",
      "Compliance-ready audit trail and reporting",
    ],
    github: "https://github.com/RalphJosehDsouza/MultiModal_Credit_risk_analysis_dashbord",
    live: "#",
    x: 37, y: 6, rotate: 2,
    isNew: false,
  },
  {
    id: "p3", codename: "OPERATION: VISION",
    title: "Deep Learning & Computer Vision", caseNumber: "FILE-003",
    status: "CLOSED", year: "2025", category: "AI/ML",
    tech: ["Jupyter", "Python", "PyTorch", "Computer Vision", "Deep RL"],
    description: "Deep learning and reinforcement learning research project applying state-of-the-art computer vision techniques to complex visual recognition tasks. Implements custom neural network architectures combining convolutional feature extraction with reinforcement learning decision-making for adaptive image analysis.",
    evidence: [
      "Custom CNN architecture for visual recognition tasks",
      "Deep reinforcement learning integration for adaptive processing",
      "Advanced image preprocessing and augmentation pipeline",
      "Benchmark results on standard CV datasets",
    ],
    github: "https://github.com/RalphJosehDsouza/DLRL_miniProject",
    live: "#",
    x: 71, y: 3, rotate: -1,
    isNew: false,
  },
  {
    id: "p4", codename: "OPERATION: UPRISING",
    title: "Odoo Hackathon Platform", caseNumber: "FILE-004",
    status: "ONGOING", year: "2025", category: "FULL STACK",
    tech: ["TypeScript", "Odoo", "Python", "PostgreSQL", "ERP"],
    description: "Full-stack employment management platform built during the high-pressure Odoo Hackathon. Features intelligent job matching, comprehensive candidate profiling, and a data-driven recommendation engine — all integrated within the Odoo ERP ecosystem for enterprise-grade reliability.",
    evidence: [
      "Built under 48-hour hackathon pressure — delivered on time",
      "Full Odoo ERP integration with custom modules",
      "Intelligent candidate-job matching algorithm",
      "Complete CRUD with role-based access control",
    ],
    github: "https://github.com/RalphJosehDsouza/Unemplyment_maxxing",
    live: "#",
    x: 14, y: 37, rotate: 1.5,
    isNew: true,
  },
  {
    id: "p5", codename: "OPERATION: CIPHER",
    title: "Distributed Chat System", caseNumber: "FILE-005",
    status: "CLOSED", year: "2025", category: "FULL STACK",
    tech: ["Python", "Distributed Systems", "WebSockets", "Networking", "Concurrency"],
    description: "Fault-tolerant distributed messaging system implementing consensus protocols for reliable message delivery across multiple server nodes. Features real-time bidirectional communication with automatic failover, message ordering guarantees, and horizontal scalability.",
    evidence: [
      "Consensus-based message ordering across nodes",
      "Automatic failover with zero message loss",
      "Real-time multi-node WebSocket communication",
      "Horizontal scaling architecture with load balancing",
    ],
    github: "https://github.com/RalphJosehDsouza/DISTRiBUTED-CHAT-APPLICATION",
    live: "#",
    x: 54, y: 39, rotate: -2,
    isNew: false,
  },
  {
    id: "p6", codename: "OPERATION: GENESIS",
    title: "AI Question Generator", caseNumber: "FILE-006",
    status: "CLOSED", year: "2025", category: "AUTOMATION",
    tech: ["TypeScript", "LLM / AI", "NLP", "React", "Node.js"],
    description: "LLM-powered intelligent question generation platform that creates contextually relevant questions from any input text or document. Supports multiple question types (MCQ, short answer, analytical), configurable difficulty levels, and educational frameworks for automated assessment creation.",
    evidence: [
      "Multi-format question generation (MCQ, short answer, analytical)",
      "Context-aware difficulty calibration system",
      "LLM-powered NLP pipeline with prompt engineering",
      "Batch processing for large document corpora",
    ],
    github: "https://github.com/RalphJosehDsouza/QuesitongenAI",
    live: "#",
    x: 3, y: 67, rotate: 1,
    isNew: false,
  },
  {
    id: "p7", codename: "OPERATION: PIPELINE",
    title: "YouTube Dual Pipeline System", caseNumber: "FILE-007",
    status: "CLOSED", year: "2025", category: "AUTOMATION",
    tech: ["Jupyter", "Python", "Data Pipeline", "ML", "YouTube API"],
    description: "Dual-pipeline data processing system for YouTube content analysis. Implements parallel processing streams — one for video metadata extraction and cataloging, another for content classification using machine learning — enabling large-scale automated video intelligence.",
    evidence: [
      "Dual parallel processing architecture for throughput",
      "Automated video content classification via ML",
      "Scalable data extraction and cataloging pipeline",
      "YouTube API integration with rate limit management",
    ],
    github: "https://github.com/RalphJosehDsouza/Youtube_Dual_pipleline_System",
    live: "#",
    x: 37, y: 69, rotate: -1.5,
    isNew: false,
  },
  {
    id: "p8", codename: "OPERATION: HUNTER",
    title: "Cold Mail Automation Platform", caseNumber: "FILE-008",
    status: "CLOSED", year: "2025", category: "AUTOMATION",
    tech: ["Python", "Automation", "Email APIs", "Analytics", "Scheduling"],
    description: "Automated cold email outreach platform with intelligent prospect targeting, personalized message generation, and comprehensive campaign analytics. Streamlines professional networking at scale with deliverability optimization, follow-up scheduling, and response tracking.",
    evidence: [
      "Automated multi-step email campaign management",
      "Intelligent prospect targeting and segmentation",
      "Deliverability optimization with warm-up protocols",
      "Real-time campaign analytics and A/B testing",
    ],
    github: "https://github.com/RalphJosehDsouza/cold-mail-hunter",
    live: "#",
    x: 71, y: 66, rotate: 2,
    isNew: false,
  },
];

// SVG connections between board cards (from id → to id, color)
const BOARD_CONNECTIONS = [
  { from: "p1", to: "p2", color: "#c0392b" },    // FL ↔ Credit Risk (ML)
  { from: "p2", to: "p3", color: "#d4922a" },    // Credit Risk ↔ CV (ML)
  { from: "p1", to: "p4", color: "#d4922a" },    // FL ↔ Odoo (TypeScript)
  { from: "p4", to: "p5", color: "#c0392b" },    // Odoo ↔ Chat (Systems)
  { from: "p3", to: "p5", color: "#c0392b" },    // CV ↔ Chat (Python)
  { from: "p5", to: "p8", color: "#d4922a" },    // Chat ↔ Cold Mail (Python)
  { from: "p6", to: "p7", color: "#c0392b" },    // QuestionAI ↔ YouTube (AI/Data)
  { from: "p6", to: "p8", color: "#d4922a" },    // QuestionAI ↔ Cold Mail (Automation)
  { from: "p4", to: "p6", color: "#c0392b" },    // Odoo ↔ QuestionAI (Platforms)
  { from: "p7", to: "p3", color: "#d4922a" },    // YouTube ↔ CV (Data/ML)
];

const EXPERIENCE = [
  {
    id: "e1", company: "MeshNet Electronics LLP",
    role: "Web Development Intern",
    period: "Dec 2025 — Present", location: "Mumbai",
    description: "Built a real-time telemetry dashboard from scratch (JavaScript, Apache ECharts) consuming live REST API sensor data, with frontend data normalization and error-state handling.",
    achievements: [
      "Developed a real-time telemetry dashboard",
      "Integrated live REST API sensor data",
      "Implemented frontend data normalization and robust error handling",
    ],
  },
  {
    id: "e2", company: "HumbleWalking",
    role: "AI Generalist Intern",
    period: "2 Months", location: "Mumbai",
    description: "Applied AI-assisted workflows for SEO/AEO optimization and structured metadata on a live web platform, using AI tools to accelerate content refinement and iterative product improvements.",
    achievements: [
      "Optimized SEO/AEO using AI-assisted workflows",
      "Implemented structured metadata for live web platforms",
      "Accelerated content refinement and product iterations",
    ],
  },
  {
    id: "e3", company: "Game Developers Association, FRCRCE",
    role: "Lead",
    period: "Jul 2025 — Present", location: "Mumbai",
    description: "Lead operations, event planning, and cross-functional coordination for the college's Game Developers Association.",
    achievements: [
      "Directed operations and event planning",
      "Managed cross-functional coordination for tech events",
      "Fostered community engagement within the college",
    ],
  },
];

const EDUCATION = {
  institution: "Fr. Conceicao Rodrigues College of Engineering",
  degree: "B.E. Computer Engineering",
  period: "2023 — 2027",
  location: "Mumbai, India",
  highlights: [
    "Pursuing B.E. Computer Engineering (Graduating 2027)",
    "Podar International School, Mumbai (ISC Higher Secondary — 87.5%, 2021–2023)"
  ],
};

// Category labels for the evidence board
const BOARD_CATEGORIES = [
  { label: "AI & MACHINE LEARNING", x: 3, y: 0.5, rotate: -1 },
  { label: "FULL STACK SYSTEMS", x: 14, y: 33, rotate: 1.5 },
  { label: "DATA & AUTOMATION", x: 3, y: 63, rotate: -0.5 },
];

// ─── Shared UI helpers ────────────────────────────────────────────────────────

function Tack({ color = "#c0392b", delay = 0 }: { color?: string; delay?: number }) {
  return (
    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 pin-drop"
         style={{ animationDelay: `${delay}s` }}>
      <div className="w-5 h-5 rounded-full"
           style={{
             background: `radial-gradient(circle at 35% 32%, ${color}, rgba(0,0,0,0.7))`,
             boxShadow: `0 2px 6px rgba(0,0,0,0.6), 0 0 8px ${color}33`,
           }} />
      <div className="w-1.5 h-2.5 mx-auto"
           style={{ background: "rgba(0,0,0,0.45)", borderRadius: "0 0 3px 3px", marginTop: "-1px" }} />
    </div>
  );
}

function BackBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-2 font-mono text-sm tracking-widest transition-opacity hover:opacity-100 opacity-60"
      style={{ color: "#d4922a", fontFamily: "'Special Elite', serif" }}>
      <ArrowLeft size={14} />
      {label}
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-xs tracking-widest mb-3"
         style={{ color: "#8b1a1a", fontFamily: "'Special Elite', serif", letterSpacing: "0.25em" }}>
      {children}
    </div>
  );
}

function CategoryIcon({ category }: { category: string }) {
  const size = 11;
  const style = { opacity: 0.6 };
  switch (category) {
    case "AI/ML": return <Cpu size={size} style={style} />;
    case "FULL STACK": return <Terminal size={size} style={style} />;
    case "AUTOMATION": return <Zap size={size} style={style} />;
    default: return <Code size={size} style={style} />;
  }
}


// ─── Case File (Main Navigation) ─────────────────────────────────────────────

function CaseFile({ onNavigate }: { onNavigate: (v: View) => void }) {
  const [visible, setVisible] = useState(false);
  const [stamped, setStamped] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 120);
    const t2 = setTimeout(() => setStamped(true), 850);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const navItems: { label: string; icon: React.ReactNode; view: View; desc: string }[] = [
    { label: "PROJECTS",     icon: <Code size={13} />,      view: "evidenceBoard", desc: "Evidence Board — 8 active cases" },
    { label: "PROFILE",      icon: <User size={13} />,      view: "about",         desc: "Subject Dossier — Full Intel" },
    { label: "WORK HISTORY", icon: <Briefcase size={13} />, view: "experience",    desc: "Field Employment Records" },
    { label: "RESUME",       icon: <FileText size={13} />,  view: "resume",        desc: "Full Operative Dossier — PDF" },
    { label: "CONTACT",      icon: <Mail size={13} />,      view: "contact",       desc: "Open a New Channel" },
  ];

  return (
    <div className="fixed inset-0 overflow-y-auto dark-wood">
      {/* Overhead lamp glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
           style={{ width: "600px", height: "500px", background: "radial-gradient(ellipse at 50% 10%, rgba(212,146,42,0.13) 0%, transparent 70%)" }} />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen py-10 px-4">
        {/* Lamp cord hint */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-10 opacity-40"
             style={{ background: "linear-gradient(to bottom, transparent, rgba(212,146,42,0.5))" }} />

        {/* Main case file */}
        <div className="w-full max-w-xl"
             style={{
               opacity: visible ? 1 : 0,
               transform: visible ? "translateY(0)" : "translateY(24px)",
               transition: "opacity 0.7s ease-out, transform 0.7s ease-out",
             }}>

          {/* Folder tab */}
          <div className="inline-flex items-center px-4 py-1.5"
               style={{ background: "#c4a050", borderRadius: "3px 3px 0 0" }}>
            <span className="font-mono text-xs tracking-widest"
                  style={{ color: "#1a1208", fontFamily: "'Special Elite', serif", letterSpacing: "0.2em" }}>
              CASE FILE #{new Date().getFullYear()}
            </span>
          </div>

          {/* Folder body */}
          <div className="p-8 relative"
               style={{
                 background: "linear-gradient(145deg, #d8c8a2 0%, #c8b888 100%)",
                 boxShadow: "0 20px 60px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.12)",
                 border: "1px solid rgba(180,148,72,0.55)",
               }}>

            {/* CLASSIFIED stamp */}
            {stamped && (
              <div className="absolute top-5 right-6 stamp-drop pointer-events-none"
                   style={{
                     border: "2px solid #8b1a1a", color: "#8b1a1a",
                     padding: "3px 10px",
                     fontFamily: "'Special Elite', serif", fontSize: "0.7rem",
                     letterSpacing: "0.3em", opacity: 0.85,
                   }}>
                CLASSIFIED
              </div>
            )}

            {/* Header */}
            <div className="mb-1 font-mono text-xs tracking-widest opacity-60"
                 style={{ color: "#3d2a0a", fontFamily: "'Special Elite', serif", letterSpacing: "0.22em" }}>
              DEPT. OF DIGITAL AFFAIRS — FIELD OPERATIVE
            </div>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              color: "#1a1208", fontSize: "clamp(1.8rem, 4vw, 2.4rem)",
              fontWeight: 900, letterSpacing: "0.06em",
            }}>
              {PERSON.name}
            </h1>
            <div className="mt-1 font-mono text-sm opacity-70"
                 style={{ color: "#3d2a0a", fontFamily: "'Special Elite', serif" }}>
              {PERSON.title} · {PERSON.location}
            </div>

            {/* Divider */}
            <div className="my-5 flex items-center gap-3">
              <span style={{ width: "6px", height: "3px", background: "#5a4a2a", borderRadius: "2px" }} />
              <div className="flex-1 h-px opacity-30" style={{ background: "#5a4a2a" }} />
              <span style={{ width: "6px", height: "3px", background: "#5a4a2a", borderRadius: "2px" }} />
            </div>

            {/* Bio */}
            <p className="mb-7 whitespace-pre-line"
               style={{ color: "#2a1a08", fontFamily: "'Special Elite', serif", fontSize: "0.88rem", lineHeight: 1.85 }}>
              {PERSON.bio}
            </p>

            {/* Quick links */}
            <div className="flex flex-wrap gap-3 mb-6">
              <a href={PERSON.github} target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-1.5 px-3 py-1.5 text-xs transition-opacity hover:opacity-75"
                 style={{ background: "#1a1208", color: "#d4922a", border: "1px solid rgba(212,146,42,0.25)", fontFamily: "'Special Elite', serif", letterSpacing: "0.1em" }}>
                <Github size={11} /> GITHUB
              </a>
              <a href={PERSON.linkedin} target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-1.5 px-3 py-1.5 text-xs transition-opacity hover:opacity-75"
                 style={{ background: "#1a1208", color: "#d4922a", border: "1px solid rgba(212,146,42,0.25)", fontFamily: "'Special Elite', serif", letterSpacing: "0.1em" }}>
                <Linkedin size={11} /> LINKEDIN
              </a>
              <a href={`mailto:${PERSON.email}`}
                 className="flex items-center gap-1.5 px-3 py-1.5 text-xs transition-opacity hover:opacity-75"
                 style={{ background: "#1a1208", color: "#d4922a", border: "1px solid rgba(212,146,42,0.25)", fontFamily: "'Special Elite', serif", letterSpacing: "0.1em" }}>
                <Mail size={11} /> EMAIL
              </a>
            </div>

            {/* Navigation */}
            <SectionLabel>SELECT INVESTIGATION:</SectionLabel>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {navItems.map((item) => (
                <button key={item.view} onClick={() => onNavigate(item.view)}
                  className="group flex items-center gap-3 p-3 text-left noir-btn"
                  style={{ background: "#1a1208", border: "1px solid rgba(212,146,42,0.22)", color: "#d4922a" }}>
                  <span className="opacity-55 group-hover:opacity-100 transition-opacity shrink-0">{item.icon}</span>
                  <div className="min-w-0">
                    <div className="font-mono text-xs tracking-widest"
                         style={{ fontFamily: "'Special Elite', serif", letterSpacing: "0.18em" }}>
                      {item.label}
                    </div>
                    <div className="text-xs opacity-45 mt-0.5 truncate"
                         style={{ fontFamily: "'Special Elite', serif" }}>
                      {item.desc}
                    </div>
                  </div>
                  <ChevronRight size={11} className="ml-auto opacity-25 group-hover:opacity-55 transition-opacity shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Folder bottom strip */}
          <div className="h-2.5" style={{ background: "#b09038", boxShadow: "0 5px 10px rgba(0,0,0,0.45)" }} />
        </div>

        <div className="mt-7 font-mono text-xs opacity-20 tracking-widest text-center"
             style={{ color: "#d4922a", fontFamily: "'Special Elite', serif", letterSpacing: "0.25em" }}>
          UNAUTHORIZED ACCESS IS A FEDERAL OFFENSE
        </div>
      </div>

      <div className="fixed inset-0 vignette" />
      <div className="fixed inset-0 scanlines" />
    </div>
  );
}

// ─── Evidence Board (Enhanced) ───────────────────────────────────────────────

function EvidenceBoard({
  onBack,
  onSelectProject,
}: {
  onBack: () => void;
  onSelectProject: (id: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Card centers in SVG viewBox 0–100 space
  const getCenter = (p: (typeof PROJECTS)[0]) => ({ x: p.x + 11, y: p.y + 13 });

  const tackColors = ["#c0392b", "#d4922a", "#2471a3", "#27ae60"];

  return (
    <div className="fixed inset-0 overflow-y-auto overflow-x-hidden">
      {/* Cork board background */}
      <div className="fixed inset-0 cork-bg">
        {/* Frame — enhanced with double border */}
        <div className="absolute inset-3 pointer-events-none"
             style={{
               border: "10px solid #3d2a0a",
               boxShadow: "inset 0 0 60px rgba(0,0,0,0.6), 0 0 0 2px rgba(200,150,50,0.18), inset 0 0 0 2px rgba(200,150,50,0.1)",
               borderImage: "linear-gradient(145deg, #5a4020, #2a1a0a, #4a3018) 1",
             }} />
        <div className="absolute inset-0 scanlines" />

        {/* Coffee stain decorations */}
        <div className="coffee-stain" style={{ width: "80px", height: "75px", top: "15%", right: "8%" }} />
        <div className="coffee-stain" style={{ width: "60px", height: "55px", bottom: "20%", left: "12%" }} />
        <div className="coffee-stain" style={{ width: "45px", height: "40px", top: "45%", left: "45%" }} />
      </div>

      {/* Board content area — tall enough for 3 rows */}
      <div className="relative" style={{ minHeight: "100vh", zIndex: 5 }}>

        {/* Category labels — small notes pinned to the board */}
        {visible && BOARD_CATEGORIES.map((cat, i) => (
          <div key={cat.label} className="board-note fade-in"
               style={{
                 left: `${cat.x}%`,
                 top: `${cat.y}%`,
                 transform: `rotate(${cat.rotate}deg)`,
                 animationDelay: `${0.2 + i * 0.15}s`,
                 opacity: 0,
                 animationFillMode: "forwards",
               }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ color: "#8b1a1a", fontSize: "0.5rem" }}>■</span>
              {cat.label}
            </div>
          </div>
        ))}

        {/* SVG connection strings */}
        {visible && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none"
               viewBox="0 0 100 100" preserveAspectRatio="none" style={{ zIndex: 6 }}>
            {BOARD_CONNECTIONS.map((conn, i) => {
              const from = PROJECTS.find((p) => p.id === conn.from);
              const to   = PROJECTS.find((p) => p.id === conn.to);
              if (!from || !to) return null;
              const fc = getCenter(from);
              const tc = getCenter(to);
              const mx = (fc.x + tc.x) / 2;
              const my = (fc.y + tc.y) / 2 - 4;
              const isActive = hovered === conn.from || hovered === conn.to;
              return (
                <path key={i}
                  d={`M ${fc.x} ${fc.y} Q ${mx} ${my} ${tc.x} ${tc.y}`}
                  fill="none"
                  stroke={conn.color}
                  strokeWidth={isActive ? "0.45" : "0.22"}
                  strokeOpacity={isActive ? 0.95 : 0.45}
                  className="draw-string"
                  style={{
                    animationDelay: `${0.3 + i * 0.2}s`,
                    transition: "stroke-width 0.3s, stroke-opacity 0.3s",
                    filter: isActive ? `drop-shadow(0 0 3px ${conn.color}66)` : "none",
                  }}
                />
              );
            })}
          </svg>
        )}

        {/* Project cards — enhanced */}
        {PROJECTS.map((project, i) => (
          <div key={project.id}
            className="absolute evidence-card"
            style={{
              left: `${project.x}%`,
              top: `${project.y}%`,
              width: "22%",
              minWidth: "200px",
              transform: `rotate(${project.rotate}deg)`,
              zIndex: hovered === project.id ? 18 : 10,
              opacity: visible ? 1 : 0,
              transition: `opacity 0.5s ${0.1 + i * 0.1}s`,
            }}
            onMouseEnter={() => setHovered(project.id)}
            onMouseLeave={() => setHovered(null)}>

            <Tack color={tackColors[i % 4]} delay={0.4 + i * 0.1} />

            {/* NEW LEAD ribbon for recent projects */}
            {project.isNew && (
              <div className="ribbon-badge">
                <span>NEW LEAD</span>
              </div>
            )}

            {/* ONGOING ribbon for active projects */}
            {project.status === "ONGOING" && !project.isNew && (
              <div className="ribbon-badge">
                <span style={{ background: "#b8860b" }}>ACTIVE</span>
              </div>
            )}

            <div onClick={() => onSelectProject(project.id)}
              style={{
                background: "#e0d0a8",
                boxShadow: hovered === project.id
                  ? "4px 6px 22px rgba(0,0,0,0.65), 0 0 15px rgba(212,146,42,0.15)"
                  : "3px 5px 16px rgba(0,0,0,0.55)",
                cursor: "pointer",
                transform: hovered === project.id
                  ? `rotate(${-project.rotate * 0.7}deg) scale(1.06) translateY(-4px)`
                  : "none",
                transition: "transform 0.3s cubic-bezier(.25,.46,.45,.94), box-shadow 0.3s ease",
              }}>

              {/* Card header */}
              <div className="px-3 py-2"
                   style={{ background: "#1a1208", borderBottom: "1px solid rgba(212,146,42,0.28)" }}>
                <div className="flex items-center justify-between">
                  <div className="font-mono text-xs opacity-50"
                       style={{ color: "#d4922a", fontFamily: "'Special Elite', serif", fontSize: "0.55rem", letterSpacing: "0.18em" }}>
                    {project.caseNumber}
                  </div>
                  <CategoryIcon category={project.category} />
                </div>
                <div className="font-mono text-xs mt-0.5"
                     style={{ color: "#d4922a", fontFamily: "'Special Elite', serif", fontSize: "0.62rem", letterSpacing: "0.12em" }}>
                  {project.codename}
                </div>
              </div>

              {/* Card body */}
              <div className="px-3 py-2.5" style={{ background: "#d4c49a" }}>
                <div className="font-bold mb-1.5"
                     style={{ fontFamily: "'Playfair Display', serif", color: "#1a1208", fontSize: "0.8rem", lineHeight: 1.3 }}>
                  {project.title}
                </div>
                <p style={{ color: "#3d2a0a", fontFamily: "'Special Elite', serif", fontSize: "0.58rem", lineHeight: 1.55 }}>
                  {project.description.slice(0, 110)}…
                </p>

                {/* Tech tags — show all */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {project.tech.slice(0, 3).map((t) => (
                    <span key={t} className="font-mono"
                          style={{ background: "#1a1208", color: "#d4922a", fontSize: "0.45rem", padding: "1px 5px", letterSpacing: "0.05em" }}>
                      {t}
                    </span>
                  ))}
                  {project.tech.length > 3 && (
                    <span className="font-mono"
                          style={{ color: "#5a4a2a", fontSize: "0.45rem", padding: "1px 2px" }}>
                      +{project.tech.length - 3}
                    </span>
                  )}
                </div>

                {/* Status + year + github */}
                <div className="flex items-center justify-between mt-2">
                  <span className="font-mono"
                        style={{ color: project.status === "CLOSED" ? "#2d6b2d" : "#8b1a1a", fontFamily: "'Special Elite', serif", fontSize: "0.55rem" }}>
                    ● {project.status}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono" style={{ color: "#5a4a2a", fontSize: "0.55rem" }}>
                      {project.year}
                    </span>
                    <a href={project.github} target="_blank" rel="noopener noreferrer"
                       onClick={(e) => e.stopPropagation()}
                       className="opacity-40 hover:opacity-80 transition-opacity"
                       style={{ color: "#3d2a0a" }}>
                      <Github size={10} />
                    </a>
                  </div>
                </div>
              </div>

              {/* Hover CTA */}
              {hovered === project.id && (
                <div className="text-center py-1.5 font-mono fade-in"
                     style={{ background: "#8b1a1a", color: "#e8dcc8", fontSize: "0.58rem", letterSpacing: "0.22em" }}>
                  ▶ OPEN CASE FILE
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Header bar */}
        <div className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4"
             style={{ background: "linear-gradient(to bottom, rgba(10,8,5,0.95) 0%, rgba(10,8,5,0.8) 60%, transparent 100%)" }}>
          <BackBtn label="BACK TO FILE" onClick={onBack} />
          <div className="font-mono text-xs opacity-35 tracking-widest hidden sm:block"
               style={{ color: "#d4922a", fontFamily: "'Special Elite', serif" }}>
            EVIDENCE BOARD — PROJECTS DIVISION
          </div>
          <div className="font-mono text-xs opacity-50 tracking-widest"
               style={{ color: "#8b1a1a", fontFamily: "'Special Elite', serif" }}>
            {PROJECTS.length} CASES ON FILE
          </div>
        </div>

        {/* Board legend — bottom left */}
        <div className="fixed bottom-6 left-6 z-20 p-3"
             style={{
               background: "rgba(26,18,8,0.92)",
               border: "1px solid rgba(212,146,42,0.2)",
               backdropFilter: "blur(4px)",
             }}>
          <div className="font-mono text-xs mb-2 opacity-50 tracking-widest"
               style={{ color: "#d4922a", fontFamily: "'Special Elite', serif", fontSize: "0.5rem", letterSpacing: "0.2em" }}>
            CASE STATUS LEGEND
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span style={{ color: "#2d6b2d", fontSize: "0.6rem" }}>●</span>
              <span className="font-mono" style={{ color: "#7a6a50", fontSize: "0.5rem", fontFamily: "'Special Elite', serif" }}>CLOSED — Complete</span>
            </div>
            <div className="flex items-center gap-2">
              <span style={{ color: "#8b1a1a", fontSize: "0.6rem" }}>●</span>
              <span className="font-mono" style={{ color: "#7a6a50", fontSize: "0.5rem", fontFamily: "'Special Elite', serif" }}>ONGOING — Active</span>
            </div>
            <div className="flex items-center gap-2">
              <span style={{ color: "#d4922a", fontSize: "0.6rem" }}>●</span>
              <span className="font-mono" style={{ color: "#7a6a50", fontSize: "0.5rem", fontFamily: "'Special Elite', serif" }}>NEW LEAD — Recent</span>
            </div>
          </div>
        </div>

        {/* Bottom watermark */}
        <div className="fixed bottom-7 right-8 font-mono text-xs opacity-20 pointer-events-none z-20"
             style={{ color: "#d4922a", fontFamily: "'Special Elite', serif", letterSpacing: "0.2em" }}>
          RESTRICTED ACCESS — DO NOT REMOVE
        </div>
      </div>
    </div>
  );
}

// ─── Project Detail ───────────────────────────────────────────────────────────

function ProjectDetail({ projectId, onBack }: { projectId: string; onBack: () => void }) {
  const project = PROJECTS.find((p) => p.id === projectId);
  const [stamped, setStamped] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStamped(true), 700);
    return () => clearTimeout(t);
  }, [projectId]);

  if (!project) return null;

  // Find connected projects
  const connectedIds = BOARD_CONNECTIONS
    .filter(c => c.from === projectId || c.to === projectId)
    .map(c => c.from === projectId ? c.to : c.from);
  const connectedProjects = PROJECTS.filter(p => connectedIds.includes(p.id));

  return (
    <div className="fixed inset-0 overflow-y-auto" style={{ background: "#0a0805" }}>
      {/* Subtle cork texture bleed */}
      <div className="fixed inset-0 pointer-events-none opacity-10 cork-bg" />
      <div className="fixed inset-0 scanlines" />

      <div className="relative z-10 max-w-4xl mx-auto px-5 py-8">
        <BackBtn label="BACK TO BOARD" onClick={onBack} />

        <div className="mt-8 p-8 relative paper-bg"
             style={{ boxShadow: "0 24px 70px rgba(0,0,0,0.85)", border: "1px solid rgba(180,150,80,0.35)" }}>

          {/* Stamp */}
          {stamped && (
            <div className="absolute top-6 right-7 stamp-drop pointer-events-none"
                 style={{
                   border: "2.5px solid #8b1a1a", color: "#8b1a1a",
                   padding: "4px 12px",
                   fontFamily: "'Special Elite', serif", fontSize: "1rem",
                   letterSpacing: "0.28em", opacity: 0.82,
                 }}>
              {project.status}
            </div>
          )}

          {/* Header */}
          <div className="mb-6 pb-5" style={{ borderBottom: "2px solid rgba(58,42,8,0.5)" }}>
            <div className="flex items-center gap-3 mb-1">
              <div className="font-mono text-xs"
                   style={{ color: "#5a4a2a", fontFamily: "'Special Elite', serif", letterSpacing: "0.22em" }}>
                {project.caseNumber} — FIELD REPORT — CLASSIFIED
              </div>
              <span className="px-2 py-0.5 text-xs"
                    style={{
                      background: "rgba(139,26,26,0.15)",
                      color: "#8b1a1a",
                      border: "1px solid rgba(139,26,26,0.3)",
                      fontFamily: "'Special Elite', serif",
                      fontSize: "0.6rem",
                      letterSpacing: "0.1em",
                    }}>
                {project.category}
              </span>
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", color: "#1a1208", fontSize: "clamp(1.8rem, 4vw, 2.4rem)", fontWeight: 700 }}>
              {project.title}
            </h1>
            <div className="font-mono text-sm mt-1"
                 style={{ color: "#5a4a2a", fontFamily: "'Special Elite', serif" }}>
              CODENAME: {project.codename} · {project.year}
            </div>
          </div>

          {/* Body grid */}
          <div className="grid gap-8" style={{ gridTemplateColumns: "1fr 1fr" }}>
            {/* Left */}
            <div>
              <SectionLabel>CASE SUMMARY</SectionLabel>
              <p style={{ color: "#2a1a08", fontFamily: "'Special Elite', serif", lineHeight: 1.8, fontSize: "0.9rem" }}>
                {project.description}
              </p>

              <div className="mt-6">
                <SectionLabel>EVIDENCE COLLECTED</SectionLabel>
                {project.evidence.map((e, i) => (
                  <div key={i} className="flex items-start gap-2.5 mb-2.5">
                    <span style={{ color: "#8b1a1a", fontSize: "0.6rem", marginTop: "0.28rem", flexShrink: 0 }}>◆</span>
                    <span style={{ color: "#2a1a08", fontFamily: "'Special Elite', serif", fontSize: "0.88rem", lineHeight: 1.65 }}>
                      {e}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right */}
            <div>
              <SectionLabel>TOOLS & METHODS</SectionLabel>
              <div className="flex flex-wrap gap-2 mb-7">
                {project.tech.map((t) => (
                  <span key={t} className="font-mono px-2.5 py-1 text-xs"
                        style={{ background: "#1a1208", color: "#d4922a", letterSpacing: "0.06em" }}>
                    {t}
                  </span>
                ))}
              </div>

              <SectionLabel>CASE STATUS</SectionLabel>
              <div className="font-mono text-lg mb-6"
                   style={{ color: project.status === "CLOSED" ? "#2d6b2d" : "#8b1a1a", fontFamily: "'Playfair Display', serif" }}>
                {project.status}
              </div>

              <div className="flex flex-wrap gap-3 mb-7">
                <a href={project.github} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-2 px-4 py-2.5 font-mono text-xs transition-opacity hover:opacity-75"
                   style={{ background: "#1a1208", color: "#d4922a", border: "1px solid rgba(212,146,42,0.35)", letterSpacing: "0.15em" }}>
                  <Github size={13} /> SOURCE CODE
                </a>
                {project.live !== "#" && (
                  <a href={project.live} target="_blank" rel="noopener noreferrer"
                     className="flex items-center gap-2 px-4 py-2.5 font-mono text-xs transition-opacity hover:opacity-75"
                     style={{ background: "#8b1a1a", color: "#e8dcc8", border: "1px solid rgba(139,26,26,0.5)", letterSpacing: "0.15em" }}>
                    <ExternalLink size={13} /> LIVE CASE
                  </a>
                )}
              </div>

              {/* Cross-references to connected projects */}
              {connectedProjects.length > 0 && (
                <div>
                  <SectionLabel>CROSS-REFERENCED CASES</SectionLabel>
                  <div className="space-y-2">
                    {connectedProjects.map(cp => (
                      <div key={cp.id} className="flex items-center gap-2 p-2"
                           style={{ background: "rgba(26,18,8,0.5)", border: "1px solid rgba(212,146,42,0.15)" }}>
                        <span style={{ color: "#8b1a1a", fontSize: "0.5rem" }}>◆</span>
                        <div>
                          <div className="font-mono text-xs" style={{ color: "#d4922a", fontFamily: "'Special Elite', serif", fontSize: "0.6rem", letterSpacing: "0.1em" }}>
                            {cp.caseNumber} — {cp.codename}
                          </div>
                          <div style={{ color: "#7a6a50", fontFamily: "'Special Elite', serif", fontSize: "0.65rem" }}>
                            {cp.title}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Case number footer */}
          <div className="mt-8 pt-4 flex items-center justify-between"
               style={{ borderTop: "1px solid rgba(90,74,42,0.3)" }}>
            <div className="font-mono text-xs opacity-40"
                 style={{ color: "#5a4a2a", fontFamily: "'Special Elite', serif" }}>
              DOCUMENT CLASSIFICATION: LEVEL 3 — RESTRICTED
            </div>
            <div className="font-mono text-xs opacity-40"
                 style={{ color: "#5a4a2a", fontFamily: "'Special Elite', serif" }}>
              {project.caseNumber}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── About / Profile ─────────────────────────────────────────────────────────

function AboutFile({ onBack }: { onBack: () => void }) {
  const [stamped, setStamped] = useState(false);
  useEffect(() => { const t = setTimeout(() => setStamped(true), 550); return () => clearTimeout(t); }, []);

  return (
    <div className="fixed inset-0 overflow-y-auto" style={{ background: "#0a0805" }}>
      <div className="fixed inset-0 scanlines" />
      <div className="relative z-10 max-w-5xl mx-auto px-5 py-8">
        <BackBtn label="BACK TO FILE" onClick={onBack} />

        <div className="mt-6 mb-4 font-mono text-xs opacity-35 tracking-widest"
             style={{ color: "#d4922a", fontFamily: "'Special Elite', serif", letterSpacing: "0.3em" }}>
          PERSONNEL FILE — CLASSIFIED — EYES ONLY
        </div>

        <div className="grid gap-7" style={{ gridTemplateColumns: "280px 1fr" }}>
          {/* Left column: classified photo + ID */}
          <div className="space-y-5">
            {/* Classified photo placeholder — noir themed */}
            <div className="relative"
                 style={{ background: "#d4c49a", padding: "10px", boxShadow: "5px 5px 22px rgba(0,0,0,0.65)" }}>
              {stamped && (
                <div className="absolute -top-2 -right-2 z-10 stamp-drop"
                     style={{
                       background: "#8b1a1a", color: "#e8dcc8",
                       padding: "2px 7px",
                       fontFamily: "'Special Elite', serif", fontSize: "0.55rem",
                       letterSpacing: "0.22em", transform: "rotate(10deg)",
                     }}>
                  CLASSIFIED
                </div>
              )}
              {/* Noir silhouette photo */}
              <div style={{
                width: "100%", aspectRatio: "3/4",
                background: "linear-gradient(180deg, #0d0a06 0%, #1a1208 40%, #2a1a08 70%, #1a1208 100%)",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                position: "relative", overflow: "hidden",
              }}>
                {/* Silhouette icon */}
                <div style={{
                  width: "80px", height: "80px", borderRadius: "50%",
                  background: "linear-gradient(145deg, #2a2010, #1a1208)",
                  border: "2px solid rgba(212,146,42,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: "12px",
                }}>
                  <User size={36} style={{ color: "rgba(212,146,42,0.35)" }} />
                </div>
                <div style={{
                  fontFamily: "'Special Elite', serif", fontSize: "0.6rem",
                  color: "rgba(212,146,42,0.4)", letterSpacing: "0.25em",
                  textAlign: "center",
                }}>
                  PHOTOGRAPH<br/>REDACTED
                </div>
                {/* Scanline overlay */}
                <div className="absolute inset-0" style={{
                  backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 3px)",
                  pointerEvents: "none",
                }} />
              </div>
              <div className="text-center font-mono mt-2 opacity-50"
                   style={{ color: "#5a4a2a", fontSize: "0.6rem", fontFamily: "'Special Elite', serif", letterSpacing: "0.2em" }}>
                SUBJECT PHOTOGRAPH
              </div>
            </div>

            {/* Identity card */}
            <div className="p-4 space-y-2"
                 style={{ background: "#1a1208", border: "1px solid rgba(212,146,42,0.25)" }}>
              <div className="font-mono text-xs opacity-45 tracking-widest"
                   style={{ color: "#d4922a", fontFamily: "'Special Elite', serif" }}>
                OPERATIVE IDENTITY
              </div>
              <div style={{ fontFamily: "'Playfair Display', serif", color: "#d4922a", fontSize: "1.3rem", fontWeight: 700 }}>
                {PERSON.name}
              </div>
              <div className="font-mono text-xs opacity-60"
                   style={{ color: "#c8b89a", fontFamily: "'Special Elite', serif" }}>
                {PERSON.title}
              </div>
              <div className="pt-2 space-y-1.5">
                {[
                  { icon: <MapPin size={9} />, val: PERSON.location },
                  { icon: <Mail size={9} />, val: PERSON.email },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 font-mono"
                       style={{ color: "#7a6a50", fontSize: "0.65rem", fontFamily: "'Special Elite', serif" }}>
                    <span className="opacity-60">{item.icon}</span>
                    {item.val}
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <a href={PERSON.github} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-1.5 font-mono text-xs transition-opacity hover:opacity-75"
                   style={{ color: "#d4922a", fontFamily: "'Special Elite', serif", fontSize: "0.65rem" }}>
                  <Github size={10} /> GITHUB
                </a>
                <a href={PERSON.linkedin} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-1.5 font-mono text-xs transition-opacity hover:opacity-75"
                   style={{ color: "#d4922a", fontFamily: "'Special Elite', serif", fontSize: "0.65rem" }}>
                  <Linkedin size={10} /> LINKEDIN
                </a>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-5">
            {/* Bio */}
            <div className="p-6 paper-bg"
                 style={{ boxShadow: "3px 5px 18px rgba(0,0,0,0.5)" }}>
              <SectionLabel>SUBJECT PROFILE</SectionLabel>
              <p className="whitespace-pre-line"
                 style={{ color: "#2a1a08", fontFamily: "'Special Elite', serif", lineHeight: 1.85, fontSize: "0.9rem" }}>
                {PERSON.bio}
              </p>
            </div>

            {/* Skills */}
            <div className="p-5" style={{ background: "#1a1208", border: "1px solid rgba(212,146,42,0.22)" }}>
              <SectionLabel>KNOWN CAPABILITIES</SectionLabel>
              <div className="flex flex-wrap gap-2">
                {PERSON.skills.map((skill) => (
                  <span key={skill} className="px-3 py-1 font-mono text-xs border"
                        style={{
                          borderColor: "rgba(212,146,42,0.3)",
                          color: "#d4922a", background: "rgba(212,146,42,0.06)",
                          fontFamily: "'Special Elite', serif", letterSpacing: "0.06em",
                        }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Tools */}
            <div className="p-5" style={{ background: "#1a1208", border: "1px solid rgba(212,146,42,0.22)" }}>
              <SectionLabel>TOOLS OF THE TRADE</SectionLabel>
              <div className="flex flex-wrap gap-2">
                {PERSON.tools.map((tool) => (
                  <span key={tool} className="px-3 py-1 font-mono text-xs"
                        style={{
                          background: "rgba(139,26,26,0.18)",
                          color: "#e07070",
                          border: "1px solid rgba(139,26,26,0.38)",
                          fontFamily: "'Special Elite', serif",
                        }}>
                    {tool}
                  </span>
                ))}
              </div>
            </div>

            {/* GitHub Projects Summary */}
            <div className="p-5" style={{ background: "#1a1208", border: "1px solid rgba(212,146,42,0.22)" }}>
              <SectionLabel>ACTIVE OPERATIONS SUMMARY</SectionLabel>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3" style={{ background: "rgba(212,146,42,0.06)", border: "1px solid rgba(212,146,42,0.15)" }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", color: "#d4922a", fontSize: "1.6rem", fontWeight: 700 }}>
                    {PROJECTS.length}
                  </div>
                  <div className="font-mono text-xs mt-1 opacity-50" style={{ color: "#c8b89a", fontFamily: "'Special Elite', serif", fontSize: "0.55rem" }}>
                    CASES ON FILE
                  </div>
                </div>
                <div className="text-center p-3" style={{ background: "rgba(212,146,42,0.06)", border: "1px solid rgba(212,146,42,0.15)" }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", color: "#d4922a", fontSize: "1.6rem", fontWeight: 700 }}>
                    {PROJECTS.filter(p => p.status === "CLOSED").length}
                  </div>
                  <div className="font-mono text-xs mt-1 opacity-50" style={{ color: "#c8b89a", fontFamily: "'Special Elite', serif", fontSize: "0.55rem" }}>
                    CASES CLOSED
                  </div>
                </div>
                <div className="text-center p-3" style={{ background: "rgba(139,26,26,0.08)", border: "1px solid rgba(139,26,26,0.2)" }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", color: "#e07070", fontSize: "1.6rem", fontWeight: 700 }}>
                    {PROJECTS.filter(p => p.status === "ONGOING").length}
                  </div>
                  <div className="font-mono text-xs mt-1 opacity-50" style={{ color: "#c8b89a", fontFamily: "'Special Elite', serif", fontSize: "0.55rem" }}>
                    ACTIVE OPS
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Experience ───────────────────────────────────────────────────────────────

function ExperienceFile({ onBack }: { onBack: () => void }) {
  return (
    <div className="fixed inset-0 overflow-y-auto" style={{ background: "#0a0805" }}>
      <div className="fixed inset-0 scanlines" />
      <div className="relative z-10 max-w-3xl mx-auto px-5 py-8">
        <BackBtn label="BACK TO FILE" onClick={onBack} />

        <div className="mt-8 mb-2 font-mono text-xs opacity-35 tracking-widest"
             style={{ color: "#d4922a", fontFamily: "'Special Elite', serif", letterSpacing: "0.3em" }}>
          EMPLOYMENT RECORDS — FIELD OPERATIVE
        </div>
        <h1 className="mb-10"
            style={{ fontFamily: "'Playfair Display', serif", color: "#d4922a", fontSize: "clamp(1.8rem, 4vw, 2.5rem)" }}>
          Work History
        </h1>

        <div className="relative">
          {/* Timeline spine */}
          <div className="absolute left-5 top-0 bottom-0 w-px"
               style={{ background: "linear-gradient(to bottom, rgba(212,146,42,0.4), rgba(212,146,42,0.1))" }} />

          {EXPERIENCE.map((exp, i) => (
            <div key={exp.id} className="relative pl-16 mb-9 fade-in-up"
                 style={{ animationDelay: `${i * 0.18}s` }}>
              {/* Timeline dot */}
              <div className="absolute left-3.5 top-4 w-3 h-3 rounded-full border-2"
                   style={{ background: "#0a0805", borderColor: "#d4922a", transform: "translateX(-50%)" }} />

              <div className="p-6"
                   style={{ background: "#1a1208", border: "1px solid rgba(212,146,42,0.2)", boxShadow: "3px 5px 15px rgba(0,0,0,0.45)" }}>
                <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#d4922a", fontSize: "1.2rem" }}>
                      {exp.company}
                    </h3>
                    <div className="font-mono text-xs mt-0.5"
                         style={{ color: "#c8b89a", fontFamily: "'Special Elite', serif", letterSpacing: "0.1em" }}>
                      {exp.role}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono text-xs opacity-60"
                         style={{ color: "#d4922a", fontFamily: "'Special Elite', serif" }}>
                      {exp.period}
                    </div>
                    <div className="font-mono text-xs opacity-40 mt-0.5"
                         style={{ color: "#d4922a", fontFamily: "'Special Elite', serif" }}>
                      {exp.location}
                    </div>
                  </div>
                </div>

                <p className="text-sm mb-4"
                   style={{ color: "#7a6a50", fontFamily: "'Special Elite', serif", lineHeight: 1.75 }}>
                  {exp.description}
                </p>

                <div className="space-y-2">
                  {exp.achievements.map((a, j) => (
                    <div key={j} className="flex items-start gap-2.5">
                      <span style={{ color: "#d4922a", fontSize: "0.55rem", marginTop: "0.38rem", flexShrink: 0 }}>◆</span>
                      <span className="text-sm"
                            style={{ color: "#c8b89a", fontFamily: "'Special Elite', serif", lineHeight: 1.6 }}>
                        {a}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Education Section */}
        <div className="mt-4 mb-6">
          <div className="font-mono text-xs opacity-35 tracking-widest mb-6"
               style={{ color: "#d4922a", fontFamily: "'Special Elite', serif", letterSpacing: "0.3em" }}>
            ACADEMIC RECORD
          </div>
          <div className="relative pl-16">
            <div className="absolute left-3.5 top-4 w-3 h-3 rounded-full"
                 style={{ background: "#d4922a", transform: "translateX(-50%)" }} />
            <div className="p-6"
                 style={{ background: "#1a1208", border: "1px solid rgba(212,146,42,0.2)", boxShadow: "3px 5px 15px rgba(0,0,0,0.45)" }}>
              <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                <div>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#d4922a", fontSize: "1.2rem" }}>
                    {EDUCATION.institution}
                  </h3>
                  <div className="font-mono text-xs mt-0.5"
                       style={{ color: "#c8b89a", fontFamily: "'Special Elite', serif", letterSpacing: "0.1em" }}>
                    {EDUCATION.degree}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono text-xs opacity-60"
                       style={{ color: "#d4922a", fontFamily: "'Special Elite', serif" }}>
                    {EDUCATION.period}
                  </div>
                  <div className="font-mono text-xs opacity-40 mt-0.5"
                       style={{ color: "#d4922a", fontFamily: "'Special Elite', serif" }}>
                    {EDUCATION.location}
                  </div>
                </div>
              </div>
              <div className="space-y-2 mt-3">
                {EDUCATION.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span style={{ color: "#d4922a", fontSize: "0.55rem", marginTop: "0.38rem", flexShrink: 0 }}>◆</span>
                    <span className="text-sm"
                          style={{ color: "#c8b89a", fontFamily: "'Special Elite', serif", lineHeight: 1.6 }}>
                      {h}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Resume ───────────────────────────────────────────────────────────────────

function ResumeView({ onBack }: { onBack: () => void }) {
  return (
    <div className="fixed inset-0 overflow-y-auto" style={{ background: "#0a0805" }}>
      <div className="fixed inset-0 scanlines" />
      <div className="relative z-10 max-w-4xl mx-auto px-5 py-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-8">
          <BackBtn label="BACK TO FILE" onClick={onBack} />
          <a href="/docs/Resume_Ralph_Joseph_Dsouza.pdf" download="Resume_Ralph_Joseph_Dsouza.pdf"
             className="flex items-center gap-2 px-4 py-2.5 font-mono text-xs transition-all hover:opacity-75 hover:scale-105"
             style={{ background: "#8b1a1a", color: "#e8dcc8", border: "1px solid rgba(139,26,26,0.5)", letterSpacing: "0.15em" }}>
            <Download size={13} /> DOWNLOAD DOSSIER
          </a>
        </div>

        {/* Resume document */}
        <div className="p-10 paper-bg"
             style={{ boxShadow: "0 24px 70px rgba(0,0,0,0.85)" }}>

          {/* Letterhead */}
          <div className="text-center pb-6 mb-6" style={{ borderBottom: "2px solid rgba(58,42,8,0.5)" }}>
            <h1 style={{ fontFamily: "'Playfair Display', serif", color: "#1a1208", fontSize: "2.4rem", letterSpacing: "0.1em", fontWeight: 900 }}>
              {PERSON.name}
            </h1>
            <div className="font-mono text-sm mt-1"
                 style={{ color: "#5a4a2a", fontFamily: "'Special Elite', serif" }}>
              {PERSON.title}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-3">
              {[
                PERSON.email,
                PERSON.location,
                "github.com/RalphJosehDsouza",
              ].map((val, i) => (
                <span key={i} className="font-mono text-xs"
                      style={{ color: "#5a4a2a", fontFamily: "'Special Elite', serif" }}>
                  {val}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
              <a href={PERSON.linkedin} target="_blank" rel="noopener noreferrer"
                 className="font-mono text-xs hover:opacity-75 transition-opacity"
                 style={{ color: "#3d6b8b", fontFamily: "'Special Elite', serif" }}>
                linkedin.com/in/ralph-joseph-dsouza
              </a>
            </div>
          </div>

          {/* Experience section */}
          <div className="mb-7">
            <h2 className="font-mono text-xs tracking-widest mb-4 pb-1"
                style={{ color: "#8b1a1a", borderBottom: "1px solid rgba(139,26,26,0.4)", fontFamily: "'Special Elite', serif", letterSpacing: "0.28em" }}>
              FIELD EXPERIENCE
            </h2>
            {EXPERIENCE.map((exp) => (
              <div key={exp.id} className="mb-5">
                <div className="flex flex-wrap items-baseline justify-between mb-1 gap-2">
                  <div>
                    <span style={{ fontFamily: "'Playfair Display', serif", color: "#1a1208", fontWeight: 700, fontSize: "1rem" }}>
                      {exp.company}
                    </span>
                    <span className="mx-2" style={{ color: "#5a4a2a" }}>—</span>
                    <span className="font-mono text-sm"
                          style={{ color: "#3d2a0a", fontFamily: "'Special Elite', serif" }}>
                      {exp.role}
                    </span>
                  </div>
                  <span className="font-mono text-xs shrink-0"
                        style={{ color: "#5a4a2a", fontFamily: "'Special Elite', serif" }}>
                    {exp.period}
                  </span>
                </div>
                {exp.achievements.map((a, i) => (
                  <div key={i} className="flex items-start gap-2 ml-3">
                    <span style={{ color: "#8b1a1a", flexShrink: 0, marginTop: "0.25rem" }}>·</span>
                    <span className="text-sm"
                          style={{ color: "#2a1a08", fontFamily: "'Special Elite', serif", lineHeight: 1.65 }}>
                      {a}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Key Projects section */}
          <div className="mb-7">
            <h2 className="font-mono text-xs tracking-widest mb-4 pb-1"
                style={{ color: "#8b1a1a", borderBottom: "1px solid rgba(139,26,26,0.4)", fontFamily: "'Special Elite', serif", letterSpacing: "0.28em" }}>
              KEY OPERATIONS
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {PROJECTS.slice(0, 4).map((p) => (
                <div key={p.id} className="mb-2">
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <span style={{ fontFamily: "'Playfair Display', serif", color: "#1a1208", fontWeight: 700, fontSize: "0.9rem" }}>
                      {p.title}
                    </span>
                  </div>
                  <p className="text-xs ml-3"
                     style={{ color: "#3d2a0a", fontFamily: "'Special Elite', serif", lineHeight: 1.5 }}>
                    {p.description.slice(0, 100)}…
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1 ml-3">
                    {p.tech.slice(0, 3).map(t => (
                      <span key={t} className="text-xs"
                            style={{ color: "#5a4a2a", fontFamily: "'Special Elite', serif", fontSize: "0.6rem" }}>
                        {t}{" · "}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skills section */}
          <div className="mb-7">
            <h2 className="font-mono text-xs tracking-widest mb-4 pb-1"
                style={{ color: "#8b1a1a", borderBottom: "1px solid rgba(139,26,26,0.4)", fontFamily: "'Special Elite', serif", letterSpacing: "0.28em" }}>
              CAPABILITIES
            </h2>
            <div className="grid grid-cols-3 gap-x-6 gap-y-1.5">
              {PERSON.skills.map((skill) => (
                <div key={skill} className="font-mono text-sm"
                     style={{ color: "#2a1a08", fontFamily: "'Special Elite', serif" }}>
                  · {skill}
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div>
            <h2 className="font-mono text-xs tracking-widest mb-4 pb-1"
                style={{ color: "#8b1a1a", borderBottom: "1px solid rgba(139,26,26,0.4)", fontFamily: "'Special Elite', serif", letterSpacing: "0.28em" }}>
              ACADEMIC RECORD
            </h2>
            <div className="flex flex-wrap items-baseline justify-between">
              <div>
                <span style={{ fontFamily: "'Playfair Display', serif", color: "#1a1208", fontWeight: 700 }}>
                  {EDUCATION.institution}
                </span>
                <span className="mx-2" style={{ color: "#5a4a2a" }}>—</span>
                <span className="font-mono text-sm" style={{ color: "#3d2a0a", fontFamily: "'Special Elite', serif" }}>
                  {EDUCATION.degree}
                </span>
              </div>
              <span className="font-mono text-xs shrink-0"
                    style={{ color: "#5a4a2a", fontFamily: "'Special Elite', serif" }}>
                {EDUCATION.period}
              </span>
            </div>
            <div className="mt-2 ml-3 space-y-1">
              {EDUCATION.highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span style={{ color: "#8b1a1a", flexShrink: 0, marginTop: "0.25rem" }}>·</span>
                  <span className="text-sm"
                        style={{ color: "#2a1a08", fontFamily: "'Special Elite', serif", lineHeight: 1.65 }}>
                    {h}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer stamp */}
          <div className="mt-8 pt-4 flex items-center justify-between"
               style={{ borderTop: "1px dashed rgba(90,74,42,0.35)" }}>
            <div className="font-mono text-xs opacity-35"
                 style={{ color: "#5a4a2a", fontFamily: "'Special Elite', serif" }}>
              DOCUMENT CLASSIFICATION: PERSONNEL — RESTRICTED
            </div>
            <div className="font-mono text-xs opacity-35"
                 style={{ color: "#5a4a2a", fontFamily: "'Special Elite', serif" }}>
              REV. {new Date().getFullYear()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Contact ──────────────────────────────────────────────────────────────────

function ContactView({ onBack }: { onBack: () => void }) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
         style={{ background: "#050302" }}>
      <div className="fixed inset-0 scanlines" />

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none"
           style={{ background: "radial-gradient(ellipse at 50% 38%, rgba(212,146,42,0.07) 0%, transparent 62%)" }} />

      <button onClick={onBack}
        className="absolute top-6 left-6 z-10 flex items-center gap-2 font-mono text-sm tracking-widest opacity-50 hover:opacity-90 transition-opacity"
        style={{ color: "#d4922a", fontFamily: "'Special Elite', serif" }}>
        <ArrowLeft size={14} />
        BACK
      </button>

      <div className="relative z-10 text-center max-w-2xl px-8">
        <div className="font-mono text-xs mb-10 opacity-25 tracking-widest"
             style={{ color: "#d4922a", fontFamily: "'Special Elite', serif", letterSpacing: "0.4em" }}>
          — END OF FILE —
        </div>

        <p className="mb-2 font-mono text-xs opacity-40"
           style={{ color: "#c8b89a", fontFamily: "'Special Elite', serif", letterSpacing: "0.2em" }}>
          THE INVESTIGATION IS NEVER TRULY CLOSED.
        </p>

        <h1 className="mb-5"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "#d4922a",
              fontSize: "clamp(1.9rem, 5vw, 3.2rem)",
              lineHeight: 1.22,
              letterSpacing: "0.02em",
            }}>
          Every great case starts<br />with a single conversation.
        </h1>

        <p className="mb-4"
           style={{ color: "#7a6a50", fontFamily: "'Special Elite', serif", fontSize: "1rem", lineHeight: 1.85 }}>
          The evidence is reviewed. The dossier is open.<br />The only question that remains—
        </p>

        <p className="mb-12"
           style={{
             fontFamily: "'Playfair Display', serif",
             color: "#c8b89a", fontSize: "1.4rem",
             fontStyle: "italic", letterSpacing: "0.03em",
           }}>
          "What if we work together?"
        </p>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-10">
          <div className="flex-1 h-px" style={{ background: "rgba(212,146,42,0.18)" }} />
          <span style={{ color: "rgba(212,146,42,0.35)", fontSize: "0.7rem" }}>◆</span>
          <div className="flex-1 h-px" style={{ background: "rgba(212,146,42,0.18)" }} />
        </div>

        {/* Email CTA */}
        <a href={`mailto:${PERSON.email}`}
           className="inline-flex items-center gap-3 px-8 py-4 font-mono text-sm tracking-widest transition-all hover:opacity-75 hover:scale-105 group"
           style={{
             border: "1px solid rgba(212,146,42,0.45)",
             color: "#d4922a", background: "rgba(212,146,42,0.05)",
             letterSpacing: "0.14em",
           }}>
          <Mail size={16} className="group-hover:scale-110 transition-transform" />
          {PERSON.email}
        </a>

        {/* Social links */}
        <div className="mt-8 flex items-center justify-center gap-8">
          {[
            { icon: <Github size={13} />, label: "GITHUB",   href: PERSON.github },
            { icon: <Linkedin size={13} />, label: "LINKEDIN", href: PERSON.linkedin },
          ].map((link) => (
            <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-2 font-mono text-xs transition-opacity opacity-40 hover:opacity-80"
               style={{ color: "#d4922a", fontFamily: "'Special Elite', serif", letterSpacing: "0.15em" }}>
              {link.icon} {link.label}
            </a>
          ))}
        </div>

        {/* Resume download link in contact */}
        <div className="mt-6">
          <a href="/docs/Resume_Ralph_Joseph_Dsouza.pdf" download="Resume_Ralph_Joseph_Dsouza.pdf"
             className="inline-flex items-center gap-2 font-mono text-xs transition-opacity opacity-30 hover:opacity-70"
             style={{ color: "#d4922a", fontFamily: "'Special Elite', serif", letterSpacing: "0.15em" }}>
            <FileText size={12} /> DOWNLOAD FULL DOSSIER (PDF)
          </a>
        </div>

        <div className="mt-12 font-mono text-xs opacity-20"
             style={{ color: "#d4922a", fontFamily: "'Special Elite', serif", letterSpacing: "0.2em" }}>
          © {new Date().getFullYear()} {PERSON.name} — ALL RIGHTS RESERVED
        </div>
      </div>

      <div className="fixed inset-0 vignette" />
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [view, setView] = useState<View>("intro");
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [fading, setFading] = useState(false);

  const navigate = useCallback((next: View) => {
    setFading(true);
    setTimeout(() => {
      setView(next);
      setFading(false);
      window.scrollTo(0, 0);
    }, 280);
  }, []);

  const handleProjectSelect = (id: string) => {
    setSelectedProject(id);
    navigate("projectDetail");
  };

  return (
    <div className="size-full">
      <style>{GLOBAL_STYLES}</style>

      {/* Page-transition veil */}
      <div className="fixed inset-0 z-[100] pointer-events-none transition-opacity duration-[280ms]"
           style={{ background: "#000", opacity: fading ? 1 : 0 }} />

      {view === "intro"         && <IntroScene3D onEnter={() => navigate("caseFile")} personName={PERSON.name} personTitle={PERSON.title} />}
      {view === "caseFile"      && <CaseFile onNavigate={navigate} />}
      {view === "evidenceBoard" && <EvidenceBoard onBack={() => navigate("caseFile")} onSelectProject={handleProjectSelect} />}
      {view === "projectDetail" && selectedProject && (
        <ProjectDetail projectId={selectedProject} onBack={() => navigate("evidenceBoard")} />
      )}
      {view === "about"      && <AboutFile onBack={() => navigate("caseFile")} />}
      {view === "experience" && <ExperienceFile onBack={() => navigate("caseFile")} />}
      {view === "resume"     && <ResumeView onBack={() => navigate("caseFile")} />}
      {view === "contact"    && <ContactView onBack={() => navigate("caseFile")} />}
    </div>
  );
}
