// src/features/stickyNotes/stickyNotesManager.ts

export interface StickyNote {
  id: string;
  content: string;
  color?: string;        // e.g., hex code like '#FFFF00'
  position?: {           // Optional: position on a canvas/board
    x: number;
    y: number;
  };
}

export class StickyNotesManager {
  private notes: Map<string, StickyNote> = new Map();
  private nextId: number = 1;

  private _generateId(): string {
    return `note-${this.nextId++}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  }

  /**
   * Creates a new sticky note.
   * @param content The content of the note.
   * @param color Optional color for the note.
   * @returns The created StickyNote object.
   */
  public createNote(content: string, color?: string): StickyNote {
    const id = this._generateId();
    const newNote: StickyNote = {
      id,
      content,
      color: color || '#FFFFE0', // Default light yellow
      position: { x: 50, y: 50 }, // Default initial position
    };
    this.notes.set(id, newNote);
    return { ...newNote }; // Return a copy
  }

  /**
   * Retrieves a specific note by its ID.
   * @param id The ID of the note to retrieve.
   * @returns The StickyNote object if found, otherwise null.
   */
  public getNote(id: string): StickyNote | null {
    const note = this.notes.get(id);
    return note ? { ...note } : null; // Return a copy
  }

  /**
   * Retrieves all current sticky notes.
   * @returns An array of StickyNote objects.
   */
  public getAllNotes(): StickyNote[] {
    return Array.from(this.notes.values()).map(note => ({ ...note })); // Return copies
  }

  /**
   * Updates an existing sticky note.
   * @param id The ID of the note to update.
   * @param newContent The new content for the note.
   * @param newColor Optional new color for the note.
   * @returns The updated StickyNote object if found and updated, otherwise null.
   */
  public updateNote(id: string, newContent: string, newColor?: string): StickyNote | null {
    const note = this.notes.get(id);
    if (note) {
      const updatedNote: StickyNote = {
        ...note,
        content: newContent,
        // Only update color if a newColor is provided, otherwise keep existing
        color: typeof newColor !== 'undefined' ? newColor : note.color,
      };
      this.notes.set(id, updatedNote);
      return { ...updatedNote }; // Return a copy
    }
    return null;
  }

  /**
   * Deletes a sticky note by its ID.
   * @param id The ID of the note to delete.
   * @returns True if the note was found and deleted, otherwise false.
   */
  public deleteNote(id: string): boolean {
    return this.notes.delete(id);
  }

  /**
   * Sets the position of a specific sticky note.
   * @param id The ID of the note to update.
   * @param position The new position {x, y}.
   * @returns The updated StickyNote object if found, otherwise null.
   */
  public setNotePosition(id: string, position: { x: number; y: number }): StickyNote | null {
    const note = this.notes.get(id);
    if (note) {
      const updatedNote: StickyNote = {
        ...note,
        position,
      };
      this.notes.set(id, updatedNote);
      return { ...updatedNote }; // Return a copy
    }
    return null;
  }

  /**
   * Clears all notes from the manager.
   * Useful for cleanup in tests or resetting state.
   */
  public clearAllNotes(): void {
    this.notes.clear();
    this.nextId = 1; // Reset ID counter as well
  }
}
