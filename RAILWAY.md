# Railway Deployment

## Environment Variables

For Railway deployment, you need to set the following environment variable:

### REPOSITORIES
A JSON array containing your recipe repositories:
```json
[{"author":"okneze","repository":"jesti-rezepte","branch":"main"}]
```

## Deployment Steps

1. Connect your GitHub repository to Railway
2. Set the REPOSITORIES environment variable in Railway dashboard
3. Deploy!

Railway will automatically:
- Install dependencies with `npm install`
- Build the application with `npm run build`
- Start the server with `npm start`

The app will be available on Railway's provided domain.
