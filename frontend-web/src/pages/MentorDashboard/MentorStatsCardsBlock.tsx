import { Baby, Wifi, Smile, CalendarDays } from 'lucide-react';

interface MentorStatsCardsBlockProps {
    data: {
        children: number;
        online_children: number;
        mood_entries_week: number;
        events: number;
    };
}

export default function MentorStatsCardsBlock({ data }: MentorStatsCardsBlockProps) {
    return (
        <div className="stats-cards">
            <div className="stats-cards__item">
                <div className="stats-cards__icon"><Baby size={20} /></div>
                <div className="stats-cards__label">Мои дети</div>
                <div className="stats-cards__value">{data.children}</div>
            </div>
            <div className="stats-cards__item">
                <div className="stats-cards__icon"><Wifi size={20} /></div>
                <div className="stats-cards__label">Дети онлайн</div>
                <div className="stats-cards__value">{data.online_children}</div>
            </div>
            <div className="stats-cards__item">
                <div className="stats-cards__icon"><Smile size={20} /></div>
                <div className="stats-cards__label">Настроения за неделю</div>
                <div className="stats-cards__value">{data.mood_entries_week}</div>
            </div>
            <div className="stats-cards__item">
                <div className="stats-cards__icon"><CalendarDays size={20} /></div>
                <div className="stats-cards__label">Мероприятия</div>
                <div className="stats-cards__value">{data.events}</div>
            </div>
        </div>
    );
}