import React from 'react';
import { ShieldCheck, FileText } from 'lucide-react';

export default function Header() {
  return (
    <header className="header-bar">
      <div className="logo-badge">
        <div className="logo-icon">
          <ShieldCheck size={26} color="#fff" />
        </div>
        <div>
          <h1 className="brand-title">Xenoverify</h1>
          <div className="brand-subtitle">Post-Quantum Digital Identity & Selective Disclosure Prototype</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <a 
          href="https://xenoverify.vercel.app/swagger/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="btn btn-secondary"
          style={{ padding: '6px 14px', fontSize: '12px', textDecoration: 'none' }}
        >
          <FileText size={14} /> Swagger API Docs
        </a>
        <span className="badge badge-cyan">NIST FIPS 204 (ML-DSA-65)</span>
        <span className="badge badge-purple">DSRM Evaluation Engine</span>
      </div>
    </header>
  );
}
