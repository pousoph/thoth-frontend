import React, { useState } from 'react';
import { createContestScraping, createContestManual } from '../services/adminService';
import '@/styles/auth.css'; // Relies on shared form inputs styles

// ── Icons ─────────────────────────────────────────────────────────────────────
const IconLink = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>;
const IconEdit = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
const IconDelete = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>;

const AdminContestsPage = () => {
  const [activeTab, setActiveTab] = useState('scraping'); // 'scraping' | 'manual'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [problematicTeams, setProblematicTeams] = useState([]);

  // Common fields
  const [contestName, setContestName] = useState('');
  const [contestType, setContestType] = useState('virtual'); // virtual | presencial | interna | icpc
  
  // Scraping fields
  const [contestUrl, setContestUrl] = useState('');

  // Manual fields
  const [manualResults, setManualResults] = useState([{ 'team-name': '', 'problems-solved': '' }]);

  const handleAddTeam = () => {
    setManualResults([...manualResults, { 'team-name': '', 'problems-solved': '' }]);
  };

  const handleRemoveTeam = (index) => {
    setManualResults(manualResults.filter((_, i) => i !== index));
  };

  const handleManualChange = (index, field, value) => {
    const updated = [...manualResults];
    updated[index][field] = field === 'problems-solved' ? Number(value) : value;
    setManualResults(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');
    setProblematicTeams([]);

    let res;
    if (activeTab === 'scraping') {
      res = await createContestScraping({
        name: contestName,
        type: contestType,
        url: contestUrl,
      });
    } else {
      res = await createContestManual({
        name: contestName,
        type: contestType,
        results: manualResults.filter((r) => r['team-name'].trim() !== ''),
      });
    }

    if (res.success) {
      setSuccessMsg(res.data?.message || 'Competencia registrada correctamente.');
      if (res.data?.['problematic-teams']?.length > 0) {
        setProblematicTeams(res.data['problematic-teams']);
      }
      // Reset form
      setContestName('');
      setContestUrl('');
      setManualResults([{ 'team-name': '', 'problems-solved': '' }]);
    } else {
      setError(res.message);
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="cl-page-header">
        <h1 className="cl-page-title">Gestionar Competencias</h1>
        <p className="cl-page-subtitle">Registrar resultados para el cálculo automático de liga</p>
      </div>

      <div className="cl-activity-card" style={{ maxWidth: 800 }}>
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: 24 }}>
          <button
            onClick={() => { setActiveTab('scraping'); setError(''); setSuccessMsg(''); }}
            style={{
              flex: 1, padding: '16px', background: 'transparent',
              border: 'none', borderBottom: activeTab === 'scraping' ? '2px solid var(--color-primary)' : '2px solid transparent',
              color: activeTab === 'scraping' ? 'var(--color-primary)' : 'var(--color-text-muted)',
              fontWeight: activeTab === 'scraping' ? 600 : 400, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
            }}
          >
            <IconLink /> Importar con BOCA
          </button>
          <button
            onClick={() => { setActiveTab('manual'); setError(''); setSuccessMsg(''); }}
            style={{
              flex: 1, padding: '16px', background: 'transparent',
              border: 'none', borderBottom: activeTab === 'manual' ? '2px solid var(--color-primary)' : '2px solid transparent',
              color: activeTab === 'manual' ? 'var(--color-primary)' : 'var(--color-text-muted)',
              fontWeight: activeTab === 'manual' ? 600 : 400, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
            }}
          >
            <IconEdit /> Ingreso Manual
          </button>
        </div>

        {/* Global Feedback */}
        {error && (
          <div style={{ padding: '12px 16px', marginBottom: 20, background: 'var(--color-error-dim)', border: '1px solid rgba(224,92,106,0.2)', borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--color-error)' }}>
            {error}
          </div>
        )}
        {successMsg && (
          <div style={{ padding: '12px 16px', marginBottom: 20, background: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.2)', borderRadius: 'var(--radius-md)', fontSize: 13, color: '#34d399' }}>
            {successMsg}
            {problematicTeams.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <strong>Equipos no encontrados en el sistema:</strong>
                <ul style={{ margin: '4px 0 0 16px', color: 'var(--color-warning)' }}>
                  {problematicTeams.map((team, idx) => (
                    <li key={idx}>{team}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Common Fields */}
          <div style={{ display: 'flex', gap: '16px' }}>
            <div className="input-wrapper" style={{ flex: 2, marginBottom: 0 }}>
              <label htmlFor="contestName" className="input-label">Nombre de Competencia</label>
              <input
                id="contestName" type="text" className="input-field" required
                placeholder="Ej. RPC 01 2025"
                value={contestName} onChange={(e) => setContestName(e.target.value)}
              />
            </div>
            <div className="input-wrapper" style={{ flex: 1, marginBottom: 0 }}>
              <label htmlFor="contestType" className="input-label">Tipo</label>
              <select
                id="contestType" className="input-field input-select" required
                value={contestType} onChange={(e) => setContestType(e.target.value)}
                style={{ appearance: 'auto', background: 'var(--color-surface-2)' }}
              >
                <option value="virtual">Virtual</option>
                <option value="presencial">Presencial</option>
                <option value="interna">Interna</option>
                <option value="icpc">ICPC</option>
              </select>
            </div>
          </div>

          {/* Scraping specific */}
          {activeTab === 'scraping' && (
            <div className="input-wrapper" style={{ marginBottom: 0 }}>
              <label htmlFor="contestUrl" className="input-label">URL del Scoreboard (BOCA)</label>
              <input
                id="contestUrl" type="url" className="input-field" required
                placeholder="https://.../index.php"
                value={contestUrl} onChange={(e) => setContestUrl(e.target.value)}
              />
              <span style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4, display: 'block' }}>
                Solo soportamos enlaces directos de la Red de Programación Competitiva o BOCA oficiales.
              </span>
            </div>
          )}

          {/* Manual specific */}
          {activeTab === 'manual' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <label className="input-label" style={{ marginBottom: 0 }}>Resultados por Equipo</label>
                <button type="button" onClick={handleAddTeam} style={{
                  background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)',
                  padding: '4px 12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: 12
                }}>
                  + Agregar equipo
                </button>
              </div>

              {manualResults.map((result, index) => (
                <div key={index} style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'flex-start' }}>
                  <input
                    type="text" className="input-field" placeholder="Nombre completo del equipo de la plataforma" required
                    value={result['team-name']}
                    onChange={(e) => handleManualChange(index, 'team-name', e.target.value)}
                  />
                  <input
                    type="number" className="input-field" placeholder="Problemas resueltos (ej. 5)" required min="0" max="20"
                    style={{ width: '120px' }}
                    value={result['problems-solved']}
                    onChange={(e) => handleManualChange(index, 'problems-solved', e.target.value)}
                  />
                  {manualResults.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTeam(index)}
                      style={{
                        height: 44, width: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'transparent', border: 'none', color: 'var(--color-error)', cursor: 'pointer'
                      }}
                    >
                      <IconDelete />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 20, marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: 'auto', padding: '0 32px' }}
              disabled={loading}
            >
              {loading ? 'Procesando...' : 'Guardar Resultados'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminContestsPage;
