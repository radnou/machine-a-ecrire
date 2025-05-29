// src/features/stickyNotes/stickyNotesManager.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { StickyNotesManager, StickyNote } from './stickyNotesManager';

describe('StickyNotesManager', () => {
  let manager: StickyNotesManager;

  beforeEach(() => {
    manager = new StickyNotesManager();
  });

  describe('createNote', () => {
    it('should create a new note with a unique ID and provided content', () => {
      const content = "Test note 1";
      const note1 = manager.createNote(content);

      expect(note1).toBeDefined();
      expect(note1.id).toEqual(expect.any(String));
      expect(note1.content).toBe(content);
      expect(note1.color).toBeDefined(); // Default color
      expect(note1.position).toBeDefined(); // Default position

      const content2 = "Test note 2";
      const color2 = "#FF0000";
      const note2 = manager.createNote(content2, color2);
      expect(note2.id).not.toBe(note1.id);
      expect(note2.content).toBe(content2);
      expect(note2.color).toBe(color2);
    });
  });

  describe('getNote', () => {
    it('should retrieve a specific note by its ID', () => {
      const createdNote = manager.createNote("Note to get");
      const fetchedNote = manager.getNote(createdNote.id);
      expect(fetchedNote).toEqual(createdNote);
    });

    it('should return null if a note with the given ID does not exist', () => {
      const fetchedNote = manager.getNote("non-existent-id");
      expect(fetchedNote).toBeNull();
    });
  });

  describe('getAllNotes', () => {
    it('should return all created notes', () => {
      const note1 = manager.createNote("Note 1");
      const note2 = manager.createNote("Note 2");
      const allNotes = manager.getAllNotes();
      expect(allNotes.length).toBe(2);
      expect(allNotes).toEqual(expect.arrayContaining([note1, note2]));
    });

    it('should return an empty array if no notes have been created', () => {
      const allNotes = manager.getAllNotes();
      expect(allNotes.length).toBe(0);
      expect(allNotes).toEqual([]);
    });
  });

  describe('updateNote', () => {
    it('should update the content and color of an existing note', () => {
      const originalNote = manager.createNote("Original content", "#00FF00");
      const newContent = "Updated content";
      const newColor = "#0000FF";
      
      const updatedNote = manager.updateNote(originalNote.id, newContent, newColor);
      expect(updatedNote).not.toBeNull();
      expect(updatedNote?.id).toBe(originalNote.id);
      expect(updatedNote?.content).toBe(newContent);
      expect(updatedNote?.color).toBe(newColor);

      const fetchedNote = manager.getNote(originalNote.id);
      expect(fetchedNote?.content).toBe(newContent);
      expect(fetchedNote?.color).toBe(newColor);
    });

    it('should update only content if newColor is not provided', () => {
        const originalNote = manager.createNote("Content", "#ABCDEF");
        const newContent = "New Content Only";
        
        const updatedNote = manager.updateNote(originalNote.id, newContent);
        expect(updatedNote?.content).toBe(newContent);
        expect(updatedNote?.color).toBe(originalNote.color); // Color should remain unchanged
      });

    it('should return null if trying to update a non-existent note', () => {
      const updatedNote = manager.updateNote("non-existent-id", "Content");
      expect(updatedNote).toBeNull();
    });
  });

  describe('deleteNote', () => {
    it('should delete an existing note and return true', () => {
      const noteToDelete = manager.createNote("To be deleted");
      const result = manager.deleteNote(noteToDelete.id);
      expect(result).toBe(true);

      const fetchedNote = manager.getNote(noteToDelete.id);
      expect(fetchedNote).toBeNull();
      expect(manager.getAllNotes().length).toBe(0);
    });

    it('should return false if trying to delete a non-existent note', () => {
      const result = manager.deleteNote("non-existent-id");
      expect(result).toBe(false);
    });
  });

  describe('setNotePosition', () => {
    it('should update the position of an existing note', () => {
      const note = manager.createNote("Note for positioning");
      const newPosition = { x: 100, y: 150 };
      
      const updatedNote = manager.setNotePosition(note.id, newPosition);
      expect(updatedNote).not.toBeNull();
      expect(updatedNote?.position).toEqual(newPosition);

      const fetchedNote = manager.getNote(note.id);
      expect(fetchedNote?.position).toEqual(newPosition);
    });

    it('should return null if trying to set position for a non-existent note', () => {
      const updatedNote = manager.setNotePosition("non-existent-id", { x: 0, y: 0 });
      expect(updatedNote).toBeNull();
    });
  });
  
  describe('clearAllNotes', () => {
    it('should remove all notes and reset ID counter', () => {
      manager.createNote("Note 1");
      manager.createNote("Note 2");
      expect(manager.getAllNotes().length).toBe(2);
      
      manager.clearAllNotes();
      expect(manager.getAllNotes().length).toBe(0);
      
      // Check if ID counter is reset (indirectly)
      // The first ID generated is usually 'note-1-...'
      const noteAfterClear = manager.createNote("Note after clear");
      // This check is a bit implementation-dependent on the _generateId format.
      // A more robust check would be to ensure it starts from a low number again if possible,
      // or simply that createNote still works.
      expect(noteAfterClear.id.startsWith('note-1-')).toBe(true);
    });
  });
});
