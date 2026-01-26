<<<<<<< HEAD
# Alvis

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.12.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
=======
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
>>>>>>> ad259c2e216993b650956f768edd8162e018171d
