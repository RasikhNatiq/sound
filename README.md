# Mobile Audio Prediction App

A modern, mobile-first React application for real-time audio classification and prediction. This app provides multiple modes for audio analysis including single file prediction, continuous processing, and real-time streaming prediction.

## 🎯 Features

- **Single File Prediction**: Upload and analyze individual audio files
- **Real-Time Processing**: Live audio recording with instant predictions
- **Continuous Analysis**: Segment-by-segment analysis of longer audio files
- **Prediction History**: View and manage historical predictions
- **Mobile-First Design**: Optimized for mobile devices with a native app feel
- **Beautiful UI**: Modern design with Tailwind CSS and smooth animations

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Audio Processing**: Web Audio API

## 📱 Pages & Features

### Landing Page (`/`)
- Simple audio file upload interface
- Instant single-file prediction
- Clean, intuitive design

### Real-Time Page (`/real-time`)
- Live audio recording with visual waveform
- Real-time prediction streaming
- Recording timer and controls

### Continuous Page (`/continuous`)
- Upload longer audio files for segment analysis
- Detailed timeline-based predictions
- Progress tracking

### History Page (`/history`)
- View all past predictions
- Refresh functionality
- Organized chronological display

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A compatible audio prediction API server

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd audio-prediction-app
```

2. Install dependencies:
```bash
npm install
```

3. Configure the API endpoint:
   - Open [`src/utils/api.ts`](src/utils/api.ts)
   - Update the `BASE_URL` constant to point to your API server

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 🔧 Configuration

### API Configuration

The app expects a backend API with the following endpoints:

- `POST /predict` - Single file prediction
- `POST /stream_predict` - Real-time streaming prediction
- `POST /continuous_predict` - Continuous file analysis
- `GET /history` - Retrieve prediction history

Update the API base URL in [`src/utils/api.ts`](src/utils/api.ts):

```typescript
const BASE_URL = "http://localhost:8000"; // Update this
```

### Audio Settings

Audio processing settings can be configured in [`src/store/audioStore.ts`](src/store/audioStore.ts):

```typescript
const CHUNK_DURATION_MS = 3000; // 3 seconds per chunk
```

## 📁 Project Structure

```
src/
├── components/ui/          # Reusable UI components
│   ├── AudioWaveform.tsx   # Real-time audio visualization
│   ├── Button.tsx          # Custom button component
│   ├── FileUpload.tsx      # Drag & drop file upload
│   ├── Header.tsx          # Page headers
│   ├── MobileFrame.tsx     # Mobile device simulator
│   ├── Navbar.tsx          # Bottom navigation
│   └── PredictionList.tsx  # Prediction results display
├── pages/                  # Application pages
│   ├── ContinuousPage.tsx  # Continuous prediction page
│   ├── HistoryPage.tsx     # Prediction history page
│   ├── LandingPage.tsx     # Home page
│   └── RealTimePage.tsx    # Real-time prediction page
├── store/                  # State management
│   └── audioStore.ts       # Audio state and actions
├── types/                  # TypeScript type definitions
│   └── index.ts            # Application types
├── utils/                  # Utility functions
│   ├── api.ts              # API communication
│   └── audio.ts            # Audio processing utilities
├── workers/                # Web Workers
│   ├── audioProcessor.worker.ts      # Audio processing worker
│   └── predictionProcessor.worker.ts # Prediction processing worker
├── App.tsx                 # Main application component
├── main.tsx               # Application entry point
└── index.css              # Global styles
```

## 🎨 Styling & Theming

The app uses a custom Tailwind CSS configuration with:

- **Primary Color**: Indigo (for main actions)
- **Secondary Color**: Slate (for backgrounds)
- **Accent Color**: Red (for recording states)

Theme configuration can be found in [`tailwind.config.js`](tailwind.config.js).

## 🔊 Audio Processing

### Supported Formats
- MP3
- WAV

### Audio Features
- Real-time microphone access
- Audio chunk processing
- WAV format conversion
- Base64 encoding for API transmission

## 📱 Mobile Features

- **Responsive Design**: Works on all screen sizes
- **Touch-Friendly**: Large tap targets and smooth interactions
- **Mobile Frame**: Simulated mobile device experience
- **Status Bar**: Realistic mobile status indicators
- **Bottom Navigation**: Easy thumb navigation

## 🛡️ Error Handling

The app includes comprehensive error handling:
- Network connection issues
- Invalid file formats
- API errors
- Microphone access permissions
- Audio processing failures

## 🔧 Development Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 📄 API Response Format

### Single/Stream Prediction Response
```json
{
  "predicted_class": "speech",
  "confidence": 0.85,
  "timestamp": "2025-05-31 02:34:11.375896"
}
```

### Continuous Prediction Response
```json
{
  "predicted_class": [
    [0, 3, "speech", 0.85],
    [3, 6, "music", 0.92],
    [6, 9, "background_noise", 0.78]
  ]
}
```

### History Response
```json
{
  "history": [
    {
      "predicted_class": "speech",
      "confidence": 0.85,
      "timestamp": "2025-05-31 02:34:11.375896"
    }
  ]
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run the linter: `npm run lint`
5. Test your changes
6. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🐛 Troubleshooting

### Common Issues

1. **Microphone not working**: Ensure you've granted microphone permissions
2. **API connection failed**: Check the API URL in [`src/utils/api.ts`](src/utils/api.ts)
3. **File upload issues**: Verify the file is a supported audio format
4. **Build errors**: Run `npm install` to ensure all dependencies are installed

### Browser Compatibility

- Chrome/Chromium 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## 📞 Support

For support, please open an issue in the repository or contact the development team.