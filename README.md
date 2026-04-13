# GulmiGang - Complete Social Networking Platform

A comprehensive social networking web application designed specifically for the Gulmi district community.

## Features

- **User Authentication**: Register and login with Gulmi location verification
- **Community Feed**: Share posts, connect with neighbors
- **Profile Management**: Manage personal information and skills
- **Minimalist Design**: Black and white theme for clean user experience

## Tech Stack

### Frontend
- Vue.js 3 (Composition API)
- Vite
- Pinia (State Management)
- VeeValidate (Form Validation)
- Axios (API Calls)
- SCSS (Styling)

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcrypt (Password Hashing)

## Getting Started

### Prerequisites
- Node.js (Latest LTS)
- MongoDB (Running locally or cloud instance)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd GulmiGang
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Create .env file with your MongoDB URI and JWT secret
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

### Environment Variables

Create a `.env` file in the backend directory:

```
MONGO_URI=mongodb://localhost:27017/gulmigang
JWT_SECRET=your_super_secret_jwt_key_here
PORT=5000
```

## Project Structure

```
GulmiGang/
├── frontend/          # Vue.js application
│   ├── src/
│   │   ├── views/     # Page components
│   │   ├── stores/    # Pinia stores
│   │   ├── router/    # Vue Router configuration
│   │   └── api.js     # Axios configuration
├── backend/           # Node.js API
│   ├── models/        # MongoDB schemas
│   ├── routes/        # API routes
│   ├── middleware/    # Authentication middleware
│   └── server.js      # Main server file
```

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/user` - Get user data (protected)

## Development Roadmap

This is Phase 1 (Foundation) of the GulmiGang platform. Future phases include:

- Phase 2: Core Features (Posts, Connections, Search)
- Phase 3: Advanced Features (Real-time messaging, Video calls)
- Phase 4: Community Features (Groups, Skills marketplace)
- Phase 5: Polish & Launch

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues.

## License

This project is licensed under the MIT License.