interface UIProps {
    planetName: string
    onReturn: () => void;
}

export function PlanetUI({ planetName, onReturn }: UIProps) {
    return (
        <div className="planet-ui-overlay">
            <h1 className="planet-title"> {planetName.toUpperCase()}</h1>

            <button onClick={onReturn} className="return-orbit-btn">
                Return to Orbit
            </button>
        </div>
    )
}