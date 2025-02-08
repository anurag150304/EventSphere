import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import EventDetails from './pages/Events/EventDetails';
import CreateEvent from './pages/Events/CreateEvent';
import EditEvent from './pages/Events/EditEvent';
import Calendar from './pages/Calendar/Calendar';
import Analytics from './pages/Analytics/Analytics';
import Profile from './pages/Profile/Profile';
import NotificationHistory from './pages/Notifications/NotificationHistory';
import store from './store';
import { UserProvider } from './context/UserContext';

function App() {
  return (
    <Provider store={store}>
      <UserProvider>
        <Router>
          <Layout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/events/:id"
                element={
                  <ProtectedRoute allowGuest>
                    <EventDetails />
                  </ProtectedRoute>
                }
              />

              {/* Protected Routes */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/events/create"
                element={
                  <ProtectedRoute>
                    <CreateEvent />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/events/:id/edit"
                element={
                  <ProtectedRoute>
                    <EditEvent />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/calendar"
                element={
                  <ProtectedRoute allowGuest>
                    <Calendar />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <Analytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <NotificationHistory />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Layout>
          <Toaster position="top-right" />
        </Router>
      </UserProvider>
    </Provider>
  );
}

export default App;
