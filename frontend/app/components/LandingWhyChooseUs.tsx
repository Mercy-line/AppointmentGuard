'use client';

import React from 'react';
import { Activity, User as UserIcon, Clock, Shield } from 'lucide-react';

export const LandingWhyChooseUs: React.FC = () => (
  <section className="section" id="why-choose-us-section">
    <div className="section-header">
      <h2 className="section-title">Why Choose Our Clinic</h2>
    </div>

    <div className="cards-grid-4">
      <div className="feature-card">
        <div className="feature-icon-badge"><Activity size={20} /></div>
        <h3 className="feature-title">Easy Online Booking</h3>
        <p className="feature-desc">Book a visit in under a minute, any time of day.</p>
      </div>

      <div className="feature-card">
        <div className="feature-icon-badge"><UserIcon size={20} /></div>
        <h3 className="feature-title">Qualified Doctors</h3>
        <p className="feature-desc">Licensed clinicians across five core specialties.</p>
      </div>

      <div className="feature-card">
        <div className="feature-icon-badge"><Clock size={20} /></div>
        <h3 className="feature-title">Real-Time Availability</h3>
        <p className="feature-desc">Slots update instantly so you never double-book.</p>
      </div>

      <div className="feature-card">
        <div className="feature-icon-badge"><Shield size={20} /></div>
        <h3 className="feature-title">Secure Patient Records</h3>
        <p className="feature-desc">Your health data stays private and encrypted.</p>
      </div>
    </div>
  </section>
);
