# Farm Metrics Dashboard — Setup Guide Explained

This document walks through each step of running the Farm Metrics Dashboard, explaining **what** is happening and **why** it is necessary. Written for complete beginners.

---

## Step 1: Install Node.js

### What is Node.js?

When you write a website, the code is written in JavaScript. Browsers (like Chrome or Firefox) already know how to run JavaScript — but only inside a web page. **Node.js** lets you run JavaScript *outside* of a browser, directly on your computer, the same way you might run a Python or Java program.

### Why do you need it?

The Farm Metrics Dashboard is built with modern web tools (React, Vite) that are all JavaScript-based. Before you can do anything with the project — download its libraries, build it, or start it — you need Node.js installed so your computer can execute those JavaScript tools.

### What is npm?

When you install Node.js, you also get **npm** (Node Package Manager). Think of npm as an app store for code libraries. Instead of manually downloading and copying library files, you type a command and npm fetches everything for you. You will use npm in later steps.

### What does "LTS" mean?

LTS stands for **Long Term Support**. Node.js releases new versions frequently. The LTS version is the one that has been thoroughly tested and will receive bug fixes for a long time. It is the safest choice for most users.

### What does verifying the install do?

Running `node --version` and `npm --version` in a terminal prints the version numbers of each tool. If you see version numbers (e.g. `v20.11.0` and `10.2.4`), it means the installation worked. If you see an error like "command not found", something went wrong during installation.

---

## Step 2: Open a terminal

### What is a terminal?

A terminal (also called a command line, console, or shell) is a text-based interface where you type commands instead of clicking buttons. It looks like a black or white window with a blinking cursor. Every operating system has one built in.

### Why do you need it?

All of the remaining steps — cloning the project, installing libraries, and starting the app — are done by typing commands in a terminal. There is no graphical installer or "double-click to run" option for development tools like these; the terminal is how developers interact with them.

---

## Step 3: Clone the repository

### What does "clone" mean?

The project's source code is stored on **GitHub**, which is a website that hosts code. "Cloning" means making a complete copy of that code on your own computer. The command:

```
git clone https://github.com/chilli-dude/Project-1.git
```

downloads every file in the project and creates a new folder called `Project-1` in whatever directory your terminal is currently in.

### What is git?

**Git** is a version control tool. It tracks every change ever made to the code, who made it, and when. This lets multiple people work on the same project without overwriting each other's work. `git clone` is one of its commands — specifically the one that downloads a project for the first time.

### Why is this necessary?

Without cloning, you do not have the code on your computer. You cannot run an application that you have not downloaded.

---

## Step 4: Navigate into the dashboard folder

```
cd Project-1/dashboard
```

### What does `cd` do?

`cd` stands for **change directory**. A directory is just another word for a folder. This command moves your terminal's "current location" into the `Project-1/dashboard` folder, which is where the dashboard's code lives.

### Why is this necessary?

Commands you run in a terminal apply to the folder you are currently in. The next steps (`npm install`, `npm run dev`) need to be run *inside* the dashboard folder because that is where the project's configuration file (`package.json`) lives. If you run them from the wrong folder, they will fail with an error.

---

## Step 5: Install dependencies

```
npm install
```

### What are dependencies?

The dashboard is not written entirely from scratch. It relies on many existing **libraries** (pre-written code that other developers have published). For example:

- **React** — a library for building user interfaces with reusable components
- **Leaflet** — a library for interactive maps (the map you draw polygons on)
- **Chart libraries** — for rendering the bar/line charts that show metric trends
- **Vite** — a development tool that bundles all the code together and serves it to your browser

These libraries are called **dependencies** because the project *depends* on them to work.

### What does `npm install` do?

It reads a file called `package.json` in the current folder. That file lists every library the project needs, along with the required version of each. npm then downloads all of those libraries from the internet and puts them in a folder called `node_modules`.

### Why is this necessary?

