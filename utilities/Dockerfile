FROM python:3.10-bookworm

# Install additional packages
COPY requirements.txt /tmp/
RUN pip install --no-cache-dir -r /tmp/requirements.txt

# Set the working directory
COPY . /app
WORKDIR /app

ENTRYPOINT ["flask", "--app", "predict", "run", "-h", "0.0.0.0", "-p", "5000"]