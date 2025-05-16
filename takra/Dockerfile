# Use official Node.js image
FROM node:18

# Set working directory
WORKDIR /app

# Copy dependency files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the app source code
COPY . .

# Expose Angular's default dev port
EXPOSE 4200

# Start Angular in dev mode
CMD ["npm", "run", "start"]
