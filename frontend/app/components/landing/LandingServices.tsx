'use client';

import React from 'react';
import { Stethoscope, Baby, Heart, Syringe, TestTube, RefreshCw } from 'lucide-react';

export const LandingServices: React.FC = () => (
  <section className="section" id="services-section">
    <div className="section-header">
      <h2 className="section-title">Our Services</h2>
    </div>

    <div className="services-grid">
      <div className="service-card">
        <Stethoscope size={20} color="#087990" />
        <span>General Consultation</span>
      </div>
      <div className="service-card">
        <Baby size={20} color="#087990" />
        <span>Pediatrics</span>
      </div>
      <div className="service-card">
        <Heart size={20} color="#087990" />
        <span>Women's Health</span>
      </div>
      <div className="service-card">
        <Syringe size={20} color="#087990" />
        <span>Vaccinations</span>
      </div>
      <div className="service-card">
        <TestTube size={20} color="#087990" />
        <span>Laboratory Services</span>
      </div>
      <div className="service-card">
        <RefreshCw size={20} color="#087990" />
        <span>Follow-up Visits</span>
      </div>
    </div>
  </section>
);
