"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  HiSparkles,
  HiCheckCircle,
  HiClock,
  HiExclamationTriangle,
  HiGlobeAlt,
  HiDocumentText,
  HiBookOpen,
  HiCog,
  HiMagnifyingGlass,
  HiCube,
  HiPlay,
  HiShieldCheck
} from "react-icons/hi2";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'error' | 'retrying';

interface AgentTask {
  id: string;
  name: string;
  description: string;
  status: TaskStatus;
  progress?: number;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  retryCount?: number;
  subtasks?: AgentTask[];
}

interface AIAgentVisualizationProps {
  courseId: string;
}

// Mock data structure - will be replaced with real API calls
const defaultTasks: AgentTask[] = [
  {
    id: '1',
    name: 'Ingest Materials',
    description: 'Downloading and processing PDFs and documents',
    status: 'pending',
    subtasks: [
      { id: '1-1', name: 'Download PDFs', description: 'Fetching material URLs', status: 'pending' },
      { id: '1-2', name: 'Extract Text', description: 'Extracting text content from PDFs', status: 'pending' },
      { id: '1-3', name: 'Chunk Content', description: 'Breaking content into searchable chunks', status: 'pending' },
    ],
  },
  {
    id: '2',
    name: 'Web Research',
    description: 'Searching for university syllabi and course materials',
    status: 'pending',
    subtasks: [
      { id: '2-1', name: 'Search MIT/IIT Sources', description: 'Finding relevant course syllabi', status: 'pending' },
      { id: '2-2', name: 'Index Web Content', description: 'Processing and indexing web sources', status: 'pending' },
    ],
  },
  {
    id: '3',
    name: 'Generate Course Structure',
    description: 'Creating modules and lessons following Bloom\'s Taxonomy',
    status: 'pending',
    subtasks: [
      { id: '3-1', name: 'Design Curriculum', description: 'Planning course progression', status: 'pending' },
      { id: '3-2', name: 'Create Modules', description: 'Generating module structure', status: 'pending' },
      { id: '3-3', name: 'Create Lessons', description: 'Generating lesson outlines', status: 'pending' },
    ],
  },
  {
    id: '4',
    name: 'Vectorize Content',
    description: 'Storing content in vector database for RAG',
    status: 'pending',
    subtasks: [
      { id: '4-1', name: 'Generate Embeddings', description: 'Creating vector embeddings', status: 'pending' },
      { id: '4-2', name: 'Store in Qdrant', description: 'Saving to vector database', status: 'pending' },
    ],
  },
  {
    id: '5',
    name: 'Generate Lesson Content',
    description: 'Creating MDX content for each lesson',
    status: 'pending',
    subtasks: [],
  },
  {
    id: '6',
    name: 'Create Animations',
    description: 'Generating visual animations where needed',
    status: 'pending',
    subtasks: [],
  },
  {
    id: '7',
    name: 'Quality Verification',
    description: 'Verifying content quality and correctness',
    status: 'pending',
    subtasks: [
      { id: '7-1', name: 'Check Content Quality', description: 'Reviewing generated content', status: 'pending' },
      { id: '7-2', name: 'Validate Structure', description: 'Ensuring proper course flow', status: 'pending' },
    ],
  },
  {
    id: '8',
    name: 'Save to Database',
    description: 'Storing course in staging mode',
    status: 'pending',
    subtasks: [],
  },
];

const getTaskIcon = (taskName: string) => {
  const name = taskName.toLowerCase();
  if (name.includes('ingest') || name.includes('material')) return HiDocumentText;
  if (name.includes('web') || name.includes('research')) return HiGlobeAlt;
  if (name.includes('structure') || name.includes('curriculum')) return HiBookOpen;
  if (name.includes('vector') || name.includes('embedding')) return HiCube;
  if (name.includes('content') || name.includes('lesson')) return HiDocumentText;
  if (name.includes('animation')) return HiPlay;
  if (name.includes('quality') || name.includes('verification')) return HiShieldCheck;
  if (name.includes('save') || name.includes('database')) return HiCog;
  return HiSparkles;
};

