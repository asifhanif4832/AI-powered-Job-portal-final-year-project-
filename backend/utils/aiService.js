import dotenv from "dotenv";
dotenv.config();
import Groq from "groq-sdk";
import fetch from "node-fetch";

let groqClient = null;
const getGroq = () => {
    if (!groqClient && process.env.GROQ_API_KEY) {
        groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
    }
    return groqClient;
};

// ─── Skill Normalization & Synonyms ─────────────────────────────────────────

export const normalizeSkill = (s) => {
    if (!s) return "";
    return s
        .toLowerCase()
        .trim()
        .replace(/\.js\b/g, "js")
        .replace(/[\/\-_]/g, " ")
        .replace(/\s+/g, " ");
};

const TECH_ALIASES = {
    "react": ["react", "reactjs", "react native"],
    "reactjs": ["react", "reactjs", "react native"],
    "react native": ["react native", "react", "mobile ui"],
    "node": ["node", "nodejs"],
    "nodejs": ["node", "nodejs"],
    "express": ["express", "expressjs"],
    "expressjs": ["express", "expressjs"],
    "mongo": ["mongo", "mongodb"],
    "mongodb": ["mongo", "mongodb"],
    "postgres": ["postgres", "postgresql", "sql"],
    "postgresql": ["postgres", "postgresql", "sql"],
    "sql": ["sql", "mysql", "postgresql", "sqlite"],
    "ml": ["ml", "machine learning", "ai", "deep learning"],
    "machine learning": ["machine learning", "ml", "ai", "deep learning"],
    "deep learning": ["deep learning", "machine learning", "ml", "ai", "neural networks"],
    "nlp": ["nlp", "natural language processing", "text processing"],
    "natural language processing": ["nlp", "natural language processing"],
    "tensorflow": ["tensorflow", "tf", "keras", "pytorch", "deep learning"],
    "kubernetes": ["kubernetes", "k8s", "kubernets"],
    "kubernets": ["kubernetes", "k8s", "kubernets"],
    "k8s": ["kubernetes", "k8s"],
    "docker": ["docker", "container", "containers", "containerization"],
    "ci cd": ["ci cd", "cicd", "continuous integration", "devops"],
    "cicd": ["ci cd", "cicd", "continuous integration", "devops"],
    "api integration": ["api integration", "api", "apis", "rest apis", "rest api", "backend"],
    "rest apis": ["rest apis", "rest api", "api integration", "apis", "api"],
    "rest api": ["rest apis", "rest api", "api integration", "apis", "api"],
    "mobile ui": ["mobile ui", "ui", "react native", "mobile development"],
    "javascript": ["javascript", "js", "typescript", "es6"],
    "js": ["javascript", "js"],
    "python": ["python", "py"],
    "html": ["html", "html5", "frontend"],
    "css": ["css", "css3", "tailwind", "bootstrap", "frontend"],
    "aws": ["aws", "amazon web services", "cloud"],
    "linux": ["linux", "ubuntu", "bash", "unix"],
    "git": ["git", "github", "gitlab"],
};

export const calculateSkillMatch = (userSkills, jobRequirements, jobTitle = "", jobDescription = "") => {
    if (!userSkills?.length) return 0;

    const normUserSkills = userSkills.map(normalizeSkill).filter(Boolean);
    const normJobSkills = (jobRequirements || []).map(normalizeSkill).filter(Boolean);

    if (!normJobSkills.length) {
        const text = `${normalizeSkill(jobTitle)} ${normalizeSkill(jobDescription)}`;
        let matches = 0;
        normUserSkills.forEach(skill => {
            if (text.includes(skill)) matches++;
        });
        return Math.min(100, Math.round((matches / Math.max(normUserSkills.length, 1)) * 100));
    }

    let totalScore = 0;
    const maxScore = normJobSkills.length;

    normJobSkills.forEach(req => {
        let bestMatch = 0;

        for (const userSkill of normUserSkills) {
            // 1. Exact match
            if (req === userSkill) {
                bestMatch = Math.max(bestMatch, 1.0);
                break;
            }

            // 2. Alias / synonym match
            const userAliases = TECH_ALIASES[userSkill] || [userSkill];
            const reqAliases = TECH_ALIASES[req] || [req];
            const hasCommonAlias = userAliases.some(a => reqAliases.includes(a));
            if (hasCommonAlias) {
                bestMatch = Math.max(bestMatch, 1.0);
                continue;
            }

            // 3. Substring match
            if (req.includes(userSkill) || userSkill.includes(req)) {
                bestMatch = Math.max(bestMatch, 0.8);
                continue;
            }

            // 4. Word overlap
            const reqWords = req.split(" ");
            const userWords = userSkill.split(" ");
            const shared = reqWords.filter(w => w.length > 2 && userWords.includes(w));
            if (shared.length > 0) {
                bestMatch = Math.max(bestMatch, 0.6);
            }
        }

        totalScore += bestMatch;
    });

    let score = Math.round((totalScore / maxScore) * 100);

    // Contextual boost if user skill matches title
    const normTitle = normalizeSkill(jobTitle);
    const titleMatch = normUserSkills.some(s => s.length > 2 && normTitle.includes(s));
    if (titleMatch && score > 0 && score < 95) {
        score = Math.min(100, score + 5);
    }

    return Math.min(100, Math.max(0, score));
};

