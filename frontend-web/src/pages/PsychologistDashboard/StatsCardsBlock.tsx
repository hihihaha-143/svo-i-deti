import { Users, UserCheck, FileText, MessageSquare, Briefcase } from 'lucide-react';

interface StatsCardsBlockProps {
    data: {
        children: number;
        parents: number;
        mentors: number;
        anketas: number;
        messages: number;
    };
}

export default function StatsCardsBlock({ data }: StatsCardsBlockProps) {
    return (
        <div className="stats-cards">
            <div className="stats-cards__item">
                <div className="stats-cards__icon"><Users size={20} /></div>
                <div className="stats-cards__label">Дети</div>
                <div className="stats-cards__value">{data.children}</div>
            </div>
            <div className="stats-cards__item">
                <div className="stats-cards__icon"><UserCheck size={20} /></div>
                <div className="stats-cards__label">Родители</div>
                <div className="stats-cards__value">{data.parents}</div>
            </div>
            <div className="stats-cards__item">
                <div className="stats-cards__icon"><Briefcase size={20} /></div>
                <div className="stats-cards__label">Наставники</div>
                <div className="stats-cards__value">{data.mentors}</div>
            </div>
            <div className="stats-cards__item">
                <div className="stats-cards__icon"><FileText size={20} /></div>
                <div className="stats-cards__label">Анкеты</div>
                <div className="stats-cards__value">{data.anketas}</div>
            </div>
            <div className="stats-cards__item">
                <div className="stats-cards__icon"><MessageSquare size={20} /></div>
                <div className="stats-cards__label">Сообщения</div>
                <div className="stats-cards__value">{data.messages}</div>
            </div>
        </div>
    );
}