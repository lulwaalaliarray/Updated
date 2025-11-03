import { Typography, Box } from '@mui/material';
import Header from '../components/Header';

function RegisterPage(): JSX.Element {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Header />
      <Box textAlign="center" sx={{ pt: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Register
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Registration functionality will be implemented in upcoming tasks.
        </Typography>
      </Box>
    </div>
  );
}

export default RegisterPage;