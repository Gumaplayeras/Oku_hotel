import { Button, Container, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      const data = await login(username, password);
      localStorage.setItem('token', data.access);
      navigate('/dashboard');
    } catch (err) {
      setError('Credenciales inválidas');
    }
  };

  return (
    <Container maxWidth="xs" style={{ marginTop: '150px' }}>
      <Typography variant="h4" align="center" gutterBottom>Oku IT Login</Typography>
      {error && <Typography color="error">{error}</Typography>}
      <TextField fullWidth label="Usuario" margin="normal" value={username} onChange={e => setUsername(e.target.value)} />
      <TextField fullWidth label="Contraseña" margin="normal" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <Button fullWidth variant="contained" color="primary" style={{ marginTop: '20px' }} onClick={handleSubmit}>Entrar</Button>
    </Container>
  )
}