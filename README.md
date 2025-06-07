India Flood Vision Dashboard
Category: Website

Project Description
The India Flood Vision Dashboard is a dynamic, web-based application designed to provide crucial insights and predictions related to flood risks across India. Our primary goal is to empower users with comprehensive, real-time data and actionable information on reservoir levels and potential flood scenarios. The dashboard offers an interactive experience, allowing users to monitor flood risk by state and district, access vital evacuation plans, and stay informed through continuously updated data.

Key Features
Comprehensive Data Integration: Fetches and aggregates all available reservoir level data from Supabase, ensuring a complete and up-to-date dataset for analysis.

Interactive Map Visualization: Features a dynamic map (built with Leaflet) that visually represents flood risk. Instead of simple points, it displays color-indicated overlays (like a heatmap) for states and districts, allowing for quick identification of high-risk areas. Clicking on these regions updates detailed information panels.

Dynamic Region Selection: Fully functional State and District dropdowns allow users to intuitively filter and focus the map and data displays on specific areas of interest. Selecting a region automatically centers the map and updates relevant information panels.

Cursor AI Flood Prediction: Integrates a powerful flood prediction model powered by Cursor AI. This model utilizes external daily and historical rainfall data (in millimeters, specific to India) to generate accurate flood forecasts.

Location-Aware Evacuation Plans: The Evacuation Plan tab dynamically requests the user's live location and displays relevant, nearby shelter information, making it a truly useful tool in emergency situations.

Real-time Data Monitoring: Displays crucial information like last updated timestamps and the number of regions with live data, along with a manual refresh option.

Intuitive User Interface: Designed with a clean, organized, and responsive layout, ensuring an optimal user experience across various devices without visual clutter or awkward spacing.

Detailed Information Panels: Provides comprehensive statistics, charts, and prediction data for selected regions, ensuring accurate display of forecast data where available.

Challenges Faced
Building this dashboard has been an incredibly demanding but rewarding journey, especially given the unique development environment. Here are some of the main hurdles we overcame:

The AI Dev Part: One of the biggest challenges was the nature of working with an AI development partner. Sometimes, the AI's "memory" seemed to reset, requiring us to re-explain concepts and instructions multiple times. This consumed valuable development credits (only 5/day, 30/month!) and often forced us to "remix" the project repeatedly to get back to a stable state, which was incredibly frustrating but taught us immense patience and precision.

The Map's Just Not Right Yet: Getting the map to display correctly has been a persistent struggle. We aimed for advanced "color indicated overlaps" for flood risk, but even getting basic points to consistently display and color correctly (they were often "all green and red broken") proved difficult. This core visualization has required significant iterative effort to refine.

Supabase Data Headaches: Ensuring our application fetches all available reservoir data from Supabase, without limitations, was a challenge, as the server sometimes returned empty arrays ([]) when fetching large datasets. Beyond just retrieval, cleaning and validating this raw data to prevent undefined or null values from breaking the UI was a continuous task.

The Dashboard Layout's Got Issues: The initial user interface for the flood vision section had noticeable layout problems, including "randomly placed graphs" and "huge gaps below the map." Redesigning this for a clean, organized, and responsive look has been a key focus.

Dropdowns That Don't Drop (or Select!): Making the state and district dropdowns truly functional and dynamic was harder than anticipated. Ensuring they correctly filter districts based on state selection and then trigger immediate map and panel updates required careful state management and event handling.

Panels Misbehavin' with Forecast Data: We encountered issues where information panels would incorrectly display "No forecast data available for this region" even when data was present. Fixing this involved meticulous debugging of conditional display logic to ensure accurate representation of information.

Gettin' a Real AI Flood Predictor: A significant challenge is integrating a genuine flood prediction model. This involves not only sourcing historical and daily rainfall data (MM, for India) from external APIs like Google Weather (since our reservoir data lacks it) but also engaging Cursor AI to build and provide a working predictor that can consume this data.

Evacuation Plan Needs Location Smartness: The evacuation plan tab initially defaulted to fixed Mumbai shelters. The challenge was to integrate real-time geolocation to ask for the user's actual location and then dynamically display relevant nearby shelters, making the feature genuinely helpful.

How to Run This Project
(Instructions on how to set up and run your project locally, including cloning the repository, installing dependencies, setting up Supabase environment variables, and starting the development server, will go here.)

Credits & Acknowledgements
Data Source: Indian Meteorological Department (IMD) via Supabase

Map Provider: OpenStreetMap via Leaflet and React-Leaflet

AI Integration: Cursor AI (for flood prediction model)

Development Environment: Lovable.dev
