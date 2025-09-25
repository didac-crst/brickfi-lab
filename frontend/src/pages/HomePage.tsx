import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Container,
  Paper,
} from '@mui/material';
import { TrendingUp, Assessment, Home, ArrowForward } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Buy vs Rent Analysis',
      description: 'Compare the economic costs of buying vs renting a property with interactive charts and sensitivity analysis.',
      icon: <Home sx={{ fontSize: 40, color: 'primary.main' }} />,
      path: '/buy-vs-rent',
      color: '#e3f2fd',
    },
    {
      title: 'Forward Rate Tracker',
      description: 'Analyze forward-loaded mortgage rates and make optimal timing decisions for refinancing.',
      icon: <TrendingUp sx={{ fontSize: 40, color: 'secondary.main' }} />,
      path: '/forward-tracker',
      color: '#fce4ec',
    },
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
          Housing Strategy Dashboard
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
          Make informed housing investment decisions with interactive analysis tools and visual insights
        </Typography>
      </Box>

      <Grid container spacing={4} sx={{ mb: 6 }}>
        {features.map((feature, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                <Box sx={{ mb: 2 }}>
                  {feature.icon}
                </Box>
                <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                  {feature.title}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                <Button
                  variant="contained"
                  endIcon={<ArrowForward />}
                  onClick={() => navigate(feature.path)}
                  size="large"
                >
                  Explore
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 4, mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
          Why Use This Dashboard?
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
              🎯 Data-Driven Decisions
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Make housing investment decisions based on comprehensive economic analysis rather than intuition.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
              📊 Visual Insights
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Understand complex financial scenarios through interactive charts and real-time visualizations.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
              ⚡ Real-Time Analysis
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Modify parameters and see results instantly. No need to recalculate manually.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
              🔄 Scenario Planning
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Test different market conditions and see how they affect your investment strategy.
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          Ready to Get Started?
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Choose an analysis tool below to begin exploring your housing investment options.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<Home />}
            onClick={() => navigate('/buy-vs-rent')}
            sx={{ minWidth: 200 }}
          >
            Buy vs Rent Analysis
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<TrendingUp />}
            onClick={() => navigate('/forward-tracker')}
            sx={{ minWidth: 200 }}
          >
            Forward Rate Tracker
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default HomePage;
