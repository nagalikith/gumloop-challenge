# Overview
## Key Features
- A modern frontend interface built with Next.js.
- A robust backend API powered by FastAPI.
- Integration with PostgreSQL.
- Demonstration of secure password handling and graph-based computations.

This submission is part of an interview process and showcases proficiency in full-stack development.

## Getting Started with the Frontend Server

Installation

Clone the repository:
```bash
git clone <repository-url>
cd <repository-folder>
```

Install dependencies:
```bash
npm install
or
yarn install
```
Running the Development Server

Start the development server:
```bash
npm run dev
or
yarn dev
```
### Open http://localhost:3000 with your browser to see the result.


## Backend Setup with FastAPI

Path to Backend Code
/backend

Installing Dependencies for FastAPI

Navigate to the backend folder:
Create a virtual environment:
```bash
cd backend

python3 -m venv venv
source venv/bin/activate  # For Linux/Mac
# or
venv\Scripts\activate  # For Windows

```

Install the required dependencies:
Start the FastAPI development server:
```bash
pip install -r requirements.txt

uvicorn main:app --reload
```
### The backend server will be accessible at http://127.0.0.1:8000.