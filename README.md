A modern, responsive web application for managing AI assistants, users, and processing natural language commands using OpenRouter's free DeepSeek models.

## Features

- **Dashboard**: Overview statistics, quick actions, and recent activity feed
- **User Management**: Add, edit, delete users with role-based permissions
- **Bot Management**: Create and manage AI assistants with different types and capabilities
- **AI Command Center**: Natural language command processing powered by OpenRouter's free models
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Setup Instructions

### 1. Environment Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file and add your OpenRouter API key:
   ```
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
   OPENROUTER_MODEL=deepseek/deepseek-chat-v3-0324:free
   ```

### 2. Installation

Install dependencies:
```bash
npm install
```

### 3. Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## API Integration

### OpenRouter API Setup

1. **Get API Key**: Obtain your OpenRouter API key from [openrouter.ai](https://openrouter.ai)
2. **Configure Environment**: Add the API key to your `.env` file
3. **Test Connection**: The app will automatically validate the connection on startup

### Free Models Available

The application uses OpenRouter's free tier with these recommended models:
- `deepseek/deepseek-chat-v3-0324:free` - Excellent for general tasks and command interpretation
- `deepseek/deepseek-r1-0528:free` - Advanced reasoning model for complex operations
- `meta-llama/llama-3.1-8b-instruct:free` - Reliable for instruction following

### Command Processing

The AI Command Center supports natural language commands such as:

- `"Go to dashboard"`
- `"Add a user named John with email john@company.com and role admin"`
- `"Create a recruitment bot named HireBot"`
- `"Show all users"`
- `"Navigate to bots page"`

### Fallback Mode

If no API key is provided, the application will use basic command parsing as a fallback, allowing you to test the interface without API access.

## Project Structure

```
src/
├── api/                 # API management and OpenRouter integration
├── components/          # Reusable UI components
├── config/             # Environment and configuration
├── data/               # Sample data and constants
├── pages/              # Main application pages
├── types/              # TypeScript type definitions
└── utils/              # Utility functions and helpers
```

## Security Notes

- Never commit your `.env` file to version control
- The `.env.example` file is safe to commit and serves as a template
- API keys are validated on application startup
- Rate limiting is implemented (10 requests/minute, 50 requests/day for free tier)

## Technologies Used

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **OpenRouter API** for AI command processing
- **Vite** for build tooling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.