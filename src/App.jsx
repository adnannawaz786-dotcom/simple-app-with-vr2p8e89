import React, { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TodoList from './components/TodoList';
import TodoForm from './components/TodoForm';
import { loadTodos, saveTodos, generateId } from './utils/todoHelpers';
import { Sparkles, Moon, Sun, Palette } from 'lucide-react';

// Theme Context
const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Todo Context
const TodoContext = createContext();

export const useTodos = () => {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodos must be used within a TodoProvider');
  }
  return context;
};

// Theme Provider Component
const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('aurora');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const themes = {
    aurora: 'theme-aurora',
    cosmic: 'theme-cosmic',
    neon: 'theme-neon',
    sunset: 'theme-sunset',
    ocean: 'theme-ocean'
  };

  const toggleTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('todo-theme', newTheme);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('todo-dark-mode', (!isDarkMode).toString());
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('todo-theme');
    const savedDarkMode = localStorage.getItem('todo-dark-mode');
    
    if (savedTheme && themes[savedTheme]) {
      setTheme(savedTheme);
    }
    
    if (savedDarkMode) {
      setIsDarkMode(savedDarkMode === 'true');
    }
  }, []);

  const value = {
    theme,
    themes,
    isDarkMode,
    toggleTheme,
    toggleDarkMode
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Todo Provider Component
const TodoProvider = ({ children }) => {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState('all'); // all, active, completed
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTodo, setEditingTodo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load todos on component mount
  useEffect(() => {
    const loadedTodos = loadTodos();
    setTodos(loadedTodos);
    setIsLoading(false);
  }, []);

  // Save todos whenever todos state changes
  useEffect(() => {
    if (!isLoading) {
      saveTodos(todos);
    }
  }, [todos, isLoading]);

  // Add new todo
  const addTodo = (todoData) => {
    const newTodo = {
      id: generateId(),
      text: todoData.text,
      description: todoData.description || '',
      priority: todoData.priority || 'medium',
      category: todoData.category || 'general',
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dueDate: todoData.dueDate || null
    };

    setTodos(prevTodos => [newTodo, ...prevTodos]);
    return newTodo;
  };

  // Update existing todo
  const updateTodo = (id, updates) => {
    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === id
          ? { ...todo, ...updates, updatedAt: new Date().toISOString() }
          : todo
      )
    );
  };

  // Delete todo
  const deleteTodo = (id) => {
    setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
  };

  // Toggle todo completion
  const toggleTodo = (id) => {
    updateTodo(id, { completed: !todos.find(todo => todo.id === id)?.completed });
  };

  // Clear completed todos
  const clearCompleted = () => {
    setTodos(prevTodos => prevTodos.filter(todo => !todo.completed));
  };

  // Mark all as completed
  const markAllCompleted = () => {
    const hasIncomplete = todos.some(todo => !todo.completed);
    setTodos(prevTodos =>
      prevTodos.map(todo => ({ ...todo, completed: hasIncomplete }))
    );
  };

  // Filter todos based on current filter and search query
  const filteredTodos = todos.filter(todo => {
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'active' && !todo.completed) ||
      (filter === 'completed' && todo.completed);

    const matchesSearch = 
      !searchQuery ||
      todo.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      todo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      todo.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // Get todo statistics
  const stats = {
    total: todos.length,
    completed: todos.filter(todo => todo.completed).length,
    active: todos.filter(todo => !todo.completed).length,
    overdue: todos.filter(todo => 
      !todo.completed && 
      todo.dueDate && 
      new Date(todo.dueDate) < new Date()
    ).length
  };

  const value = {
    todos: filteredTodos,
    allTodos: todos,
    filter,
    searchQuery,
    editingTodo,
    isLoading,
    stats,
    setFilter,
    setSearchQuery,
    setEditingTodo,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    clearCompleted,
    markAllCompleted
  };

  return (
    <TodoContext.Provider value={value}>
      {children}
    </TodoContext.Provider>
  );
};

// Main App Component
function App() {
  const { theme, themes, isDarkMode, toggleTheme, toggleDarkMode } = useTheme();
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  return (
    <div className={`app ${themes[theme]} ${isDarkMode ? 'dark' : ''}`}>
      {/* Animated Background */}
      <div className="background-container">
        <div className="background-gradient"></div>
        <div className="background-pattern"></div>
        <div className="floating-orbs">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative min-h-screen">
        {/* Header */}
        <motion.header 
          className="glass-card sticky top-0 z-50 backdrop-blur-lg"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <motion.div 
                className="flex items-center space-x-3"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="icon-glow">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold gradient-text">
                  GlassTodos
                </h1>
              </motion.div>

              {/* Theme Controls */}
              <div className="flex items-center space-x-2">
                <motion.button
                  onClick={toggleDarkMode}
                  className="glass-button p-2"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                >
                  {isDarkMode ? (
                    <Sun className="w-5 h-5" />
                  ) : (
                    <Moon className="w-5 h-5" />
                  )}
                </motion.button>

                <div className="relative">
                  <motion.button
                    onClick={() => setShowThemeSelector(!showThemeSelector)}
                    className="glass-button p-2"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Change theme"
                  >
                    <Palette className="w-5 h-5" />
                  </motion.button>

                  <AnimatePresence>
                    {showThemeSelector && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.9 }}
                        className="absolute right-0 top-full mt-2 glass-card p-3 min-w-[120px] z-50"
                      >
                        <div className="space-y-1">
                          {Object.keys(themes).map((themeName) => (
                            <motion.button
                              key={themeName}
                              onClick={() => {
                                toggleTheme(themeName);
                                setShowThemeSelector(false);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm capitalize transition-colors ${
                                theme === themeName 
                                  ? 'bg-primary/20 text-primary' 
                                  : 'hover:bg-white/10'
                              }`}
                              whileHover={{ x: 4 }}
                            >
                              {themeName}
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Todo Form */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <TodoForm />
            </motion.div>

            {/* Todo List */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <TodoList />
            </motion.div>
          </div>
        </main>

        {/* Footer */}
        <motion.footer 
          className="glass-card mt-16"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="container mx-auto px-4 py-6">
            <div className="text-center">
              <p className="text-sm opacity-70">
                Made with ✨ using React, Vite & Glassmorphism
              </p>
            </div>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}

// Root App Component with Providers
export default function AppWithProviders() {
  return (
    <ThemeProvider>
      <TodoProvider>
        <App />
      </TodoProvider>
    </ThemeProvider>
  );
}
