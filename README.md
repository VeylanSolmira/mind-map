# 🧠 Mind Map Goal Management System

A powerful, interactive goal management and visualization system built with React and Node.js. Organize your goals hierarchically, track events on a calendar, and use multiple visualization modes to stay focused on what matters most.

## ✨ Features

### 🎯 **Goal Management**
- **Hierarchical Organization**: Structure goals with parent-child relationships using intuitive numbering (1.1.1, 1.2.1, etc.)
- **Multiple Goal Types**: Overarching, Long-term, Moderate, Micro, and Daily goals
- **Smart Prioritization**: Time-decay based priority system that adapts over time
- **Quick Actions**: Create new goals directly from event creation

### 📅 **Calendar & Event Tracking**
- **Interactive Calendar**: Monthly view with drag-and-drop event management
- **Event Management**: Create, edit, and track goal-related events
- **Status Tracking**: Mark events as planned, in-progress, or completed
- **Duration Tracking**: Log time spent on goals

### 🎨 **Multiple Visualization Modes**
- **📊 Table View**: Sortable, filterable data grid with inline editing
- **🌳 Tree View**: Interactive hierarchical visualization with D3.js
- **📈 Timeline View**: Chronological goal progression
- **📋 Kanban View**: Drag-and-drop board organization  
- **🎲 Select View**: Random goal selection based on priority weights
- **📅 Calendar View**: Monthly event scheduling and tracking

### 🔧 **Advanced Features**
- **Real-time Updates**: Changes sync across all views instantly
- **Inline Editing**: Click to edit goals and events directly
- **Priority Decay**: Automatic priority adjustment based on time since last activity
- **Bulk Operations**: Manage multiple goals efficiently
- **Export/Import**: CSV support for data management

## 🚀 Quick Start

### Prerequisites
- **Node.js** 16+ 
- **MongoDB** (local or cloud)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/mind-map.git
   cd mind-map
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB URI and preferences
   ```

3. **Install dependencies**
   ```bash
   # Backend dependencies
   cd backend && npm install

   # Frontend dependencies  
   cd ../frontend && npm install
   ```

4. **Start the application**
   ```bash
   # Terminal 1: Start backend
   cd backend && npm run dev

   # Terminal 2: Start frontend
   cd frontend && npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:5173
   ```

## 🏗️ Tech Stack

### Backend
- **Node.js** + **Express** - REST API server
- **MongoDB** + **Mongoose** - Database and ODM
- **TypeScript** - Type safety
- **Jest** - Testing framework

### Frontend  
- **React 18** + **TypeScript** - UI framework
- **Vite** - Build tool and dev server
- **D3.js** - Tree visualization
- **React Beautiful DnD** - Drag and drop
- **date-fns** - Date manipulation
- **Axios** - HTTP client

## 📖 Usage Examples

### Creating a Goal Hierarchy
```
1. Career Development
├── 1.1 Technical Skills
│   ├── 1.1.1 Learn React
│   └── 1.1.2 Master TypeScript
└── 1.2 Leadership
    ├── 1.2.1 Team Management
    └── 1.2.2 Public Speaking
```

### Scheduling Goal Events
1. Navigate to **Calendar View**
2. Click on any date to create an event
3. Select existing goal or create new one
4. Set duration, status, and notes
5. Track progress over time

### Priority-Based Goal Selection
1. Switch to **Select View**
2. Let the system randomly select goals based on:
   - Base priority levels
   - Time since last activity
   - Exponential decay weighting

## 🔧 Configuration

### Environment Variables (.env)
```bash
# Database
MONGODB_URI=mongodb://localhost:27017/mind-map

# Server
PORT=3001
NODE_ENV=development

# Frontend (for development)
VITE_API_URL=http://localhost:3001/api
```

### Goal Types & Colors
- **Overarching** (Blue): Life-changing, major objectives
- **Long-term** (Green): 6-12 month goals  
- **Moderate** (Orange): 1-6 month goals
- **Micro** (Purple): Week-to-month tasks
- **Day** (Teal): Daily/immediate actions

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **D3.js** community for excellent visualization tools
- **React** team for the amazing framework
- **MongoDB** for flexible data storage
- All contributors who help improve this project

---

**⭐ Star this repository if you find it helpful!** 