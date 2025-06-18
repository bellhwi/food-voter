# Pickle: Food Voter App

A fun, collaborative decision-making app to help groups choose what to eat---without the endless back-and-forth.

## Overview

**Problem:** Every group has faced this dilemma---"What should we eat?"

**Solution:** Food Voter lets participants submit menu ideas, then vote on the best one in a structured, turn-based flow.

I built this as a full-stack practice project to improve my skills with **Next.js** and **MongoDB**, while solving a relatable problem with a clean user experience.

## Features

✅ Make a room with a title and deadline

✅ Real-time display of submitted menus and live voting results

✅ Participants submit menus with nicknames

✅ Voting phase starts after all menus are submitted

✅ Automatically shows the winner after voting ends

## Live Demo

👉 [Try the app here](https://food-voter-swart.vercel.app/)

## Running the Project Locally

1. Clone the repo
   `git clone https://github.com/bellhwi/food-voter.git`

2. Go into the directory
   `cd food-voter`

3. Install dependencies
   `npm install`

4. Set up environment variables. Create a .env.local file and add:
   `MONGODB_URI=your_mongodb_connection_string`

5. Run the development server
   `npm run dev`

App will be running at http://localhost:3000

## Tech Stack & Dependencies

- [Next.js 15+](https://nextjs.org/)

- [MongoDB + Atlas](https://www.mongodb.com/)

- [Tailwind CSS](https://tailwindcss.com/)

- [Vercel](https://vercel.com/)

- [TypeScript](https://www.typescriptlang.org/)

- SWR for data fetching

## ToDo

- Polish the UI for better visual consistency and clarity

## Contributors

by [@bellhwi](https://github.com/bellhwi)

## How to Contribute

Want to help improve the app?

1.  Fork this repo

2.  Create a new branch: `git checkout -b my-feature`

3.  Commit your changes: `git commit -m 'Add feature'`

4.  Push to your branch: `git push origin my-feature`

5.  Submit a pull request

Open to feature suggestions, bug reports, and UX improvements!

## 🛡️ License

MIT --- free to use and modify.
