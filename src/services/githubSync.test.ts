// src/services/githubSync.test.ts

import { describe, it, expect } from 'vitest';
import {
  GitHubFile,
  saveFileToGitHub,
  loadFileFromGitHub,
  listFilesFromGitHub,
} from './githubSync';

const TEST_REPO = "test-user/test-repo";
const TEST_TOKEN = "fake-token-123";

describe('GitHub Sync Mock Service', () => {
  describe('saveFileToGitHub', () => {
    it('should return a success response with path and SHA when saving a valid file', async () => {
      const fileToSave: GitHubFile = {
        path: "src/newFile.txt",
        content: "This is new content.",
      };
      const response = await saveFileToGitHub(fileToSave, TEST_REPO, TEST_TOKEN);
      
      expect(response.success).toBe(true);
      expect(response.path).toBe(fileToSave.path);
      expect(response.sha).toEqual(expect.any(String));
      expect(response.sha).not.toBe('');
      expect(response.message).toBeUndefined();
    });

    it('should return a failure response if file path is missing', async () => {
      const fileToSave: GitHubFile = {
        path: "", // Empty path
        content: "Content without path.",
      };
      const response = await saveFileToGitHub(fileToSave, TEST_REPO, TEST_TOKEN);
      
      expect(response.success).toBe(false);
      expect(response.path).toBe("");
      expect(response.sha).toBe('');
      expect(response.message).toBe("File path or content is missing.");
    });

    // @ts-ignore testing invalid input for content
    it('should return a failure response if file content is missing', async () => {
      const fileToSave: GitHubFile = {
        path: "src/noContent.txt",
        // content is undefined
      };
      // Type assertion to allow testing this invalid state for the mock's robustness check
      const response = await saveFileToGitHub(fileToSave as any, TEST_REPO, TEST_TOKEN);
      
      expect(response.success).toBe(false);
      expect(response.path).toBe("src/noContent.txt");
      expect(response.sha).toBe('');
      expect(response.message).toBe("File path or content is missing.");
    });
  });

  describe('loadFileFromGitHub', () => {
    const MOCK_KNOWN_FILE_PATH_IN_SERVICE = "docs/notes.txt"; // Must match the one in githubSync.ts

    it('should return a file for a known mock path', async () => {
      const response = await loadFileFromGitHub(MOCK_KNOWN_FILE_PATH_IN_SERVICE, TEST_REPO, TEST_TOKEN);
      
      expect(response.success).toBe(true);
      expect(response.file).toBeDefined();
      expect(response.file?.path).toBe(MOCK_KNOWN_FILE_PATH_IN_SERVICE);
      expect(response.file?.content).toEqual(expect.any(String));
      expect(response.file?.sha).toEqual(expect.any(String));
      expect(response.message).toBeUndefined();
    });

    it('should return success:false for an unknown mock path', async () => {
      const unknownPath = "unknown/path/to/file.txt";
      const response = await loadFileFromGitHub(unknownPath, TEST_REPO, TEST_TOKEN);
      
      expect(response.success).toBe(false);
      expect(response.file).toBeUndefined();
      expect(response.message).toBe("File not found in mock service.");
    });
  });

  describe('listFilesFromGitHub', () => {
    it('should return a list of files for the root path', async () => {
      const response = await listFilesFromGitHub(TEST_REPO, TEST_TOKEN); // Defaults to root
      
      expect(response.success).toBe(true);
      expect(response.files).toBeDefined();
      expect(Array.isArray(response.files)).toBe(true);
      expect(response.files!.length).toBeGreaterThan(0); 
      // Check structure of one file
      expect(response.files![0]).toHaveProperty('path');
      expect(response.files![0]).toHaveProperty('name');
      expect(response.message).toBeUndefined();
    });

    it('should return a filtered list of files for a specific directory path', async () => {
      const directoryPath = "docs/";
      const response = await listFilesFromGitHub(TEST_REPO, TEST_TOKEN, directoryPath);
      
      expect(response.success).toBe(true);
      expect(response.files).toBeDefined();
      expect(Array.isArray(response.files)).toBe(true);
      response.files?.forEach(file => {
        expect(file.path.startsWith(directoryPath)).toBe(true);
      });
      // Check if it found the known file in docs/
      const knownFileInDocs = response.files?.find(file => file.path === "docs/notes.txt");
      expect(knownFileInDocs).toBeDefined();
    });

    it('should return an empty list for a directory path that has no files (but is valid)', async () => {
      const emptyDirectoryPath = "empty_dir/"; // Assuming mock doesn't have files starting with this
      const response = await listFilesFromGitHub(TEST_REPO, TEST_TOKEN, emptyDirectoryPath);
      
      expect(response.success).toBe(true);
      expect(response.files).toBeDefined();
      expect(Array.isArray(response.files)).toBe(true);
      expect(response.files!.length).toBe(0);
    });
  });
});
