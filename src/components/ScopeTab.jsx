import React from 'react';
import { FileText, Lock, AlertTriangle } from 'lucide-react';

export default function ScopeTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <FileText size={20} color="var(--accent-cyan)" /> DSRM Table 3.1: Scope & Evaluation Treatment
          </h2>
          <span className="badge badge-emerald">MRe Research Framework</span>
        </div>
        <p style={{ color: 'var(--text-muted)', marginBottom: '18px', fontSize: '14px' }}>
          Architectural boundary specification distinguishing implemented cryptographic modules from simulated environmental services.
        </p>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)' }}>
                <th style={{ padding: '12px' }}>Component</th>
                <th style={{ padding: '12px' }}>Scope</th>
                <th style={{ padding: '12px' }}>Evaluation Treatment</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ padding: '12px', fontWeight: 600 }}>Post-quantum signing</td>
                <td style={{ padding: '12px' }}><span className="badge badge-emerald">Implemented</span></td>
                <td style={{ padding: '12px', color: 'var(--text-muted)' }}>Functional, security and performance testing (ML-DSA-65)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ padding: '12px', fontWeight: 600 }}>Selective disclosure/proof</td>
                <td style={{ padding: '12px' }}><span className="badge badge-emerald">Implemented</span></td>
                <td style={{ padding: '12px', color: 'var(--text-muted)' }}>Salted Merkle Tree inclusion proofs, zero attribute leakage</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ padding: '12px', fontWeight: 600 }}>Core identity verification</td>
                <td style={{ padding: '12px' }}><span className="badge badge-emerald">Implemented</span></td>
                <td style={{ padding: '12px', color: 'var(--text-muted)' }}>End-to-end cryptographic verifier testing & tamper rejection</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ padding: '12px', fontWeight: 600 }}>Identity Wallet</td>
                <td style={{ padding: '12px' }}><span className="badge badge-amber">Simulated</span></td>
                <td style={{ padding: '12px', color: 'var(--text-muted)' }}>Holder credential storage & claim selection representation</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ padding: '12px', fontWeight: 600 }}>Ledger / Blockchain DID</td>
                <td style={{ padding: '12px' }}><span className="badge badge-amber">Simulated</span></td>
                <td style={{ padding: '12px', color: 'var(--text-muted)' }}>Decentralized Identifier registry & public key anchoring</td>
              </tr>
              <tr>
                <td style={{ padding: '12px', fontWeight: 600 }}>Revocation Status Registry</td>
                <td style={{ padding: '12px' }}><span className="badge badge-amber">Simulated</span></td>
                <td style={{ padding: '12px', color: 'var(--text-muted)' }}>Cryptographic status accumulator & rejection testing</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '12px' }}>
            <Lock size={18} color="var(--accent-cyan)" /> Cryptographic Specifications
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <div><strong>Standard:</strong> NIST FIPS 204 (August 2024 Final)</div>
            <div><strong>Primary Scheme:</strong> ML-DSA-65 (Module-Lattice Digital Signatures)</div>
            <div><strong>Security Level:</strong> Category 3 (Lattice hard problems / Module-LWE)</div>
            <div><strong>Public Key Size:</strong> 1,952 bytes</div>
            <div><strong>Signature Size:</strong> 3,309 bytes</div>
            <div><strong>Leaf Commitment:</strong> SHA-256 with 128-bit CSPRNG salt</div>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '12px' }}>
            <AlertTriangle size={18} color="var(--accent-rose)" /> Classical Baseline Comparison
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <div><strong>Baseline Scheme:</strong> ECDSA over secp256k1 (SHA-256)</div>
            <div><strong>Public Key Size:</strong> 88 bytes</div>
            <div><strong>Signature Size:</strong> 71 bytes</div>
            <div><strong>Quantum Vulnerability:</strong> Breakable by polynomial-time Shor's algorithm</div>
            <div><strong>Role in Research:</strong> Provides Chapter 4 empirical baseline to justify PQC overhead</div>
          </div>
        </div>
      </div>
    </div>
  );
}
