/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { KanbanBoard } from './components/KanbanBoard';
import { ListView } from './components/ListView';
import { GanttView } from './components/GanttView';
import { AIAgentsSquadView } from './components/AIAgentsSquadView';
import { AuditLogView } from './components/AuditLogView';
import { TaskModal } from './components/TaskModal';
import { NewTaskModal } from './components/NewTaskModal';
import { GitHubModal } from './components/GitHubModal';
import { PrivacyModal } from './components/PrivacyModal';
import { RBACModal } from './components/RBACModal';
import { CloudBackupModal } from './components/CloudBackupModal';
import { ReportModal } from './components/ReportModal';
import { NewProjectModal } from './components/NewProjectModal';
import { WorkspaceHeader } from './components/WorkspaceHeader';
import { TaskStatus } from './types';

function MainApp() {
  const { activeView } = useApp();

  // Modals state
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTaskDefaultStatus, setNewTaskDefaultStatus] = useState<TaskStatus | undefined>(undefined);
  const [newTaskDefaultAgentId, setNewTaskDefaultAgentId] = useState<string | undefined>(undefined);

  const [showReportModal, setShowReportModal] = useState(false);
  const [showGitHubModal, setShowGitHubModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showRBACModal, setShowRBACModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [isGroupOnlyModal, setIsGroupOnlyModal] = useState(false);

  const handleOpenNewTask = (defaultStatus?: TaskStatus) => {
    setNewTaskDefaultStatus(defaultStatus);
    setNewTaskDefaultAgentId(undefined);
    setShowNewTaskModal(true);
  };

  const handleOpenNewTaskWithAgent = (agentId: string) => {
    setNewTaskDefaultStatus('todo');
    setNewTaskDefaultAgentId(agentId);
    setShowNewTaskModal(true);
  };

  const handleOpenNewGroup = () => {
    setIsGroupOnlyModal(true);
    setShowNewProjectModal(true);
  };

  const handleOpenNewProject = () => {
    setIsGroupOnlyModal(false);
    setShowNewProjectModal(true);
  };

  return (
    <div className="h-dvh overflow-hidden bg-white text-neutral-900 flex flex-col font-sans antialiased">
      {/* Top Bar Navigation Contract */}
      <TopBar
        onOpenNewTask={() => handleOpenNewTask()}
        onOpenReportModal={() => setShowReportModal(true)}
        onOpenGitHubModal={() => setShowGitHubModal(true)}
        onOpenPrivacyModal={() => setShowPrivacyModal(true)}
        onOpenRBACModal={() => setShowRBACModal(true)}
        onOpenBackupModal={() => setShowBackupModal(true)}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          onOpenNewGroup={handleOpenNewGroup}
          onOpenNewProject={handleOpenNewProject}
        />

        {/* Content Viewport */}
        <main className="flex-1 min-w-0 overflow-y-auto pb-16">
          <WorkspaceHeader />
          {activeView === 'dashboard' && (
            <DashboardView onOpenTaskModal={(id) => setSelectedTaskId(id)} />
          )}

          {activeView === 'kanban' && (
            <KanbanBoard
              onOpenTaskModal={(id) => setSelectedTaskId(id)}
              onOpenNewTask={(status) => handleOpenNewTask(status)}
            />
          )}

          {activeView === 'list' && (
            <ListView onOpenTaskModal={(id) => setSelectedTaskId(id)} />
          )}

          {activeView === 'gantt' && (
            <GanttView onOpenTaskModal={(id) => setSelectedTaskId(id)} />
          )}

          {activeView === 'agents' && (
            <AIAgentsSquadView
              onOpenNewTaskWithAgent={handleOpenNewTaskWithAgent}
              onOpenTaskModal={(id) => setSelectedTaskId(id)}
            />
          )}

          {activeView === 'audit' && <AuditLogView />}
        </main>
      </div>

      {/* Interactive Modals */}
      {selectedTaskId && (
        <TaskModal
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
        />
      )}

      {showNewTaskModal && (
        <NewTaskModal
          onClose={() => setShowNewTaskModal(false)}
          defaultStatus={newTaskDefaultStatus}
          defaultAgentId={newTaskDefaultAgentId}
        />
      )}

      {showReportModal && (
        <ReportModal onClose={() => setShowReportModal(false)} />
      )}

      {showGitHubModal && (
        <GitHubModal onClose={() => setShowGitHubModal(false)} />
      )}

      {showPrivacyModal && (
        <PrivacyModal onClose={() => setShowPrivacyModal(false)} />
      )}

      {showRBACModal && (
        <RBACModal onClose={() => setShowRBACModal(false)} />
      )}

      {showBackupModal && (
        <CloudBackupModal onClose={() => setShowBackupModal(false)} />
      )}

      {showNewProjectModal && (
        <NewProjectModal
          isGroupOnly={isGroupOnlyModal}
          onClose={() => setShowNewProjectModal(false)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
