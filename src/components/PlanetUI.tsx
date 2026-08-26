interface UIProps {
  planetName: string;
  onReturn: () => void;
}

export function PlanetUI({ planetName, onReturn }: UIProps) {
  return (
    <div className="planet-ui-overlay">
      <h1 className="planet-title">{planetName.toUpperCase()}</h1>

      <div className="planet-card">
        {planetName === 'About' && (
          <div>
            <p>Hi, I'm Arnav! I build apps and whatever I feel like!!!</p>
          </div>
        )}
        {planetName === 'Projects' && (
          <div>
            <h3>My Projects</h3>
            <p>• Portfolio</p>
            <p>• Pokedex Tracker</p>
          </div>
        )}
        {planetName === 'Experience' && (
          <div>
            <h3>Experience</h3>
            <p>• SAC</p>
            <p>• Hackathon Winner</p>
          </div>
        )}
        {planetName === 'Skills' && (
          <div>
            <h3>Skills</h3>
            <p>• Teamwork</p>
            <p>• React | Three.js | TypeScript | Vite | Tailwind</p>
          </div>
        )}
        {planetName === 'Contact' && (
          <div>
            <h3>Reach me!</h3>
            <p>Email: arnav.mandewalker@gmail.com</p>
            <p>Phone Number: 548-255-1780</p>
          </div>
        )}
      </div>

      <button onClick={onReturn} className="return-orbit-btn">
        Return to Orbit
      </button>
    </div>
  );
}