import { UserProfile, SemesterPlan, Project, Note } from '../contexts/AppContext';

interface Course {
  title: string;
  link: string;
  description?: string;
  learningObjectives?: string[];
  prerequisites?: string[];
  recommendedResources?: { type: string; title: string; link: string }[];
}

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
    - "courses": array of objects with "title" (string), "link" (string, use "#" as a placeholder),
      "description" (string, a detailed course syllabus/summary),
      "learningObjectives" (array of strings, what the student should gain),
      "prerequisites" (array of strings, required prior knowledge),
      "recommendedResources" (array of objects with "type" (string, e.g., "Book", "Article", "Video"), "title" (string), "link" (string, provide actual, relevant, and functional links, not placeholders))
    - "certifications": array of objects with "title" (string), "platform" (string), and "difficulty" (string)
    - "projects": array of objects with "id" (string), "title" (string), "description" (string), "difficulty" (string), "semester" (number), and "steps" (array of strings)
    - "researchPapers": array of objects with "title" (string), "link" (string, use "#" as a placeholder), and "abstract" (string)

    Example of a single semester object:
    {
      "semester": 1,
      "courses": [
        {
          "title": "Introduction to Computer Science",
          "link": "#",
          "description": "This course provides a broad introduction to the field of computer science, covering fundamental concepts of computation, algorithms, and programming.",
          "learningObjectives": [
            "Understand basic programming constructs",
            "Develop problem-solving skills using algorithms",
            "Familiarize with data structures and their applications"
          ],
          "prerequisites": ["Basic math skills"],
          "recommendedResources": [
            { "type": "Book", "title": "Introduction to Algorithms", "link": "https://www.amazon.com/Introduction-Algorithms-Thomas-Cormen/dp/0262033844" },
            { "type": "Video", "title": "MIT OpenCourseWare - Introduction to Computer Science and Programming in Python", "link": "https://www.youtube.com/playlist?list=PLUl4u3cNGP63WbdFxL8G_r_B_Q_Jt1P7" }
          ]
        }
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

export const generateCourseRecommendations = async (courseTitle: string, courseDescription?: string): Promise<{
  studyPlan: string;
  certifications: { title: string; platform: string; link: string }[];
  projectIdeas: { title: string; description: string }[];
}> => {
  const prompt = `
    Generate AI recommendations for the course titled "${courseTitle}"${courseDescription ? ` with the following description: "${courseDescription}"` : ``}.
    The output MUST be a valid JSON object. Do not include any other text or markdown.
    The object must have the following properties:
    - "studyPlan": string (a suggested study plan for this course)
    - "certifications": array of objects with "title" (string), "platform" (string), and "link" (string)
    - "projectIdeas": array of objects with "title" (string) and "description" (string)

    Example:
    {
      "studyPlan": "Week 1: Introduction to CS, Binary. Week 2: C Programming basics.",
      "certifications": [
        { "title": "Python for Everybody", "platform": "Coursera", "link": "#" }
      ],
      "projectIdeas": [
        { "title": "Build a simple web server", "description": "Create a basic HTTP server." }
      ]
    }
  `;
  const response = await callAIApi(prompt);
  try {
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch && jsonMatch[1]) {
      return JSON.parse(jsonMatch[1]);
    }
    return JSON.parse(response);
  } catch (error) {
    console.error("Failed to parse course recommendations response:", response);
    throw error;
  }
};
