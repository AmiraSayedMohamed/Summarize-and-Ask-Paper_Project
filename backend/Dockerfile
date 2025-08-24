# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container at /app
# This is done first to leverage Docker's layer caching
COPY ./requirements.txt /app/requirements.txt

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend application code into the container at /app
COPY . /app

# Let Docker know that the container listens on this port
EXPOSE 8000

# Define the command to run the application
# Uvicorn is the server that will run your FastAPI code.
# Use sh -c so shell environment variable expansion works and the container
# will bind to the platform-provided $PORT (falling back to 8000 locally).
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
