# React Developer Test Repository

## Task Description:

This repository contains a sample React application with intentional issues ranging from actual bugs to common React mistakes, as well as opportunities for UI improvements

Your task is to clone this repository, identify the issues, fix them, and submit a pull request with your improvements.

It is important to explain the logic behind your changes in the pull request description or next to code that was changed.

## Getting Started:

1. Clone the repository.
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Identify and fix the issues

## Submission:

- Submit a pull request with your fixes for review.
- In the pull request description, explain the logic behind your changes. Why did you choose to fix the issue in this way? How does your solution improve the code?

## What I changed

- Removed the completedTodos state as it can be derieved from the todos state. This also removes a re-render when the component first mounts by deleting the useEffect
- Added tanstack/from and zod to ensure adding a new todo was typesafe and to manage forms easier. Displaying errors was also added
- Changed useEffect to useLayoutEffect in the ThemeProvider so the classname change can run be ran before component has been rended and browser has painted
- Added a loading spinner when the userId is null so mutations cannot occur if the user is signed out
- Moved all firebase environemnt variables to .env file so they can be changed per on local/QA/Prod etc. The app will also error if these are missing providing a fast feedback loop
- Add error boundary to display messages if mutations/queries to firebase fail
- Added e2e test using playwright to ensure functionality continues to work after future changes are made
