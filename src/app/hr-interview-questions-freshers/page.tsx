import { Metadata } from 'next';
import Link from 'next/link';
import {
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Video,
  Mic,
  Award,
  BookOpen,
} from 'lucide-react';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://oratii.in';

export const metadata: Metadata = {
  title: 'Top 10 HR Interview Questions for Freshers with Model Answers | Oratii',
  description:
    'Master the top 10 HR interview questions for college freshers with word-for-word sample answers, common mistakes to avoid, and interactive AI mock interview practice.',
  alternates: {
    canonical: `${siteUrl}/hr-interview-questions-freshers`,
  },
  keywords: [
    'hr interview questions for freshers',
    'common hr questions with answers',
    'fresher interview questions',
    'why should we hire you fresher',
    'where do you see yourself in 5 years fresher',
    'salary expectations fresher answer',
    'hr round tips engineering graduates',
  ],
  openGraph: {
    title: 'Top 10 HR Interview Questions for Freshers with Model Answers | Oratii',
    description:
      'Master the top 10 HR interview questions with word-for-word sample answers, scoring rubrics, and interactive AI practice.',
    url: `${siteUrl}/hr-interview-questions-freshers`,
    siteName: 'Oratii',
    type: 'article',
  },
};

const hrQuestionsList = [
  {
    num: 1,
    question: 'Tell me about yourself.',
    evaluates: 'Communication clarity, concise storytelling, and logical flow.',
    modelAnswer:
      "I recently graduated with a degree in Computer Science from XYZ University. Throughout my academic journey, I discovered a strong passion for full-stack web development, which led me to build a real-time collaborative task manager using React and Node.js during my final year. I also led our technical symposium's web committee, coordinating with a team of six. I'm excited about this opportunity because your team is building scalable cloud software, and I am eager to apply my foundational skills to ship reliable code in a collaborative production environment.",
    mistakes:
      'Reciting your entire resume line-by-line, discussing your childhood or school marks, or speaking for longer than 90 seconds.',
  },
  {
    num: 2,
    question: 'Why should we hire you as a fresher without industry experience?',
    evaluates: 'Self-awareness, practical eagerness, and foundational readiness.',
    modelAnswer:
      'While I may not yet have years of corporate experience, I bring strong computer science fundamentals, a verified track record of self-driven projects, and a very steep learning curve. During college, when our team needed to implement JWT authentication for our project, I taught myself modern auth flows in 48 hours and implemented it without bugs. I am adaptable, eager to be mentored by your senior engineers, and ready to put in the focused work to add value to your sprints from month one.',
    mistakes:
      'Saying "because I need a job" or giving a generic "I am a hardworking person" statement without concrete evidence.',
  },
  {
    num: 3,
    question: 'What are your greatest strengths and weaknesses?',
    evaluates: 'Honesty, emotional maturity, and commitment to self-improvement.',
    modelAnswer:
      "My greatest strength is structured problem-solving under ambiguity. When building projects, I break complex requirements into verifiable milestones and debug methodically rather than guessing. As for an area I'm actively improving, I used to hesitate when delegating tasks in college group projects, wanting to verify every line of code myself. I realized this created bottlenecks, so I began implementing shared Trello boards and code review checklists, which helped our team deliver 3 days ahead of our deadline.",
    mistakes:
      'Using cliché non-weaknesses like "I am a perfectionist" or "I work too hard", or stating a disqualifying flaw like "I cannot wake up on time".',
  },
  {
    num: 4,
    question: 'Why do you want to join our company?',
    evaluates: 'Prior research, motivation, and company alignment.',
    modelAnswer:
      "I have been following your engineering blog, particularly the recent writeup on how you migrated your microservices architecture to reduce API latency by 40%. Coming from an academic background where system performance was my favorite elective, joining a culture that prioritizes architectural excellence and provides a structured 3-month mentorship bootcamp for new graduates aligns directly with where I want to build my career.",
    mistakes:
      'Giving a response that could apply to any company (e.g. "You are a very reputed MNC") without mentioning anything specific about their products or domain.',
  },
  {
    num: 5,
    question: 'Where do you see yourself in 5 years?',
    evaluates: 'Ambition, career stability, and realistic growth expectations.',
    modelAnswer:
      "Over the next 2 to 3 years, my goal is to master your tech stack, earn ownership of core feature modules, and become a dependable go-to engineer on the team. In 5 years, I see myself taking on technical leadership responsibilities, mentoring incoming freshers, and helping architect scalable systems that drive business impact for the organization.",
    mistakes:
      'Saying "I want to be the CEO", or mentioning plans to leave for higher studies (MBA/MS) within 12 months.',
  },
  {
    num: 6,
    question: 'How do you handle pressure and tight deadlines?',
    evaluates: 'Composure, prioritization, and communication under stress.',
    modelAnswer:
      'When facing tight deadlines, I don’t panic; I prioritize. During our final-year project submission, we encountered an unexpected database connection bug 24 hours before the evaluation. I paused, listed our dependencies, triaged the blocker, and communicated clearly with our guide. We resolved the bug and submitted on time. I find that clear checklists and prompt communication keep pressure manageable.',
    mistakes:
      'Saying "I never feel pressure" (unbelievable) or admitting that you freeze or lose your temper.',
  },
  {
    num: 7,
    question: 'Are you comfortable with relocation or working rotational shifts?',
    evaluates: 'Flexibility and practical willingness to adapt to company needs.',
    modelAnswer:
      'Yes, absolutely. As a fresher at the start of my professional journey, my priority is learning, teamwork, and gaining real-world exposure. I view relocating to a new city as an exciting step to build independence and immerse myself in the company’s workplace culture.',
    mistakes:
      'Hesitating, arguing about location, or giving an ambiguous "maybe later" answer if the job description explicitly required mobility.',
  },
  {
    num: 8,
    question: 'What are your salary expectations?',
    evaluates: 'Market awareness, flexibility, and professionalism.',
    modelAnswer:
      'As a fresher, my primary focus is securing an opportunity where I can learn from talented peers and build a strong technical foundation. I understand your organization has a standard salary band for campus graduate hires, and I am confident that an offer aligned with company standards and industry benchmarks will be fair.',
    mistakes:
      'Quoting an aggressive arbitrary figure or saying "I do not care about money at all" (unprofessional).',
  },
  {
    num: 9,
    question: 'Tell me about a time you had a disagreement with a team member.',
    evaluates: 'Conflict resolution and collaborative maturity (STAR framework).',
    modelAnswer:
      'During our hackathon project, my teammate and I disagreed on whether to use SQL or MongoDB for our data store. Instead of arguing theoretically, I suggested we benchmark both against our schema requirements and read/write ratio. We wrote quick prototype tests, saw that our structured relational queries performed 3x faster in Postgres, and mutually agreed on Postgres. We ended up winning 2nd runner-up.',
    mistakes:
      'Claiming you have never had a disagreement, or blaming your teammate for being "lazy" or "difficult".',
  },
  {
    num: 10,
    question: 'Do you have any questions for us?',
    evaluates: 'Curiosity, enthusiasm, and active engagement in the interview.',
    modelAnswer:
      'Yes, thank you! I would love to know: for a fresher joining this team, what does a successful first 90 days look like? Also, what are the most common technical skills successful new hires pick up during their initial onboarding?',
    mistakes:
      'Saying "No, I have no questions" or immediately asking about leaves, holidays, or free snacks.',
  },
];

