import React from 'react';
import useMyProfile from '../hooks/useMyProfile';
import { Box, Typography, Chip, Divider, Grid, Avatar } from '@mui/material';
import { T } from '../theme/theme';

const FieldBlock = ({ label, value }) => (
  <Box>
    <Typography sx={{ fontFamily: T.fontDisp, fontSize: '0.5625rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.t3, mb: 0.75, display: 'block' }}>
      {label}
    </Typography>
    <Typography sx={{ fontFamily: T.fontUI, color: T.t1, fontWeight: 500, fontSize: '0.9rem' }}>
      {value || <span style={{ color: T.t3, fontStyle: 'italic' }}>—</span>}
    </Typography>
  </Box>
);

export default function Profile() {
  const { data, loading, error } = useMyProfile();

  if (loading) return (
    <Box sx={{ p: 3 }}>
      <Typography sx={{ fontFamily: T.fontUI, color: T.t3, fontSize: '0.875rem' }}>Cargando perfil…</Typography>
    </Box>
  );
  if (error) return (
    <Box sx={{ p: 3 }}>
      <Typography sx={{ fontFamily: T.fontUI, color: T.red, fontSize: '0.875rem' }}>No se pudo cargar el perfil</Typography>
    </Box>
  );
  if (!data) return null;

  const { username, first_name, last_name, email, empleado } = data;
  const nombreCompleto = (first_name || last_name) ? `${first_name||''} ${last_name||''}`.trim() : username;
  const initials = first_name ? (first_name[0] + (last_name?.[0] || '')).toUpperCase() : (username?.[0]?.toUpperCase() || 'U');

  const depNombre = empleado?.departamento_nombre || empleado?.departamento || null;
  const delegacion = empleado?.delegacion || null;
  const rol = empleado?.rol || null;
  const tipoRol = empleado?.tipo_rol || null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Avatar card */}
      <Box sx={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: '8px', overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, p: 3 }}>
          <Avatar sx={{
            width: 64, height: 64,
            background: `linear-gradient(135deg, ${T.accent}, #b8924a)`,
            border: `1px solid ${T.accentBdr}`,
            borderRadius: '8px',
            fontFamily: T.fontMono,
            fontWeight: 800, fontSize: 22, color: T.bg,
            flexShrink: 0,
          }}>
            {initials}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontFamily: T.fontDisp, fontWeight: 700, fontSize: '1.25rem', color: T.t1, lineHeight: 1.2, mb: 0.5 }}>
              {nombreCompleto}
            </Typography>
            <Typography sx={{ fontFamily: T.fontUI, color: T.t3, fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {email || '—'}
            </Typography>
            <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip label={`@${username}`} size="small" sx={{ background: 'rgba(255,255,255,0.05)', color: T.t2, border: `1px solid ${T.border}`, fontFamily: T.fontDisp, fontSize: '0.5625rem', fontWeight: 600, letterSpacing: '0.1em', height: 20, borderRadius: '4px' }} />
              {delegacion && <Chip label={delegacion} size="small" sx={{ background: 'rgba(96,165,250,0.1)', color: T.blue, border: '1px solid rgba(96,165,250,0.2)', fontFamily: T.fontDisp, fontSize: '0.5625rem', fontWeight: 600, letterSpacing: '0.1em', height: 20, borderRadius: '4px' }} />}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Account data */}
      <Box sx={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: '8px', overflow: 'hidden' }}>
        <Box sx={{ p: '20px' }}>
          <Typography sx={{ fontFamily: T.fontDisp, fontSize: '0.5625rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.t3, mb: 2.5 }}>
            Datos de cuenta
          </Typography>
          <Box sx={{ display: 'grid', rowGap: 2 }}>
            <FieldBlock label="Usuario" value={username} />
            <Divider sx={{ borderColor: T.border }} />
            <Grid container spacing={2}>
              <Grid item xs={6}><FieldBlock label="Nombre" value={first_name} /></Grid>
              <Grid item xs={6}><FieldBlock label="Apellidos" value={last_name} /></Grid>
            </Grid>
            <Divider sx={{ borderColor: T.border }} />
            <FieldBlock label="Email" value={email} />
          </Box>
        </Box>
      </Box>

      {/* Employee data */}
      {empleado && (
        <Box sx={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: '8px', overflow: 'hidden' }}>
          <Box sx={{ p: '20px' }}>
            <Typography sx={{ fontFamily: T.fontDisp, fontSize: '0.5625rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.t3, mb: 2.5 }}>
              Datos de empleado
            </Typography>
            <Box sx={{ display: 'grid', rowGap: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}><FieldBlock label="Departamento" value={depNombre} /></Grid>
                <Grid item xs={6}><FieldBlock label="Delegación" value={delegacion} /></Grid>
              </Grid>
              <Divider sx={{ borderColor: T.border }} />
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={6}>
                  <Typography sx={{ fontFamily: T.fontDisp, fontSize: '0.5625rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.t3, mb: 0.75, display: 'block' }}>Rol</Typography>
                  {rol ? <Chip label={rol} size="small" sx={{ background: T.accentDim, color: T.accent, border: `1px solid ${T.accentBdr}`, fontFamily: T.fontDisp, fontSize: '0.5625rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', height: 20, borderRadius: '4px' }} /> : <Typography sx={{ fontFamily: T.fontUI, color: T.t3, fontStyle: 'italic', fontSize: '0.875rem' }}>—</Typography>}
                </Grid>
                <Grid item xs={6}><FieldBlock label="Tipo de rol" value={tipoRol} /></Grid>
              </Grid>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}
