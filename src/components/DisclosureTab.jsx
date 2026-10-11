import React from 'react';
import { Eye, EyeOff, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';

export default function DisclosureTab({
  disclosedKeys,
  setDisclosedKeys,
  proofPacket,
  verificationResult,
  handleGenerateProof,
  handleVerifyProof,
  loading
}) {
  const allAttributes = ['fullName', 'nin', 'dob', 'nationality', 'clearanceLevel', 'residence'];

  return (
    <div className="grid-2">
      {/* Holder Side */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <EyeOff size={18} color="var(--accent-cyan)" /> Holder Selective Disclosure
          </h2>
          <button className="btn btn-primary" onClick={handleGenerateProof} disabled={loading}>
            Generate Merkle Proof
          </button>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>
          Select which attributes to reveal. Unchecked attributes remain completely private.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {allAttributes.map(key => {
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
          <h2 className="card-title">
            <ShieldCheck size={18} color="var(--accent-emerald)" /> Verifier Audit Console
          </h2>
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
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: 700, 
                  color: verificationResult.valid ? 'var(--accent-emerald)' : 'var(--accent-rose)' 
                }}>
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
  );
}
