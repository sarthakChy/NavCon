# NavCon - Advanced Navigation with Mappls Web JS SDK

A comprehensive navigation and mapping application powered by **Mappls Web JS SDK v3.0**, showcasing the full capabilities of Mappls APIs and plugins for location-based services.

![NavCon](https://img.shields.io/badge/Mappls-Web%20JS%20SDK-blue)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![FastAPI](https://img.shields.io/badge/FastAPI-Python-green)

## 🚀 Features

### Core Functionality
- ✅ **Interactive Vector Maps** - High-performance vector maps with Mappls SDK v3.0
- ✅ **Smart Search** - Real-time autocomplete with hyper-localized results
- ✅ **Turn-by-Turn Navigation** - Route calculation with detailed step-by-step directions
- ✅ **Nearby POI Search** - Find ATMs, restaurants, hospitals, and more within configurable radius
- ✅ **Place Picker** - Click-to-pick locations directly from the map
- ✅ **Navigation Simulation** - Animated route playback with marker tracking
- ✅ **Custom Markers** - Rich markers with popups, custom icons, and annotations
- ✅ **Route Visualization** - Beautiful route rendering with automatic bounds fitting

### Mappls Plugins Integrated
- 🔍 **Search Plugin** - Intelligent autocomplete search
- 📍 **Place Picker Plugin** - Interactive location selection
- 🗺️ **Nearby Plugin** - Radial POI search with category filtering
- 🧭 **Direction/Routing** - Multi-modal route calculation
- 📌 **Marker Plugin** - Advanced marker management with eLoc support

## 📋 Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- Mappls API credentials ([Get them here](https://auth.mappls.com/console/))

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd NavCon
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
MAPPLS_CLIENT_ID=your_client_id_here
MAPPLS_CLIENT_SECRET=your_client_secret_here
MAPPLS_ROUTING_KEY=your_static_key_here
EOF
```

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env.local file
echo "NEXT_PUBLIC_BACKEND_URL=http://localhost:8000" > .env.local
```

## 🚦 Running the Application

### Start Backend Server
```bash
cd backend
python main.py
# Server runs on http://localhost:8000
```

### Start Frontend Development Server
```bash
cd frontend
npm run dev
# Application runs on http://localhost:3000
```

## 📖 Usage Guide

### 🗺️ Getting Directions

1. **Select Start Location**
   - Click on "Start Location" input field
   - Type your starting point (e.g., "Connaught Place, Delhi")
   - Select from autocomplete suggestions

2. **Select Destination**
   - Click on "Destination" input field
   - Type your destination
   - Select from suggestions

3. **Calculate Route**
   - Click "Get Directions" button
   - View turn-by-turn directions in sidebar
   - Route will be displayed on map

4. **Simulate Navigation**
   - Click "▶ Start Sim" to begin animated navigation
   - Watch the marker move along the route
   - Click "⏹ Stop Sim" to end simulation

### 🔍 Searching Nearby Places

1. **Quick Search**
   - Click on any quick search button (ATM, Restaurant, Hospital, Petrol Pump)
   - Results appear instantly on the map

2. **Custom Search**
   - Click "🔍 Nearby Search" button
   - Enter custom keyword (e.g., "pharmacy", "cafe", "school")
   - Click "Search Nearby"
   - Results show within 5km radius of map center

### 📍 Picking Locations

1. Click "📍 Pick Location" button
2. Click anywhere on the map
3. Location details will be captured and marker will be placed

### 🧹 Managing Markers

- Click "Clear All Markers" to remove all markers from map
- Individual marker popups can be closed by clicking the X

## 🏗️ Project Structure

```
NavCon/
├── backend/
│   ├── main.py              # FastAPI server with all endpoints
│   ├── requirements.txt     # Python dependencies
│   ├── doc.txt             # API documentation
│   └── .env                # Environment variables (create this)
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx        # Main application page
│   │   ├── layout.tsx      # Root layout
│   │   └── globals.css     # Global styles
│   ├── components/
│   │   ├── mappls-map.tsx      # Map SDK initialization
│   │   ├── sidebar.tsx         # Navigation sidebar
│   │   └── map-plugins.tsx     # Plugin controls
│   ├── lib/
│   │   └── api.ts          # Backend API client
│   └── package.json        # Frontend dependencies
│
├── MAPPLS_IMPLEMENTATION.md  # Detailed implementation guide
└── README.md                  # This file
```

## 🔑 Key Technologies

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Mappls Web JS SDK v3.0** - Interactive mapping

### Backend
- **FastAPI** - Modern Python web framework
- **HTTPX** - Async HTTP client
- **Python 3.8+** - Core language

### APIs & Services
- **Mappls Search APIs** - Autosuggest, Geocoding, Place Details
- **Mappls Routing API** - Direction calculation
- **Mappls Nearby API** - POI search
- **OAuth 2.0** - Secure authentication

## 📚 API Endpoints

### Backend REST APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/token` | GET | Get OAuth access token |
| `/api/autosuggest` | GET | Search suggestions with autocomplete |
| `/api/search` | GET | Full text search for places |
| `/api/geocode` | GET | Convert address to coordinates |
| `/api/route` | GET | Calculate route between two points |
| `/api/placedetail` | GET | Get detailed place information |

## 🎨 Features Deep Dive

### Mappls Search Plugin
```typescript
// Auto-binds to input element
new window.mappls.search(inputElement, {
  location: [28.61, 77.23],
  region: "IND",
  height: 300,
  hyperLocal: true
}, callback);
```

### Nearby Search Plugin
```typescript
window.mappls.nearby({
  map: map,
  keywords: 'restaurant',
  refLocation: [lat, lng],
  fitbounds: true,
  radius: 5000,
  popup: true
}, callback);
```

### Marker Management
```typescript
const marker = new window.mappls.Marker({
  position: [lat, lng],
  map: map,
  icon: { url: 'icon.png', width: 30, height: 40 },
  popupHtml: '<div>Popup Content</div>',
  popupOptions: { openPopup: true }
});
```

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```bash
MAPPLS_CLIENT_ID=your_client_id
MAPPLS_CLIENT_SECRET=your_client_secret
MAPPLS_ROUTING_KEY=your_static_access_token
```

**Frontend (.env.local)**
```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

## 🐛 Troubleshooting

### Map Not Loading
- ✅ Check if access token is being fetched successfully
- ✅ Verify MAPPLS credentials in backend .env
- ✅ Open browser console to check for errors
- ✅ Ensure backend server is running

### Search Not Working
- ✅ Wait for "Mappls plugins loaded successfully" in console
- ✅ Check network tab for API responses
- ✅ Verify search queries are valid
- ✅ Ensure proper region setting

### Route Not Displaying
- ✅ Verify coordinates are valid (India region)
- ✅ Check if routing API returns GeoJSON
- ✅ Ensure start and end points are different
- ✅ Look for errors in browser console

### Plugins Not Initializing
- ✅ Ensure map is fully loaded before using plugins
- ✅ Check if `window.mappls` object exists in console
- ✅ Verify plugin script URL is loading correctly
- ✅ Wait for all scripts to load before interaction

## 📊 Performance Tips

1. **Token Caching** - Implement token caching to reduce API calls
2. **Lazy Loading** - Plugins are loaded only when needed
3. **Marker Clustering** - For large number of markers, implement clustering
4. **Route Optimization** - Use appropriate routing profiles
5. **Error Boundaries** - Implement error boundaries for better UX

## 🚀 Deployment

### Backend (Python)
```bash
# Use Uvicorn for production
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Frontend (Next.js)
```bash
npm run build
npm start
```

## 📖 Documentation

- [Mappls Web JS SDK](https://apis.mappls.com/advancedmaps/doc/sample/map-sdk)
- [Mappls REST APIs](https://about.mappls.com/api/)
- [Implementation Guide](./MAPPLS_IMPLEMENTATION.md)
- [API Documentation](./backend/doc.txt)

## 🤝 Support

- **Mappls API Support**: apisupport@mappls.com
- **Documentation**: https://about.mappls.com/api/
- **Console**: https://auth.mappls.com/console/

## 📄 License

This project requires valid Mappls API credentials. Please ensure you have proper licensing from Mappls.

## 🙏 Acknowledgments

- Powered by [Mappls](https://about.mappls.com/) - India's leading mapping platform
- Built with [Next.js](https://nextjs.org/)
- Backend powered by [FastAPI](https://fastapi.tiangolo.com/)

---

**Made with ❤️ using Mappls Web JS SDK v3.0**
