'use client';

import React from 'react';
import { User as UserIcon, Calendar, CheckCircle2 } from 'lucide-react';

export const LandingHowItWorks: React.FC = () => (
  <section className="section section-tint" id="how-it-works-section">
    <div className="section-header">
      <h2 className="section-title">How It Works</h2>
    </div>

    <div className="cards-grid-3">
      <div className="feature-card">
        <div className="feature-icon-badge">
          <UserIcon size={20} />
        </div>
        <h3 className="feature-title">Choose a Doctor</h3>
        <p className="feature-desc">Browse our clinicians and pick the right specialist for your needs.</p>
      </div>

      <div className="feature-card">
        <div className="feature-icon-badge">
          <Calendar size={20} />
        </div>
        <h3 className="feature-title">Pick a Time</h3>
        <p className="feature-desc">See real-time openings and select a 30-minute slot that fits your schedule.</p>
      </div>

      <div className="feature-card">
        <div className="feature-icon-badge">
          <CheckCircle2 size={20} />
        </div>
        <h3 className="feature-title">Confirm Booking</h3>
        <p className="feature-desc">Confirm in one click and get an instant appointment reference.</p>
      </div>
    </div>
  </section>
);
