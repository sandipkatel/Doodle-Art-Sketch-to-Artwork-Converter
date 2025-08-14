#!/bin/bash

# Set host to 0.0.0.0 instead of localhost
export HOST=localhost

# Run server in the background
(cd server && python app_stylize.py) &
(cd server && python app_pix.py) &

# Run front-end
yarn && yarn dev