const getStatusColor = (status: TaskStatus) => {
  switch (status) {
    case 'completed':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    case 'in_progress':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    case 'error':
      return 'bg-red-500/10 text-red-400 border-red-500/30';
    case 'retrying':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
  }
};

const getStatusIcon = (status: TaskStatus) => {
  switch (status) {
    case 'completed':
      return HiCheckCircle;
    case 'in_progress':
      return HiClock;
    case 'error':
      return HiExclamationTriangle;
    case 'retrying':
      return HiCog;
    default:
      return HiClock;
  }
};

function TaskItem({ task, level = 0 }: { task: AgentTask; level?: number }) {
  const Icon = getTaskIcon(task.name);
  const StatusIcon = getStatusIcon(task.status);
  const hasSubtasks = task.subtasks && task.subtasks.length > 0;
  const completedSubtasks = task.subtasks?.filter(t => t.status === 'completed').length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const subtaskProgress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`${level > 0 ? 'ml-8 mt-2' : ''}`}
    >
      <div className={`flex items-start gap-3 p-3 rounded-lg border ${task.status === 'in_progress'
        ? 'bg-amber-500/5 border-amber-500/20'
        : task.status === 'completed'
          ? 'bg-emerald-500/5 border-emerald-500/20'
          : task.status === 'error'
            ? 'bg-red-500/5 border-red-500/20'
            : 'bg-slate-800/50 border-white/5'
        }`}>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${task.status === 'in_progress'
          ? 'bg-amber-500/20 text-amber-400'
          : task.status === 'completed'
            ? 'bg-emerald-500/20 text-emerald-400'
            : task.status === 'error'
              ? 'bg-red-500/20 text-red-400'
              : 'bg-slate-700 text-slate-400'
          }`}>
          {task.status === 'in_progress' ? (
            <StatusIcon className="w-5 h-5 animate-spin" />
          ) : (
            <Icon className="w-5 h-5" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-white text-sm">{task.name}</h4>
              <Badge variant="outline" className={`text-xs ${getStatusColor(task.status)}`}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {task.status === 'in_progress' ? 'In Progress' :
                  task.status === 'completed' ? 'Completed' :
                    task.status === 'error' ? 'Error' :
                      task.status === 'retrying' ? `Retrying (${task.retryCount || 0})` :
                        'Pending'}
              </Badge>
            </div>
            {task.progress !== undefined && task.status === 'in_progress' && (
              <span className="text-xs text-slate-400">{task.progress}%</span>
            )}
          </div>

          <p className="text-xs text-slate-400 mb-2">{task.description}</p>

          {hasSubtasks && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Subtasks: {completedSubtasks}/{totalSubtasks}</span>
                <span>{Math.round(subtaskProgress)}%</span>
              </div>
              <Progress value={subtaskProgress} className="h-1" />
            </div>
          )}

          {task.progress !== undefined && task.status === 'in_progress' && (
            <Progress value={task.progress} className="h-1 mt-2" />
          )}

          {task.error && (
            <div className="mt-2 p-2 rounded bg-red-500/10 border border-red-500/20">
              <p className="text-xs text-red-400">{task.error}</p>
            </div>
          )}

          {task.startedAt && (
            <p className="text-xs text-slate-500 mt-1">
              Started: {new Date(task.startedAt).toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>

      <AnimatePresence>
        {hasSubtasks && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-2 space-y-2"
          >
            {task.subtasks?.map((subtask) => (
              <TaskItem key={subtask.id} task={subtask} level={level + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface WebSearchLog {
  timestamp: number;
  step: string;
  message: string;
  data?: {
    query?: string;
    url?: string;
    title?: string;
    result_count?: number;
    content_length?: number;
    [key: string]: any;
  };
}

export function AIAgentVisualization({ courseId }: AIAgentVisualizationProps) {
  const [tasks, setTasks] = useState<AgentTask[]>(defaultTasks);
  const [isGenerating, setIsGenerating] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [webSearchLogs, setWebSearchLogs] = useState<WebSearchLog[]>([]);
  const [showSearchLogs, setShowSearchLogs] = useState(false);

  // Fetch real-time agent status from API
  useEffect(() => {
    const fetchAgentStatus = async () => {
      try {
        const response = await fetch(`/api/courses/${courseId}/agent-status`);
        if (!response.ok) throw new Error('Failed to fetch agent status');

        const data = await response.json();

        if (data.tasks) {
          setTasks(data.tasks as AgentTask[]);
        }

        setIsGenerating(data.status === 'generating');
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching agent status:', error);
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchAgentStatus();

    // Poll every 3 seconds for updates
    const interval = setInterval(fetchAgentStatus, 3000);

    return () => clearInterval(interval);
  }, [courseId]);

  // Fetch web search logs
  useEffect(() => {
    const fetchSearchLogs = async () => {
      try {
        const response = await fetch(`/api/courses/${courseId}/web-search-logs`);
        if (!response.ok) {
          // Log error but don't show to user (might be normal if course hasn't started)
          if (response.status !== 404) {
            console.warn('[Web Search Logs] Failed to fetch:', response.status);
          }
          return;
        }

        const data = await response.json();
        if (data.logs) {
          const logs = data.logs as WebSearchLog[];
          setWebSearchLogs(logs);
          
          // Auto-show logs if they exist and we're generating
          if (logs.length > 0 && isGenerating && !showSearchLogs) {
            setShowSearchLogs(true);
          }
          
          // Debug logging
          if (logs.length > 0) {
            console.log(`[Web Search Logs] Fetched ${logs.length} logs for course ${courseId}`);
          }
        }
      } catch (error) {
        console.error('[Web Search Logs] Error:', error);
      }
    };

    // Initial fetch
    fetchSearchLogs();

    // Poll every 2 seconds for search logs (more frequent for real-time feel)
    const interval = setInterval(fetchSearchLogs, 2000);

    return () => clearInterval(interval);
  }, [courseId, isGenerating, showSearchLogs]);

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalTasks = tasks.length;
  const overallProgress = (completedTasks / totalTasks) * 100;
  const currentTask = tasks.find(t => t.status === 'in_progress');

  if (isLoading) {
    return (
      <Card className="bg-slate-900/50 border-white/10">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-slate-800 rounded w-1/3"></div>
            <div className="h-2 bg-slate-800 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900/50 border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HiSparkles className={`w-5 h-5 ${isGenerating ? 'text-amber-400 animate-pulse' : 'text-emerald-400'}`} />
            <CardTitle className="text-white">AI Agent Activity</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSearchLogs(!showSearchLogs)}
              className="text-xs px-2 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-colors"
              disabled={webSearchLogs.length === 0}
            >
              <HiMagnifyingGlass className="w-3 h-3 inline mr-1" />
              {showSearchLogs ? 'Hide' : 'Show'} Search Logs ({webSearchLogs.length})
            </button>
            <Badge variant="outline" className={isGenerating ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}>
              {isGenerating ? (
                <>
                  <HiClock className="w-3 h-3 mr-1 animate-spin" />
                  Generating
                </>
              ) : (
                <>
                  <HiCheckCircle className="w-3 h-3 mr-1" />
                  Complete
                </>
              )}
            </Badge>
          </div>
        </div>
        <CardDescription>
          {currentTask
            ? `Currently: ${currentTask.name} - ${currentTask.description}`
            : 'All tasks completed'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Overall Progress</span>
            <span className="text-white font-medium">{completedTasks}/{totalTasks} tasks</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>

        {/* Web Search Logs */}
        {showSearchLogs && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 p-4 rounded-lg bg-slate-800/50 border border-amber-500/20"
          >
            <div className="flex items-center gap-2 mb-3">
              <HiMagnifyingGlass className="w-4 h-4 text-amber-400" />
              <h4 className="text-sm font-medium text-white">🌐 Web Search Activity</h4>
              <Badge variant="outline" className="ml-auto bg-amber-500/10 text-amber-400 border-amber-500/30 text-xs">
                {webSearchLogs.length} events
              </Badge>
            </div>
            {webSearchLogs.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <HiMagnifyingGlass className="w-8 h-8 mx-auto mb-2 text-slate-500" />
                <p className="text-sm">Waiting for web search to begin...</p>
                <p className="text-xs text-slate-500 mt-1">
                  Logs will appear here when the AI agent starts searching the web
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                <AnimatePresence mode="popLayout">
                  {webSearchLogs.map((log, idx) => {
                  const stepColors: Record<string, string> = {
                    start: "text-blue-400",
                    query: "text-amber-400",
                    query_results: "text-emerald-400",
                    ai_answer: "text-purple-400",
                    scraping: "text-cyan-400",
                    scraping_start: "text-yellow-400",
                    scraping_success: "text-green-400",
                    scraping_skip: "text-slate-400",
                    source_added: "text-emerald-400",
                    complete: "text-blue-400",
                    ai_summary: "text-purple-400",
                  };
                  
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-xs p-3 rounded-lg bg-slate-900/70 border border-slate-700/50 hover:border-amber-500/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className={`font-semibold ${stepColors[log.step] || "text-amber-400"}`}>
                              [{log.step}]
                            </span>
                            <span className="text-slate-500 text-[10px]">
                              {new Date(log.timestamp * 1000).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-slate-200 mb-2">{log.message}</p>
                          {log.data && Object.keys(log.data).length > 0 && (
                            <div className="mt-2 space-y-1.5 pl-2 border-l-2 border-amber-500/20">
                              {log.data.url && (
                                <div className="text-slate-400">
                                  <HiGlobeAlt className="w-3 h-3 inline mr-1 text-amber-400" />
                                  <a 
                                    href={log.data.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="hover:text-amber-400 underline break-all"
                                  >
                                    {log.data.url}
                                  </a>
                                </div>
                              )}
                              {log.data.query && (
                                <div className="text-slate-400">
                                  <span className="text-slate-500 font-medium">🔍 Query:</span> 
                                  <span className="ml-1 text-slate-300">{log.data.query}</span>
                                </div>
                              )}
                              {log.data.title && (
                                <div className="text-slate-400">
                                  <span className="text-slate-500 font-medium">📄 Title:</span> 
                                  <span className="ml-1 text-slate-300">{log.data.title}</span>
                                </div>
                              )}
                              {log.data.result_count !== undefined && (
                                <div className="text-slate-400">
                                  <span className="text-slate-500 font-medium">📊 Results:</span> 
                                  <span className="ml-1 text-emerald-400">{log.data.result_count}</span>
                                </div>
                              )}
                              {log.data.content_length !== undefined && (
                                <div className="text-slate-400">
                                  <span className="text-slate-500 font-medium">📝 Content:</span> 
                                  <span className="ml-1 text-emerald-400">{log.data.content_length.toLocaleString()} chars</span>
                                </div>
                              )}
                              {log.data.sources && Array.isArray(log.data.sources) && log.data.sources.length > 0 && (
                                <div className="text-slate-400">
                                  <span className="text-slate-500 font-medium">🔗 Top Sources:</span>
                                  <ul className="ml-4 mt-1 space-y-0.5">
                                    {log.data.sources.slice(0, 3).map((source: string, i: number) => (
                                      <li key={i} className="text-[10px] truncate">
                                        <a href={source} target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 underline">
                                          {source}
                                        </a>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                  })}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}

        {/* Task List */}
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          <AnimatePresence>
            {tasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </AnimatePresence>
        </div>

        {!isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center"
          >
            <HiCheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-emerald-400">Course generation completed!</p>
            <p className="text-xs text-slate-400 mt-1">Review the course and publish when ready.</p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}





