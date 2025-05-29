# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

This is a full-stack TypeScript application for hierarchical goal management and visualization.

**Frontend**: React 19 + TypeScript + Vite
- Located in `/frontend`
- Uses D3.js for tree visualization
- React Beautiful DnD for drag-and-drop in Kanban view
- Multiple view modes: Table, Tree, Timeline, Kanban, Calendar, Priority Queue

**Backend**: Express + TypeScript + MongoDB
- Located in `/backend`
- RESTful API with Mongoose ODM
- Goal hierarchy with parent-child relationships
- Event tracking and scheduling system
- Priority calculation with time decay

## Key Commands

### Frontend Development
```bash
cd frontend
npm run dev      # Start development server (port 5173)
npm run build    # Build for production
npm run test     # Run Jest tests
npm run lint     # Run ESLint
```

### Backend Development
```bash
cd backend
npm run dev      # Start development server with nodemon (port 3001)
npm run build    # Compile TypeScript
npm run start    # Run compiled JavaScript
npm run test     # Run Jest tests
npm run lint     # Run linter
```

### Testing
- Frontend: `npm test -- --watch` for watch mode, `npm test -- GoalTreeNavigator.test.tsx` for specific file
- Backend: `npm test -- --watch` for watch mode, `npm test -- Goal.test.ts` for specific file
- Both use Jest with TypeScript support via ts-jest

## Core Data Models

**Goal** (`backend/src/models/Goal.ts`):
- Hierarchical structure with `parentId` references
- Status: "Not Started", "In Progress", "Completed", "Cancelled"
- Priority calculation based on importance, urgency, and time decay
- `lastSelected` timestamp for temperature-based priority scaling

**GoalEvent** (`backend/src/models/GoalEvent.ts`):
- Events associated with goals
- Start/end dates, notes, participants
- Recurring event support

## API Endpoints

- `/api/goals` - CRUD operations for goals
- `/api/nodes` - Legacy node endpoints (being phased out)
- `/api/goal-events` - Event management
- `/api/research` - Research tab integration

## Important Implementation Details

1. **Goal ID Generation**: Uses hierarchical IDs (e.g., "1.2.3") based on parent structure
2. **Kanban Status Mapping**: 
   - "Not Started" → Backlog column
   - "In Progress" → In Progress column
   - "Completed" → Done column
3. **Priority Calculation**: Combines importance, urgency, and time-based temperature scaling
4. **Tree Navigation**: Interactive goal browser in CreateGoalModal for parent selection

## Utility Scripts (backend/scripts)

- `checkGoals.ts` - Verify goal data integrity
- `truncateAndSeedFromCSV.ts` - Import goals from CSV
- `generateGoalEvents.ts` - Create sample events
- `ingestResearchTabs.ts` - Import browser research tabs