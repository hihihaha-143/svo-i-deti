import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, GripVertical } from 'lucide-react';
import apiClient from '../../api/client';
import useToast from '../../hooks/useToast';
import Modal from '../../components/Modal/Modal';
import '../../styles/pages/ParentDashboard/_parent-test-passing.scss';

interface Question {
  id: number;
  question_text: string;
  type: 'single' | 'scale' | 'luscher';
  order: number;
  options: any;
  scale_min_label: string | null;
  scale_max_label: string | null;
  allow_skip: boolean;
}

interface TestData {
  id: number;
  title: string;
  description: string | null;
  motivation_text: string | null;
  questions: Question[];
}

export default function ParentTestPassingPage() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [test, setTest] = useState<TestData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [motivationText, setMotivationText] = useState('');

  // Состояние для Люшера (порядок цветов)
  const [luscherOrder, setLuscherOrder] = useState<string[]>([]);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  useEffect(() => {
    const start = async () => {
      try {
        const res = await apiClient.post(`/parent/tests/${testId}/start`);
        setAttemptId(res.data.data.attempt_id);
        setTest(res.data.data.test);
      } catch (err: any) {
        if (err.response?.status === 409) {
          showToast('Этот тест уже пройден', 'error');
          navigate('/parent');
        } else {
          showToast('Ошибка запуска теста', 'error');
          navigate('/parent');
        }
      } finally {
        setLoading(false);
      }
    };
    start();
  }, [testId]);

  const currentQuestion = test?.questions[currentIndex];

  // Инициализация Люшера при переходе к вопросу
  useEffect(() => {
    if (currentQuestion?.type === 'luscher' && Array.isArray(currentQuestion.options)) {
      const saved = answers[currentQuestion.id];
      const initial = saved?.order || currentQuestion.options.map((o: any) => o.text || o.value || o);
      setLuscherOrder(initial);
    }
  }, [currentIndex, currentQuestion]);

  const saveAnswer = async (questionId: number, value: any) => {
    if (!attemptId) return;
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    try {
      await apiClient.post(`/parent/tests/${testId}/answer`, {
        attempt_id: attemptId,
        question_id: questionId,
        value_json: value,
      });
    } catch {
      showToast('Ошибка сохранения ответа', 'error');
    }
  };

  const handleSingleSelect = (idx: number, option: any) => {
    saveAnswer(currentQuestion!.id, {
      index: idx,
      text: option.text || option,
      option_id: idx + 1,
    });
  };

  const handleScaleChange = (value: number) => {
    saveAnswer(currentQuestion!.id, { value });
  };

  const handleLuscherMove = (fromIdx: number, toIdx: number) => {
    const next = [...luscherOrder];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    setLuscherOrder(next);
    saveAnswer(currentQuestion!.id, { order: next });
  };

  const handleLuscherClick = (idx: number) => {
    if (idx === 0) return;
    handleLuscherMove(idx, 0);
  };

  const goNext = () => {
    if (currentIndex < (test?.questions.length || 0) - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      finishTest();
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const finishTest = async () => {
    if (!attemptId) return;
    try {
      const res = await apiClient.post(`/parent/tests/${testId}/finish`, {
        attempt_id: attemptId,
      });
      setMotivationText(res.data.data.motivation_text || 'Молодец, что прошёл тест!');
      setIsFinished(true);
    } catch {
      showToast('Ошибка завершения теста', 'error');
    }
  };

  if (loading) return <div className="parent-test-passing__loading">Загрузка...</div>;
  if (!test || !currentQuestion) return <div className="parent-test-passing__loading">Тест не найден</div>;

  const total = test.questions.length;
  const progress = Math.round(((currentIndex + 1) / total) * 100);

  return (
    <div className="parent-test-passing">
      <button className="parent-test-passing__back" onClick={() => navigate('/parent')}>
        <ArrowLeft size={16} />
        <span>На главную</span>
      </button>

      <h2 className="parent-test-passing__title">{test.title}</h2>

      <div className="parent-test-passing__progress">
        <div className="parent-test-passing__progress-bar" style={{ width: `${progress}%` }} />
      </div>
      <p className="parent-test-passing__counter">
        Вопрос {currentIndex + 1} из {total}
      </p>

      <div className="parent-test-passing__question">
        <p className="parent-test-passing__question-text">{currentQuestion.question_text}</p>

        {currentQuestion.type === 'single' && Array.isArray(currentQuestion.options) && (
          <div className="parent-test-passing__options">
            {currentQuestion.options.map((opt: any, idx: number) => {
              const isSelected = answers[currentQuestion.id]?.index === idx;
              return (
                <button
                  key={idx}
                  className={`parent-test-passing__option${isSelected ? ' parent-test-passing__option--selected' : ''}`}
                  onClick={() => handleSingleSelect(idx, opt)}
                >
                  {opt.text || opt}
                </button>
              );
            })}
          </div>
        )}

        {currentQuestion.type === 'scale' && (
          <div className="parent-test-passing__scale">
            <span className="parent-test-passing__scale-label">
              {currentQuestion.scale_min_label || '1'}
            </span>
            <input
              type="range"
              min={1}
              max={10}
              value={answers[currentQuestion.id]?.value || 5}
              onChange={(e) => handleScaleChange(Number(e.target.value))}
              className="parent-test-passing__scale-input"
            />
            <span className="parent-test-passing__scale-label">
              {currentQuestion.scale_max_label || '10'}
            </span>
            <span className="parent-test-passing__scale-value">
              {answers[currentQuestion.id]?.value || 5}
            </span>
          </div>
        )}

        {currentQuestion.type === 'luscher' && (
          <div className="parent-test-passing__luscher">
            <p className="parent-test-passing__luscher-hint">
              Перетащите цвета или нажмите, чтобы поставить на первое место
            </p>
            <ul className="parent-test-passing__luscher-list">
              {luscherOrder.map((item, idx) => (
                <li
                  key={`${item}-${idx}`}
                  className="parent-test-passing__luscher-item"
                  draggable
                  onDragStart={() => setDraggedIdx(idx)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (draggedIdx !== null && draggedIdx !== idx) {
                      handleLuscherMove(draggedIdx, idx);
                    }
                    setDraggedIdx(null);
                  }}
                  onClick={() => handleLuscherClick(idx)}
                >
                  <GripVertical size={16} />
                  <span className="parent-test-passing__luscher-num">{idx + 1}</span>
                  <span className="parent-test-passing__luscher-text">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="parent-test-passing__nav">
        <button
          className="parent-test-passing__nav-btn parent-test-passing__nav-btn--prev"
          onClick={goPrev}
          disabled={currentIndex === 0}
        >
          <ArrowLeft size={18} />
          Назад
        </button>
        <button
          className="parent-test-passing__nav-btn parent-test-passing__nav-btn--next"
          onClick={goNext}
        >
          {currentIndex === total - 1 ? (
            <>
              <Check size={18} />
              Завершить
            </>
          ) : (
            <>
              Далее
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>

      <Modal isOpen={isFinished} onClose={() => navigate('/parent')} title="Тест пройден!">
        <div className="parent-test-passing__result">
          <p className="parent-test-passing__result-text">{motivationText}</p>
          <button
            className="parent-test-passing__result-btn"
            onClick={() => navigate('/parent')}
          >
            На главную
          </button>
        </div>
      </Modal>
    </div>
  );
}