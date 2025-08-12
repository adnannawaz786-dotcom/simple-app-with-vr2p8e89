```jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Edit2, Star, Calendar, Clock, Trash2 } from 'lucide-react';

const TodoList = ({ 
  todos, 
  onToggleComplete, 
  onDeleteTodo, 
  onEditTodo, 
  onToggleFavorite,
  filter 
}) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'from-red-400/30 to-pink-600/30 border-red-400/50';
      case 'medium':
        return 'from-yellow-400/30 to-orange-600/30 border-yellow-400/50';
      case 'low':
        return 'from-green-400/30 to-emerald-600/30 border-green-400/50';
      default:
        return 'from-blue-400/30 to-purple-600/30 border-blue-400/50';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      work: 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-200',
      personal: 'bg-gradient-to-r from-pink-500/20 to-rose-500/20 text-pink-200',
      shopping: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-200',
      health: 'bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-200',
      education: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-200',
      default: 'bg-gradient-to-r from-gray-500/20 to-slate-500/20 text-gray-200'
    };
    return colors[category] || colors.default;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays <= 7) return `${diffDays} days`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date().setHours(0, 0, 0, 0);
  };

  const filteredTodos = todos.filter(todo => {
    switch (filter) {
      case 'completed':
        return todo.completed;
      case 'pending':
        return !todo.completed;
      case 'favorites':
        return todo.favorite;
      case 'overdue':
        return !todo.completed && isOverdue(todo.dueDate);
      default:
        return true;
    }
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    },
    exit: { 
      opacity: 0, 
      x: -100,
      scale: 0.95,
      transition: {
        duration: 0.2
      }
    }
  };

  if (filteredTodos.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <div className="glass-card p-8 rounded-2xl backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-400/30 to-pink-400/30 flex items-center justify-center">
            <Check className="w-12 h-12 text-white/60" />
          </div>
          <h3 className="text-xl font-semibold text-white/80 mb-2">
            {filter === 'completed' ? 'No completed tasks' : 
             filter === 'pending' ? 'No pending tasks' :
             filter === 'favorites' ? 'No favorite tasks' :
             filter === 'overdue' ? 'No overdue tasks' :
             'No tasks yet'}
          </h3>
          <p className="text-white/60">
            {filter === 'all' || !filter ? 
              'Create your first task to get started!' : 
              'Switch to a different filter to see your tasks.'}
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      <AnimatePresence mode="popLayout">
        {filteredTodos.map((todo) => (
          <motion.div
            key={todo.id}
            variants={itemVariants}
            layout
            exit="exit"
            whileHover={{ 
              scale: 1.02,
              transition: { duration: 0.2 }
            }}
            className={`glass-card backdrop-blur-xl bg-gradient-to-br ${getPriorityColor(todo.priority)} 
                       border rounded-xl p-6 group hover:shadow-2xl hover:shadow-purple-500/10 
                       transition-all duration-300 ${todo.completed ? 'opacity-75' : ''}`}
          >
            <div className="flex items-start gap-4">
              {/* Checkbox */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onToggleComplete(todo.id)}
                className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center
                           transition-all duration-200 ${
                             todo.completed
                               ? 'bg-gradient-to-r from-green-400 to-emerald-500 border-green-400'
                               : 'border-white/40 hover:border-white/60 hover:bg-white/10'
                           }`}
              >
                <AnimatePresence>
                  {todo.completed && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                    >
                      <Check className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className={`font-semibold text-lg leading-tight transition-all duration-200 ${
                    todo.completed 
                      ? 'text-white/60 line-through' 
                      : 'text-white/90'
                  }`}>
                    {todo.title}
                  </h3>

                  {/* Favorite Star */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onToggleFavorite(todo.id)}
                    className={`flex-shrink-0 p-1 rounded-full transition-colors duration-200 ${
                      todo.favorite
                        ? 'text-yellow-400 hover:text-yellow-300'
                        : 'text-white/40 hover:text-yellow-400'
                    }`}
                  >
                    <Star 
                      className="w-5 h-5" 
                      fill={todo.favorite ? 'currentColor' : 'none'}
                    />
                  </motion.button>
                </div>

                {todo.description && (
                  <p className={`text-sm mb-3 leading-relaxed transition-all duration-200 ${
                    todo.completed 
                      ? 'text-white/40' 
                      : 'text-white/70'
                  }`}>
                    {todo.description}
                  </p>
                )}

                {/* Tags and Info */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {/* Category */}
                  {todo.category && (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(todo.category)}`}>
                      {todo.category}
                    </span>
                  )}

                  {/* Priority */}
                  <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize
                    ${todo.priority === 'high' ? 'bg-red-500/20 text-red-200' :
                      todo.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-200' :
                      todo.priority === 'low' ? 'bg-green-500/20 text-green-200' :
                      'bg-gray-500/20 text-gray-200'}`}>
                    {todo.priority || 'normal'} priority
                  </span>

                  {/* Due Date */}
                  {todo.dueDate && (
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium
                      ${isOverdue(todo.dueDate) && !todo.completed
                        ? 'bg-red-500/20 text-red-200'
                        : 'bg-blue-500/20 text-blue-200'}`}>
                      <Calendar className="w-3 h-3" />
                      {formatDate(todo.dueDate)}
                    </div>
                  )}

                  {/* Created Date */}
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-300">
                    <Clock className="w-3 h-3" />
                    {new Date(todo.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onEditTodo(todo)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 
                             text-blue-200 hover:text-blue-100 text-sm font-medium transition-all duration-200"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onDeleteTodo(todo.id)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 
                             text-red-200 hover:text-red-100 text-sm font-medium transition-all duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default TodoList;
```