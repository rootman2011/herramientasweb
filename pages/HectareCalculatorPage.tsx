
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

type Point = { x: number; y: number };
type Language = 'es' | 'en';

const translations = {
    es: {
        title: 'Calculadora Visual de Hectáreas',
        subtitle: '¿Alguna vez te has preguntado cómo se ve una hectárea? Ingresa un valor, visualiza el terreno y ajusta su forma interactivamente.',
        hectaresLabel: 'Introduce la cantidad de hectáreas (ha)',
        hectaresPlaceholder: 'Ej: 1.5',
        totalArea: 'Área Total',
        maxWidth: 'Ancho Máx.',
        maxLength: 'Largo Máx.',
        metersUnit: 'metros',
        hectareConversion: '*1 hectárea (ha) equivale a 10,000 metros cuadrados (m²).',
        howToTitle: '¿Cómo funciona?',
        howToStep1: '<strong>1. Ingresa Hectáreas:</strong> Empieza escribiendo un valor en el campo de entrada para ver un terreno cuadrado.',
        howToStep2: '<strong>2. Arrastra los Vértices:</strong> Mueve los círculos blancos para cambiar la forma del polígono.',
        howToStep3: '<strong>3. Añade Puntos:</strong> Haz clic en un círculo semitransparente en medio de una línea para crear un nuevo vértice.',
        visualizerPlaceholder: 'Introduce un valor para visualizar el terreno',
        hectaresUnit: 'hectáreas'
    },
    en: {
        title: 'Visual Hectare Calculator',
        subtitle: 'Ever wondered what a hectare looks like? Enter a value, see the plot of land, and adjust its shape interactively.',
        hectaresLabel: 'Enter the amount of hectares (ha)',
        hectaresPlaceholder: 'Ex: 1.5',
        totalArea: 'Total Area',
        maxWidth: 'Max Width',
        maxLength: 'Max Length',
        metersUnit: 'meters',
        hectareConversion: '*1 hectare (ha) equals 10,000 square meters (m²).',
        howToTitle: 'How It Works',
        howToStep1: '<strong>1. Enter Hectares:</strong> Start by typing a value in the input field to see a square plot.',
        howToStep2: '<strong>2. Drag the Corners:</strong> Move the white circles to change the polygon\'s shape.',
        howToStep3: '<strong>3. Add Points:</strong> Click a semi-transparent circle on a line\'s midpoint to create a new corner.',
        visualizerPlaceholder: 'Enter a value to visualize the land',
        hectaresUnit: 'hectares'
    }
};

const calculatePolygonArea = (points: Point[]): number => {
    let area = 0;
    const n = points.length;
    if (n < 3) return 0;
    for (let i = 0; i < n; i++) {
        area += points[i].x * points[(i + 1) % n].y - points[(i + 1) % n].x * points[i].y;
    }
    return Math.abs(area / 2.0);
};

const createSquareFromArea = (sqMeters: number): Point[] => {
    if (sqMeters <= 0) return [];
    const side = Math.sqrt(sqMeters);
    return [{ x: 0, y: 0 }, { x: side, y: 0 }, { x: side, y: side }, { x: 0, y: side }];
};

