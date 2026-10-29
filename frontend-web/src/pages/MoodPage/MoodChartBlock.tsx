import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Dot } from 'recharts';

interface ChartPoint {
    date: string;
    date_full: string;
    mood: string;
    mood_label: string;
    value: number;
    child_name: string;
}

interface MoodChartBlockProps {
    data: ChartPoint[];
}

const MOOD_COLORS: Record<string, string> = {
    good: 'var(--right)',
    normal: 'var(--clarify)',
    bad: 'var(--wrong)',
};

interface CustomDotProps {
    cx?: number;
    cy?: number;
    payload?: ChartPoint;
}

function CustomDot({ cx, cy, payload }: CustomDotProps) {
    if (cx === undefined || cy === undefined || !payload) return null;
    const color = MOOD_COLORS[payload.mood] ?? 'var(--primary-admin)';
    return <circle cx={cx} cy={cy} r={5} fill={color} stroke="#ffffff" strokeWidth={2} />;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{ payload: ChartPoint }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
    if (!active || !payload || !payload.length) return null;
    const point = payload[0].payload;
    return (
        <div className="mood-chart__tooltip">
            <div className="mood-chart__tooltip-date">{point.date_full}</div>
            <div className="mood-chart__tooltip-row">
                <span>Ребёнок:</span> <strong>{point.child_name}</strong>
            </div>
            <div className="mood-chart__tooltip-row">
                <span>Настроение:</span>{' '}
                <strong style={{ color: MOOD_COLORS[point.mood] }}>{point.mood_label}</strong>
            </div>
        </div>
    );
}

export default function MoodChartBlock({ data }: MoodChartBlockProps) {
    return (
        <div className="mood-chart">
            <div className="mood-chart__header">
                <h2 className="mood-chart__title">Динамика настроений за последние 30 дней</h2>
                <span className="mood-chart__count">{data.length} дн.</span>
            </div>

            {data.length === 0 ? (
                <div className="mood-chart__empty">Нет данных для отображения графика</div>
            ) : (
                <div className="mood-chart__canvas">
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--secondary-admin)" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 12, fill: 'var(--text-admin)' }}
                                stroke="var(--secondary-admin)"
                            />
                            <YAxis
                                domain={[0, 4]}
                                ticks={[1, 2, 3]}
                                tickFormatter={(v) => (v === 1 ? 'Плохое' : v === 2 ? 'Норм.' : v === 3 ? 'Хорошее' : '')}
                                tick={{ fontSize: 11, fill: 'var(--text-admin)' }}
                                stroke="var(--secondary-admin)"
                                width={70}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="var(--primary-admin)"
                                strokeWidth={2.5}
                                dot={<CustomDot />}
                                activeDot={{ r: 7 }}
                                isAnimationActive={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}