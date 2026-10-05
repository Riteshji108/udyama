import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, testConnection, loginWithGoogle, logoutUser } from './lib/firebase';
import { Task, TaskStatus, TaskPriority, TaskCategory, ActiveDevice, ReviewCard } from './types';
import {
  getLocalTasks,
  saveLocalTasks,
  initializeDefaultTasks,
  subscribeToUserTasks,
  createTaskInCloud,
  updateTaskInCloud,
  deleteTaskInCloud,
  syncLocalTasksToCloud,
} from './services/taskService';
import {
  getOrCreateDeviceId,
  registerDeviceHeartbeat,
  subscribeToActiveDevices,
} from './services/deviceService';
import { subscribeToReviewCards } from './services/reviewService';

// Core UI Components
import { TaskItem } from './components/TaskItem';
import { TaskForm } from './components/TaskForm';
import { FocusTimer } from './components/FocusTimer';
import { DeviceSyncStatus } from './components/DeviceSyncStatus';
import { PracticeLab } from './components/PracticeLab';
import { ReviewQueue } from './components/ReviewQueue';
import { RoadmapView } from './components/RoadmapView';
import { MockTestView } from './components/MockTestView';
import { CommandPalette } from './components/CommandPalette';
import { StreakActivity } from './components/StreakActivity';
import { QuickFactFeed } from './components/QuickFactFeed';
import { AIInterviewSimulator } from './components/AIInterviewSimulator';
import { AITutorChat } from './components/AITutorChat';
import { ResourcesAndVideos } from './components/ResourcesAndVideos';
import { BlogAndNews } from './components/BlogAndNews';
import { PersonalizationModal, UserPersonalization } from './components/PersonalizationModal';

// Icons
import {
  IconSync,
  IconCheck,
  IconClock,
  IconLayers,
  IconCode,
  IconAward,
  IconFlame,
  IconSearch,
  IconPlus,
  IconCloudCheck,
  IconUser,
  IconDeviceLaptop,
  IconMessageSquare,
  IconVideo,
  IconBookOpen,
  IconSliders,
  IconSparkles,
} from './components/icons';

