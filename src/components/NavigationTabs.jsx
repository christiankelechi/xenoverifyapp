import React from 'react';
import { Cpu, Key, Fingerprint, Activity } from 'lucide-react';

export default function NavigationTabs({ activeTab, setActiveTab }) {
  return (
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
  );
}
