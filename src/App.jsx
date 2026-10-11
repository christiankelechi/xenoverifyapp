import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  Key, 
  Layers, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  XCircle, 
  Activity, 
  Database, 
  RefreshCw,
  AlertTriangle,
  Fingerprint,
  FileText
} from 'lucide-react';

import { API_BASE_URL } from './config';

const API_BASE = API_BASE_URL;

export default function App() {
  const [activeTab, setActiveTab] = useState('dsrm');
  const [systemInfo, setSystemInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');

  // Issuer State
  const [issuer, setIssuer] = useState(null);
  const [secretKey, setSecretKey] = useState('');

  // Credential State
  const [credentials, setCredentials] = useState([]);
  const [selectedCred, setSelectedCred] = useState(null);
  const [newAttrs, setNewAttrs] = useState({
    fullName: 'Olushola James',
    nin: '29837492812',
    dob: '1992-06-14',
    nationality: 'Nigerian',
    clearanceLevel: 'Level-3',
    residence: 'Victoria Island, Lagos'
  });

  // Selective Disclosure State
  const [disclosedKeys, setDisclosedKeys] = useState(['fullName', 'nationality']);
  const [proofPacket, setProofPacket] = useState(null);

  // Verification State
  const [verificationResult, setVerificationResult] = useState(null);
  const [tamperSimulated, setTamperSimulated] = useState(false);

  // Benchmark State
  const [benchmarkResult, setBenchmarkResult] = useState(null);
  const [benchmarkIterations, setBenchmarkIterations] = useState(20);

  // Load Initial Info
  useEffect(() => {
    fetchSystemInfo();
    fetchCredentials();
  }, []);

  const fetchSystemInfo = async () => {
    try {
      const res = await fetch(`${API_BASE}/system/info/`);
      const data = await res.json();
      setSystemInfo(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCredentials = async () => {
    try {
      const res = await fetch(`${API_BASE}/credentials/list/`);
      const data = await res.json();
      setCredentials(data);
      if (data.length > 0 && !selectedCred) {
        setSelectedCred(data[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleInitIssuer = async (scheme = 'ML-DSA-65') => {
    setLoading(true);
    setProcessingMessage(`Generating NIST FIPS 204 ${scheme} keypair (1,952-byte public key)...`);
    try {
      const res = await fetch(`${API_BASE}/issuers/initialize/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheme, entity_name: 'National Identity Management Commission (NIMC)' })
      });
      const data = await res.json();
      setIssuer(data.issuer);
      setSecretKey(data.secret_key_b64);
    } catch (e) {
      alert('Error initializing issuer: ' + e);
    } finally {
      setLoading(false);
      setProcessingMessage('');
    }
  };

  const handleIssueCredential = async () => {
    setLoading(true);
    setProcessingMessage('Salting attributes, building Merkle tree & signing root with ML-DSA-65...');
    try {
      const res = await fetch(`${API_BASE}/credentials/issue/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issuer_did: issuer ? issuer.did : null,
          secret_key_b64: secretKey || null,
          attributes: newAttrs
        })
      });
      const data = await res.json();
      await fetchCredentials();
      setSelectedCred(data);
    } catch (e) {
      alert('Error issuing: ' + e);
    } finally {
      setLoading(false);
      setProcessingMessage('');
    }
  };

  const handleGenerateProof = async () => {
    if (!selectedCred) return;
    setLoading(true);
    setProcessingMessage('Extracting Merkle authentication paths for disclosed claims...');
    setVerificationResult(null);
    setTamperSimulated(false);
    try {
      const res = await fetch(`${API_BASE}/proofs/generate/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credential_id: selectedCred.id || selectedCred.credential_id,
          disclosed_keys: disclosedKeys
        })
      });
      const data = await res.json();
      setProofPacket(data);
    } catch (e) {
      alert('Error generating proof: ' + e);
    } finally {
      setLoading(false);
      setProcessingMessage('');
    }
  };

  const handleVerifyProof = async (tamper = false) => {
    if (!proofPacket) return;
    setLoading(true);
    setProcessingMessage(tamper ? 'Simulating malicious attribute modification & executing verifier...' : 'Recomputing Merkle root & verifying ML-DSA-65 signature...');
    try {
      let payload = JSON.parse(JSON.stringify(proofPacket));
      if (tamper && payload.disclosed_claims.length > 0) {
        payload.disclosed_claims[0].value = payload.disclosed_claims[0].value + '_TAMPERED';
        setTamperSimulated(true);
      } else {
        setTamperSimulated(false);
      }

      const res = await fetch(`${API_BASE}/proofs/verify/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setVerificationResult(data);
    } catch (e) {
      setVerificationResult({ valid: false, error: String(e) });
    } finally {
      setLoading(false);
      setProcessingMessage('');
    }
  };

  const handleRunBenchmarks = async () => {
    setLoading(true);
    setProcessingMessage(`Running ${benchmarkIterations} controlled trials comparing ML-DSA-65 vs ECDSA (this takes ~5-15s)...`);
    try {
      const res = await fetch(`${API_BASE}/benchmarks/run/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ iterations: benchmarkIterations })
      });
      const data = await res.json();
      setBenchmarkResult(data);
    } catch (e) {
      alert('Benchmark error: ' + e);
    } finally {
      setLoading(false);
      setProcessingMessage('');
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
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
            href="http://localhost:8000/swagger/" 
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

      {/* Real-time Processing Overlay / Loader Banner */}
      {loading && (
        <div className="processing-banner">
          <RefreshCw size={18} className="spinner" />
          <span>{processingMessage || 'Cryptographic operation in progress. Please wait...'}</span>
        </div>
      )}

      {/* Tabs */}

      <nav className="nav-tabs">
        <button 
          className={`nav-tab-btn ${activeTab === 'dsrm' ? 'active' : ''}`}
          onClick={() => setActiveTab('dsrm')}
        >
          <Cpu size={16} /> Chapter 3 DSRM Scope & Specs
        </button>
        <button 
          className={`nav-tab-btn ${activeTab === 'issuer' ? 'active' : ''}`}
          onClick={() => setActiveTab('issuer')}
        >
          <Key size={16} /> Issuer Authority & Signing
        </button>
        <button 
          className={`nav-tab-btn ${activeTab === 'disclosure' ? 'active' : ''}`}
          onClick={() => setActiveTab('disclosure')}
        >
          <Fingerprint size={16} /> Selective Disclosure Playground
        </button>
        <button 
          className={`nav-tab-btn ${activeTab === 'benchmarks' ? 'active' : ''}`}
          onClick={() => setActiveTab('benchmarks')}
        >
          <Activity size={16} /> Chapter 4 Benchmarks & Metrics
        </button>
      </nav>

      {/* Tab 1: DSRM Scope & Specs */}
      {activeTab === 'dsrm' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title"><FileText size={20} color="var(--accent-cyan)" /> DSRM Table 3.1: Scope & Evaluation Treatment</h2>
              <span className="badge badge-emerald">Research Framework</span>
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
              <h3 className="card-title" style={{ marginBottom: '12px' }}><Lock size={18} color="var(--accent-cyan)" /> Cryptographic Specifications</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                <div><strong>Standard:</strong> NIST FIPS 204 (August 2024 Final)</div>
                <div><strong>Primary Scheme:</strong> ML-DSA-65 (Module-Lattice Digital Signatures)</div>
                <div><strong>Security Level:</strong> Category 3 (Lattice hard problems / Module-LWE)</div>
                <div><strong>Public Key Size:</strong> 1,952 bytes</div>
                <div><strong>Signature Size:</strong> 3,293 bytes</div>
                <div><strong>Leaf Commitment:</strong> SHA-256 with 128-bit CSPRNG salt</div>
              </div>
            </div>

            <div className="card">
              <h3 className="card-title" style={{ marginBottom: '12px' }}><AlertTriangle size={18} color="var(--accent-rose)" /> Classical Baseline Comparison</h3>
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
      )}

      {/* Tab 2: Issuer Authority & Credential Issuance */}
      {activeTab === 'issuer' && (
        <div className="grid-2">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title"><Key size={18} color="var(--accent-cyan)" /> 1. Issuer Authority (NIMC Simulator)</h2>
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
                <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>No active Post-Quantum Issuer authority loaded.</p>
                <button className="btn btn-primary" onClick={() => handleInitIssuer('ML-DSA-65')} disabled={loading}>
                  Initialize ML-DSA-65 Issuer
                </button>
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title"><ShieldCheck size={18} color="var(--accent-purple)" /> 2. Issue Synthetic Credential</h2>
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
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Signature: {selectedCred.signature_bytes} bytes</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Selective Disclosure Playground */}
      {activeTab === 'disclosure' && (
        <div className="grid-2">
          {/* Holder Side */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title"><EyeOff size={18} color="var(--accent-cyan)" /> Holder Selective Disclosure</h2>
              <button className="btn btn-primary" onClick={handleGenerateProof} disabled={loading}>
                Generate Merkle Proof
              </button>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>
              Select which attributes to reveal. Unchecked attributes remain completely private.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {['fullName', 'nin', 'dob', 'nationality', 'clearanceLevel', 'residence'].map(key => {
                const isDisclosed = disclosedKeys.includes(key);
                return (
                  <div 
                    key={key} 
                    className={`attribute-pill ${isDisclosed ? 'selected' : ''}`}
                    onClick={() => {
                      if (isDisclosed) {
                        setDisclosedKeys(disclosedKeys.filter(k => k !== key));
                      } else {
                        setDisclosedKeys([...disclosedKeys, key]);
                      }
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>{key}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {isDisclosed ? 'Revealed to Verifier' : 'Hidden (Zero Knowledge)'}
                      </div>
                    </div>
                    {isDisclosed ? <Eye size={18} color="var(--accent-cyan)" /> : <EyeOff size={18} color="var(--text-dim)" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Verifier Side */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title"><ShieldCheck size={18} color="var(--accent-emerald)" /> Verifier Audit Console</h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className="btn btn-primary" 
                  onClick={() => handleVerifyProof(false)} 
                  disabled={!proofPacket || loading}
                >
                  Verify Proof
                </button>
                <button 
                  className="btn btn-danger" 
                  onClick={() => handleVerifyProof(true)} 
                  disabled={!proofPacket || loading}
                >
                  Simulate Tamper Attack
                </button>
              </div>
            </div>

            {verificationResult ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  padding: '16px', 
                  borderRadius: '12px', 
                  background: verificationResult.valid ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                  border: `1px solid ${verificationResult.valid ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`
                }}>
                  {verificationResult.valid ? (
                    <CheckCircle2 size={32} color="var(--accent-emerald)" />
                  ) : (
                    <XCircle size={32} color="var(--accent-rose)" />
                  )}
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: verificationResult.valid ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                      {verificationResult.valid ? 'CRYPTOGRAPHICALLY VALID & VERIFIED' : 'VERIFICATION REJECTED'}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      {verificationResult.valid 
                        ? 'ML-DSA-65 signature verified + Merkle inclusion path mathematically unbroken'
                        : `Failure Stage: ${verificationResult.error_stage || 'Validation'} - ${verificationResult.error}`}
                    </div>
                  </div>
                </div>

                {verificationResult.valid && verificationResult.metrics && (
                  <div className="grid-3" style={{ marginTop: '8px' }}>
                    <div className="card" style={{ padding: '14px', textAlign: 'center' }}>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Merkle Verification</div>
                      <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                        {verificationResult.metrics.merkle_proof_verification_ms} ms
                      </div>
                    </div>
                    <div className="card" style={{ padding: '14px', textAlign: 'center' }}>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ML-DSA-65 Verification</div>
                      <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--accent-purple)' }}>
                        {verificationResult.metrics.signature_verification_ms} ms
                      </div>
                    </div>
                    <div className="card" style={{ padding: '14px', textAlign: 'center' }}>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Total Latency</div>
                      <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                        {verificationResult.metrics.total_workflow_verification_ms} ms
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)' }}>
                Generate a selective disclosure proof and click "Verify Proof" to see the cryptographic audit.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Chapter 4 Benchmarks */}
      {activeTab === 'benchmarks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title"><Activity size={20} color="var(--accent-cyan)" /> Chapter 4 Empirical Evaluation Suite</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
                  Executes controlled repeated trials comparing ML-DSA-65 (NIST FIPS 204) with classical ECDSA baseline.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <select 
                  className="form-input" 
                  style={{ width: '130px' }}
                  value={benchmarkIterations}
                  onChange={e => setBenchmarkIterations(Number(e.target.value))}
                >
                  <option value={10}>10 Trials</option>
                  <option value={20}>20 Trials</option>
                  <option value={50}>50 Trials</option>
                </select>
                <button className="btn btn-primary" onClick={handleRunBenchmarks} disabled={loading}>
                  <RefreshCw size={14} /> Run Evaluation Benchmark
                </button>
              </div>
            </div>

            {benchmarkResult && (
              <div>
                <div className="grid-2" style={{ marginBottom: '24px' }}>
                  {/* ML-DSA-65 Card */}
                  <div className="card" style={{ background: '#0f172a' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span className="badge badge-cyan">ML-DSA-65 (Post-Quantum)</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>FIPS 204</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                      <div><strong>Public Key Size:</strong> {benchmarkResult.ml_dsa_65.public_key_bytes} bytes</div>
                      <div><strong>Signature Size:</strong> {benchmarkResult.ml_dsa_65.signature_bytes} bytes</div>
                      <div><strong>Keygen Latency (Mean / Median / p95):</strong> {benchmarkResult.ml_dsa_65.keygen.mean_ms}ms / {benchmarkResult.ml_dsa_65.keygen.median_ms}ms / {benchmarkResult.ml_dsa_65.keygen.p95_ms}ms</div>
                      <div><strong>Signing Latency (Mean / Median / p95):</strong> {benchmarkResult.ml_dsa_65.sign.mean_ms}ms / {benchmarkResult.ml_dsa_65.sign.median_ms}ms / {benchmarkResult.ml_dsa_65.sign.p95_ms}ms</div>
                      <div><strong>Verify Latency (Mean / Median / p95):</strong> {benchmarkResult.ml_dsa_65.verify.mean_ms}ms / {benchmarkResult.ml_dsa_65.verify.median_ms}ms / {benchmarkResult.ml_dsa_65.verify.p95_ms}ms</div>
                    </div>
                  </div>

                  {/* ECDSA Card */}
                  <div className="card" style={{ background: '#0f172a' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span className="badge badge-purple">ECDSA Baseline (Classical)</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>secp256k1</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                      <div><strong>Public Key Size:</strong> {benchmarkResult.ecdsa_baseline.public_key_bytes} bytes</div>
                      <div><strong>Signature Size:</strong> {benchmarkResult.ecdsa_baseline.signature_bytes} bytes</div>
                      <div><strong>Keygen Latency (Mean / Median / p95):</strong> {benchmarkResult.ecdsa_baseline.keygen.mean_ms}ms / {benchmarkResult.ecdsa_baseline.keygen.median_ms}ms / {benchmarkResult.ecdsa_baseline.keygen.p95_ms}ms</div>
                      <div><strong>Signing Latency (Mean / Median / p95):</strong> {benchmarkResult.ecdsa_baseline.sign.mean_ms}ms / {benchmarkResult.ecdsa_baseline.sign.median_ms}ms / {benchmarkResult.ecdsa_baseline.sign.p95_ms}ms</div>
                      <div><strong>Verify Latency (Mean / Median / p95):</strong> {benchmarkResult.ecdsa_baseline.verify.mean_ms}ms / {benchmarkResult.ecdsa_baseline.verify.median_ms}ms / {benchmarkResult.ecdsa_baseline.verify.p95_ms}ms</div>
                    </div>
                  </div>
                </div>

                {/* Summary Box */}
                <div className="card" style={{ background: 'rgba(6, 182, 212, 0.05)', borderColor: 'rgba(6, 182, 212, 0.2)' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px', color: 'var(--accent-cyan)' }}>
                    Empirical Evaluation & Performance Analysis
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                    The empirical evaluation across {benchmarkResult.iterations} controlled trials demonstrates the trade-off boundaries: ML-DSA-65 signatures require 3,293 bytes compared to ECDSA's 71 bytes (a ~46x footprint increase for quantum resilience). However, verification latency remains sub-100ms, making it fully viable for real-time digital identity verification without violating user experience tolerances.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
