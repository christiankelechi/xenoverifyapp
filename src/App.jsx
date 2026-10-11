import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { API_BASE_URL } from './config';

import Header from './components/Header';
import NavigationTabs from './components/NavigationTabs';
import ScopeTab from './components/ScopeTab';
import IssuerTab from './components/IssuerTab';
import DisclosureTab from './components/DisclosureTab';
import BenchmarkTab from './components/BenchmarkTab';

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
      {/* Modular Header */}
      <Header />

      {/* Real-time Processing Overlay / Loader Banner */}
      {loading && (
        <div className="processing-banner">
          <RefreshCw size={18} className="spinner" />
          <span>{processingMessage || 'Cryptographic operation in progress. Please wait...'}</span>
        </div>
      )}

      {/* Modular Navigation Tabs */}
      <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Tab 1: DSRM Scope & Specs */}
      {activeTab === 'dsrm' && <ScopeTab />}

      {/* Tab 2: Issuer Authority & Signing */}
      {activeTab === 'issuer' && (
        <IssuerTab
          issuer={issuer}
          selectedCred={selectedCred}
          newAttrs={newAttrs}
          setNewAttrs={setNewAttrs}
          handleInitIssuer={handleInitIssuer}
          handleIssueCredential={handleIssueCredential}
          loading={loading}
        />
      )}

      {/* Tab 3: Selective Disclosure Playground */}
      {activeTab === 'disclosure' && (
        <DisclosureTab
          disclosedKeys={disclosedKeys}
          setDisclosedKeys={setDisclosedKeys}
          proofPacket={proofPacket}
          verificationResult={verificationResult}
          handleGenerateProof={handleGenerateProof}
          handleVerifyProof={handleVerifyProof}
          loading={loading}
        />
      )}

      {/* Tab 4: Chapter 4 Benchmarks */}
      {activeTab === 'benchmarks' && (
        <BenchmarkTab
          benchmarkResult={benchmarkResult}
          benchmarkIterations={benchmarkIterations}
          setBenchmarkIterations={setBenchmarkIterations}
          handleRunBenchmarks={handleRunBenchmarks}
          loading={loading}
        />
      )}
    </div>
  );
}
