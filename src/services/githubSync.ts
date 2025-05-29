// src/services/githubSync.ts

/**
 * Interface for a file to be synchronized with GitHub.
 */
export interface GitHubFile {
  path: string;      // Full path of the file in the repository
  content: string;   // File content
  sha?: string;       // SHA hash of the file, used for updates
}

/**
 * Represents the structure of a file entry when listing files.
 */
export interface GitHubListedFile {
  path: string; // Full path of the file
  name: string; // Just the file name
  // Potentially other properties like 'type' ('file' or 'dir'), 'sha', etc.
}

// --- Mock API Service ---

const MOCK_KNOWN_FILE_PATH = "docs/notes.txt";
const MOCK_KNOWN_FILE_CONTENT = "This is a note stored in GitHub.";

/**
 * Simulates saving a file to a GitHub repository.
 * In a real implementation, this would involve an API call (e.g., using Octokit).
 */
export async function saveFileToGitHub(
  file: GitHubFile,
  repo: string,
  token: string
): Promise<{ success: boolean; path: string; sha: string; message?: string }> {
  console.log(`[MockGitHubSync] Attempting to save file: ${file.path} to repo: ${repo}, token used: ${token ? 'yes' : 'no'}`);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));

  if (!file.path || typeof file.content === 'undefined') {
    return { success: false, path: file.path || '', sha: '', message: "File path or content is missing." };
  }

  // Simulate a successful save
  const fakeSha = `sha-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  console.log(`[MockGitHubSync] File saved successfully: ${file.path}, new SHA: ${fakeSha}`);
  
  return {
    success: true,
    path: file.path,
    sha: fakeSha,
  };
}

/**
 * Simulates loading a file from a GitHub repository.
 */
export async function loadFileFromGitHub(
  path: string,
  repo: string,
  token: string
): Promise<{ success: boolean; file?: GitHubFile; message?: string }> {
  console.log(`[MockGitHubSync] Attempting to load file: ${path} from repo: ${repo}, token used: ${token ? 'yes' : 'no'}`);

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));

  if (path === MOCK_KNOWN_FILE_PATH) {
    const file: GitHubFile = {
      path: MOCK_KNOWN_FILE_PATH,
      content: MOCK_KNOWN_FILE_CONTENT,
      sha: `sha-known-${Date.now()}`,
    };
    console.log(`[MockGitHubSync] Known file found and loaded: ${path}`);
    return { success: true, file };
  } else {
    console.log(`[MockGitHubSync] File not found: ${path}`);
    return { success: false, message: "File not found in mock service." };
  }
}

/**
 * Simulates listing files from a GitHub repository path (e.g., root or a directory).
 */
export async function listFilesFromGitHub(
  repo: string, // Path within the repo can be part of this or a separate arg
  token: string,
  // Optional: specify a directory path, defaults to root
  directoryPath: string = "" 
): Promise<{ success: boolean; files?: GitHubListedFile[]; message?: string }> {
  console.log(`[MockGitHubSync] Attempting to list files in dir: '${directoryPath || '/'}' from repo: ${repo}, token used: ${token ? 'yes' : 'no'}`);

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));

  // Sample file list, can be expanded or made dynamic based on directoryPath for more complex mocks
  const sampleFiles: GitHubListedFile[] = [
    { path: "README.md", name: "README.md" },
    { path: "docs/notes.txt", name: "notes.txt" }, // This is our MOCK_KNOWN_FILE_PATH
    { path: "src/main.ts", name: "main.ts" },
    { path: "images/logo.png", name: "logo.png" },
  ];

  // Filter if directoryPath is specified (basic filtering for mock)
  const filteredFiles = directoryPath 
    ? sampleFiles.filter(file => file.path.startsWith(directoryPath) && file.path !== directoryPath)
    : sampleFiles;
  
  console.log(`[MockGitHubSync] Files listed successfully for path: '${directoryPath || '/'}'. Found ${filteredFiles.length} items.`);
  return { success: true, files: filteredFiles };
}
