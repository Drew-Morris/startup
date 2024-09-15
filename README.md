# Odd One Out

This is a web application for playing a game of Odd One Out with a group of users 
and a Chatbot.

## Specification Deliverable

### Elevator Pitch

Can a group of regular people figure out which one of them is an AI? Odd One Out 
is a game where each player tries to figure out who the AI is and vote them out 
without getting voted out themself. Each round, every player submits a question. 
One of those questions is then presented to the group to answer. Each player then 
gets to vote out who they think is the AI. Each remaining player then votes to 
continue or halt the game. If the AI is still in when the game ends, the players 
lose. Otherwise, the remaining players win.

### Design

![Gameplay Page Mockup](Odd-One-Out-Mockup)

### Key Features

- Secure login over HTTPS
- Game Match-Making
- Q/A Collection and Distribution
- Ranked Choice Voting Algorithm
- Restriction of gameplay to authenticated users
- Non-interactive gameplay for voted-out players

### Technologies

I will use the required technologies on the following ways

- HTML - Uses correct HTML structure for the application: one login page and one 
gameplay page.
- CSS - Uses application styling that is appealing across various device formats, 
uses good whitespace, color choice, and contrast.
- React - Provides login, q\a submission, player answer display, applying votes, 
display removed player, display results, and use of React for routing and 
components. 
- Service - Backend service with endpoints for
    - Login
    - Submitting Questions
    - Random Question Selection
    - Submitting Answers
    - Retrieving Answers
    - Submitting Votes
    - Retrieving Voting Results
    - Retrieving Results
- DB - Stores player data and game data in a database.
- Authentication - Register and login players. Restrict gameplay and 
participation to authenticated players only.
- WebSocket - As players submit questions, they are collected for one to be 
distributed to all players. As players submit answers, they are displayed to 
other users in real time.



