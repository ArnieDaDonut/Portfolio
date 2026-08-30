interface UIProps {
    planetName: string
    onReturn: () => void;
}

export function PlanetUI({ planetName, onReturn }: UIProps) {
    return (
        <div className="planet-ui-overlay">
            <button onClick={onReturn} className="return-orbit-btn">
                Return to Orbit
            </button>
        </div>
    )
}