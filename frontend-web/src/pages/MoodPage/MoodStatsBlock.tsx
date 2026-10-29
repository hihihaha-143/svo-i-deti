import { Smile, Meh, Frown } from 'lucide-react';

interface MoodSummary {
    good: number;
    normal: number;
    bad: number;
}

interface MoodStatsBlockProps {
    summary: MoodSummary;
}

export default function MoodStatsBlock({ summary }: MoodStatsBlockProps) {
    const cards = [
        {
            key: 'good',
            label: 'Хорошее настроение',
            value: summary.good,
            icon: Smile,
            modifier: 'good',
        },
        {
            key: 'normal',
            label: 'Нормальное настроение',
            value: summary.normal,
            icon: Meh,
            modifier: 'normal',
        },
        {
            key: 'bad',
            label: 'Плохое настроение',
            value: summary.bad,
            icon: Frown,
            modifier: 'bad',
        },
    ];

    return (
        <div className="mood-stats">
            {cards.map(card => {
                const Icon = card.icon;
                return (
                    <div
                        key={card.key}
                        className={`mood-stats__card mood-stats__card--${card.modifier}`}
                    >
                        <Icon size={32} className="mood-stats__icon" strokeWidth={2.5} />
                        <div className="mood-stats__value">{card.value}</div>
                        <div className="mood-stats__label">{card.label}</div>
                    </div>
                );
            })}
        </div>
    );
}