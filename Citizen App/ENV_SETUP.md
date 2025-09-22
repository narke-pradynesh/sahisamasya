# Environment Variables Setup

This document explains how to configure environment variables for the SahiSamasya application.

## Quick Setup

1. **Copy the environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit the `.env` file** with your actual API keys and configuration values.

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_OPENROUTER_API_KEY` | OpenRouter API key for AI image classification | `sk-or-v1-...` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/sahisamasya` |
| `JWT_SECRET` | Secret key for JWT token signing | `your-super-secret-key` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `HOST` | Server host | `localhost` |
| `NODE_ENV` | Environment mode | `development` |
| `DB_NAME` | Database name | `SahiSamasya` |
| `JWT_EXPIRES_IN` | JWT token expiration | `7d` |
| `VITE_OPENROUTER_MODEL` | Primary AI model | `x-ai/grok-4-fast:free` |
| `VITE_OPENROUTER_FALLBACK_MODELS` | Fallback AI models | `openai/gpt-4o-mini,anthropic/claude-3-haiku` |

## Getting API Keys

### OpenRouter API Key
1. Visit [OpenRouter](https://openrouter.ai/keys)
2. Create an account and generate an API key
3. Add the key to your `.env` file as `VITE_OPENROUTER_API_KEY`

### MongoDB URI
- **Local MongoDB:** `mongodb://localhost:27017/sahisamasya`
- **MongoDB Atlas:** Get connection string from your Atlas cluster

## Security Notes

**Important Security Considerations:**

1. **Never commit `.env` files** to version control
2. **Change the JWT_SECRET** in production
3. **Use strong, unique secrets** for production
4. **Restrict MongoDB access** in production
5. **Use HTTPS** in production

## File Structure

```
├── .env                 # Your actual environment variables (DO NOT COMMIT)
├── .env.example         # Template file (safe to commit)
└── ENV_SETUP.md         # This documentation
```

## Troubleshooting

### Environment Variables Not Loading
- Ensure `.env` file is in the project root
- Restart your development server after changing `.env`
- Check that variable names match exactly (case-sensitive)

### API Key Issues
- Verify API keys are valid and have proper permissions
- Check API key format (no extra spaces or quotes)
- Ensure sufficient API credits/quotas

### Database Connection Issues
- Verify MongoDB URI format
- Check network connectivity
- Ensure database credentials are correct
