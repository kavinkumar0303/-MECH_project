import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  CheckCircle2,
  Clock3,
  Compass,
  Gauge,
  Search,
  ShieldCheck,
  Sparkles,
  Wrench
} from 'lucide-react';

const machineCards = [
  {
    id: 'lathe',
    title: 'Centre lathe',
    category: 'Machining',
    description: 'Practice turning, facing and precision finishing.',
    image: '/lathe.jpg',
    duration: '12 min',
    tone: 'apricot'
  },
  {
    id: 'milling',
    title: 'Milling machine',
    category: 'Machining',
    description: 'Explore multi-axis cutting and workholding.',
    image: '/milling.jpg',
    duration: '15 min',
    tone: 'blue'
  },
  {
    id: 'welding',
    title: 'Arc welding',
    category: 'Joining',
    description: 'Build safe habits for common weld joints.',
    image: '/welding.jpg',
    duration: '10 min',
    tone: 'peach'
  },
  {
    id: 'shaper',
    title: 'Shaping machine',
    category: 'Machining',
    description: 'Learn reciprocating cuts, slots and keyways.',
    image: '/shaper.jpg',
    duration: '11 min',
    tone: 'sage'
  },
  {
    id: 'planer',
    title: 'Planing machine',
    category: 'Machining',
    description: 'See how large workpieces are surfaced.',
    image: '/planer.jpg',
    duration: '13 min',
    tone: 'blue'
  },
  {
    id: 'casting',
    title: 'Metal casting',
    category: 'Foundry',
    description: 'Follow molten metal through a casting process.',
    image: '/casting.jpg',
    duration: '14 min',
    tone: 'peach'
  },
  {
    id: 'moulding',
    title: 'Sand moulding',
    category: 'Foundry',
    description: 'Prepare patterns, cavities and a sound mould.',
    image: '/moulding.jpg',
    duration: '9 min',
    tone: 'sage'
  }
];

export default function Dashboard({ user, setActiveTab, setSelectedMachineId }) {
  const [search, setSearch] = useState('');
  const visibleMachines = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return machineCards;
    return machineCards.filter((machine) =>
      `${machine.title} ${machine.category} ${machine.description}`.toLowerCase().includes(query)
    );
  }, [search]);

  const openMachine = (machineId) => {
    setSelectedMachineId(machineId);
    setActiveTab('machine_explorer');
  };

  const firstName = user?.name?.trim().split(/\s+/)[0] || 'there';

  return (
    <main className="dashboard-page">
      <section className="dashboard-welcome">
        <div className="dashboard-welcome-copy">
          <span className="eyebrow"><Sparkles size={14} /> YOUR WORKSHOP, YOUR PACE</span>
          <h1>Good to see you, {firstName}<span className="welcome-dot">.</span></h1>
          <p>Build confidence with hands-on machine simulations, one skill at a time.</p>
          <div className="welcome-actions">
            <button className="button-primary" onClick={() => openMachine('lathe')}>
              <Wrench size={17} /> Start a simulation <ArrowRight size={16} />
            </button>
            <button className="button-secondary" onClick={() => setActiveTab('workshop_map')}>
              <Compass size={17} /> Explore the workshop
            </button>
          </div>
          <div className="welcome-trust">
            <span><CheckCircle2 size={15} /> 7 interactive machines</span>
            <span><ShieldCheck size={15} /> Safety-first practice</span>
          </div>
        </div>
        <div className="welcome-art" aria-label="Lathe machine in a virtual workshop">
          <div className="welcome-art-glow" />
          <div className="welcome-art-chip"><span /> SIMULATION READY</div>
          <img src="/lathe.jpg" alt="Centre lathe machine" />
          <div className="welcome-art-caption">
            <span className="caption-icon"><Gauge size={17} /></span>
            <span><strong>Start with the lathe</strong><small>Explore precision turning</small></span>
            <ArrowUpRight size={18} />
          </div>
        </div>
      </section>

      <section className="dashboard-overview" aria-label="Learning overview">
        <article className="overview-card">
          <span className="overview-icon icon-orange"><Award size={18} /></span>
          <div><span className="overview-label">Workshop XP</span><strong>{(user?.xp || 0).toLocaleString()}</strong><small>Keep learning to level up</small></div>
        </article>
        <article className="overview-card">
          <span className="overview-icon icon-green"><ShieldCheck size={18} /></span>
          <div><span className="overview-label">Safety score</span><strong>{user?.safetyScore ?? 100}<small className="metric-unit">%</small></strong><small>Safety comes first</small></div>
        </article>
        <article className="overview-card">
          <span className="overview-icon icon-blue"><Gauge size={18} /></span>
          <div><span className="overview-label">Accuracy</span><strong>{user?.accuracy ?? 98}<small className="metric-unit">%</small></strong><small>Your precision is improving</small></div>
        </article>
        <button className="overview-card overview-link" onClick={() => setActiveTab('progress')}>
          <span className="overview-icon icon-violet"><Clock3 size={18} /></span>
          <div><span className="overview-label">Learning journey</span><strong>{user?.completedMissions || 0}<small className="metric-unit"> sessions</small></strong><small>View your progress</small></div>
          <ArrowUpRight className="overview-arrow" size={18} />
        </button>
      </section>

      <section className="machine-library">
        <div className="section-heading">
          <div>
            <span className="eyebrow">LEARN BY DOING</span>
            <h2>Explore the workshop</h2>
            <p>Choose a machine and jump into a guided 3D experience.</p>
          </div>
          <button className="text-action" onClick={() => setActiveTab('workshop_map')}>
            View workshop map <ArrowRight size={16} />
          </button>
        </div>

        <label className="machine-search">
          <Search size={18} aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Find a machine or process"
            aria-label="Find a machine or process"
          />
          {search && <button type="button" onClick={() => setSearch('')} aria-label="Clear search">Clear</button>}
        </label>

        {visibleMachines.length > 0 ? (
          <div className="machine-grid">
            {visibleMachines.map((machine) => (
              <button
                className={`machine-card tone-${machine.tone}`}
                key={machine.id}
                onClick={() => openMachine(machine.id)}
              >
                <span className="machine-card-image">
                  <img src={machine.image} alt="" loading="lazy" />
                  <span className="machine-card-category">{machine.category}</span>
                  <span className="machine-card-arrow"><ArrowUpRight size={17} /></span>
                </span>
                <span className="machine-card-content">
                  <span className="machine-card-title">{machine.title}</span>
                  <span className="machine-card-description">{machine.description}</span>
                  <span className="machine-card-footer"><span><Clock3 size={14} /> {machine.duration}</span><span>Open simulation <ArrowRight size={14} /></span></span>
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="empty-machines">
            <Search size={22} />
            <strong>No machines found</strong>
            <span>Try a different search term.</span>
          </div>
        )}
      </section>

      <section className="workplane-callout">
        <div className="workplane-callout-icon"><Compass size={22} /></div>
        <div>
          <span className="eyebrow">TAKE A LOOK AROUND</span>
          <h2>Visit the 3D workshop floor</h2>
          <p>Get a bird's-eye view of the machines and how each station fits together.</p>
        </div>
        <button className="button-secondary" onClick={() => setActiveTab('workshop_map')}>
          Explore the map <ArrowRight size={16} />
        </button>
      </section>
    </main>
  );
}
