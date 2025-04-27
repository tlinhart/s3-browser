# Step 1: Use an official Node.js image as a base image
FROM node:18-alpine

# Step 2: Install curl using apk
RUN apk add --no-cache curl

# Step 3: Set the working directory inside the container
WORKDIR /app

# Step 4: Copy the package.json and package-lock.json (if available) to install dependencies
COPY package*.json ./

# Step 5: Install the project dependencies
RUN npm install

# Step 6: Copy the rest of the application files into the container
COPY . .

# Step 8: Command to run the application
CMD ["npm", "start"]