const hrFaqs = [
  {
    q: 'How long should an HR interview answer be for a fresher?',
    a: 'Aim for 45 to 75 seconds per answer. Anything under 30 seconds sounds abrupt and unconfident, while answers stretching past 90 seconds often lead to rambling and filler words.',
  },
  {
    q: 'Can freshers use AI to practice for HR interviews?',
    a: 'Yes. Practicing with an interactive AI coach like Oratii allows you to speak your answers out loud on camera, receive immediate feedback on your vocal pace (WPM), eliminate nervous filler words, and verify your answer structure without judgment.',
  },
  {
    q: 'Why do interviewers ask "Tell me about yourself" first?',
    a: 'It serves as an icebreaker, assesses your spoken English and articulation, and tests how concisely you can connect your academic background to the role you applied for.',
  },
];

export default function HrInterviewQuestionsPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: hrFaqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Header */}
      <section className="relative overflow-hidden pt-12 pb-16 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 mb-6">
            <BookOpen size={14} />
            <span>Complete Fresher Interview Playbook</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Top 10 HR Interview Questions for Freshers
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Detailed sample answers, what the recruiter is secretly evaluating, common traps to avoid, and 1-click interactive AI practice for every question.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/interview"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-indigo-900 text-white hover:bg-slate-900 dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-400 transition-all shadow-md"
            >
              <Video size={16} />
              <span>Practice Questions with AI Recruiter</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/campus-placement-interview"
              className="px-5 py-3 rounded-xl font-bold text-sm bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-800 hover:bg-slate-50 transition-all"
            >
              Campus Placement Guide
            </Link>
          </div>
        </div>
      </section>

      {/* Question Cards List */}
      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        {hrQuestionsList.map((item) => (
          <article
            key={item.num}
            id={`q-${item.num}`}
            className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-200 dark:hover:border-slate-700 transition-all"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-sm">
                  {item.num}
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  {item.question}
                </h2>
              </div>
              <Link
                href={`/interview?role=Fresher&focus=${encodeURIComponent(item.question)}`}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-amber-400 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors shrink-0"
              >
                <Mic size={14} /> Practice Now
              </Link>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 mb-4 bg-slate-50 dark:bg-slate-850 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
              <strong className="text-slate-700 dark:text-slate-200">What recruiters evaluate:</strong>{' '}
              {item.evaluates}
            </div>

            {/* Model Answer Box */}
            <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40 p-4 sm:p-5 rounded-xl mb-4">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs uppercase tracking-wider mb-2">
                <CheckCircle2 size={14} />
                <span>Word-for-Word Model Answer</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed italic">
                &ldquo;{item.modelAnswer}&rdquo;
              </p>
            </div>

            {/* Trap to Avoid */}
            <div className="flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300 bg-rose-50/50 dark:bg-rose-950/20 p-3 rounded-lg border border-rose-200/60 dark:border-rose-900/40">
              <AlertTriangle size={15} className="shrink-0 mt-0.5" />
              <div>
                <strong>Common Mistake:</strong> {item.mistakes}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between sm:hidden">
              <Link
                href={`/interview?role=Fresher&focus=${encodeURIComponent(item.question)}`}
                className="w-full text-center py-2 bg-indigo-900 text-white rounded-lg text-xs font-bold"
              >
                Practice Answer with AI
              </Link>
            </div>
          </article>
        ))}
      </section>

      {/* CTA Box */}
      <section className="py-12 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-10 rounded-3xl text-center shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Ready to Speak Your Answers Out Loud?
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto mt-2">
            Reading sample answers is only 20% of the battle. Practice speaking in front of Oratii’s photorealistic AI interviewer to build muscle memory and overcome hesitation.
          </p>
          <div className="mt-6 flex justify-center">
            <Link
              href="/interview"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-amber-500 text-slate-950 font-bold rounded-xl text-sm hover:bg-amber-400 transition-all shadow-md"
            >
              <span>Launch Free Video Mock Interview</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 max-w-3xl mx-auto px-4 sm:px-6">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white text-center mb-8">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {hrFaqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800"
            >
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle size={15} className="text-indigo-600 dark:text-amber-400 shrink-0" />
                {faq.q}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 pl-5 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Internal Links Footer */}
      <section className="py-10 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-xs text-slate-600 dark:text-slate-400 flex flex-wrap gap-4 justify-center">
          <Link href="/tell-me-about-yourself" className="hover:text-indigo-600 dark:hover:text-amber-400">
            Tell Me About Yourself Guide →
          </Link>
          <span>•</span>
          <Link href="/star-method-practice" className="hover:text-indigo-600 dark:hover:text-amber-400">
            STAR Method Answer Builder →
          </Link>
          <span>•</span>
          <Link href="/campus-placement-interview" className="hover:text-indigo-600 dark:hover:text-amber-400">
            Campus Placement Strategy →
          </Link>
        </div>
      </section>
    </div>
  );
}

