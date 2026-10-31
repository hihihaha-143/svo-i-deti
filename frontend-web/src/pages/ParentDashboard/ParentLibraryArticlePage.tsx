import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUp, BookOpen } from 'lucide-react';
import apiClient from '../../api/client';
import useToast from '../../hooks/useToast';
import '../../styles/pages/ParentDashboard/_parent-library.scss';

interface Material {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

export default function ParentLibraryArticlePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiClient.get(`/parent/materials/${id}`);
        setMaterial(res.data.data);
      } catch {
        showToast('Ошибка загрузки статьи', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return <div className="parent-library__loading">Загрузка...</div>;
  if (!material) return <div className="parent-library__loading">Статья не найдена</div>;

  return (
    <div className="parent-library parent-library--article">
      <button className="parent-library__back" onClick={() => navigate('/parent/library')}>
        <ArrowLeft size={16} />
        <span>В библиотеку</span>
      </button>

      <span className="parent-library__card-badge">
        <BookOpen size={14} />
        Статья
      </span>

      <h1 className="parent-library__article-title">{material.title}</h1>

      <div className="parent-library__article-content">
        {material.content.split('\n').map((paragraph, idx) => (
          <p key={idx}>{paragraph}</p>
        ))}
      </div>

      {showScrollTop && (
        <button className="parent-library__scroll-top" onClick={scrollToTop} title="Наверх">
          <ArrowUp size={24} />
        </button>
      )}
    </div>
  );
}