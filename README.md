# mapstimator :earth_americas:
mapstimator is a multiplayer guessing game based on GeoGuessr. Players join up in lobbies, and are dropped at a random location using Google Streetview. From there, they must explore and guess where they are on a map. The closer their guess, the higher their score!

## Overview
mapstimator is a single page React webapp bootstrapped using [Create React App](https://github.com/facebook/create-react-app). The backend is managed using Firebase, which provides both hosting and persistent storage (Firestore). Streetview and maps are provided by Google Maps API.

## Available Scripts
Note that when developing, Firebase emulator should be used so that production data is not impacted. Modify this in `App.js`.

### `yarn start`
Builds app, then opens Firebase emulator, emulating both hosting and Firestore. Emulator control panel can be accessed at `localhost:4000`, hosted webpage can be accessed at `localhost:5000`, and Firestore control panel can be accessed at `localhost:8080`. Ensure that emulation is enabled in `App.js`. This will not automatically rebuild the package if changes are made.

### `yarn start-basic`
Launches development server provided by create-react-app. Webpage is accessible on `localhost:3000`. This will automatically rebuild every time changes are made. Typically used in conjunction with `yarn start-firestore` if emulator needed for Firestore.

### `yarn start-firestore`
Launches Firestore emulator only. Firestore control panel accessible at `localhost:8080`, and emulator control panel accessible at `localhost:4000`. Typically used in conjunction with `yarn start-basic`.

### `yarn test`
Launches the test runner in the interactive watch mode. Thus far, no tests have been written for this webapp.

### `yarn build`
Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Use for building when deploying to production.

### Making a Progressive Web App
This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)
