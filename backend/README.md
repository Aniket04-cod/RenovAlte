# RenovAlte Backend - Setup Guide

This is the backend for **RenovAlte**, a German home renovation cost estimation and financing platform powered by Google Gemini AI and Vertex AI.

## 🚀 Quick Start

### Prerequisites

- Python 3.8 or higher
- Google Gemini API key (for text operations)
- Google Cloud account (for image generation with Vertex AI)
- pip (Python package manager)

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment Variables

```bash
# Copy the template file
cp .env.example .env

# Edit the .env file with your actual credentials
# (Use any text editor)
```

**Required Environment Variables:**

| Variable | Description | How to Get It |
|----------|-------------|---------------|
| `GEMINI_API_KEY` | Google Gemini API key for text operations | [Get from Google AI Studio](https://aistudio.google.com/) |
| `GOOGLE_CLOUD_PROJECT_ID` | Your Google Cloud project ID | [Create project in Google Cloud Console](https://console.cloud.google.com/) |
| `GOOGLE_CLOUD_LOCATION` | Region for Vertex AI (default: `us-central1`) | Use default or choose from [available regions](https://cloud.google.com/vertex-ai/docs/general/locations) |
| `VERTEX_AI_IMAGEN_MODEL` | Imagen model to use (default: `imagen-4.0-ultra-generate`) | See available models below |

### 3. Set Up Vertex AI Credentials

**Option A: Automatic Setup (Recommended)**

Follow the detailed guide in `VERTEX_AI_SETUP_GUIDE.md` for step-by-step instructions.

**Option B: Manual Setup**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Vertex AI API
4. Create a service account with "Vertex AI User" role
5. Download the JSON key file
6. Save it as `backend/credentials/vertex-ai-credentials.json`

### 4. Verify Your Setup

Test that everything is configured correctly:

```bash
# Test Vertex AI configuration
python core/services/vertex_ai_config.py

# Test image generation
python core/services/gemini_image_service.py

# Run complete integration test
```

### 5. Run the Server

```bash
# Run Django development server
python manage.py runserver

# The API will be available at:
# http://localhost:8000/api/
```



## 🧪 Testing

### Test Individual Components

```bash
# Test Vertex AI configuration
python core/services/vertex_ai_config.py

# Test image generation
python core/services/gemini_image_service.py

# Test text generation
python core/services/gemini_service.py

# List available models
```

### Test API Endpoints

```bash
# Make sure the server is running
python manage.py runserver

# In another terminal, test the cost estimation endpoint
curl -X POST http://localhost:8000/api/financing/cost-estimation/ \
  -H "Content-Type: application/json" \
  -d '{"renovationType": "bathroom", "bathroomSize": "medium"}'
```

## 🐛 Troubleshooting

### "Model not found" Error

**Problem:** `404 models/gemini-xxx is not found for API version v1beta`

**Solution:**
- Check that you're using a model available in your account (see list above)
- Update the model name in `core/api/financing/views.py:403` to `gemini-2.5-flash`

### "Vertex AI Configuration Error"

**Problem:** Missing or invalid Vertex AI credentials

**Solution:**
1. Verify `GOOGLE_CLOUD_PROJECT_ID` is set in `.env`
2. Check that `credentials/vertex-ai-credentials.json` exists
3. Run `python core/services/vertex_ai_config.py` to validate

### "Permission Denied" Error

**Problem:** Service account doesn't have proper permissions

**Solution:**
1. Go to [IAM & Admin](https://console.cloud.google.com/iam-admin/iam)
2. Find your service account
3. Add "Vertex AI User" role
4. Wait 1-2 minutes for permissions to propagate

### "Billing Not Enabled" Error

**Problem:** Google Cloud billing is not enabled

**Solution:**
1. Go to [Billing](https://console.cloud.google.com/billing)
2. Link a billing account to your project
3. Enable billing for Vertex AI

### "API Rate Limit Exceeded"

**Problem:** Too many requests to Gemini API

**Solution:**
- Wait a few minutes before trying again
- Check your [API quota](https://aistudio.google.com/)
- Consider upgrading to a paid plan

## 📚 Additional Documentation

- **[VERTEX_AI_SETUP_GUIDE.md](../VERTEX_AI_SETUP_GUIDE.md)** - Detailed Vertex AI setup instructions
- **[PROJECT_DOCUMENTATION.md](../PROJECT_DOCUMENTATION.md)** - Complete project overview
- **[QUICK_START_VERTEX_AI.txt](../QUICK_START_VERTEX_AI.txt)** - Quick reference guide

## 🔒 Security Notes

⚠️ **IMPORTANT:** Never commit these files to version control:

- `.env` - Contains your API keys
- `credentials/vertex-ai-credentials.json` - Contains your service account key

Both files are already in `.gitignore`. Keep your credentials secure!

## 💡 Pro Tips

1. **Use the recommended models** - `gemini-2.5-flash` for text, `imagen-4.0-ultra-generate` for images
2. **Monitor your costs** - Check [Google Cloud Console](https://console.cloud.google.com/billing) regularly
3. **Set up budget alerts** - Go to [Budgets & alerts](https://console.cloud.google.com/billing/budgets)
4. **Test with smaller models first** - Use `imagen-4.0-fast-generate` during development
5. **Keep your API keys secure** - Never share them or commit them to Git

## 🤝 Contributing

If you improve the setup process or fix any issues, please update this README to help future users!

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the detailed setup guides in the docs folder
3. Verify your environment variables in `.env`
4. Test individual components to isolate the problem

---

**Happy Renovating! 🏠✨**
