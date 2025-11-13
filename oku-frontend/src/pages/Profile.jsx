import React from 'react';
import useMyProfile from '../hooks/useMyProfile';
import { Box, Card, CardContent, Typography, Chip, Divider, Grid, Avatar } from '@mui/material';

export default function Profile() {
  const { data, loading, error } = useMyProfile();

  if (loading) return <Typography sx={{ p: 3 }}>Cargando perfil…</Typography>;
  if (error)   return <Typography sx={{ p: 3 }} color="error">No se pudo cargar el perfil</Typography>;
  if (!data)   return <Typography sx={{ p: 3 }}>Sin datos</Typography>;

  const {
    username, first_name, last_name, email,
    empleado
  } = data;

  const nombreCompleto = (first_name || last_name)
    ? `${first_name || ''} ${last_name || ''}`.trim()
    : username;

  // Helpers para mostrar campos del empleado con fallback
  const depNombre = empleado?.departamento_nombre || empleado?.departamento || '-';
  const delegacion = empleado?.delegacion || '-';
  const rol = empleado?.rol || '—';
  const tipoRol = empleado?.tipo_rol || '-';

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, display: 'flex', justifyContent: 'center' }}>
      <Box sx={{ width: '100%', maxWidth: 920 }}>
        <Card
          sx={{
            background: 'linear-gradient(180deg, rgba(17,24,39,0.95) 0%, rgba(15,18,23,0.95) 100%)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 3,
            boxShadow: '0 20px 40px rgba(0,0,0,0.35)',
            overflow: 'hidden'
          }}
        >
          {/* Encabezado con avatar y nombre */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              p: 3,
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              background:
                'radial-gradient(1200px 200px at -10% -30%, rgba(212,165,116,0.10), transparent 60%), radial-gradient(1200px 200px at 120% -30%, rgba(201,151,91,0.08), transparent 60%)'
            }}
          >
            <Avatar
              sx={{
                width: 72,
                height: 72,
                background: 'linear-gradient(135deg, #d4a574, #c9975b)',
                border: '1px solid rgba(212,165,116,0.35)',
                fontWeight: 800,
                fontSize: 28,
                boxShadow: '0 6px 18px rgba(212,165,116,0.35)'
              }}
            >
              {(first_name?.[0] || username?.[0] || 'U').toUpperCase()}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="h5"
                sx={{ fontWeight: 800, letterSpacing: '0.3px', lineHeight: 1.2 }}
              >
                {nombreCompleto}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: '#cbd5e1', mt: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                title={email}
              >
                {email || '-'}
              </Typography>

              <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={`@${username}`}
                  size="small"
                  sx={{
                    background: 'rgba(255,255,255,0.06)',
                    color: '#e5e7eb',
                    border: '1px solid rgba(255,255,255,0.12)',
                    fontWeight: 600
                  }}
                />
                {delegacion && (
                  <Chip
                    label={`Delegación: ${delegacion}`}
                    size="small"
                    sx={{
                      background: 'rgba(33,150,243,0.12)',
                      color: '#e5e7eb',
                      border: '1px solid rgba(33,150,243,0.25)',
                      fontWeight: 600
                    }}
                  />
                )}
                {depNombre && (
                  <Chip
                    label={`Departamento: ${depNombre}`}
                    size="small"
                    sx={{
                      background: 'rgba(100,181,246,0.12)',
                      color: '#e5e7eb',
                      border: '1px solid rgba(100,181,246,0.25)',
                      fontWeight: 600
                    }}
                  />
                )}
              </Box>
            </Box>
          </Box>

          <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            <Grid container spacing={3}>
              {/* Columna izquierda: datos de cuenta */}
              <Grid item xs={12} md={6}>
                <Typography variant="overline" sx={{ color: '#94a3b8' }}>
                  Datos de cuenta
                </Typography>
                <Box sx={{ mt: 1.5, display: 'grid', rowGap: 1.25 }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                      Usuario
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{username}</Typography>
                  </Box>

                  <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.06)' }} />

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                        Nombre
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>{first_name || '-'}</Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                        Apellidos
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>{last_name || '-'}</Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.06)' }} />

                  <Box>
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                      Email
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{email || '-'}</Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Columna derecha: datos laborales */}
              <Grid item xs={12} md={6}>
                <Typography variant="overline" sx={{ color: '#94a3b8' }}>
                  Datos de empleado
                </Typography>

                {empleado ? (
                  <Box sx={{ mt: 1.5, display: 'grid', rowGap: 1.25 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                          Departamento
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>{depNombre}</Typography>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                          Delegación
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>{delegacion}</Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.06)' }} />

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                          Rol
                        </Typography>
                        <Box sx={{ mt: 0.5 }}>
                          <Chip
                            label={rol}
                            size="small"
                            sx={{
                              background: 'rgba(212,165,116,0.15)',
                              color: '#fff',
                              border: '1px solid rgba(212,165,116,0.35)',
                              fontWeight: 700
                            }}
                          />
                        </Box>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                          Tipo de rol
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>{tipoRol}</Typography>
                      </Box>
                    </Box>
                  </Box>
                ) : (
                  <Typography sx={{ mt: 2, color: '#cbd5e1' }}>
                    Este usuario no tiene datos de empleado asignados.
                  </Typography>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}