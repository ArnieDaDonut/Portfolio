import { useState, useEffect } from 'react';
import { EXPERIENCES, SECTIONS } from './ExperienceBasecamp';

export function ExperienceUI({ sectionId, onClose }: { sectionId: string, onClose: () => void }) {
    const section = SECTIONS.find(s => s.id === sectionId) || SECTIONS[0];
    const [activeIndex, setActiveIndex] = useState(0);
    const activeExp = section.experiences[activeIndex] || section.experiences[0];
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0,
            width: '100vw',
            height: '100vh',
            // Deep space backdrop with slight transparency
            background: 'radial-gradient(circle at center, rgba(10,15,30,0.8) 0%, rgba(2,3,8,0.95) 100%)',
            backdropFilter: 'blur(10px)',
            zIndex: 9999,
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Courier New', Courier, monospace",
            color: '#fff',
            opacity: mounted ? 1 : 0,
            transition: 'opacity 0.5s ease-out'
        }}>
            {/* Grid overlay */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
                pointerEvents: 'none',
                zIndex: 1
            }} />

            {/* Centralized Glassmorphism Modal */}
            <div style={{
                width: '85vw',
                maxWidth: '1200px',
                height: '80vh',
                maxHeight: '800px',
                background: 'rgba(10, 12, 20, 0.6)',
                border: `1px solid ${section.color}40`,
                borderRadius: '24px',
                boxShadow: `0 0 40px ${section.color}20, inset 0 0 20px ${section.color}10`,
                display: 'flex',
                flexDirection: 'row',
                position: 'relative',
                overflow: 'hidden',
                zIndex: 10,
                backdropFilter: 'blur(20px)',
                transform: mounted ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(20px)',
                transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
                
                {/* Decorative Sci-Fi Corners */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '40px', height: '40px', borderTop: `3px solid ${section.color}`, borderLeft: `3px solid ${section.color}`, borderTopLeftRadius: '24px' }} />
                <div style={{ position: 'absolute', top: 0, right: 0, width: '40px', height: '40px', borderTop: `3px solid ${section.color}`, borderRight: `3px solid ${section.color}`, borderTopRightRadius: '24px' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: '40px', height: '40px', borderBottom: `3px solid ${section.color}`, borderLeft: `3px solid ${section.color}`, borderBottomLeftRadius: '24px' }} />
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: '40px', height: '40px', borderBottom: `3px solid ${section.color}`, borderRight: `3px solid ${section.color}`, borderBottomRightRadius: '24px' }} />

                {/* Close Button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        background: 'rgba(0,0,0,0.5)',
                        border: `1px solid ${section.color}50`,
                        color: section.color,
                        fontSize: '20px',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        zIndex: 35,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease-in-out',
                        boxShadow: `0 0 10px ${section.color}40`
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.background = `${section.color}30`;
                        e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.background = 'rgba(0,0,0,0.5)';
                        e.currentTarget.style.transform = 'scale(1)';
                    }}
                >
                    ✕
                </button>

                {/* Left Sidebar - Navigation */}
                <div style={{
                    width: '35%',
                    minWidth: '300px',
                    background: 'rgba(0,0,0,0.4)',
                    borderRight: `1px solid ${section.color}30`,
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '30px 0'
                }}>
                    <div style={{
                        padding: '0 30px 20px',
                        borderBottom: `1px solid ${section.color}20`,
                        marginBottom: '10px'
                    }}>
                        <div style={{ color: '#666', fontSize: '12px', letterSpacing: '3px', marginBottom: '8px' }}>DATABASE // {section.id.toUpperCase()}</div>
                        <div style={{ color: section.color, fontSize: '24px', fontWeight: 'bold', letterSpacing: '2px', textShadow: `0 0 10px ${section.color}80` }}>
                            EXPERIENCES
                        </div>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '10px 20px' }}>
                        {section.experiences.map((exp, idx) => (
                            <div
                                key={exp.id}
                                onClick={() => setActiveIndex(idx)}
                                style={{
                                    padding: '20px',
                                    marginBottom: '10px',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    background: activeIndex === idx ? `linear-gradient(90deg, ${section.color}20 0%, transparent 100%)` : 'transparent',
                                    border: `1px solid ${activeIndex === idx ? section.color + '50' : 'transparent'}`,
                                    borderLeft: `4px solid ${activeIndex === idx ? exp.color : '#333'}`,
                                    transition: 'all 0.3s ease',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '6px'
                                }}
                                onMouseOver={(e) => {
                                    if (activeIndex !== idx) e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                }}
                                onMouseOut={(e) => {
                                    if (activeIndex !== idx) e.currentTarget.style.background = 'transparent';
                                }}
                            >
                                <div style={{
                                    color: activeIndex === idx ? exp.color : '#aaa',
                                    fontWeight: 'bold',
                                    fontSize: '18px',
                                    transition: 'color 0.3s'
                                }}>
                                    {exp.company}
                                </div>
                                <div style={{ color: '#777', fontSize: '12px', letterSpacing: '1px' }}>
                                    {exp.role}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Content Area */}
                <div style={{
                    flex: 1,
                    padding: '50px 60px',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    overflowY: 'auto'
                }}>
                    {/* Decorative Top Right Element */}
                    <div style={{ position: 'absolute', top: '30px', right: '80px', display: 'flex', gap: '8px', opacity: 0.5 }}>
                        <div style={{ width: '4px', height: '12px', background: activeExp.color }} />
                        <div style={{ width: '4px', height: '12px', background: activeExp.color }} />
                        <div style={{ width: '4px', height: '12px', background: activeExp.color }} />
                    </div>

                    {/* Metadata Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                        <div style={{
                            background: `${activeExp.color}20`,
                            border: `1px solid ${activeExp.color}`,
                            color: activeExp.color,
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            letterSpacing: '1.5px',
                            boxShadow: `0 0 10px ${activeExp.color}40`
                        }}>
                            {activeExp.badge}
                        </div>
                        <div style={{ color: '#888', fontSize: '14px', letterSpacing: '1px' }}>
                            {activeExp.period}
                        </div>
                    </div>

                    <h1 style={{
                        fontSize: '56px',
                        margin: '0 0 10px 0',
                        color: '#fff',
                        textShadow: `0 0 20px ${activeExp.color}80`,
                        fontWeight: 800
                    }}>
                        {activeExp.company}
                    </h1>
                    
                    <h2 style={{
                        fontSize: '28px',
                        margin: '0 0 40px 0',
                        color: activeExp.color,
                        fontWeight: 400,
                        opacity: 0.9
                    }}>
                        {activeExp.role}
                    </h2>

                    <div style={{ width: '100px', height: '2px', background: `linear-gradient(90deg, ${activeExp.color}, transparent)`, marginBottom: '40px' }} />

                    <p style={{
                        fontSize: '18px',
                        lineHeight: '1.7',
                        color: '#bbb',
                        marginBottom: '40px',
                        maxWidth: '800px',
                        fontWeight: 300
                    }}>
                        {activeExp.summary}
                    </p>

                    {/* Achievements List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '50px' }}>
                        {activeExp.bullets.map((bullet, i) => (
                            <div key={i} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                                <div style={{ 
                                    marginTop: '6px',
                                    minWidth: '8px', 
                                    height: '8px', 
                                    background: activeExp.color,
                                    boxShadow: `0 0 8px ${activeExp.color}`,
                                    transform: 'rotate(45deg)'
                                }} />
                                <span style={{ color: '#ddd', fontSize: '16px', lineHeight: '1.6' }}>
                                    {bullet}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Skills Grid */}
                    <div style={{ marginTop: 'auto' }}>
                        <div style={{ color: '#666', fontSize: '12px', letterSpacing: '2px', marginBottom: '15px' }}>
                            TECHNOLOGIES & SKILLS
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                            {activeExp.skills.map((skill, i) => (
                                <div key={i} style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    border: `1px solid rgba(255,255,255,0.1)`,
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    color: '#eee',
                                    fontSize: '14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    transition: 'all 0.2s',
                                    cursor: 'default'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.borderColor = activeExp.color;
                                    e.currentTarget.style.boxShadow = `0 0 10px ${activeExp.color}30`;
                                    e.currentTarget.style.color = activeExp.color;
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                                    e.currentTarget.style.boxShadow = 'none';
                                    e.currentTarget.style.color = '#eee';
                                }}
                                >
                                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: activeExp.color }} />
                                    {skill}
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
