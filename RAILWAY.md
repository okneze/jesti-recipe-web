# Railway Deployment

## Environment Variables

For Railway deployment, you need to set the following environment variables:

### REPOSITORIES
A JSON array containing your recipe repositories:
```json
[{"author":"okneze","repository":"jesti-rezepte","branch":"main"}]
```

### GITHUB_TOKEN (Optional - Required for Private Repositories)
If your recipe repository is private, you need to create a GitHub Personal Access Token:

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with these permissions:
   - `repo` (Full control of private repositories)
3. Copy the token and set it as `GITHUB_TOKEN` environment variable in Railway

**Note**: Without a token, only public repositories will work.

## Deployment Steps

1. Connect your GitHub repository to Railway
2. Set the REPOSITORIES environment variable in Railway dashboard
3. If using private repositories, set the GITHUB_TOKEN environment variable
4. Deploy!

Railway will automatically:
- Install dependencies with `npm install`
- Build the application with `npm run build`
- Start the server with `npm start`

The app will be available on Railway's provided domain.
