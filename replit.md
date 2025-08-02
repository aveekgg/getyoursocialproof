# Overview

RoomReel Challenge is a mobile-first React web application that allows students to record guided video content about their housing experience. The app gamifies content creation through a 5-day challenge timeline system, where new challenges unlock daily. Students record multiple short video clips following prompts and receive randomized rewards with varying rarity levels upon completion. The timeline creates urgency and engagement by spreading challenges across 5 days with increasing point values.

# User Preferences

Preferred communication style: Simple, everyday language.
Target audience: UK university students aged 18-26 (undergrad/postgrad).
Content tone: Authentic, relatable, using British English and student-friendly language.

# System Architecture

## Frontend Architecture
- **React with TypeScript**: Component-based SPA using modern React patterns with hooks and context
- **Vite Build System**: Fast development server with hot module replacement and optimized production builds
- **Wouter Router**: Lightweight client-side routing for single-page navigation
- **Tailwind CSS + shadcn/ui**: Utility-first styling with a comprehensive component library for consistent UI
- **TanStack Query**: Server state management for API calls, caching, and background updates

## Component Structure
- **Screen-based Architecture**: Main screens (Welcome, Setup, Camera, Review, Reward, Success) handle different phases of the challenge flow
- **Specialized Components**: CameraInterface manages WebRTC video recording, RewardWheel handles gamification
- **Custom Hooks**: useCamera for WebRTC access, useMediaRecorder for video capture, and standard UI hooks for interactions

## State Management
- **Local State**: React useState for component-level state (current step, recording status, clips)
- **Server State**: TanStack Query for API data fetching and caching
- **No Global State**: Simple prop drilling and context for shared data

## Mobile-First Design
- **WebRTC Integration**: Native browser camera access with fallback support for various devices
- **Responsive UI**: Mobile-optimized interface with touch-friendly controls and animations
- **Progressive Enhancement**: Graceful degradation for devices with limited camera capabilities

## Backend Architecture
- **Express.js Server**: RESTful API with middleware for logging, error handling, and request processing
- **In-Memory Storage**: MemStorage class simulates database operations for challenges, submissions, and rewards
- **Database Schema**: Drizzle ORM with PostgreSQL schema definitions for future database integration
- **File Structure**: Clean separation between server routes, storage layer, and business logic

## API Design
- **REST Endpoints**: Standard CRUD operations for challenges (`/api/challenges`), submissions (`/api/submissions`)
- **JSON Communication**: All data exchange via JSON with proper error handling and status codes
- **Session Management**: Prepared for user authentication with session storage configuration

## Data Models
- **Challenges**: Structured as multi-step processes with defined prompts, durations, point values, and timeline positioning (day 1-5)
- **Timeline System**: 5-day challenge schedule with unlock dates and progressive point increases (25→40 points per step)
- **Video Clips**: Metadata tracking for recorded segments without actual video storage
- **Rewards System**: Weighted randomized prize generation (common 70%, rare 25%, epic 5%) with UK-relevant rewards
- **User Submissions**: Links user attempts to completed challenges with point tracking

# External Dependencies

## Core Framework Dependencies
- **React Ecosystem**: React 18 with TypeScript, React DOM, and development tools
- **Vite**: Build tool with plugins for React, error overlays, and Replit integration
- **Wouter**: Lightweight routing library for client-side navigation

## UI and Styling
- **Tailwind CSS**: Utility-first CSS framework with PostCSS processing
- **Radix UI**: Headless component primitives for accessibility and interaction patterns
- **shadcn/ui**: Pre-built component library built on Radix UI primitives
- **Lucide React**: Icon library for consistent iconography

## Backend Infrastructure
- **Express.js**: Web application framework for Node.js
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL dialect support
- **Neon Database**: Serverless PostgreSQL database service via `@neondatabase/serverless`

## Development and Build Tools
- **TypeScript**: Static type checking with strict configuration
- **ESBuild**: Fast JavaScript bundler for production builds
- **TSX**: TypeScript execution engine for development server
- **Various Build Plugins**: PostCSS, Autoprefixer, and Replit-specific development tools

## Media and Recording
- **Native WebRTC**: Browser-based camera and microphone access
- **MediaRecorder API**: Built-in browser video recording capabilities
- **No External Video Processing**: Relies on browser capabilities for media handling
- **Video Storage**: Currently videos are recorded in-browser but not stored on backend - only metadata is saved
- **Future Enhancement**: Video storage would require file upload system and cloud storage integration

## Form and Data Handling
- **React Hook Form**: Form state management and validation
- **Zod**: Runtime type validation and schema validation
- **TanStack Query**: Server state management and caching layer
- **Date-fns**: Date manipulation and formatting utilities