```javascript
// Todo utility functions and localStorage management
import { v4 as uuidv4 } from 'uuid';

// Local storage key
const TODOS_STORAGE_KEY = 'glassmorphic-todos';

// Default todo structure
const createTodo = (text, category = 'general', priority = 'medium') => ({
  id: uuidv4(),
  text: text.trim(),
  completed: false,
  category,
  priority,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  dueDate: null,
  tags: [],
  description: ''
});

// Load todos from localStorage
export const loadTodos = () => {
  try {
    const stored = localStorage.getItem(TODOS_STORAGE_KEY);
    if (!stored) return [];
    
    const todos = JSON.parse(stored);
    // Ensure todos have all required properties
    return todos.map(todo => ({
      ...createTodo(''),
      ...todo,
      // Ensure dates are properly formatted
      createdAt: todo.createdAt || new Date().toISOString(),
      updatedAt: todo.updatedAt || new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error loading todos from localStorage:', error);
    return [];
  }
};

// Save todos to localStorage
export const saveTodos = (todos) => {
  try {
    localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(todos));
    return true;
  } catch (error) {
    console.error('Error saving todos to localStorage:', error);
    return false;
  }
};

// Add a new todo
export const addTodo = (todos, text, category = 'general', priority = 'medium') => {
  if (!text || !text.trim()) {
    throw new Error('Todo text cannot be empty');
  }
  
  const newTodo = createTodo(text, category, priority);
  const updatedTodos = [newTodo, ...todos];
  saveTodos(updatedTodos);
  return updatedTodos;
};

// Update an existing todo
export const updateTodo = (todos, id, updates) => {
  const updatedTodos = todos.map(todo => 
    todo.id === id 
      ? { 
          ...todo, 
          ...updates, 
          updatedAt: new Date().toISOString(),
          // Ensure text is trimmed if being updated
          text: updates.text ? updates.text.trim() : todo.text
        }
      : todo
  );
  saveTodos(updatedTodos);
  return updatedTodos;
};

// Toggle todo completion status
export const toggleTodo = (todos, id) => {
  return updateTodo(todos, id, { 
    completed: !todos.find(todo => todo.id === id)?.completed 
  });
};

// Delete a todo
export const deleteTodo = (todos, id) => {
  const updatedTodos = todos.filter(todo => todo.id !== id);
  saveTodos(updatedTodos);
  return updatedTodos;
};

// Delete multiple todos
export const deleteTodos = (todos, ids) => {
  const updatedTodos = todos.filter(todo => !ids.includes(todo.id));
  saveTodos(updatedTodos);
  return updatedTodos;
};

// Clear all completed todos
export const clearCompleted = (todos) => {
  const updatedTodos = todos.filter(todo => !todo.completed);
  saveTodos(updatedTodos);
  return updatedTodos;
};

// Mark all todos as completed/uncompleted
export const toggleAllTodos = (todos, completed = true) => {
  const updatedTodos = todos.map(todo => ({
    ...todo,
    completed,
    updatedAt: new Date().toISOString()
  }));
  saveTodos(updatedTodos);
  return updatedTodos;
};

// Filter todos by status
export const filterTodos = (todos, filter) => {
  switch (filter) {
    case 'active':
      return todos.filter(todo => !todo.completed);
    case 'completed':
      return todos.filter(todo => todo.completed);
    case 'all':
    default:
      return todos;
  }
};

// Filter todos by category
export const filterByCategory = (todos, category) => {
  if (!category || category === 'all') return todos;
  return todos.filter(todo => todo.category === category);
};

// Filter todos by priority
export const filterByPriority = (todos, priority) => {
  if (!priority || priority === 'all') return todos;
  return todos.filter(todo => todo.priority === priority);
};

// Search todos by text
export const searchTodos = (todos, searchTerm) => {
  if (!searchTerm.trim()) return todos;
  
  const term = searchTerm.toLowerCase();
  return todos.filter(todo => 
    todo.text.toLowerCase().includes(term) ||
    todo.description.toLowerCase().includes(term) ||
    todo.category.toLowerCase().includes(term) ||
    todo.tags.some(tag => tag.toLowerCase().includes(term))
  );
};

// Sort todos by different criteria
export const sortTodos = (todos, sortBy = 'createdAt', order = 'desc') => {
  const sorted = [...todos].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'text':
        aValue = a.text.toLowerCase();
        bValue = b.text.toLowerCase();
        break;
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        aValue = priorityOrder[a.priority] || 0;
        bValue = priorityOrder[b.priority] || 0;
        break;
      case 'category':
        aValue = a.category.toLowerCase();
        bValue = b.category.toLowerCase();
        break;
      case 'completed':
        aValue = a.completed ? 1 : 0;
        bValue = b.completed ? 1 : 0;
        break;
      case 'dueDate':
        aValue = a.dueDate ? new Date(a.dueDate).getTime() : 0;
        bValue = b.dueDate ? new Date(b.dueDate).getTime() : 0;
        break;
      case 'updatedAt':
        aValue = new Date(a.updatedAt).getTime();
        bValue = new Date(b.updatedAt).getTime();
        break;
      case 'createdAt':
      default:
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
    }
    
    if (order === 'asc') {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    }
  });
  
  return sorted;
};

// Get todo statistics
export const getTodoStats = (todos) => {
  const total = todos.length;
  const completed = todos.filter(todo => todo.completed).length;
  const active = total - completed;
  const overdue = todos.filter(todo => 
    todo.dueDate && 
    !todo.completed && 
    new Date(todo.dueDate) < new Date()
  ).length;
  
  const byCategory = todos.reduce((acc, todo) => {
    acc[todo.category] = (acc[todo.category] || 0) + 1;
    return acc;
  }, {});
  
  const byPriority = todos.reduce((acc, todo) => {
    acc[todo.priority] = (acc[todo.priority] || 0) + 1;
    return acc;
  }, {});
  
  return {
    total,
    completed,
    active,
    overdue,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    byCategory,
    byPriority
  };
};

// Get unique categories from todos
export const getCategories = (todos) => {
  const categories = [...new Set(todos.map(todo => todo.category))];
  return categories.sort();
};

// Get unique tags from todos
export const getTags = (todos) => {
  const tags = [...new Set(todos.flatMap(todo => todo.tags))];
  return tags.sort();
};

// Export/Import functionality
export const exportTodos = (todos) => {
  try {
    const dataStr = JSON.stringify(todos, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `todos-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error exporting todos:', error);
    return false;
  }
};