// ─── Extract Match Score from AI Text ───────────────────────────────────────

export const extractScoreFromAnalysis = (text) => {
    if (!text) return null;
    const patterns = [
        /OVERALL SCORE[^\n:]*:[*\s]*(\d{1,3})/i,
        /OVERALL SCORE\s*\([0-9-]+\)[*\s:]*(\d{1,3})/i,
        /SCORE[^\n:]*:[*\s]*(\d{1,3})/i,
        /(\d{1,3})\s*\/\s*100/i,
        /score[:\s*]+(\d{1,3})/i,
    ];
    for (const pattern of patterns) {
        const m = text.match(pattern);
        if (m) {
            const num = parseInt(m[1], 10);
            if (!isNaN(num) && num >= 0 && num <= 100) {
                return num;
            }
        }
    }
    return null;
};

// ─── Skill Matching using Groq ─────────────────────────────────────────────

export const computeMatchScore = async (userSkills, jobSkills, jobTitle = "", jobDescription = "") => {
    const baseScore = calculateSkillMatch(userSkills, jobSkills, jobTitle, jobDescription);
    try {
        const groq = getGroq();
        if (!groq || !userSkills?.length || !jobSkills?.length) {
            return baseScore;
        }

        const prompt = `You are a skill matching expert. Compare candidate skills with required job skills and output ONLY a number between 0 and 100.
Candidate Skills: ${userSkills.join(", ")}
Job Required Skills: ${jobSkills.join(", ")}
Return ONLY the number, nothing else.`;

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "qwen/qwen3.8-27b",
            temperature: 0.1,
            max_tokens: 50,
        });

        const scoreText = completion.choices[0]?.message?.content?.trim() || "";
        const parsed = parseInt(scoreText.match(/\d{1,3}/)?.[0] || "", 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
            return parsed;
        }
        return baseScore;
    } catch (error) {
        console.warn("AI match score fallback to deterministic:", error.message);
        return baseScore;
    }
};

// ─── Get Recommendations ───────────────────────────────────────────────────

export const getJobRecommendations = async (userSkills, jobs, threshold = 50) => {
    try {
        if (!userSkills?.length || !jobs?.length) return [];

        // 1. Compute deterministic scores
        const scoredJobs = jobs.map((job) => {
            const jobSkills = job.requiredSkills || job.requirements || [];
            const score = calculateSkillMatch(userSkills, jobSkills, job.title || "", job.description || "");
            return {
                ...job,
                matchScore: score,
            };
        });

        // 2. Filter strictly by threshold (only 50% or more)
        let matches = scoredJobs.filter((j) => j.matchScore >= threshold);

        // 3. Optional: Refine top matches using Groq batch call if available
        const groq = getGroq();
        if (groq && matches.length > 0) {
            try {
                const topCandidates = matches.slice(0, 10);
                const prompt = `You are a recruitment AI. Evaluate how well candidate skills match each job's requirements.
Candidate Skills: ${userSkills.join(", ")}

Jobs:
${topCandidates.map(j => `ID ${j._id}: ${j.title} (Requires: ${(j.requirements || []).join(", ")})`).join("\n")}

Return ONLY a JSON array of objects with "id" and "score" (0-100 number). Example: [{"id": "...", "score": 85}]`;

                const res = await groq.chat.completions.create({
                    messages: [{ role: "user", content: prompt }],
                    model: "qwen/qwen3.8-27b",
                    temperature: 0.1,
                    max_tokens: 400,
                });

                const rawJson = res.choices[0]?.message?.content?.trim() || "";
                const jsonMatch = rawJson.match(/\[[\s\S]*\]/);
                if (jsonMatch) {
                    const aiScores = JSON.parse(jsonMatch[0]);
                    const scoreMap = new Map();
                    aiScores.forEach(item => {
                        if (item.id && typeof item.score === "number") {
                            scoreMap.set(String(item.id), Math.min(100, Math.max(0, Math.round(item.score))));
                        }
                    });

                    matches = matches.map(job => {
                        const aiScore = scoreMap.get(String(job._id));
                        if (aiScore !== undefined) {
                            return { ...job, matchScore: aiScore };
                        }
                        return job;
                    });
                }
            } catch (aiErr) {
                console.warn("Groq batch refinement skipped:", aiErr.message);
            }
        }

        // Strictly keep only jobs that match 50% or more
        matches = matches.filter((j) => j.matchScore >= threshold);

        // Sort descending by matchScore
        matches.sort((a, b) => b.matchScore - a.matchScore);
        return matches;

    } catch (error) {
        console.error("Recommendation error:", error.message);
        return [];
    }
};