The project code references these libraries everywhere. Without them, the application would crash immediately because it would be trying to use code that does not exist on your machine. You only need to run this command once (unless the library list changes).

---

## Step 6: Start the app

```
npm run dev
```

### What does this do?

This starts a **local development server**. Here is what happens behind the scenes:

1. **Vite** (the build tool) reads all the project files — JavaScript, CSS, HTML, images
2. It processes and bundles them into a format that browsers can understand
3. It starts a small web server on your computer that serves those files
4. It watches for file changes so that if you edit the code, the browser updates automatically

### What is a development server?

A server is a program that waits for requests and sends back responses. When your browser asks for a web page, a server sends it. In this case, the server is running on **your own computer** (not on the internet) — that is what makes it "local."

### What does `localhost:5173` mean?

- **localhost** means "this computer" — you are not connecting to anything on the internet
- **5173** is a **port number** — think of it like a channel or room number. Your computer can run many servers at once; the port number tells the browser which one to talk to. Vite uses port 5173 by default

### Why is this necessary?

Modern web applications cannot simply be opened as a file (double-clicking an HTML file will not work). They need a server to properly serve all the pieces — JavaScript modules, CSS, images, data — and to handle things like routing. The development server provides this.

---

## Step 7: Open it in your browser

### What is happening?

When you visit `http://localhost:5173` in your browser:

1. Your browser sends a request to the local Vite server running on your machine
2. Vite sends back the HTML page, which references JavaScript and CSS files
3. The browser downloads and runs those files
4. React takes over and renders the dashboard interface — the map, the metrics panel, and the chart area

### Why do you need to do this manually?

Some development servers automatically open the browser, but this one does not by default. You simply paste the URL into your browser's address bar.

---

## Step 8: Using the dashboard

This step is about interacting with the running application. Here is what each action does:

### Draw a polygon

The centre of the screen shows an interactive map (powered by Leaflet). In the top-right corner of the map there are drawing tools. When you select the polygon or rectangle tool and draw a shape on the map, you are defining a **geographic area** — a farm boundary. The application uses the coordinates of that shape to calculate environmental metrics for that region.

### View metrics

Once a polygon is drawn, the left panel fills with **10 environmental metric cards**. Each card shows a metric name, its value, and a risk level (e.g. low, medium, high). These metrics represent things relevant to farming such as soil health, rainfall, temperature, etc. The data is generated or fetched based on the area you selected.

### Click a metric

Clicking on one of the metric cards in the left panel updates the right panel to show a **monthly trend chart** for that metric. This lets you see how the value changes over the course of a year, which is useful for spotting seasonal patterns or risks.

### Delete/redraw

The trash icon in the map toolbar removes the current polygon so you can draw a new one for a different farm area. The metrics and chart will update to reflect the new location.

---

## Step 9: Stop the app

### What does Ctrl + C do?

In a terminal, pressing `Ctrl + C` sends an **interrupt signal** to whatever program is currently running. It is the standard way to say "stop" to a command-line program. This shuts down the Vite development server.

### Why stop it?

The development server stays running indefinitely until you tell it to stop. While it is running, it occupies that terminal window and uses a small amount of your computer's memory and CPU. When you are done using the dashboard, stopping the server frees those resources. You can always start it again later by running `npm run dev` from the same folder.

---

## Summary of the flow

| Step | What you do | Why |
|------|------------|-----|
| 1 | Install Node.js | Your computer needs a JavaScript runtime |
| 2 | Open a terminal | All commands are typed in a terminal |
| 3 | Clone the repo | Download the project code |
| 4 | `cd` into the folder | Move to where the code lives |
| 5 | `npm install` | Download the libraries the code depends on |
| 6 | `npm run dev` | Start a local server to run the app |
| 7 | Open browser | View the running app |
| 8 | Interact | Use the dashboard features |
| 9 | Ctrl + C | Stop the server when done |