// Import todos from JSON file
export const importTodos = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const importedTodos = JSON.parse(e.target.result);
        
        // Validate imported data
        if (!Array.isArray(importedTodos)) {
          throw new Error('Invalid file format: expected array of todos');
        }
        
        // Validate and normalize each todo
        const validTodos = importedTodos
          .filter(todo => todo && typeof todo === 'object' && todo.text)
          .map(todo => ({
            ...createTodo(todo.text, todo.category, todo.priority),
            ...todo,
            id: todo.id || uuidv4(), // Ensure unique ID
            createdAt: todo.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }));
        
        resolve(validTodos);
      } catch (error) {
        reject(new Error('Invalid JSON file or file format'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsText(file);
  });
};

// Duplicate a todo
export const duplicateTodo = (todos, id) => {
  const todoToDuplicate = todos.find(todo => todo.id === id);
  if (!todoToDuplicate) {
    throw new Error('Todo not found');
  }
  
  const duplicatedTodo = {
    ...todoToDuplicate,
    id: uuidv4(),
    text: `${todoToDuplicate.text} (Copy)`,
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  const updatedTodos = [duplicatedTodo, ...todos];
  saveTodos(updatedTodos);
  return updatedTodos;
};

// Batch operations
export const batchUpdateTodos = (todos, ids, updates) => {
  const updatedTodos = todos.map(todo => 
    ids.includes(todo.id) 
      ? { 
          ...todo, 
          ...updates, 
          updatedAt: new Date().toISOString() 
        }
      : todo
  );
  saveTodos(updatedTodos);
  return updatedTodos;
};

// Default categories and priorities
export const DEFAULT_CATEGORIES = [
  'general',
  'work',
  'personal',
  'shopping',
  'health',
  'learning',
  'projects'
];

export const DEFAULT_PRIORITIES = [
  'low',
  'medium',
  'high'
];

// Priority colors for UI
export const PRIORITY_COLORS = {
  low: 'from-blue-400 to-cyan-400',
  medium: 'from-yellow-400 to-orange-400',
  high: 'from-red-400 to-pink-400'
};

// Category colors for UI
export const CATEGORY_COLORS = {
  general: 'from-gray-400 to-slate-400',
  work: 'from-blue-400 to-indigo-400',
  personal: 'from-green-400 to-emerald-400',
  shopping: 'from-purple-400 to-violet-400',
  health: 'from-red-400 to-rose-400',
  learning: 'from-yellow-400 to-amber-400',
  projects: 'from-cyan-400 to-teal-400'
};
```