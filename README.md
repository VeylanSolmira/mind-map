# AI Development Knowledge Management System

A comprehensive knowledge management system for organizing AI development topics, capabilities, safety concerns, and tasks. This system provides multiple visualization modes and interactive features for managing your AI development knowledge base.

## Features

- **Multiple Visualization Modes**
  - Tree view for hierarchical representation
  - Graph view for relationship visualization
  - Table view for structured data
  - Priority queue view with smart prioritization

- **Interactive Data Management**
  - Drag-and-drop node manipulation
  - Inline editing of node properties
  - Markdown-based content management
  - Real-time updates across all views

- **Smart Priority System**
  - Base priority with time decay
  - Stochastic sampling for lower priority items
  - Relationship-based prioritization
  - Visual priority indicators

## Project Structure

```
mind-map/
├── frontend/           # React frontend application
├── backend/           # Node.js/Express backend
└── docs/             # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. Set up environment variables:
   ```bash
   # In backend directory
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Start the development servers:
   ```bash
   # Start backend (from backend directory)
   npm run dev

   # Start frontend (from frontend directory)
   npm start
   ```

## Development

### Backend

The backend is built with Node.js and Express, providing:
- RESTful API endpoints
- MongoDB integration
- File system storage for markdown content
- Authentication and authorization

### Frontend

The frontend is built with React and TypeScript, featuring:
- Multiple visualization components
- Interactive data manipulation
- Real-time updates
- Responsive design

## Documentation

Detailed documentation can be found in the `docs/` directory:
- API documentation
- Component documentation
- Data structure documentation
- Development guidelines

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 