
# Algorithm Visualizer

An interactive web application designed to visualize how algorithms work step by step, with a strong focus on conceptual understanding rather than execution speed or user accounts.
This project is built as part of an academic requirement and emphasizes clarity, clean architecture, and learning-first design.

## Features

Step-by-step algorithm visualization
Beginner-friendly explanations
Overview & complexity analysis for each algorithm
Clean UI with modern design
Database-driven algorithm metadata
Extensible architecture for adding more algorithms

## Project Philosophy

Most algorithm tools focus only on final results.
This project focuses on:

What is happening?
Why is it happening?
Which line of code is responsible?

The goal is to help beginners see and understand algorithms in motion.

## Tech Stack

### Frontend
Angular (Standalone Components)
TypeScript
HTML & CSS
Font Awesome (icons)

### Backend
Flask (Python)
REST API architecture

### Database
SQLite - Stores static algorithm metadata (overview, complexity, status)

## Database Design

The SQLite database stores algorithm metadata only, such as:
Name
Overview description
Time complexity
Space complexity
Best / average / worst case
Implementation status

No user data or sensitive information is stored.