const HectareCalculatorPage: React.FC = () => {
    const [language, setLanguage] = useState<Language>('es');
    const [points, setPoints] = useState<Point[]>([]);
    const [inputValue, setInputValue] = useState('1');
    const svgRef = useRef<SVGSVGElement>(null);
    const visualizerRef = useRef<HTMLDivElement>(null);
    const draggedPointRef = useRef<{ index: number; type: string } | null>(null);

    const t = translations[language];

    const formatNumber = (num: number) => new Intl.NumberFormat(language, { maximumFractionDigits: 2 }).format(num);

    const getMousePosition = useCallback((e: MouseEvent | TouchEvent): Point => {
        if (!svgRef.current) return { x: 0, y: 0 };
        const CTM = svgRef.current.getScreenCTM();
        if (!CTM) return { x: 0, y: 0 };
        
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        
        const svgPoint = svgRef.current.createSVGPoint();
        svgPoint.x = clientX;
        svgPoint.y = clientY;
        const transformedPoint = svgPoint.matrixTransform(CTM.inverse());
        return { x: transformedPoint.x, y: transformedPoint.y };
    }, []);

    const { area, dimensions, center } = useMemo(() => {
        const calculatedArea = calculatePolygonArea(points);
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        if (points.length > 0) {
            points.forEach(p => {
                minX = Math.min(minX, p.x);
                minY = Math.min(minY, p.y);
                maxX = Math.max(maxX, p.x);
                maxY = Math.max(maxY, p.y);
            });
        } else {
            minX = minY = maxX = maxY = 0;
        }

        const centerPoint = points.reduce((acc, p) => ({x: acc.x + p.x, y: acc.y + p.y}), {x:0, y:0});
        if (points.length > 0) {
             centerPoint.x /= points.length;
             centerPoint.y /= points.length;
        }
        
        return {
            area: calculatedArea,
            dimensions: {
                minX, minY, maxX, maxY,
                width: points.length > 0 ? maxX - minX : 0,
                height: points.length > 0 ? maxY - minY : 0,
            },
            center: centerPoint,
        };
    }, [points]);
    
    const dynamicSizes = useMemo(() => {
        const { width, height, minX, minY } = dimensions;
        const padding = Math.max(width, height) * 0.3 + 10;
        const viewBoxWidth = width + padding;
        const viewBoxHeight = height + padding;
        const mainFontSize = Math.min(viewBoxWidth * 0.04, viewBoxHeight * 0.1);
        
        return {
            viewBox: `${minX - padding / 2} ${minY - padding / 2} ${viewBoxWidth} ${viewBoxHeight}`,
            handleRadius: viewBoxWidth * 0.018,
            strokeWidth: viewBoxWidth * 0.004,
            fontSize: mainFontSize,
            labelFontSize: mainFontSize * 0.65,
        };
    }, [dimensions]);

    const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
        if (!draggedPointRef.current) return;
        if (e.cancelable) e.preventDefault();
        const newPos = getMousePosition(e);
        setPoints(currentPoints => currentPoints.map((p, i) => i === draggedPointRef.current!.index ? newPos : p));
    }, [getMousePosition]);

    const endDrag = useCallback(() => {
        if (!draggedPointRef.current) return;
        draggedPointRef.current = null;
        if (visualizerRef.current) {
            visualizerRef.current.classList.remove('cursor-grabbing');
        }
        window.removeEventListener('mousemove', handleDragMove);
        window.removeEventListener('touchmove', handleDragMove);
        window.removeEventListener('mouseup', endDrag);
        window.removeEventListener('touchend', endDrag);
    }, [handleDragMove]);

    const startDrag = useCallback((e: React.MouseEvent | React.TouchEvent, index: number, type: 'vertex' | 'midpoint') => {
        e.stopPropagation();
        
        if (type === 'midpoint') {
            const p1 = points[index];
            const p2 = points[(index + 1) % points.length];
            const newPoint = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
            const newIndex = index + 1;
            setPoints(currentPoints => {
                const newPoints = [...currentPoints];
                newPoints.splice(newIndex, 0, newPoint);
                return newPoints;
            });
            draggedPointRef.current = { index: newIndex, type: 'vertex' };
        } else {
            draggedPointRef.current = { index, type: 'vertex' };
        }
        
        if (visualizerRef.current) {
            visualizerRef.current.classList.add('cursor-grabbing');
        }

        window.addEventListener('mousemove', handleDragMove);
        window.addEventListener('touchmove', handleDragMove, { passive: false });
        window.addEventListener('mouseup', endDrag);
        window.addEventListener('touchend', endDrag);
    }, [points, handleDragMove, endDrag]);

    const handleHectaresChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputValue(val);
        const numHectares = parseFloat(val.replace(',', '.'));
        if (!isNaN(numHectares) && numHectares >= 0) {
            setPoints(createSquareFromArea(numHectares * 10000));
        } else if (val === '') {
            setPoints([]);
        }
    };

    useEffect(() => {
        const hectares = area / 10000;
        const currentInputFloat = parseFloat(inputValue.replace(',', '.'));
        if (document.activeElement?.id !== 'hectares-input' && (Math.abs(currentInputFloat - hectares) > 1e-5 || (isNaN(currentInputFloat) && hectares !== 0))) {
            if (hectares > 0) {
                 setInputValue(new Intl.NumberFormat(language, {minimumFractionDigits: 0, maximumFractionDigits: 4}).format(Number(hectares.toFixed(4))));
            } else if (points.length > 0) {
                 setInputValue('0');
            }
        }
    }, [area, points.length, language]);

    useEffect(() => {
        handleHectaresChange({ target: { value: '1' } } as React.ChangeEvent<HTMLInputElement>);
        return () => {
             window.removeEventListener('mousemove', handleDragMove);
             window.removeEventListener('touchmove', handleDragMove);
             window.removeEventListener('mouseup', endDrag);
             window.removeEventListener('touchend', endDrag);
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const renderSVGContent = () => {
        return (
            <>
                {points.length > 2 && (
                    <polygon
                        points={points.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ')}
                        className="fill-primary/80 stroke-primary-focus"
                        strokeWidth={dynamicSizes.strokeWidth}
                    />
                )}
                {points.length > 1 && points.map((p1, i) => {
                    const p2 = points[(i + 1) % points.length];
                    const length = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
                    const midPoint = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
                    let angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI);
                    if (angle > 90 || angle < -90) angle += 180;
                    
                    return (
                        <g key={`edge-${i}`}>
                            {length > dynamicSizes.handleRadius * 4 && (
                                <text
                                    x={midPoint.x} y={midPoint.y}
                                    transform={`rotate(${angle}, ${midPoint.x}, ${midPoint.y})`}
                                    dy={-dynamicSizes.handleRadius * 0.8}
                                    fontSize={dynamicSizes.labelFontSize}
                                    className="fill-base-content font-sans pointer-events-none"
                                    fontWeight="500"
                                    textAnchor="middle" dominantBaseline="central"
                                >
                                    {length.toFixed(1)}m
                                </text>
                            )}
                            <circle
                                cx={midPoint.x} cy={midPoint.y} r={dynamicSizes.handleRadius * 0.8}
                                className="fill-base-200/60 hover:fill-base-200 transition-colors cursor-pointer"
                                onMouseDown={(e) => startDrag(e, i, 'midpoint')}
                                onTouchStart={(e) => startDrag(e, i, 'midpoint')}
                            />
                        </g>
                    );
                })}
                {points.map((p, i) => (
                     <circle
                        key={`vertex-${i}`}
                        cx={p.x} cy={p.y} r={dynamicSizes.handleRadius}
                        className="fill-white stroke-2 stroke-primary-focus cursor-grab"
                        onMouseDown={(e) => startDrag(e, i, 'vertex')}
                        onTouchStart={(e) => startDrag(e, i, 'vertex')}
                    />
                ))}
                 {area > 1 && points.length > 2 && (
                    <text
                        x={center.x} y={center.y}
                        fontSize={dynamicSizes.fontSize}
                        fontWeight="bold"
                        className="fill-white font-mono pointer-events-none"
                        textAnchor="middle"
                        dominantBaseline="central"
                    >
                        {area.toLocaleString(language, {maximumFractionDigits: 0})} m²
                    </text>
                 )}
            </>
        )
    }

    return (
        <div className="w-full max-w-6xl mx-auto bg-base-100 rounded-2xl shadow-2xl shadow-base-200/80 overflow-hidden relative">
            <div className="absolute top-4 right-4 z-10 flex space-x-1 bg-base-200 p-1 rounded-full">
                <button onClick={() => setLanguage('es')} className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${language === 'es' ? 'bg-base-100 text-primary shadow-sm' : 'text-base-content/60 hover:text-base-content'}`}>ES</button>
                <button onClick={() => setLanguage('en')} className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${language === 'en' ? 'bg-base-100 text-primary shadow-sm' : 'text-base-content/60 hover:text-base-content'}`}>EN</button>
            </div>
            <div className="grid md:grid-cols-2">
                <div className="p-8 lg:p-12 border-r border-base-200 flex flex-col justify-center">
                    <header className="mb-8">
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary">{t.title}</h1>
                        <p className="mt-3 text-gray-400 text-lg">{t.subtitle}</p>
                    </header>
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="hectares-input" className="block text-sm font-medium text-base-content mb-2">{t.hectaresLabel}</label>
                            <input
                                type="text"
                                id="hectares-input"
                                value={inputValue}
                                onChange={handleHectaresChange}
                                placeholder={t.hectaresPlaceholder}
                                className="w-full p-4 bg-base-200 border border-secondary/50 rounded-lg text-xl focus:ring-2 focus:ring-primary focus:border-primary transition duration-150 ease-in-out"
                            />
                        </div>
                        <div className="grid sm:grid-cols-3 gap-4">
                            <InfoCard title={t.totalArea} value={formatNumber(area)} unit="m²" icon={<IconArea />} />
                            <InfoCard title={t.maxWidth} value={formatNumber(dimensions.width)} unit={t.metersUnit} icon={<IconWidth />} />
                            <InfoCard title={t.maxLength} value={formatNumber(dimensions.height)} unit={t.metersUnit} icon={<IconLength />} />
                        </div>
                        <div className="pt-6 border-t border-secondary/50">
                            <h3 className="text-lg font-semibold text-base-content mb-3">{t.howToTitle}</h3>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li dangerouslySetInnerHTML={{ __html: t.howToStep1 }} />
                                <li dangerouslySetInnerHTML={{ __html: t.howToStep2 }} />
                                <li dangerouslySetInnerHTML={{ __html: t.howToStep3 }} />
                            </ul>
                            <p className="text-xs text-gray-500 mt-4" dangerouslySetInnerHTML={{ __html: t.hectareConversion }} />
                        </div>
                    </div>
                </div>
                <div
                    ref={visualizerRef}
                    className="p-4 lg:p-6 flex items-center justify-center min-h-[400px] md:min-h-0 relative bg-base-200"
                    title={`${(area/10000).toLocaleString(language, { maximumFractionDigits: 4 })} ${t.hectaresUnit}`}
                    style={{
                        backgroundImage: 'linear-gradient(rgba(107, 114, 128, 0.4) 1px, transparent 1px), linear-gradient(to right, rgba(107, 114, 128, 0.4) 1px, transparent 1px)',
                        backgroundSize: '20px 20px'
                    }}
                >
                    <svg ref={svgRef} className="w-full h-full touch-none" preserveAspectRatio="xMidYMid meet" viewBox={dynamicSizes.viewBox}>
                        {points.length > 0 ? renderSVGContent() : (
                             <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-gray-500 select-none text-lg">
                                {t.visualizerPlaceholder}
                            </text>
                        )}
                    </svg>
                </div>
            </div>
        </div>
    );
};

const InfoCard: React.FC<{ title: string; value: string; unit: string; icon: React.ReactNode }> = ({ title, value, unit, icon }) => (
    <div className="bg-base-200 rounded-xl p-4 flex items-center space-x-4 border border-secondary/50 hover:shadow-md transition-shadow">
        <div className="bg-base-100 p-3 rounded-full border border-secondary/50">{icon}</div>
        <div>
            <h3 className="text-sm font-medium text-gray-400">{title}</h3>
            <p className="text-xl font-semibold text-base-content">
                <span>{value}</span> <span className="text-base font-normal text-gray-400">{unit}</span>
            </p>
        </div>
    </div>
);

const IconArea: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"></path></svg>;
const IconWidth: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 12h16M4 10v4m16-4v4"></path></svg>;
const IconLength: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16M10 4h4m-4 16h4"></path></svg>;

export default HectareCalculatorPage;