import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, ArrowRight } from 'lucide-react';
import apiClient from '../../api/client';
import useToast from '../../hooks/useToast';
import '../../styles/pages/ParentDashboard/_parent-library.scss';

interface Material {
  id: number;
  title: string;
  excerpt: string;
  created_at: string;
}

export default function ParentLibraryPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiClient.get('/parent/materials');
        setMaterials(res.data.data || []);
      } catch {
        showToast('Ошибка загрузки библиотеки', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="parent-library__loading">Загрузка...</div>;

  return (
    <div className="parent-library">
      <button className="parent-library__back" onClick={() => navigate('/parent')}>
        <ArrowLeft size={16} />
        <span>На главную</span>
      </button>

      <h2 className="parent-library__page-title">
        <BookOpen size={24} />
        Библиотека знаний
      </h2>

      {materials.length === 0 ? (
        <div className="parent-library__block">
          <p className="parent-library__empty">Материалов пока нет</p>
        </div>
      ) : (
        <ul className="parent-library__list">
          {materials.map((m) => (
            <li key={m.id} className="parent-library__card">
              <span className="parent-library__card-badge">
                <BookOpen size={14} />
                Статья
              </span>
              <h3 className="parent-library__card-title">{m.title}</h3>
              <p className="parent-library__card-excerpt">{m.excerpt}</p>
              <button
                className="parent-library__card-more"
                onClick={() => navigate(`/parent/library/${m.id}`)}
              >
                Читать далее
                <ArrowRight size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
