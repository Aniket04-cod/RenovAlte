"""
RenovAlte Setup Verification Script

Run this script to verify that your RenovAlte backend is properly configured.
This will check all required environment variables, credentials, and dependencies.

Usage:
    python verify_setup.py
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Colors for terminal output
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    BOLD = '\033[1m'
    END = '\033[0m'

def print_header(text):
    """Print a formatted header"""
    print(f"\n{Colors.BLUE}{'='*80}{Colors.END}")
    print(f"{Colors.BOLD}{text}{Colors.END}")
    print(f"{Colors.BLUE}{'='*80}{Colors.END}\n")

def print_success(text):
    """Print success message"""
    print(f"{Colors.GREEN}✅ {text}{Colors.END}")

def print_error(text):
    """Print error message"""
    print(f"{Colors.RED}❌ {text}{Colors.END}")

def print_warning(text):
    """Print warning message"""
    print(f"{Colors.YELLOW}⚠️  {text}{Colors.END}")

def print_info(text):
    """Print info message"""
    print(f"ℹ️  {text}")

# Load environment variables
load_dotenv()

# Track overall status
all_checks_passed = True

# ============================================================================
# CHECK 1: Environment File
# ============================================================================
print_header("CHECK 1: Environment File (.env)")

env_file = Path('.env')
if env_file.exists():
    print_success(".env file exists")
else:
    print_error(".env file not found!")
    print_info("Run: cp .env.example .env")
    all_checks_passed = False

# ============================================================================
# CHECK 2: Required Environment Variables
# ============================================================================
print_header("CHECK 2: Required Environment Variables")

required_vars = {
    'GEMINI_API_KEY': 'Google Gemini API key for text operations',
    'GOOGLE_CLOUD_PROJECT_ID': 'Google Cloud project ID for Vertex AI',
}

optional_vars = {
    'GOOGLE_CLOUD_LOCATION': 'Google Cloud region (defaults to us-central1)',
    'VERTEX_AI_IMAGEN_MODEL': 'Imagen model name (defaults to imagen-4.0-ultra-generate-001)',
}

for var, description in required_vars.items():
    value = os.getenv(var)
    if value:
        # Mask sensitive values
        if 'KEY' in var:
            masked_value = value[:10] + '...' + value[-4:] if len(value) > 14 else '***'
            print_success(f"{var} = {masked_value}")
        else:
            print_success(f"{var} = {value}")
    else:
        print_error(f"{var} is not set!")
        print_info(f"Description: {description}")
        all_checks_passed = False

print("\nOptional variables:")
for var, description in optional_vars.items():
    value = os.getenv(var)
    if value:
        print_success(f"{var} = {value}")
    else:
        print_warning(f"{var} not set (will use default)")
        print_info(f"Description: {description}")

# ============================================================================
# CHECK 3: Vertex AI Credentials File
# ============================================================================
print_header("CHECK 3: Vertex AI Credentials File")

credentials_path = os.getenv(
    'GOOGLE_APPLICATION_CREDENTIALS',
    'credentials/vertex-ai-credentials.json'
)

credentials_file = Path(credentials_path)
if credentials_file.exists():
    print_success(f"Credentials file found: {credentials_path}")

    # Check if it's a valid JSON file
    try:
        import json
        with open(credentials_file, 'r') as f:
            creds = json.load(f)

        # Check for required fields
        required_fields = ['type', 'project_id', 'private_key', 'client_email']
        missing_fields = [field for field in required_fields if field not in creds]

        if missing_fields:
            print_error(f"Credentials file is missing required fields: {', '.join(missing_fields)}")
            all_checks_passed = False
        else:
            print_success("Credentials file is valid JSON with required fields")
            print_info(f"Service Account: {creds.get('client_email', 'N/A')}")
            print_info(f"Project ID: {creds.get('project_id', 'N/A')}")

    except json.JSONDecodeError:
        print_error("Credentials file is not valid JSON!")
        all_checks_passed = False
    except Exception as e:
        print_error(f"Error reading credentials file: {str(e)}")
        all_checks_passed = False

else:
    print_error(f"Credentials file not found: {credentials_path}")
    print_info("Download service account JSON from Google Cloud Console")
    print_info("Save it as: credentials/vertex-ai-credentials.json")
    all_checks_passed = False

# ============================================================================
# CHECK 4: Python Dependencies
# ============================================================================
print_header("CHECK 4: Python Dependencies")

required_packages = [
    ('django', 'Django web framework'),
    ('google.generativeai', 'Google Generative AI SDK'),
    ('google.cloud.aiplatform', 'Google Cloud Vertex AI SDK'),
    ('dotenv', 'Environment variable loader'),
    ('rest_framework', 'Django REST Framework'),
]

for package, description in required_packages:
    try:
        __import__(package)
        print_success(f"{package} is installed")
    except ImportError:
        print_error(f"{package} is NOT installed!")
        print_info(f"Description: {description}")
        print_info("Run: pip install -r requirements.txt")
        all_checks_passed = False

# ============================================================================
# CHECK 5: Vertex AI Configuration
# ============================================================================
print_header("CHECK 5: Vertex AI Configuration")

try:
    from core.services.vertex_ai_config import VertexAIConfig

    config = VertexAIConfig()
    print_success("Vertex AI configuration is valid!")

    config_summary = config.get_config_summary()
    print_info(f"Project ID: {config_summary['project_id']}")
    print_info(f"Location: {config_summary['location']}")
    print_info(f"Model: {config_summary['model_name']}")
    print_info(f"Aspect Ratio: {config_summary['aspect_ratio']}")

except ValueError as e:
    print_error("Vertex AI configuration error!")
    print_info(str(e))
    all_checks_passed = False
except ImportError as e:
    print_error("Could not import Vertex AI config module!")
    print_info(str(e))
    all_checks_passed = False
except Exception as e:
    print_error(f"Unexpected error: {str(e)}")
    all_checks_passed = False

# ============================================================================
# CHECK 6: Test Gemini API Connection
# ============================================================================
print_header("CHECK 6: Test Gemini API Connection")

gemini_api_key = os.getenv('GEMINI_API_KEY')
if gemini_api_key:
    try:
        import google.generativeai as genai

        genai.configure(api_key=gemini_api_key)

        # Try to create a model instance
        model = genai.GenerativeModel('gemini-2.5-flash')
        print_success("Successfully connected to Gemini API")
        print_success("Model 'gemini-2.5-flash' is accessible")

    except Exception as e:
        print_error(f"Failed to connect to Gemini API: {str(e)}")
        print_info("Check that your GEMINI_API_KEY is valid")
        print_info("Get a new key at: https://aistudio.google.com/")
        all_checks_passed = False
else:
    print_warning("Skipping (GEMINI_API_KEY not set)")

# ============================================================================
# FINAL SUMMARY
# ============================================================================
print_header("VERIFICATION SUMMARY")

if all_checks_passed:
    print(f"{Colors.GREEN}{Colors.BOLD}")
    print("🎉 ALL CHECKS PASSED! 🎉")
    print(f"{Colors.END}")
    print("\nYour RenovAlte backend is properly configured!")
    print("\nNext steps:")
    print("  1. Start the Django server: python manage.py runserver")
    print("  2. Test image generation: python core/services/gemini_image_service.py")
    print("  3. Run integration test: python test_vertex_ai.py")
    print("\n✨ Happy renovating! ✨\n")
    sys.exit(0)
else:
    print(f"{Colors.RED}{Colors.BOLD}")
    print("❌ SOME CHECKS FAILED")
    print(f"{Colors.END}")
    print("\nPlease fix the issues above before running the application.")
    print("\nHelpful resources:")
    print("  • Setup guide: backend/README.md")
    print("  • Environment template: backend/.env.example")
    print("  • Vertex AI guide: VERTEX_AI_SETUP_GUIDE.md")
    print("  • Quick start: QUICK_START.md")
    print()
    sys.exit(1)
