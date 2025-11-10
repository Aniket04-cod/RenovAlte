# RenovAlte 

## Backend

#### Prerequisites

- Python 3.10+
- Pip

#### Setup

```bash
# Navigate to backend project
cd backend

# Create a virtual environment
python3 -m venv .venv
# On Windows (CMD): python -m venv .venv

# Activate the virtual environment
source .venv/bin/activate
# On Windows (CMD): .venv\Scripts\activate.bat

# Install dependencies
pip install -r requirements.txt

# Apply database migrations
python manage.py migrate

# Create an admin user (optional but recommended)
python manage.py createsuperuser

# Start the development server
python manage.py runserver
```

#### Development URLs
- App: `http://127.0.0.1:8000/`
- Admin: `http://127.0.0.1:8000/admin/`

### Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

## Frontend

#### Prerequisites

- Node.js 16+
- Npm

#### Setup

```bash
# Navigate to frontend project
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```
#### Development URLs
- App: `http://127.0.0.1:3000/`

## Start Both Servers (Windows)

If you are on Windows, you can start both the Django API and React app together with the helper script:

```cmd
run-dev.bat
```

The script runs backend migrations, launches `python manage.py runserver` in the background, and then starts the frontend dev server (`npm start`) in the current terminal. Press `Ctrl+C` to stop both servers.