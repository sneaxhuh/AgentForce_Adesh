import { UserProfile, SemesterPlan, Project, Note } from '../contexts/AppContext';
import { auth } from '../firebase'; // Import Firebase auth
import { getIdToken } from 'firebase/auth'; // Import getIdToken

interface Course {
  title: string;
  link: string;
  description?: string;
  learningObjectives?: string[];
  prerequisites?: string[];
  recommendedResources?: { type: string; title: string; link: string }[];
}

const callAIApi = async (prompt: string) => {
  const user = auth.currentUser; // Get current Firebase user
  let token: string | null = null;

  if (user) {
    token = await user.getIdToken(); // Get Firebase ID token
  }

  const response = await fetch('http://localhost:3002/api/ai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, // Add Authorization header
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    // Handle unauthorized or forbidden responses
    if (response.status === 401 || response.status === 403) {
      // You might want to trigger a logout here or redirect to login
      throw new Error('Unauthorized or Forbidden: Please log in again.');
    }
    throw new Error('Failed to generate AI content');
  }

  const data = await response.json();
  return data.text;
};


export const generateSemesterPlan = async (userData: UserProfile): Promise<SemesterPlan[]> => {
  let numSemesters: number;
  switch (userData.academicLevel) {
    case 'undergrad':
      numSemesters = 8; // 4 years * 2 semesters/year
      break;
    case 'high-school':
      numSemesters = 4; // 2 years * 2 semesters/year
      break;
    case 'postgrad':
      numSemesters = 10; // 5 years * 2 semesters/year (can vary, but a reasonable default)
      break;
    default:
      numSemesters = 8; // Default for unknown academic levels
  }

  const prompt = `
    Generate a semester plan for a ${userData.academicLevel} student with the following profile:
    - Career Goals: ${userData.careerGoals}
    - Current Skills: ${userData.currentSkills}
    - Interests: ${userData.interests.join(', ')}

    The plan should cover exactly ${numSemesters} semesters.
    The output MUST be a valid JSON array of objects. Do not include any other text or markdown.
    Each object in the array represents a semester and must have the following properties:
    - "semester": number
    - "courses": array of objects with "title" (string), "link" (string, use "#" as a placeholder),
      "description" (string, a detailed course syllabus/summary),
      "learningObjectives" (array of strings, what the student should gain),
      "prerequisites" (array of strings, required prior knowledge, provide at least one if applicable),
      "recommendedResources" (array of objects with "type" (string, e.g., "Book", "Article", "Video"), "title" (string), "link" (string, provide actual, relevant, and functional links, not placeholders), provide at least 2 resources). Each semester must have at least 2 courses.
    - "certifications": array of objects with "title" (string), "platform" (string), "difficulty" (string), and "link" (string, provide actual, relevant, and functional links). Each semester must have at least 2 certifications related to the courses in that semester.
    - "projects": array of objects with "id" (string), "title" (string), "description" (string), "difficulty" (string), "semester" (number), and "steps" (array of strings, provide detailed and actionable implementation steps, e.g., for a website: "Set up project structure", "Design UI mockups", "Implement frontend components", "Develop backend API", "Integrate frontend and backend", "Deploy to hosting").
    - "researchPapers": array of objects with "title" (string), "link" (string, provide actual, relevant, and functional links), and "abstract" (string, provide a concise summary). Ensure this array is populated with relevant research papers.

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
          "prerequisites": ["Basic math skills", "High school algebra"],
          "recommendedResources": [
            { "type": "Book", "title": "Introduction to Algorithms", "link": "https://www.amazon.com/Introduction-Algorithms-Thomas-Cormen/dp/0262033844" },
            { "type": "Video", "title": "MIT OpenCourseWare - Introduction to Computer Science and Programming in Python", "link": "https://www.youtube.com/playlist?list=PLUl4u3cNGP63WbdFxL8G_r_B_Q_Jt1P7" }
          ]
        }
      ],
      "certifications": [
        { "title": "Python for Everybody", "platform": "Coursera", "difficulty": "Beginner", "link": "https://www.coursera.org/specializations/python" }
      ],
      "projects": [
        {
          "id": "project-1-1",
          "title": "Personal Portfolio Website",
          "description": "Create a personal portfolio website to showcase your skills and projects.",
          "difficulty": "Easy",
          "semester": 1,
          "steps": [
            "Step 1: Define project scope and features (e.g., sections, content, target audience).",
            "Step 2: Choose a technology stack (e.g., React, Vue, plain HTML/CSS/JS).",
            "Step 3: Design wireframes and mockups for key pages (e.g., home, about, projects, contact).",
            "Step 4: Set up the project environment and version control (e.g., Git, GitHub).",
            "Step 5: Develop the core HTML structure and apply basic CSS styling.",
            "Step 6: Implement responsive design for various screen sizes (mobile, tablet, desktop).",
            "Step 7: Add interactive elements using JavaScript (e.g., form validation, animations).",
            "Step 8: Populate content for each section (e.g., project descriptions, skills, bio).",
            "Step 9: Optimize images and assets for web performance.",
            "Step 10: Test the website across different browsers and devices.",
            "Step 11: Deploy the website to a hosting service (e.g., Netlify, Vercel, GitHub Pages).",
            "Step 12: Set up analytics and monitor website performance."
          ]
        }
      ],
      "researchPapers": [
        { "title": "Attention Is All You Need", "link": "https://arxiv.org/abs/1706.03762", "abstract": "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, eschewing recurrence and convolutions entirely. Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train. Our model achieves 28.4 BLEU on the WMT 2014 English-to-German translation task, improving over the existing best results by over 2 BLEU, including ensembles. On the WMT 2014 English-to-French translation task, our model establishes a new single-model state-of-the-art BLEU score of 41.8 after training for 3.5 days on eight GPUs, a small fraction of the training cost of the best models from the literature. We show that the Transformer generalizes well to other tasks by applying it to English constituency parsing, both with large and limited training data." }
      ]
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

export const generateGitHubStructure = async (project: Project): Promise<{ folders: string[]; files: { name: string; content: string; }[]; }> => { const prompt = `
    Generate a GitHub repository structure for a project with the following details:
    Title: ${project.title}
    Description: ${project.description}
    Difficulty: ${project.difficulty}
    Implementation Steps: ${project.steps.join('\n- ')}

    The output MUST be a valid JSON object. Do not include any other text or markdown.
    The object must have the following properties:
    - "folders": array of strings (e.g., ["src/components", "src/pages"])
    - "files": array of objects with "name" (string) and "content" (string, can be empty for placeholder files).

    Example:
    {
      "folders": [
        "src/components",
        "src/pages"
      ],
      "files": [
        { "name": "README.md", "content": "# My Project" },
        { "name": "src/App.tsx", "content": "import React from 'react';\n\nfunction App() { return <div>Hello</div>; }\n\nexport default App;" }
      ]
    }
  `; const response = await callAIApi(prompt); try { const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/); if (jsonMatch && jsonMatch[1]) { return JSON.parse(jsonMatch[1]); } return JSON.parse(response); } catch (error) { console.error("Failed to parse GitHub structure response:", response); throw error; } };

export const generateNotesSuggestions = async (notesText: string): Promise<string[]> => {
  const prompt = `Generate a JSON array of strings as suggestions for the following notes: ${notesText}. The output MUST be a valid JSON array of strings. Do not include any other text or markdown.`;
  const response = await callAIApi(prompt);
  try {
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch && jsonMatch[1]) {
      return JSON.parse(jsonMatch[1]);
    }
    return JSON.parse(response);
  } catch (error) {
    console.error("Failed to parse notes suggestions response:", response);
    throw error;
  }
};

export const generateNoteSummary = async (notesText: string): Promise<string> => {
  const prompt = `Summarize the following notes: ${notesText}. Provide only the summary text, without any additional formatting, markdown, or JSON wrapping.`;
  const response = await callAIApi(prompt);
  return response;
};

export const generateProgressNudge = async (userData: UserProfile): Promise<string> => {
  const prompt = `Generate a motivational nudge for a ${userData.academicLevel} student.`;
  const response = await callAIApi(prompt);
  return response;
};

import { jsonrepair } from "jsonrepair"; // npm install jsonrepair

export const generateCourseRecommendations = async (
  courseTitle: string,
  courseDescription?: string
): Promise<{
  studyPlan: string;
  certifications: { title: string; platform: string; link: string }[];
  projectIdeas: { title: string; description: string }[];
}> => {
  const prompt = `
    Generate AI recommendations for the course titled "${courseTitle}"${courseDescription ? ` with the following description: "${courseDescription}"` : ``}.
    The output MUST be a valid JSON object. Do not include any other text or markdown.
    The object must have the following properties:
    - "studyPlan": string
    - "certifications": array of { "title": string, "platform": string, "link": string }
    - "projectIdeas": array of { "title": string, "description": string }
  `;

  const response = await callAIApi(prompt);

  try {
    // Extract anything that looks like JSON
    const match = response.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON found in response");

    // Repair malformed JSON (removes trailing commas, fixes quotes, etc.)
    const cleaned = jsonrepair(match[0]);

    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Failed to parse course recommendations response:", response);
    throw error;
  }
};
