import { Users, Baby, UserCheck, Briefcase } from 'lucide-react';

interface OnlineCardsBlockProps {
    data: {
        online_total: number;
        online_children: number;
        online_parents: number;
        online_mentors: number;
    };
}

export default function OnlineCardsBlock({ data }: OnlineCardsBlockProps) {
    return (
        <div className="online-cards">
            <div className="online-cards__item online-cards__item--active">
                <div className="online-cards__icon"><Users size={20} /></div>
                <div className="online-cards__label">Сейчас на сайте всего:</div>
                <div className="online-cards__value">{data.online_total}</div>
                <div className="online-cards__subtext">за последние 5 минут</div>
            </div>
            <div className="online-cards__item">
                <div className="online-cards__icon"><Baby size={20} /></div>
                <div className="online-cards__label">Сейчас на сайте детей:</div>
                <div className="online-cards__value">{data.online_children}</div>
            </div>
            <div className="online-cards__item">
                <div className="online-cards__icon"><UserCheck size={20} /></div>
                <div className="online-cards__label">Сейчас на сайте родителей:</div>
                <div className="online-cards__value">{data.online_parents}</div>
            </div>
            <div className="online-cards__item">
                <div className="online-cards__icon"><Briefcase size={20} /></div>
                <div className="online-cards__label">Сейчас на сайте наставников:</div>
                <div className="online-cards__value">{data.online_mentors}</div>
            </div>
        </div>
    );
}