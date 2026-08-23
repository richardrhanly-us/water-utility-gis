![CI](https://github.com/richardrhanly-us/water-utility-gis/actions/workflows/ci.yml/badge.svg)

# Water Utility GIS Operations Dashboard

An interactive GIS web application for visualizing, filtering, and analyzing simulated water utility infrastructure.

The project is designed as a utility-operations dashboard that demonstrates GIS application development concepts including spatial data visualization, asset filtering, feature inspection, and proximity analysis.

## Features

- Interactive ArcGIS map centered on San Antonio, Texas
- Simulated water utility infrastructure, including:
  - Water mains
  - Hydrants
  - Valves
  - Service zones
- Layer visibility controls
- Asset filtering by:
  - Asset type
  - Status
  - Water-main material
  - Water-main condition
  - Installation year
- Click-to-inspect asset details
- Water-main selection for spatial analysis
- Configurable 250 ft, 500 ft, and 1,000 ft buffer analysis
- Identification of hydrants and valves located within the selected buffer
- Map highlighting for spatial-analysis results
- Reset controls for restoring the dashboard to its default state

## Spatial Analysis

The dashboard supports proximity analysis around selected water mains.

When a water main is selected, the user can choose a buffer distance and run an analysis to identify nearby hydrants and valves.

The application uses ArcGIS geometry operators to:

1. Generate a geodesic buffer around the selected water main
2. Test hydrant and valve geometries for intersection with the buffer
3. Display matching assets in the interface
4. Highlight matching assets on the map

This demonstrates common GIS workflows used in infrastructure and utility-management applications.

## Technology Stack

- React
- TypeScript
- Vite
- ArcGIS Maps SDK for JavaScript
- Vitest
- ESLint
- Git
- GitHub
- GitHub Actions

## Data Model

The project uses structured synthetic utility data stored in `src/data/utilityData.ts`.

The dataset contains simulated:

- Hydrant locations and inspection information
- Valve locations, types, status, and installation years
- Water-main geometries, materials, conditions, diameters, and installation years
- Service-zone polygon geometry

The dataset is intentionally simulated and does not represent actual utility infrastructure.

## Testing

Automated tests are implemented with Vitest.

The current test suite validates:

- Presence of utility asset datasets
- Unique asset identifiers
- Valid coordinate ranges
- Valid water-main path geometry
- Service-zone polygon structure
- Supported water-main materials
- Supported water-main conditions
- Water-main filtering behavior
- Combined filtering behavior
- Installation-year filtering

Run the test suite with:

    npm test

## Quality Checks

The project uses three primary local quality checks:

    npm test
    npm run lint
    npm run build

These verify automated tests, linting, TypeScript compilation, and the production build.

## Continuous Integration

GitHub Actions runs the project's quality checks automatically on pushes and pull requests to the `main` branch.

The CI workflow:

1. Checks out the repository
2. Configures Node.js
3. Installs dependencies with `npm ci`
4. Runs the Vitest test suite
5. Runs ESLint
6. Builds the production application

The CI badge at the top of this README reflects the current workflow status.

## Project Structure

    water-utility-gis/
    ├── .github/
    │   └── workflows/
    │       └── ci.yml
    ├── src/
    │   ├── data/
    │   │   ├── utilityData.ts
    │   │   └── utilityData.test.ts
    │   ├── utils/
    │   │   ├── filterWaterMains.ts
    │   │   └── filterWaterMains.test.ts
    │   ├── App.tsx
    │   └── main.tsx
    ├── package.json
    └── README.md

## Running Locally

Clone the repository:

    git clone https://github.com/richardrhanly-us/water-utility-gis.git

Enter the project directory:

    cd water-utility-gis

Install dependencies:

    npm install

Start the development server:

    npm run dev

Then open the local address displayed by Vite.

## Production Build

Create a production build with:

    npm run build

The generated production files will be placed in the `dist/` directory.

## Development Goals

This project was built to practice and demonstrate:

- GIS application development
- Spatial data modeling
- Interactive map interfaces
- Geometry-based analysis
- React and TypeScript application development
- Testable application logic
- Source control workflows
- Continuous integration
- Technical documentation

## Disclaimer

All utility assets, infrastructure geometries, attributes, and service-zone data in this project are synthetic and are provided solely for demonstration and software-development purposes.