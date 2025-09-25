import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Container, AppBar, Toolbar, Typography, Box, Paper, Button } from '@mui/material';
import { Home, TrendingUp, Assessment } from '@mui/icons-material';

// Import your pages
import HomePage from './pages/HomePage';
import BuyVsRentPage from './pages/BuyVsRentPage';
import ForwardTrackerPage from './pages/ForwardTrackerPage';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
});

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <AppBar position="static" elevation={2}>
      <Toolbar>
        <Home sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Housing Strategy Dashboard
        </Typography>
        <Button 
          color="inherit" 
          onClick={() => navigate('/')}
          sx={{ mr: 2 }}
          variant={location.pathname === '/' ? 'outlined' : 'text'}
        >
          Home
        </Button>
        <Button 
          color="inherit" 
          onClick={() => navigate('/buy-vs-rent')}
          sx={{ mr: 2 }}
          variant={location.pathname === '/buy-vs-rent' ? 'outlined' : 'text'}
        >
          Buy vs Rent
        </Button>
        <Button 
          color="inherit" 
          onClick={() => navigate('/forward-tracker')}
          variant={location.pathname === '/forward-tracker' ? 'outlined' : 'text'}
        >
          Forward Tracker
        </Button>
      </Toolbar>
    </AppBar>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ flexGrow: 1 }}>
          <Navigation />
          <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/buy-vs-rent" element={<BuyVsRentPage />} />
              <Route path="/forward-tracker" element={<ForwardTrackerPage />} />
            </Routes>
          </Container>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
