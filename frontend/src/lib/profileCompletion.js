/**
 * Student profile completion: 5 weighted steps (20% each).
 * Photo is set at signup; other fields are filled over time.
 */
export function getStudentProfileCompletion(user) {
  if (!user || user.role !== "student") {
    return {
      percent: 100,
      steps: [],
      complete: true,
      isStudent: false,
    };
  }

  const p = user.profile || {};
  const hasPhoto = Boolean(p.profilePhoto?.trim());
  const hasBio = Boolean(String(p.bio || "").trim());
  const hasSkills =
    Array.isArray(p.skills) &&
    p.skills.length > 0 &&
    p.skills.some((s) => String(s).trim());
  const hasResume = Boolean(p.resume?.trim());
  const hasExperience = Boolean(String(p.experience || "").trim());

  const steps = [
    {
      id: "photo",
      label: "Profile photo",
      description: "Shown on your profile and applications",
      done: hasPhoto,
    },
    {
      id: "bio",
      label: "About you",
      description: "Short bio so recruiters know you",
      done: hasBio,
    },
    {
      id: "skills",
      label: "Skills",
      description: "Add skills (e.g. React, Python)",
      done: hasSkills,
    },
    {
      id: "resume",
      label: "CV / Resume",
      description: "Upload your PDF resume",
      done: hasResume,
    },
    {
      id: "experience",
      label: "Experience",
      description: "Internships, projects, or work history",
      done: hasExperience,
    },
  ];

  const doneCount = steps.filter((s) => s.done).length;
  const percent = Math.round((doneCount / steps.length) * 100);

  return {
    percent,
    steps,
    complete: doneCount === steps.length,
    isStudent: true,
    doneCount,
    total: steps.length,
  };
}