type ActiveTab =
  | 'dashboard'
  | 'tasks'
  | 'roadmaps'
  | 'practice'
  | 'mock_tests'
  | 'interview'
  | 'resources'
  | 'blog_news'
  | 'devices';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [connectionHealthy, setConnectionHealthy] = useState(true);

  // Core Data
  const [tasks, setTasks] = useState<Task[]>([]);
  const [devices, setDevices] = useState<ActiveDevice[]>([]);
  const [reviewCards, setReviewCards] = useState<ReviewCard[]>([]);

  // Navigation & UI State
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [taskFilter, setTaskFilter] = useState<'all' | 'todo' | 'completed' | 'urgent'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [activeTimerTask, setActiveTimerTask] = useState<Task | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isAITutorOpen, setIsAITutorOpen] = useState(false);
  const [isPersonalizationOpen, setIsPersonalizationOpen] = useState(false);

  // Personalization settings
  const [personalization, setPersonalization] = useState<UserPersonalization>({
    targetRole: 'Data Analyst',
    experienceLevel: 'Intermediate',
    weeklyHours: 10,
    dailyMinutes: 45,
    restDay: 'Sunday',
    focusTrack: 'data-analyst',
  });

  // Study metrics
  const [todayStudyMinutes, setTodayStudyMinutes] = useState(45);
  const [weekStudyHours, setWeekStudyHours] = useState(9.2);
  const [currentStreak, setCurrentStreak] = useState(8);
  const [longestStreak, setLongestStreak] = useState(24);

  const currentDeviceId = getOrCreateDeviceId();

  // Test server connectivity on startup as mandated by the Firebase skill
  useEffect(() => {
    testConnection().then((healthy) => {
      setConnectionHealthy(healthy);
    });
  }, []);

  // Auth observer
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  // Real-time synchronization when user is authenticated
  useEffect(() => {
    if (currentUser) {
      registerDeviceHeartbeat(currentUser.uid);

      const unsubTasks = subscribeToUserTasks(currentUser.uid, (syncedTasks) => {
        if (syncedTasks.length === 0) {
          const initialTasks = initializeDefaultTasks(currentUser.uid);
          syncLocalTasksToCloud(currentUser.uid, initialTasks).then(() => {
            setTasks(initialTasks);
          });
        } else {
          setTasks(syncedTasks);
        }
      });

      const unsubDevices = subscribeToActiveDevices(currentUser.uid, (deviceList) => {
        setDevices(deviceList);
      });

      const unsubReviews = subscribeToReviewCards(currentUser.uid, (cards) => {
        setReviewCards(cards);
      });

      return () => {
        unsubTasks?.();
        unsubDevices?.();
        unsubReviews?.();
      };
    } else {
      const local = getLocalTasks();
      if (local.length === 0) {
        const seeded = initializeDefaultTasks('guest-device-user');
        setTasks(seeded);
        saveLocalTasks(seeded);
      } else {
        setTasks(local);
      }
      setDevices([
        {
          id: currentDeviceId,
          userId: 'guest',
          deviceId: currentDeviceId,
          deviceName: 'Current Browser Session',
          deviceType: 'desktop',
          lastSeenAt: new Date().toISOString(),
          isCurrent: true,
        },
      ]);
    }
  }, [currentUser, currentDeviceId]);

  // Global open command palette listener
  useEffect(() => {
    const handleOpen = () => setIsCommandPaletteOpen(true);
    window.addEventListener('open-command-palette', handleOpen);
    return () => window.removeEventListener('open-command-palette', handleOpen);
  }, []);

  // Handlers for Task CRUD
  const handleToggleTaskStatus = async (task: Task) => {
    const nextStatus: TaskStatus = task.status === 'completed' ? 'todo' : 'completed';
    const now = new Date().toISOString();

    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? {
              ...t,
              status: nextStatus,
              completedAt: nextStatus === 'completed' ? now : undefined,
              updatedAt: now,
            }
          : t
      )
    );

    if (currentUser) {
      await updateTaskInCloud(task.id, {
        status: nextStatus,
        completedAt: nextStatus === 'completed' ? now : undefined,
      });
    } else {
      const updated = tasks.map((t) =>
        t.id === task.id
          ? {
              ...t,
              status: nextStatus,
              completedAt: nextStatus === 'completed' ? now : undefined,
              updatedAt: now,
            }
          : t
      );
      saveLocalTasks(updated);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (currentUser) {
      await deleteTaskInCloud(taskId);
    } else {
      const updated = tasks.filter((t) => t.id !== taskId);
      saveLocalTasks(updated);
    }
  };

  const handleCreateTask = async (data: {
    title: string;
    description?: string;
    priority: TaskPriority;
    category: TaskCategory;
    trackSlug?: string;
    estimatedMinutes?: number;
    dueDate?: string;
  }) => {
    const userId = currentUser?.uid || 'guest-device-user';
    if (currentUser) {
      const created = await createTaskInCloud({
        userId,
        ...data,
        status: 'todo',
      });
      setTasks((prev) => [created, ...prev.filter((t) => t.id !== created.id)]);
    } else {
      const now = new Date().toISOString();
      const newTask: Task = {
        id: `task_local_${Date.now()}`,
        userId,
        ...data,
        status: 'todo',
        createdAt: now,
        updatedAt: now,
      };
      const nextTasks = [newTask, ...tasks];
      setTasks(nextTasks);
      saveLocalTasks(nextTasks);
    }
  };

  const handleAddTaskFromRoadmap = async (title: string, trackSlug: string, minutes: number) => {
    await handleCreateTask({
      title,
      trackSlug,
      priority: 'high',
      category: 'roadmap_study',
      estimatedMinutes: minutes,
      dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    });
  };

  const handleGoogleSignIn = async () => {
    try {
      const user = await loginWithGoogle();
      if (user) {
        const local = getLocalTasks();
        if (local.length > 0) {
          await syncLocalTasksToCloud(user.uid, local);
        }
      }
    } catch (e) {
      console.error('Sign-in error:', e);
    }
  };

  const handleSignOut = async () => {
    await logoutUser();
  };

  const handleSessionLogged = (durationSec: number) => {
    const mins = Math.round(durationSec / 60);
    setTodayStudyMinutes((m) => m + mins);
    setWeekStudyHours((h) => Number((h + mins / 60).toFixed(1)));
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (taskFilter === 'todo' && t.status === 'completed') return false;
    if (taskFilter === 'completed' && t.status !== 'completed') return false;
    if (taskFilter === 'urgent' && t.priority !== 'urgent') return false;
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
    return true;
  });

  const todoTasks = tasks.filter((t) => t.status !== 'completed');
  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const priorityTask = todoTasks.find((t) => t.priority === 'urgent') || todoTasks[0];

  return (
    <div className="min-h-screen bg-[#F2F3F1] text-[#253238] flex flex-col antialiased selection:bg-[#2E5B66] selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#E7E9E6]/95 backdrop-blur-xs border-b border-[#C8CECB] px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2 text-left cursor-pointer group"
            >
              <div className="w-8 h-8 rounded bg-[#2E5B66] flex items-center justify-center text-white font-serif font-bold text-lg shadow-none">
                U
              </div>
              <div>
                <span className="font-serif font-bold text-lg tracking-tight text-[#253238] group-hover:text-[#2E5B66]">
                  UDYAMA
                </span>
                <span className="hidden sm:inline-block text-[10px] text-[#5D676C] ml-2 font-mono uppercase tracking-widest border-l border-[#C8CECB] pl-2">
                  Learning & Productivity OS
                </span>
              </div>
            </button>
          </div>

          {/* Quick Actions & Search */}
          <div className="flex items-center gap-2">
            {/* Command Palette Trigger */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="flex items-center gap-2 bg-[#F2F3F1] border border-[#C8CECB] hover:border-[#2E5B66]/50 rounded px-2.5 py-1 text-xs text-[#5D676C] cursor-pointer"
            >
              <IconSearch size={14} />
              <span className="hidden md:inline">Search...</span>
              <kbd className="hidden md:inline-block text-[10px] font-mono bg-[#E7E9E6] border border-[#C8CECB] px-1 rounded">
                ⌘K
              </kbd>
            </button>

            {/* AI Tutor Chat Trigger Button */}
            <button
              onClick={() => setIsAITutorOpen(!isAITutorOpen)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border cursor-pointer transition-colors ${
                isAITutorOpen
                  ? 'bg-[#2E5B66] text-white border-[#2E5B66]'
                  : 'bg-[#F2F3F1] border-[#C8CECB] text-[#253238] hover:bg-[#DDE1DE]'
              }`}
            >
              <IconSparkles size={13} className={isAITutorOpen ? 'text-white' : 'text-[#2E5B66]'} />
              <span className="hidden sm:inline">AI Tutor</span>
            </button>

            {/* Personalization Settings Button */}
            <button
              onClick={() => setIsPersonalizationOpen(true)}
              title="Personalization & Study Goals"
              className="p-1.5 rounded bg-[#F2F3F1] border border-[#C8CECB] hover:bg-[#DDE1DE] text-[#5D676C] cursor-pointer"
            >
              <IconSliders size={14} />
            </button>

            {/* Cloud Sync Status Pill */}
            <button
              onClick={() => setActiveTab('devices')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#E7E9E6] border border-[#C8CECB] hover:bg-[#DDE1DE] text-xs cursor-pointer"
              title="Click to view connected devices"
            >
              <div className="w-2 h-2 rounded-full bg-[#3E6A50] animate-pulse" />
              <IconCloudCheck size={14} className="text-[#3E6A50]" />
              <span className="hidden lg:inline text-[11px] font-medium text-[#253238]">
                {currentUser ? 'Cloud Synced' : 'Local Mode'}
              </span>
              {devices.length > 1 && (
                <span className="text-[10px] bg-[#2E5B66] text-white px-1.5 rounded-full font-mono">
                  {devices.length} screens
                </span>
              )}
            </button>

            {/* Google Auth Profile */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-[#C8CECB]">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-7 h-7 rounded-full border border-[#C8CECB]"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#2E5B66] text-white flex items-center justify-center text-xs font-semibold">
                    {currentUser.displayName ? currentUser.displayName[0] : 'U'}
                  </div>
                )}
                <button
                  onClick={handleSignOut}
                  className="text-xs text-[#5D676C] hover:text-[#934444] hidden sm:inline cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={handleGoogleSignIn}
                className="px-3 py-1 bg-[#2E5B66] hover:bg-[#244851] text-white text-xs font-medium rounded flex items-center gap-1.5 cursor-pointer"
              >
                <IconUser size={13} />
                <span className="hidden sm:inline">Sign In with Google</span>
                <span className="sm:hidden">Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col md:flex-row px-4 py-4 gap-6">
        {/* Left Rail Desktop Navigation (Section 42) */}
        <aside className="hidden md:flex flex-col w-56 shrink-0 space-y-4">
          <nav className="bg-[#E7E9E6] border border-[#C8CECB] rounded-md p-2 space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: IconLayers },
              { id: 'tasks', label: 'Tasks & Sync', icon: IconCheck, count: todoTasks.length },
              { id: 'roadmaps', label: 'Career Roadmaps', icon: IconLayers },
              { id: 'interview', label: 'AI Mock Interview', icon: IconVideo },
              { id: 'practice', label: 'SQL & Practice Lab', icon: IconCode },
              { id: 'mock_tests', label: 'Mock Test Simulator', icon: IconAward },
              { id: 'resources', label: 'Videos & Resources', icon: IconVideo },
              { id: 'blog_news', label: 'Articles & News', icon: IconBookOpen },
              { id: 'devices', label: 'Connected Devices', icon: IconDeviceLaptop, count: devices.length },
            ].map((item) => {
              const IconComp = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as ActiveTab)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#2E5B66] text-white'
                      : 'text-[#253238] hover:bg-[#DDE1DE]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <IconComp size={15} />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && item.count > 0 && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                        isActive ? 'bg-white/20 text-white' : 'bg-[#DDE1DE] text-[#5D676C]'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Focus Timer */}
          <FocusTimer
            userId={currentUser?.uid}
            activeTask={activeTimerTask}
            onSessionLogged={handleSessionLogged}
          />

          {/* Spaced Review Queue Widget */}
          <ReviewQueue cards={reviewCards} />
        </aside>

        {/* Center Main Stage */}
        <main className="flex-1 min-w-0 space-y-4 pb-20 md:pb-4">
          {/* AI Tutor Chat Drawer if Open */}
          {isAITutorOpen && (
            <div className="mb-4">
              <AITutorChat
                onClose={() => setIsAITutorOpen(false)}
                targetRole={personalization.targetRole}
                trackSlug={personalization.focusTrack}
                onAddTask={(title, category) => {
                  handleCreateTask({
                    title,
                    priority: 'high',
                    category: category || 'roadmap_study',
                    estimatedMinutes: 30,
                  });
                }}
              />
            </div>
          )}

          {/* Personalization Settings Modal if Open */}
          {isPersonalizationOpen && (
            <div className="mb-4">
              <PersonalizationModal
                currentSettings={personalization}
                onSave={(newSettings) => setPersonalization(newSettings)}
                onClose={() => setIsPersonalizationOpen(false)}
              />
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB: DASHBOARD */}
          {/* ============================================================ */}
          {activeTab === 'dashboard' && (
            <div className="space-y-4">
              {/* Context Strip & Profile Header (Section 41) */}
              <div className="bg-[#E7E9E6] border border-[#C8CECB] rounded-md p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#C8CECB] pb-3">
                  <div>
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-[#5D676C]">
                      Personal Learning Operating System (Section 41)
                    </span>
                    <h1 className="text-xl font-serif font-bold text-[#253238]">
                      Welcome, {currentUser?.displayName || 'Learner'}
                    </h1>
                    <p className="text-xs text-[#5D676C] mt-0.5">
                      Target Role: <strong className="text-[#2E5B66]">{personalization.targetRole}</strong> ({personalization.experienceLevel}) • Goal: {personalization.weeklyHours}h/wk
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsPersonalizationOpen(true)}
                      className="px-3 py-1.5 border border-[#C8CECB] bg-[#F2F3F1] hover:bg-[#DDE1DE] text-[#253238] text-xs font-medium rounded flex items-center gap-1.5 cursor-pointer"
                    >
                      <IconSliders size={13} /> Customize Goals
                    </button>
                    <button
                      onClick={() => setShowTaskForm(true)}
                      className="px-3 py-1.5 bg-[#2E5B66] hover:bg-[#244851] text-white text-xs font-semibold rounded flex items-center gap-1.5 cursor-pointer"
                    >
                      <IconPlus size={14} /> New Synced Task
                    </button>
                  </div>
                </div>

                {/* Metrics bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
                  <div className="bg-[#F2F3F1] border border-[#C8CECB] rounded p-2.5 text-center">
                    <span className="text-[11px] text-[#5D676C] uppercase font-semibold">
                      Today Focus
                    </span>
                    <div className="text-xl font-mono font-bold text-[#253238] tabular-nums mt-0.5">
                      {todayStudyMinutes} min
                    </div>
                  </div>

                  <div className="bg-[#F2F3F1] border border-[#C8CECB] rounded p-2.5 text-center">
                    <span className="text-[11px] text-[#5D676C] uppercase font-semibold">
                      This Week
                    </span>
                    <div className="text-xl font-mono font-bold text-[#253238] tabular-nums mt-0.5">
                      {weekStudyHours} hrs
                    </div>
                  </div>

                  <div className="bg-[#F2F3F1] border border-[#C8CECB] rounded p-2.5 text-center">
                    <span className="text-[11px] text-[#5D676C] uppercase font-semibold flex items-center justify-center gap-1">
                      <IconFlame size={13} className="text-[#9A6A1F]" /> Active Streak
                    </span>
                    <div className="text-xl font-mono font-bold text-[#9A6A1F] tabular-nums mt-0.5">
                      {currentStreak} Days
                    </div>
                  </div>

                  <div className="bg-[#F2F3F1] border border-[#C8CECB] rounded p-2.5 text-center">
                    <span className="text-[11px] text-[#5D676C] uppercase font-semibold">
                      Tasks Completed
                    </span>
                    <div className="text-xl font-mono font-bold text-[#3E6A50] tabular-nums mt-0.5">
                      {tasks.length > 0
                        ? `${Math.round((completedTasks.length / tasks.length) * 100)}%`
                        : '0%'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Daily Streak Activity & Weekly Consistency */}
              <StreakActivity
                currentStreak={currentStreak}
                longestStreak={longestStreak}
                todayMinutes={todayStudyMinutes}
                weeklyTargetDays={5}
                restDay={personalization.restDay}
                onUpdateRestDay={(day) =>
                  setPersonalization((prev) => ({ ...prev, restDay: day }))
                }
              />

              {/* Today: One Prioritized Task Card (Section 41) */}
              {priorityTask && (
                <div className="bg-[#FDF6E8] border border-[#ECD9AE] rounded-md p-4">
                  <div className="flex items-center justify-between border-b border-[#ECD9AE] pb-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#9A6A1F] flex items-center gap-1.5">
                      <IconCheck size={14} /> Today: One Prioritized Task
                    </span>
                    <span className="text-[10px] font-mono uppercase bg-white/70 px-1.5 py-0.2 rounded border border-[#ECD9AE] text-[#9A6A1F]">
                      {priorityTask.priority}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-[#253238]">
                        {priorityTask.title}
                      </h3>
                      {priorityTask.description && (
                        <p className="text-xs text-[#5D676C] mt-1">
                          {priorityTask.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-[#5D676C] mt-2">
                        {priorityTask.estimatedMinutes && (
                          <span className="flex items-center gap-1 tabular-nums">
                            <IconClock size={12} /> {priorityTask.estimatedMinutes}m est
                          </span>
                        )}
                        {priorityTask.dueDate && <span>Due: {priorityTask.dueDate}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setActiveTimerTask(priorityTask);
                          setActiveTab('tasks');
                        }}
                        className="px-3 py-1.5 bg-[#9A6A1F] hover:bg-[#835A19] text-white text-xs font-semibold rounded flex items-center gap-1 cursor-pointer"
                      >
                        Start Focus Block
                      </button>
                      <button
                        onClick={() => handleToggleTaskStatus(priorityTask)}
                        className="px-3 py-1.5 border border-[#ECD9AE] bg-white hover:bg-[#FDF6E8] text-[#9A6A1F] text-xs font-medium rounded cursor-pointer"
                      >
                        Mark Done
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Insta-style Quick Fact Reel */}
              <QuickFactFeed
                onSaveToReview={(fact) => {
                  handleCreateTask({
                    title: `Review Flashcard: ${fact.slice(0, 45)}...`,
                    category: 'revision',
                    priority: 'medium',
                    estimatedMinutes: 10,
                  });
                }}
              />

              {/* Inline Task Form if toggled */}
              {showTaskForm && (
                <TaskForm
                  onAddTask={handleCreateTask}
                  onClose={() => setShowTaskForm(false)}
                />
              )}

              {/* Tasks List Snapshot */}
              <div className="bg-[#E7E9E6] border border-[#C8CECB] rounded-md p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-[#C8CECB] pb-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#253238]">
                    Active Synced Tasks ({todoTasks.length})
                  </h3>
                  <button
                    onClick={() => setActiveTab('tasks')}
                    className="text-xs text-[#2E5B66] hover:underline"
                  >
                    View All Tasks & Filters →
                  </button>
                </div>

                <div className="space-y-2">
                  {todoTasks.slice(0, 4).map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggleStatus={handleToggleTaskStatus}
                      onDelete={handleDeleteTask}
                      onSelectForTimer={(t) => setActiveTimerTask(t)}
                    />
                  ))}
                  {todoTasks.length === 0 && (
                    <p className="text-xs text-[#5D676C] text-center py-4">
                      All tasks completed! Click "+ New Synced Task" or add from Career Roadmaps.
                    </p>
                  )}
                </div>
              </div>

              {/* Feature Cards Grid: AI Mock Interview & Practice Lab */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#E7E9E6] border border-[#C8CECB] rounded-md p-4 space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#5D676C] flex items-center gap-1.5">
                    <IconVideo size={15} className="text-[#2E5B66]" /> AI Mock Interview
                  </span>
                  <h4 className="text-sm font-semibold text-[#253238] font-display">
                    Adaptive Case & Technical Interview
                  </h4>
                  <p className="text-xs text-[#5D676C]">
                    Speech-enabled response capture and Gemini evaluation across clarity, technical depth, and executive communication.
                  </p>
                  <button
                    onClick={() => setActiveTab('interview')}
                    className="mt-2 px-3 py-1.5 bg-[#2E5B66] hover:bg-[#244851] text-white text-xs font-medium rounded cursor-pointer"
                  >
                    Launch Mock Interview
                  </button>
                </div>

                <div className="bg-[#E7E9E6] border border-[#C8CECB] rounded-md p-4 space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#5D676C] flex items-center gap-1.5">
                    <IconCode size={15} className="text-[#687554]" /> SQL & Practice Lab
                  </span>
                  <h4 className="text-sm font-semibold text-[#253238] font-display">
                    Cohort Retention Rate Query Lab
                  </h4>
                  <p className="text-xs text-[#5D676C]">
                    Solve real queries against an isolated PostgreSQL sandbox with progressive hints.
                  </p>
                  <button
                    onClick={() => setActiveTab('practice')}
                    className="mt-2 px-3 py-1.5 bg-[#687554] hover:bg-[#576346] text-white text-xs font-medium rounded cursor-pointer"
                  >
                    Launch Practice Lab
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB: TASKS & SYNC */}
          {/* ============================================================ */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#E7E9E6] border border-[#C8CECB] rounded-md p-4">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-[#253238] flex items-center gap-2">
                    <IconCheck size={18} className="text-[#2E5B66]" />
                    Productivity Tasks (Real-Time Multi-Device Sync)
                  </h2>
                  <p className="text-xs text-[#5D676C] mt-0.5">
                    Every task updates synchronously across your laptop, tablet, and mobile via Firestore.
                  </p>
                </div>

                <button
                  onClick={() => setShowTaskForm(true)}
                  className="px-3.5 py-1.5 bg-[#2E5B66] hover:bg-[#244851] text-white text-xs font-semibold rounded flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                >
                  <IconPlus size={14} /> Add Task
                </button>
              </div>

              {showTaskForm && (
                <TaskForm
                  onAddTask={handleCreateTask}
                  onClose={() => setShowTaskForm(false)}
                />
              )}

              {/* Filters */}
              <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-1">
                  {[
                    { id: 'all', label: 'All Tasks' },
                    { id: 'todo', label: 'To Do' },
                    { id: 'urgent', label: 'Urgent' },
                    { id: 'completed', label: 'Completed' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setTaskFilter(f.id as any)}
                      className={`px-3 py-1 rounded border cursor-pointer transition-colors ${
                        taskFilter === f.id
                          ? 'bg-[#2E5B66] text-white border-[#2E5B66]'
                          : 'bg-[#E7E9E6] border-[#C8CECB] text-[#5D676C] hover:bg-[#DDE1DE]'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[#5D676C]">Category:</span>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-[#E7E9E6] border border-[#C8CECB] rounded px-2 py-1 text-xs text-[#253238]"
                  >
                    <option value="all">All Categories</option>
                    <option value="roadmap_study">Roadmap Study</option>
                    <option value="coding_practice">Coding & SQL</option>
                    <option value="mock_test">Mock Test</option>
                    <option value="revision">Spaced Review</option>
                    <option value="general">General</option>
                  </select>
                </div>
              </div>

              {/* Tasks List */}
              <div className="space-y-2">
                {filteredTasks.length === 0 ? (
                  <div className="bg-[#E7E9E6] border border-[#C8CECB] rounded-md p-8 text-center text-xs text-[#5D676C]">
                    No tasks match this filter. Create a new task or switch filters.
                  </div>
                ) : (
                  filteredTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggleStatus={handleToggleTaskStatus}
                      onDelete={handleDeleteTask}
                      onSelectForTimer={(t) => setActiveTimerTask(t)}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB: CAREER ROADMAPS */}
          {/* ============================================================ */}
          {activeTab === 'roadmaps' && (
            <RoadmapView
              currentTrackSlug={personalization.focusTrack}
              onSelectTrack={(slug) =>
                setPersonalization((prev) => ({ ...prev, focusTrack: slug }))
              }
              onAddTaskFromRoadmap={handleAddTaskFromRoadmap}
            />
          )}

          {/* ============================================================ */}
          {/* TAB: AI MOCK INTERVIEW */}
          {/* ============================================================ */}
          {activeTab === 'interview' && (
            <AIInterviewSimulator targetRole={personalization.targetRole} />
          )}

          {/* ============================================================ */}
          {/* TAB: PRACTICE LAB */}
          {/* ============================================================ */}
          {activeTab === 'practice' && (
            <PracticeLab
              userId={currentUser?.uid}
              onQuestionCompleted={(_q, passed) => {
                if (passed) {
                  setTodayStudyMinutes((m) => m + 15);
                }
              }}
            />
          )}

          {/* ============================================================ */}
          {/* TAB: MOCK TESTS */}
          {/* ============================================================ */}
          {activeTab === 'mock_tests' && <MockTestView />}

          {/* ============================================================ */}
          {/* TAB: VIDEOS & RESOURCES */}
          {/* ============================================================ */}
          {activeTab === 'resources' && (
            <ResourcesAndVideos
              onAddTask={(title, duration) => {
                handleCreateTask({
                  title,
                  category: 'roadmap_study',
                  priority: 'medium',
                  estimatedMinutes: duration,
                });
              }}
            />
          )}

          {/* ============================================================ */}
          {/* TAB: ARTICLES & NEWS */}
          {/* ============================================================ */}
          {activeTab === 'blog_news' && (
            <BlogAndNews
              onAddTask={(title, mins) => {
                handleCreateTask({
                  title,
                  category: 'roadmap_study',
                  priority: 'low',
                  estimatedMinutes: mins,
                });
              }}
            />
          )}

          {/* ============================================================ */}
          {/* TAB: CONNECTED DEVICES & SYNC */}
          {/* ============================================================ */}
          {activeTab === 'devices' && (
            <DeviceSyncStatus
              devices={devices}
              currentDeviceId={currentDeviceId}
              isOnline={connectionHealthy}
              isLoggedIn={!!currentUser}
              userEmail={currentUser?.email}
              onRefreshSync={() => {
                if (currentUser) {
                  registerDeviceHeartbeat(currentUser.uid);
                }
              }}
              onSignInWithGoogle={handleGoogleSignIn}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation (Section 42: Labeled destinations) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#E7E9E6] border-t border-[#C8CECB] px-2 py-1.5 flex items-center justify-around">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: IconLayers },
          { id: 'tasks', label: 'Tasks', icon: IconCheck },
          { id: 'interview', label: 'Interview', icon: IconVideo },
          { id: 'practice', label: 'Practice', icon: IconCode },
          { id: 'devices', label: 'Sync', icon: IconDeviceLaptop },
        ].map((tab) => {
          const IconComp = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ActiveTab)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded cursor-pointer transition-colors ${
                isActive ? 'text-[#2E5B66] font-semibold' : 'text-[#5D676C]'
              }`}
            >
              <IconComp size={18} />
              <span className="text-[10px] mt-0.5">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Command Palette Modal */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        tasks={tasks}
        onSelectTrack={(slug) => {
          setPersonalization((prev) => ({ ...prev, focusTrack: slug }));
          setActiveTab('roadmaps');
        }}
        onNavigateTab={(tab) => setActiveTab(tab as ActiveTab)}
        onSelectTask={(task) => {
          setActiveTimerTask(task);
        }}
      />
    </div>
  );
}
