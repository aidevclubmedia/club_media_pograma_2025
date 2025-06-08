POGrama Shelf Designer AI
A React + Vite web application built to design and manage AI-powered retail planograms. It provides tools for product placement on shelves, analytics, and optimization suggestions using AI.

📘 Project Overview: What it Does
POGrama is a planogram editor and optimizer that enables users to:
•	🛒 Design store layouts and product placements visually
•	⚙️ Drag and drop products to shelves
•	📊 Analyze shelf space, weight, compliance, and sales
•	🤖 Automatically generate planograms using Gemini AI
•	🧠 Receive optimization suggestions and insights
•	🎨 View product arrangements in 2D and 3D

________________________________________
⚙️ Key Features
•	Interactive Planogram Designer (/designer)
•	AI-Assisted Planogram Generation powered by Google Gemini
•	Drag-and-Drop Interface with product catalog
•	3D Visualization of Shelves
•	Real-time Analytics & Compliance Warnings
•	Custom Rules, Facings, Stock Management

🧪 Example Usage
Visit the landing page:
Go to https://pograma.netlify.app/ — this is the page to access for POGrama.

Open Planogram Designer:
Navigate to https://pograma.netlify.app/ to:
1.	Click Try POGrama
2.	Add a door > equipment > bay > shelf
3.	Drag products from the catalog into the shelf
4.	Click the magic wand button to auto-generate a layout (bottom right side)
5.	View analytics (sales, profit, compliance issues)
6.	Visualize the layout in 3D

🧠 Notable Components
Component	Description
1. PlanogramView - Shows correct layout view based on selection
2. AutoGeneratePlanogram - Sends prompt to Gemini AI and applies JSON planogram
3. ShelfView - Core visual editor for shelves
4. DroppableShelf - Manages product dropping & layout constraints
5. ShelfAnalytics - Shows profit, weight, and compliance issues
6. OptimizationPanel - Suggests actionable layout improvements
________________________________________
🧩 Tech Stack
1. ⚛ React + TypeScript
2. 🧩 react-dnd for drag-and-drop
3. 🌈 Tailwind CSS for styling
4. 🔥 react-hot-toast for notifications
5. 🤖 Gemini AI (via GoogleGenerativeAI SDK)
6. 🚀 Vite for bundling
