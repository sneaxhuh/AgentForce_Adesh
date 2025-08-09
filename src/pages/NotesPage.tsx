import React, { useState, useRef } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { generateNotesSuggestions, generateNoteSummary } from '../services/aiService';
import { FileText, Upload, Plus, Search, Tag, Lightbulb, BookOpen, Trash2, Edit3, Save, X, FileUp as FileUpload, Sparkles, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const NotesPage: React.FC = () => {
  const { notes, setNotes } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [newNote, setNewNote] = useState({ title: '', content: '', tags: [] as string[] });
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState<string | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sample tags for demonstration
  const availableTags = [
    'Computer Science', 'Mathematics', 'Physics', 'Biology', 'Chemistry',
    'History', 'Literature', 'Psychology', 'Business', 'Economics'
  ];

  // Get unique tags from all notes
  const allTags = Array.from(new Set(notes.flatMap(note => note.tags)));

  // Filter notes based on search and tags
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.some(tag => note.tags.includes(tag));
    return matchesSearch && matchesTags;
  });

  const addNote = () => {
    if (!newNote.title.trim() || !newNote.content.trim()) return;

    const note = {
      id: Date.now().toString(),
      title: newNote.title,
      content: newNote.content,
      tags: newNote.tags,
      createdAt: new Date().toISOString(),
    };

    setNotes([...notes, note]);
    setNewNote({ title: '', content: '', tags: [] });
    setIsAddingNote(false);
  };

  const updateNote = (noteId: string, updatedNote: any) => {
    setNotes(notes.map(note => 
      note.id === noteId ? { ...note, ...updatedNote } : note
    ));
  };

  const deleteNote = (noteId: string) => {
    setNotes(notes.filter(note => note.id !== noteId));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setNewNote({
        title: file.name.replace(/\.[^/.]+$/, ''),
        content: content,
        tags: []
      });
      setIsAddingNote(true);
    };
    reader.readAsText(file);
  };

  const getSuggestions = async (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    setIsLoadingSuggestions(noteId);
    try {
      const suggestions = await generateNotesSuggestions(note.content);
      updateNote(noteId, { aiSuggestions: suggestions });
    } catch (error) {
      console.error('Failed to get suggestions:', error);
    } finally {
      setIsLoadingSuggestions(null);
    }
  };

  const getSummary = async (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    setIsLoadingSummary(noteId);
    try {
      const summary = await generateNoteSummary(note.content);
      updateNote(noteId, { summary });
    } catch (error) {
      console.error('Failed to get summary:', error);
    } finally {
      setIsLoadingSummary(null);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const addTagToNote = (tag: string) => {
    if (!newNote.tags.includes(tag)) {
      setNewNote(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    }
  };

  const removeTagFromNote = (tag: string) => {
    setNewNote(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Notes & Research Hub 📚</h1>
            <p className="text-indigo-100 text-lg">
              Organize your study notes and get AI-powered insights to improve your learning.
            </p>
            <div className="flex items-center space-x-6 mt-4">
              <div className="flex items-center space-x-2">
                <FileText size={16} />
                <span className="text-sm">{notes.length} Notes</span>
              </div>
              <div className="flex items-center space-x-2">
                <Tag size={16} />
                <span className="text-sm">{allTags.length} Tags</span>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <BookOpen size={64} className="text-indigo-300 opacity-50" />
          </div>
        </div>
      </motion.div>

      {/* Action Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search notes..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={() => setIsAddingNote(true)}
              className="flex items-center space-x-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus size={16} />
              <span>New Note</span>
            </button>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Upload size={16} />
              <span>Upload</span>
            </button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Tag Filters */}
        {allTags.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filter by tags:</p>
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {tag}
                </button>
              ))}
              {selectedTags.length > 0 && (
                <button
                  onClick={() => setSelectedTags([])}
                  className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* Add Note Modal */}
      {isAddingNote && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add New Note</h3>
              <button
                onClick={() => {
                  setIsAddingNote(false);
                  setNewNote({ title: '', content: '', tags: [] });
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={newNote.title}
                  onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter note title..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content
                </label>
                <textarea
                  value={newNote.content}
                  onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Write your notes here..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {availableTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => addTagToNote(tag)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        newNote.tags.includes(tag)
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                {newNote.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Selected:</span>
                    {newNote.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm"
                      >
                        {tag}
                        <button
                          onClick={() => removeTagFromNote(tag)}
                          className="ml-1 text-indigo-600 hover:text-indigo-800"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={addNote}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Save Note
              </button>
              <button
                onClick={() => {
                  setIsAddingNote(false);
                  setNewNote({ title: '', content: '', tags: [] });
                }}
                className="px-6 py-3 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.map((note, index) => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-gray-900 dark:text-white text-lg line-clamp-2">
                  {note.title}
                </h3>
                <div className="flex space-x-1">
                  <button
                    onClick={() => setEditingNoteId(note.id)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                {note.content}
              </div>

              {/* Tags */}
              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {note.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* AI Features */}
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <button
                    onClick={() => getSuggestions(note.id)}
                    disabled={isLoadingSuggestions === note.id}
                    className="flex-1 flex items-center justify-center space-x-2 py-2 px-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors text-sm disabled:opacity-50"
                  >
                    {isLoadingSuggestions === note.id ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <Lightbulb size={14} />
                    )}
                    <span>Suggest</span>
                  </button>
                  
                  <button
                    onClick={() => getSummary(note.id)}
                    disabled={isLoadingSummary === note.id}
                    className="flex-1 flex items-center justify-center space-x-2 py-2 px-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm disabled:opacity-50"
                  >
                    {isLoadingSummary === note.id ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <Sparkles size={14} />
                    )}
                    <span>Summarize</span>
                  </button>
                </div>

                {/* AI Suggestions */}
                {note.aiSuggestions && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">AI Suggestions:</h4>
                    <ul className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
                      {note.aiSuggestions.slice(0, 3).map((suggestion, idx) => (
                        <li key={idx}>• {suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* AI Summary */}
                {note.summary && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">AI Summary:</h4>
                    <p className="text-xs text-blue-700 dark:text-blue-300 line-clamp-3">
                      {note.summary}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                {new Date(note.createdAt).toLocaleDateString()}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredNotes.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center shadow-sm"
        >
          <FileText size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {searchTerm || selectedTags.length > 0 ? 'No matching notes' : 'No notes yet'}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {searchTerm || selectedTags.length > 0 
              ? 'Try adjusting your search or filter criteria.'
              : 'Create your first note or upload existing notes to get started.'
            }
          </p>
          {!searchTerm && selectedTags.length === 0 && (
            <button
              onClick={() => setIsAddingNote(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200"
            >
              Create Your First Note
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default NotesPage;