import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createParte, getParte, updateParte, deleteParte } from '../api/partes';
import './ParteForm.css';

const ROLES_EMISOR = ['IT Manager', 'Deputy IT Manager', 'IT Technician', 'AV Manager', 'Otro'];
const TIPOS_ENTREGA = ['Entrega definitiva', 'Préstamo temporal', 'Sustitución', 'Reposición', 'Otro'];
const ESTADOS_EQUIPO = ['Nuevo', 'Bueno', 'Aceptable', 'Con incidencias'];
const DEPARTAMENTOS = [
  'IT', 'Recepción', 'F&B', 'Housekeeping', 'Mantenimiento',
  'Dirección', 'RRHH', 'Spa', 'Pool', 'Seguridad', 'Cocina', 'Administración', 'Otro'
];

const emptyEquipo = () => ({
  tipo: '', marca: '', modelo: '', serial: '', asset: '',
  cantidad: 1, estado: 'Bueno', accesorios: '', observaciones: ''
});



export default function ParteForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const now = new Date();
  const todayISO = now.toISOString().slice(0, 10);
  const timeNow = now.toTimeString().slice(0, 5);
  const [numParte, setNumParte] = useState('Autogenerado');

  const [emisor, setEmisor] = useState({ nombre: '', rol: '', departamento: 'IT' });
  const [receptor, setReceptor] = useState({ nombre: '', rol: '', departamento: '', ubicacion: '' });
  const [fecha, setFecha] = useState(todayISO);
  const [hora, setHora] = useState(timeNow);
  const [tipoEntrega, setTipoEntrega] = useState('');
  const [equipos, setEquipos] = useState([emptyEquipo()]);
  const [observaciones, setObservaciones] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedId, setSavedId] = useState(id || null);
  const [errors, setErrors] = useState({});

  React.useEffect(() => {
    if (id) {
      const fetchParte = async () => {
        try {
          const res = await getParte(id);
          const data = res.data || res;
          if (data.numero_parte) setNumParte(data.numero_parte);
          
          setEmisor({
            nombre: data.emisor_nombre || data.solicitante || '',
            rol: data.emisor_rol || '',
            departamento: 'IT'
          });
          setReceptor({
            nombre: data.receptor_nombre || '',
            rol: data.receptor_rol || '',
            departamento: data.receptor_departamento || '',
            ubicacion: data.receptor_ubicacion || ''
          });
          setTipoEntrega(data.tipo_entrega || '');
          setObservaciones(data.observaciones_generales || '');
          
          if (data.equipos_json) {
            try {
              const eq = JSON.parse(data.equipos_json);
              setEquipos(Array.isArray(eq) && eq.length > 0 ? eq : [emptyEquipo()]);
            } catch(e){}
          }
          
          if (data.fecha_apertura) {
            const d = new Date(data.fecha_apertura);
            setFecha(d.toISOString().slice(0, 10));
            setHora(d.toTimeString().slice(0, 5));
          }
        } catch (err) {
          console.error("Error loading parte", err);
        }
      };
      fetchParte();
    } else {
      // Intentar sacar el nombre del usuario logueado de localStorage
      const savedProfile = localStorage.getItem('user_profile');
      if (savedProfile) {
        try {
          const u = JSON.parse(savedProfile);
          const name = u.empleado?.nombre || u.user?.first_name || u.user?.username || '';
          const role = u.empleado?.cargo || '';
          setEmisor(prev => ({ ...prev, nombre: name, rol: role }));
        } catch (e) {}
      }
    }
  }, [id]);

  const updateEquipo = (i, field, value) =>
    setEquipos(prev => prev.map((eq, idx) => idx === i ? { ...eq, [field]: value } : eq));
  const addEquipo = () => setEquipos(prev => [...prev, emptyEquipo()]);
  const removeEquipo = (i) => setEquipos(prev => prev.filter((_, idx) => idx !== i));

  const validate = () => {
    const e = {};
    if (!emisor.nombre.trim()) e['emisor.nombre'] = true;
    if (!emisor.rol.trim()) e['emisor.rol'] = true;
    if (!receptor.nombre.trim()) e['receptor.nombre'] = true;
    if (!receptor.departamento.trim()) e['receptor.departamento'] = true;
    if (!tipoEntrega) e['tipoEntrega'] = true;
    equipos.forEach((eq, i) => { if (!eq.tipo.trim()) e[`eq.tipo.${i}`] = true; });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const buildPayload = (estado = 'borrador') => ({
    numero_parte: numParte === 'Autogenerado' ? '' : numParte,
    titulo: `Entrega a ${receptor.nombre || '?'} – ${tipoEntrega || 'Parte'}`,
    estado,
    prioridad: 'media',
    tipo_entrega: tipoEntrega,
    emisor_nombre: emisor.nombre,
    emisor_rol: emisor.rol,
    solicitante: emisor.nombre,
    receptor_nombre: receptor.nombre,
    receptor_rol: receptor.rol,
    receptor_departamento: receptor.departamento,
    receptor_ubicacion: receptor.ubicacion,
    equipos_json: JSON.stringify(equipos),
    observaciones_generales: observaciones,
    descripcion: observaciones,
  });

  const handleSave = async (estado = 'borrador') => {
    if (!validate()) return false;
    setSaving(true);
    try {
      const payload = buildPayload(estado);
      let res;
      if (savedId) {
        res = await updateParte(savedId, payload);
      } else {
        res = await createParte(payload);
      }
      
      const data = res?.data || res;
      const returnedId = data?.id;
      const returnedNum = data?.numero_parte;
      
      if (returnedNum) setNumParte(returnedNum);
      if (returnedId) setSavedId(returnedId);
      
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
      return true;
    } catch (err) {
      console.error('Error guardando parte:', err);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = async () => {
    if (!saved) await handleSave('pendiente');
    window.print();
  };

  const handleClear = () => {
    if (!window.confirm('¿Limpiar el formulario?')) return;
    setEmisor({ nombre: '', rol: '', departamento: 'IT' });
    // recargar usuario
    const savedProfile = localStorage.getItem('user_profile');
    if (savedProfile) {
      try {
        const u = JSON.parse(savedProfile);
        const name = u.empleado?.nombre || u.user?.first_name || u.user?.username || '';
        const role = u.empleado?.cargo || '';
        setEmisor(prev => ({ ...prev, nombre: name, rol: role }));
      } catch (e) {}
    }
    
    setReceptor({ nombre: '', rol: '', departamento: '', ubicacion: '' });
    setTipoEntrega('');
    setEquipos([emptyEquipo()]);
    setObservaciones('');
    setErrors({});
    setSaved(false);
    setSavedId(null);
    setNumParte('Autogenerado');
  };

  const handleDelete = async () => {
    if (!savedId) return;
    if (!window.confirm("¿Seguro que deseas eliminar definitivamente este parte?")) return;
    try {
      await deleteParte(savedId);
      navigate('/partes');
    } catch (err) {
      console.error("Error eliminando parte:", err);
    }
  };

  const hasErr = (key) => errors[key] ? 'field-error' : '';

  return (
    <div className="pf-wrapper">
      {/* TOP BAR */}
      <div className="pf-topbar no-print">
        <button className="pf-btn-back" onClick={() => navigate('/partes')}>← Volver</button>
        <div className="pf-topbar-actions">
          {saved && (
            <span className="pf-saved-badge">
              ✓ Guardado &nbsp;
              <span className="pf-saved-link" onClick={() => navigate('/partes')}>Ver en lista →</span>
            </span>
          )}
          {savedId && (
            <button className="pf-btn no-print" onClick={handleDelete} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              Eliminar
            </button>
          )}
          <button className="pf-btn pf-btn-clear" onClick={handleClear}>Limpiar</button>
          <button className="pf-btn pf-btn-save" onClick={() => handleSave('borrador')} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar borrador'}
          </button>
          <button className="pf-btn pf-btn-print" onClick={handlePrint}>
            🖨 Imprimir / PDF
          </button>
        </div>
      </div>

      {/* DOCUMENT */}
      <div className="pf-doc">

        {/* HEADER */}
        <header className="pf-header">
          <div className="pf-logo-box">
            <span className="pf-logo-text">OKU</span>
            <span className="pf-logo-sub">IBIZA</span>
          </div>
          <div className="pf-header-center">
            <h1 className="pf-title">Parte de Entrega de Equipos</h1>
            <p className="pf-subtitle">Departamento de IT · OKU Ibiza</p>
          </div>
          <div className="pf-header-meta">
            <div className="pf-meta-row">
              <span className="pf-meta-label">Nº Parte</span>
              <span className="pf-num">{numParte}</span>
            </div>
            <div className="pf-meta-row">
              <span className="pf-meta-label">Fecha</span>
              <input type="date" className="pf-input-inline" value={fecha} onChange={e => setFecha(e.target.value)} />
            </div>
            <div className="pf-meta-row">
              <span className="pf-meta-label">Hora</span>
              <input type="time" className="pf-input-inline" value={hora} onChange={e => setHora(e.target.value)} />
            </div>
          </div>
        </header>

        <div className="pf-divider-gold" />

        {/* EMISOR + RECEPTOR */}
        <div className="pf-two-col">
          <section className="pf-section">
            <h2 className="pf-section-title"><span className="pf-num-badge">01</span> Emisor</h2>
            <div className="pf-inline-fields">
              <div className="pf-field">
                <label className="pf-label">Nombre <span className="req">*</span></label>
                <input className={`pf-input ${hasErr('emisor.nombre')}`} value={emisor.nombre}
                  onChange={e => setEmisor({ ...emisor, nombre: e.target.value })} placeholder="Nombre completo" />
              </div>
              <div className="pf-field">
                <label className="pf-label">Cargo <span className="req">*</span></label>
                <select className={`pf-select ${hasErr('emisor.rol')}`} value={emisor.rol}
                  onChange={e => setEmisor({ ...emisor, rol: e.target.value })}>
                  <option value="">Seleccionar...</option>
                  {ROLES_EMISOR.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div className="pf-field">
                <label className="pf-label">Departamento</label>
                <input className="pf-input pf-readonly" value="IT" readOnly />
              </div>
            </div>
          </section>

          <section className="pf-section pf-section-border">
            <h2 className="pf-section-title"><span className="pf-num-badge">02</span> Receptor</h2>
            <div className="pf-inline-fields">
              <div className="pf-field">
                <label className="pf-label">Nombre <span className="req">*</span></label>
                <input className={`pf-input ${hasErr('receptor.nombre')}`} value={receptor.nombre}
                  onChange={e => setReceptor({ ...receptor, nombre: e.target.value })} placeholder="Nombre completo" />
              </div>
              <div className="pf-field">
                <label className="pf-label">Cargo</label>
                <input className="pf-input" value={receptor.rol}
                  onChange={e => setReceptor({ ...receptor, rol: e.target.value })} placeholder="Cargo o puesto" />
              </div>
              <div className="pf-field">
                <label className="pf-label">Departamento <span className="req">*</span></label>
                <select className={`pf-select ${hasErr('receptor.departamento')}`} value={receptor.departamento}
                  onChange={e => setReceptor({ ...receptor, departamento: e.target.value })}>
                  <option value="">Seleccionar...</option>
                  {DEPARTAMENTOS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="pf-field pf-field-wide">
                <label className="pf-label">Ubicación / Área</label>
                <input className="pf-input" value={receptor.ubicacion}
                  onChange={e => setReceptor({ ...receptor, ubicacion: e.target.value })} placeholder="Ej.: Recepción, Habitación 301..." />
              </div>
            </div>
          </section>
        </div>

        {/* TIPO ENTREGA */}
        <section className="pf-section pf-section-tipo">
          <h2 className="pf-section-title"><span className="pf-num-badge">03</span> Tipo de Entrega</h2>
          <div className="pf-tipo-row">
            {TIPOS_ENTREGA.map(t => (
              <label key={t} className={`pf-tipo-chip ${tipoEntrega === t ? 'selected' : ''} ${errors['tipoEntrega'] && !tipoEntrega ? 'err' : ''}`}>
                <input type="radio" name="tipoEntrega" value={t} checked={tipoEntrega === t} onChange={() => setTipoEntrega(t)} />
                {t}
              </label>
            ))}
          </div>
        </section>

        {/* EQUIPOS */}
        <section className="pf-section">
          <h2 className="pf-section-title"><span className="pf-num-badge">04</span> Detalle de la Entrega</h2>

          <table className="pf-eq-table">
            <thead>
              <tr>
                <th>Tipo / Descripción</th>
                <th>Marca</th>
                <th>Modelo</th>
                <th>Nº Serie</th>
                <th>Asset Tag</th>
                <th>Ud.</th>
                <th>Estado</th>
                <th className="no-print">·</th>
              </tr>
            </thead>
            <tbody>
              {equipos.map((eq, i) => (
                <tr key={i}>
                  <td><input className={`pf-td-input ${hasErr(`eq.tipo.${i}`)}`} value={eq.tipo} onChange={e => updateEquipo(i, 'tipo', e.target.value)} placeholder="Portátil, Tablet..." /></td>
                  <td><input className="pf-td-input" value={eq.marca} onChange={e => updateEquipo(i, 'marca', e.target.value)} placeholder="Apple, HP..." /></td>
                  <td><input className="pf-td-input" value={eq.modelo} onChange={e => updateEquipo(i, 'modelo', e.target.value)} /></td>
                  <td><input className="pf-td-input pf-mono" value={eq.serial} onChange={e => updateEquipo(i, 'serial', e.target.value)} placeholder="S/N..." /></td>
                  <td><input className="pf-td-input pf-mono" value={eq.asset} onChange={e => updateEquipo(i, 'asset', e.target.value)} placeholder="OKU-IT-..." /></td>
                  <td><input type="number" min="1" className="pf-td-input pf-td-num" value={eq.cantidad} onChange={e => updateEquipo(i, 'cantidad', e.target.value)} /></td>
                  <td>
                    <select className="pf-td-select" value={eq.estado} onChange={e => updateEquipo(i, 'estado', e.target.value)}>
                      {ESTADOS_EQUIPO.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="no-print">
                    {equipos.length > 1 && <button className="pf-btn-rm" onClick={() => removeEquipo(i)}>×</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Accesorios por equipo - solo si hay algo */}
          {equipos.some(e => e.accesorios || e.observaciones) && (
            <div className="pf-eq-notes">
              {equipos.map((eq, i) => (eq.accesorios || eq.observaciones) ? (
                <p key={i} className="pf-eq-note">
                  <strong>Equipo #{i+1}:</strong>
                  {eq.accesorios && <span> Accesorios: {eq.accesorios}.</span>}
                  {eq.observaciones && <span> Obs: {eq.observaciones}.</span>}
                </p>
              ) : null)}
            </div>
          )}

          {/* Fila añadir accesorios inline - screen only */}
          <div className="pf-eq-extra no-print">
            {equipos.map((eq, i) => (
              <div key={i} className="pf-eq-acc-row">
                <span className="pf-eq-acc-label">#{i+1} Accesorios:</span>
                <input className="pf-td-input" value={eq.accesorios} onChange={e => updateEquipo(i, 'accesorios', e.target.value)} placeholder="Cargador, funda, cable HDMI..." />
                <span className="pf-eq-acc-label">Obs.:</span>
                <input className="pf-td-input" value={eq.observaciones} onChange={e => updateEquipo(i, 'observaciones', e.target.value)} placeholder="Notas del equipo..." />
              </div>
            ))}
          </div>

          <button className="pf-btn-add no-print" onClick={addEquipo}>+ Añadir equipo</button>
        </section>

        {/* OBSERVACIONES */}
        <section className="pf-section pf-section-obs">
          <h2 className="pf-section-title"><span className="pf-num-badge">05</span> Observaciones</h2>
          <textarea className="pf-textarea" value={observaciones}
            onChange={e => setObservaciones(e.target.value)} rows={3}
            placeholder="Configuración realizada, fecha de devolución prevista, incidencias previas..." />
        </section>

        {/* CONDITIONS */}
        <section className="pf-conditions">
          <p className="pf-conditions-text">
            <strong>Condiciones:</strong> La persona receptora confirma haber recibido el material en las condiciones indicadas y se responsabiliza de su custodia y uso adecuado. Cualquier incidencia, pérdida o devolución deberá comunicarse al Departamento de IT de OKU Ibiza. Este documento tiene carácter de constancia interna de entrega.
          </p>
        </section>

        {/* FIRMAS */}
        <section className="pf-signatures">
          <div className="pf-sig-block">
            <div className="pf-sig-area" />
            <div className="pf-sig-info">
              <span><strong>Nombre:</strong> {emisor.nombre || '____________________________'}</span>
              <span><strong>Cargo:</strong> {emisor.rol || '____________________________'}</span>
              <span><strong>Fecha:</strong> ____ / ____ / ________</span>
            </div>
            <p className="pf-sig-role">EMISOR · Departamento IT</p>
          </div>

          <div className="pf-sig-divider" />

          <div className="pf-sig-block">
            <div className="pf-sig-area" />
            <div className="pf-sig-info">
              <span><strong>Nombre:</strong> {receptor.nombre || '____________________________'}</span>
              <span><strong>Cargo:</strong> {receptor.rol || '____________________________'}</span>
              <span><strong>Fecha:</strong> ____ / ____ / ________</span>
            </div>
            <p className="pf-sig-role">RECEPTOR · {receptor.departamento || 'Departamento'}</p>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="pf-footer">
          <div className="pf-footer-line" />
          <p className="pf-footer-text">
            Documento interno de control de entrega de material · Departamento de IT · OKU Ibiza · {numParte}
          </p>
        </footer>

      </div>
    </div>
  );
}
