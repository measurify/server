# Introduction

**Measurify Dashboard** is Graphical User Interface (GUI) is developed to support a [Measurify](https://measurify.org/) instance. This GUI can be installed within the Measurify source code (to run on the same machine) or be configured to communicate with a remote Measurify instance.

# Configuration

To change the title of this GUI, you have to change the website name in the configManager.js and the string between the title tags.

    <title> </title>

The base_api_url defined in the configManager.js specifies the url of the Measurify instance. If the GUI and Measurify runs together, set it as undefined, otherwise specify the url.

The GUI can be fastly configured to manage different user's needs on pages and proprieties; the configuration can be specified in the ./src/configs/ as a standalone .js file (you can use already present configs as example). Comments inside those files shoud be a guideline on how to manage all the elements in the configuration.
Once the configuration is defined, you should edit the configManager.js file in ./src folder to use the specified configuration. The file is configured to switch configuration according to tenant name (to offer a wider range of applications), but this can be changed as you need.

# Usage

As said before, this GUI can be used as a standalone React Application or built-in a measurify instance.

## Requirements

To use this GUI from source, both for standalone application or to build it inside Measurify, [NodeJS](https://nodejs.org/) should be installed.

## Standalone application

To run as standalone application, use the instructions to run a react app on the [React website](https://reactjs.org).

- GUI requirements must be installed : _npm install_
- GUI have to be started or built: _npm start_ (will run the React application and it c an be reached from http://localhost:3000 )

## Built in Measurify

To build the GUI within the Measurify installation, follow the following steps:

- Clone the source code of Measurify from [Github](https://github.com/measurify/server/)
- Copy the whole directory of the GUI project (except /node_modules/, .gitignore, package-lock.json, README.md) into the ./gui/ folder of the Measurify directory
- Use the terminal to navigate to the ./gui folder of the Measurify directory
- Install the GUI requirements: _npm install_
- Build the GUI with _npm run build-win_ on a Windows machine or _npm run build-mac_ on a MacOS machine. Those two commands are batch operations to build react scrpts and then copy the output into the public folder of Measurify (_npm run build-mac_ runs as _react-scripts build && cp -r ./build/\* ../public/_ )
- Install Measurify (on cloud or on premises) as specified in [Measurify Github page](https://github.com/measurify/server/)

# Test

Several automatic tests are provided to test the functionalities of this GUI. Tests are developed using [Cypress](https://docs.cypress.io/) and can be run locally before the deploy.

## Requirements

Test run on a local tenant that must be set up before running tests (check Measurify APIs examples to create a new tenant using Postman). In particular, the tenant should be named "test-tenant" and admin cretendials must be:

    username: admin
    password: adminAdmin

To open Cypress navigate to the ./tests folder and run _npx cypress open_, select _E2E testing_ and then the browser (Google Chrome should be used, if possible).
The _cypress/e2e/localhost-dashboard-tests_ folder contains several tests to create, validate and remove a single entity. Those tests are divided into entity-specific files (i.e., _Things.cy.js_) or bundled together in _create_delete_multi_test.cy.js_.
Select the desired file to run it. Make sure that Measurify instance and the GUI are running on your pc, as tests are performed on http://localhost:3000/ .

# Versions

- 1.0.0 (current)

  > GUI now supports multiple configurations, selection is based on tenant's name\
  > Password recovery is now supported by the GUI\
  > The user can now change the email associated with the account from the profile page\
  > When data are fetched from the Measurify server, only required fields are requested\
  > Added automatic tests\
  > Several bugfixes

- 0.6.0

  > Added operational pages to manage experiments (add history steps, remove history steps, download experiments' history)\
  > User can specify CSV separators in operational pages\
  > Preview table for operational pages reflecs the CSV separators specified by the user\
  > Added Import/Export values to the form to add a new Experiment\
  > GUI now automatically arranges itself according to user's role (page without access right aren't shown in the navigation bar, actions that cannot be performed by the user aren't shown)\
  > Boolean fields are now correctly managed during add/edit operation\
  > Several bugfixes

- 0.5.0

  > GUI can now be configured to work in vertical or horizontal (landscape) mode\
  >  Improved functionalities for mobile view\
  >  Notification system enhanced with a simple animation when a new notification pops\
  >  Improved fetched data management\
  >  Added mui/material library to support autocompletion inputs\
  >  Added autocomplete fields for fetched-data based fields both for add and edit pages\
  >  Added specific page to add "measurements"\
  >  Several bugfixes

- 0.4.0

  > Added profile page to edit password \
  >  Improved view for various resources\
  >  Code cleaning and refactoring \
  >  Solved bugfix on rebuild page \
  >  Added Back button to the file form of post resources \
  >  Language selector visualization aligned to configuration options

- 0.3.0

  > Major code refactoring to support new data types in Measurify \
  >  Changed numeric input fields \
  >  Improved default check for input forms \
  >  Arrays are now edited defining add/update/remove in PUT body
  > JSON files can now be uploaded during entity creation for faster definition \
  >  Several bugfixes

- 0.2.0

  > Improved array visualization for edit pages \
  >  Remove element button in edit page are now correctly disabled\
  >  Login pages now displays error messages\
  >  Removed pages that are no longer used

- 0.1.0

  > Added support for enum types fetched directly from the database\
  >  variables.js renamed into config.js\
  >  Languages can now be configured from the configuration\
  >  Several bugfixes and code clearing

- 0.0.0
  > The gui supports the definition of pages to view, edit and add resources. All of them can be defined through a config file.\
  >  To create new records the user can use the web-form or upload a CSV file.\
  >  A notification sistem is working to acknowledge user about the success or failure of an operation.