// ─── Extract PDF Text ──────────────────────────────────────────────────────

export const extractTextFromPdfUrl = async (url) => {
    try {
        console.log("Fetching PDF from:", url);

        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Accept": "application/pdf,*/*",
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch PDF: ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);

        console.log(`Downloaded ${buffer.length} bytes`);

        // Use pdfjs-dist
        const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
        const loadingTask = pdfjsLib.getDocument({ data: buffer });
        const pdf = await loadingTask.promise;

        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const pageText = content.items.map((item) => item.str).join(" ");
            fullText += pageText + "\n";
        }

        console.log(`Extracted ${fullText.length} characters from PDF`);
        return fullText.trim();

    } catch (error) {
        console.error("PDF extraction error:", error.message);
        return "";
    }
};

// ─── Resume Analysis ───────────────────────────────────────────────────────

export const analyzeResumeWithAI = async (resumeUrl, jobTitle, jobRequirements, jobDescription) => {
    try {
        const resumeText = await extractTextFromPdfUrl(resumeUrl);

        if (!resumeText) {
            throw new Error("Could not extract text from resume PDF.");
        }

        console.log(`Analyzing resume with ${resumeText.length} characters`);

        const prompt = `You are an expert HR recruiter and resume analyst.

Analyze the following resume for the job position below.

JOB DETAILS:
- Job Title: ${jobTitle}
- Required Skills: ${(jobRequirements || []).join(", ")}
- Job Description: ${jobDescription}

RESUME TEXT:
${resumeText.slice(0, 4000)}

Provide a structured analysis with EXACTLY these sections in order:

1. OVERALL SCORE (0-100): Give a single number score based on how well this resume matches the job requirements

2. SKILLS MATCH: List which required skills are present in the resume and which are missing

3. EXPERIENCE ANALYSIS: Evaluate the work experience, internships, and projects for relevance to this role

4. STRENGTHS: List top 3 strengths of this candidate for this specific role

5. WEAKNESSES: List top 3 gaps or weaknesses for this specific role

6. RECOMMENDATION: Choose one of (Hire / Maybe / Pass) and give a 2-3 sentence justification

Be specific, professional, and base your analysis only on the resume content provided.`;

        const groq = getGroq();
        if (!groq) {
            throw new Error("GROQ_API_KEY is not configured.");
        }

        // Try primary model, fallback to qwen if needed
        let completion;
        try {
            completion = await groq.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: "You are an expert HR recruiter. Give structured, honest, and professional resume assessments.",
                    },
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
                model: "openai/gpt-oss-120b",
                temperature: 0.3,
                max_tokens: 1024,
            });
        } catch (mErr) {
            console.warn("Primary model failed, trying fallback model:", mErr.message);
            completion = await groq.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: "You are an expert HR recruiter. Give structured, honest, and professional resume assessments.",
                    },
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
                model: "qwen/qwen3.8-27b",
                temperature: 0.3,
                max_tokens: 1024,
            });
        }

        return completion.choices[0]?.message?.content || "";

    } catch (error) {
        console.error("Resume analysis error:", error.message);
        throw error;
    }
};
