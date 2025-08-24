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
# --host 0.0.0.0 makes it accessible from outside the container.
# Railway will automatically set the PORT environment variable.
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
