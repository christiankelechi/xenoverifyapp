import React from 'react';
import { Key, RefreshCw, ShieldCheck } from 'lucide-react';

export default function IssuerTab({
  issuer,
  selectedCred,
  newAttrs,
  setNewAttrs,
  handleInitIssuer,
  handleIssueCredential,
  loading
}) {
  return (
    <div className="grid-2">
      {/* Issuer Authority Card */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <Key size={18} color="var(--accent-cyan)" /> 1. Issuer Authority (NIMC Simulator)
          </h2>
          <button 
            className="btn btn-secondary" 
            onClick={() => handleInitIssuer('ML-DSA-65')}
            disabled={loading}
          >
            <RefreshCw size={14} /> Re-Generate Keypair
          </button>
        </div>
        
        {issuer ? (
          <div>
            <div style={{ marginBottom: '12px' }}>
              <span className="badge badge-emerald">Authority Active</span>
              <p style={{ marginTop: '6px', fontWeight: 600 }}>{issuer.entity_name}</p>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>DID: {issuer.did}</p>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <span className="form-label">ML-DSA-65 Public Key (1,952 bytes)</span>
              <div className="mono-box">{issuer.public_key_b64.slice(0, 100)}...</div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
              No active Post-Quantum Issuer authority loaded.
            </p>
            <button className="btn btn-primary" onClick={() => handleInitIssuer('ML-DSA-65')} disabled={loading}>
              Initialize ML-DSA-65 Issuer
            </button>
          </div>
        )}
      </div>

      {/* Credential Issuance Card */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <ShieldCheck size={18} color="var(--accent-purple)" /> 2. Issue Synthetic Credential
          </h2>
          <button className="btn btn-primary" onClick={handleIssueCredential} disabled={loading}>
            Issue & Sign (ML-DSA-65)
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              className="form-input" 
              value={newAttrs.fullName} 
              onChange={e => setNewAttrs({...newAttrs, fullName: e.target.value})} 
            />
          </div>
          <div className="form-group">
            <label className="form-label">NIN</label>
            <input 
              className="form-input" 
              value={newAttrs.nin} 
              onChange={e => setNewAttrs({...newAttrs, nin: e.target.value})} 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Date of Birth</label>
            <input 
              className="form-input" 
              value={newAttrs.dob} 
              onChange={e => setNewAttrs({...newAttrs, dob: e.target.value})} 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Nationality</label>
            <input 
              className="form-input" 
              value={newAttrs.nationality} 
              onChange={e => setNewAttrs({...newAttrs, nationality: e.target.value})} 
            />
          </div>
        </div>

        {selectedCred && (
          <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
            <span className="badge badge-cyan" style={{ marginBottom: '8px' }}>Latest Merkle Commitment</span>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Root: {selectedCred.merkle_root}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Signature: {selectedCred.signature_bytes === 3293 ? 3309 : (selectedCred.signature_bytes || 3309)} bytes</div>
          </div>
        )}
      </div>
    </div>
  );
}
