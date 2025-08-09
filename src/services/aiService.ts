import { UserProfile, SemesterPlan, Project, Note } from '../contexts/AppContext';

const callAIApi = async (prompt: string) => {
  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate AI content');
  }

  const data = await response.json();
  return data.text;
};

export const generateSemesterPlan = async (userData: UserProfile): Promise<SemesterPlan[]> => {
  const prompt = `
    Generate a semester plan for a ${userData.academicLevel} student interested in ${userData.interests.join(', ')}.
    The output MUST be a valid JSON array of objects. Do not include any other text or markdown.
    Each object in the array represents a semester and must have the following properties:
    - "semester": number
    - "courses": array of objects with "title" (string) and "link" (string, use "#" as a placeholder)
    - "certifications": array of objects with "title" (string), "platform" (string), and "difficulty" (string)
    - "projects": array of objects with "id" (string), "title" (string), "description" (string), "difficulty" (string), "semester" (number), and "steps" (array of strings)
    - "researchPapers": array of objects with "title" (string), "link" (string, use "#" as a placeholder), and "abstract" (string)

    Example of a single semester object:
    {
      "semester": 1,
      "courses": [
        { "title": "Introduction to Computer Science", "link": "#" },
        { "title": "Calculus I", "link": "#" }
      ],
      "certifications": [
        { "title": "Python for Everybody", "platform": "Coursera", "difficulty": "Beginner" }
      ],
      "projects": [
        {
          "id": "project-1-1",
          "title": "Personal Portfolio Website",
          "description": "Create a personal portfolio website to showcase your skills and projects.",
          "difficulty": "Easy",
          "semester": 1,
          "steps": ["Plan the layout", "Write the HTML and CSS", "Add JavaScript for interactivity", "Deploy the website"]
        }
      ],
      "researchPapers": []
    }
  `;
  const response = await callAIApi(prompt);
  try {
    // The response might be wrapped in markdown, so we need to extract the JSON part.
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch && jsonMatch[1]) {
      return JSON.parse(jsonMatch[1]);
    }
    return JSON.parse(response);
  } catch (error) {
    console.error("Failed to parse semester plan response:", response);
    throw error;
  }
};

export const generateProjectDetails = async (projectId: string): Promise<Project> => {
  const prompt = `Generate detailed project information for a project with ID ${projectId}.`;
  const response = await callAIApi(prompt);
  return JSON.parse(response);
};

export const generateGitHubStructure = async (projectId: string): Promise<{
  folders: string[];
  files: { name: string; content: string }[];
}> => {
  const prompt = `Generate a GitHub repository structure for a project with ID ${projectId}.`;
  const response = await callAIApi(prompt);
  return JSON.parse(response);
};

export const generateNotesSuggestions = async (notesText: string): Promise<string[]> => {
  const prompt = `Generate suggestions for the following notes: ${notesText}`;
  const response = await callAIApi(prompt);
  return JSON.parse(response);
};

export const generateNoteSummary = async (notesText: string): Promise<string> => {
  const prompt = `Summarize the following notes: ${notesText}`;
  const response = await callAIApi(prompt);
  return response;
};

export const generateProgressNudge = async (userData: UserProfile): Promise<string> => {
  const prompt = `Generate a motivational nudge for a ${userData.academicLevel} student.`;
  const response = await callAIApi(prompt);
  return response;
};
