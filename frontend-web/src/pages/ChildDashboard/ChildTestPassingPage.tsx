import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Star, SkipForward, Palette, MousePointerClick, RotateCcw } from 'lucide-react';
import apiClient from '../../api/client';
import useToast from '../../hooks/useToast';
import Modal from '../../components/Modal/Modal';
import '../../styles/pages/ChildDashboard/_child-test-passing.scss';

interface QuestionOption {
  value?: string;
  text?: string;
  hex?: string;
}

interface Question {
  id: number;
  question_text: string;
  type: 'single' | 'scale' | 'luscher';
  order: number;
  options: QuestionOption[] | null;
  scale_min_label: string | null;
  scale_max_label: string | null;
  allow_skip: boolean;
}

interface TestData {
  id: number;
  title: string;
  description: string | null;
  motivation_text: string | null;
  coloring_file_url: string | null;
  questions: Question[];
}

interface NewAchievement {
  id: number;
  title: string;
  icon: string | null;
  stars_reward: number;
}

export default function ChildTestPassingPage() {
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
  const [starsEarned, setStarsEarned] = useState(0);
  const [coloringUrl, setColoringUrl] = useState<string | null>(null);
  const [newAchievements, setNewAchievements] = useState<NewAchievement[]>([]);

  const [selectedColors, setSelectedColors] = useState<QuestionOption[]>([]);
  const [availableColors, setAvailableColors] = useState<QuestionOption[]>([]);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  useEffect(() => {
    const start = async () => {
      try {
        const res = await apiClient.post(`/child/tests/${testId}/start`);
        setAttemptId(res.data.data.attempt_id);
        setTest(res.data.data.test);
        setColoringUrl(res.data.data.test.coloring_file_url || null);
      } catch (err: any) {
        if (err.response?.status === 409) {
          showToast('Этот тест уже пройден', 'error');
          navigate('/child');
        } else {
          showToast('Ошибка запуска теста', 'error');
          navigate('/child');
        }
      } finally {
        setLoading(false);
      }
    };
    start();
  }, [testId]);

  const currentQuestion = test?.questions[currentIndex];

  useEffect(() => {
    if (currentQuestion?.type === 'luscher' && Array.isArray(currentQuestion.options)) {
      const saved = answers[currentQuestion.id];
      if (saved?.order && Array.isArray(saved.order)) {
        const restoredSelected = saved.order
          .map((val: string) => currentQuestion.options!.find((o) => o.value === val))
          .filter(Boolean) as QuestionOption[];
        const restoredAvailable = currentQuestion.options.filter(
          (o) => !saved.order.includes(o.value)
        );
        setSelectedColors(restoredSelected);
        setAvailableColors(restoredAvailable);
      } else {
        setSelectedColors([]);
        setAvailableColors([...currentQuestion.options]);
      }
    }
  }, [currentIndex, currentQuestion]);

  const saveAnswer = async (questionId: number, value: any) => {
    if (!attemptId) return;
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    try {
      await apiClient.post(`/child/tests/${testId}/answer`, {
        attempt_id: attemptId,
        question_id: questionId,
        value_json: value,
      });
    } catch {
      showToast('Ошибка сохранения ответа', 'error');
    }
  };

  const handleSingleSelect = (idx: number, option: QuestionOption) => {
    saveAnswer(currentQuestion!.id, {
      index: idx,
      text: option.text || '',
    });
  };

  const handleScaleChange = (value: number) => {
    saveAnswer(currentQuestion!.id, { value });
  };

  const handleColorPick = (color: QuestionOption) => {
    const nextSelected = [...selectedColors, color];
    const nextAvailable = availableColors.filter((c) => c.value !== color.value);
    setSelectedColors(nextSelected);
    setAvailableColors(nextAvailable);
    saveAnswer(currentQuestion!.id, {
      order: nextSelected.map((c) => c.value),
    });
  };

  const handleColorRemove = (idx: number) => {
    const color = selectedColors[idx];
    const nextSelected = selectedColors.filter((_, i) => i !== idx);
    const nextAvailable = [...availableColors, color];
    setSelectedColors(nextSelected);
    setAvailableColors(nextAvailable);
    saveAnswer(currentQuestion!.id, {
      order: nextSelected.map((c) => c.value),
    });
  };

  const handleLuscherMove = (fromIdx: number, toIdx: number) => {
    const next = [...selectedColors];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    setSelectedColors(next);
    saveAnswer(currentQuestion!.id, {
      order: next.map((c) => c.value),
    });
  };

  const handleLuscherReset = () => {
    if (!currentQuestion?.options) return;
    setSelectedColors([]);
    setAvailableColors([...currentQuestion.options]);
    saveAnswer(currentQuestion!.id, { order: [] });
  };

  const handleSkip = () => {
    saveAnswer(currentQuestion!.id, null);
    if (currentIndex < (test?.questions.length || 0) - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      finishTest();
    }
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
      const res = await apiClient.post(`/child/tests/${testId}/finish`, {
        attempt_id: attemptId,
      });
      setMotivationText(res.data.data.motivation_text || 'Молодец, что прошёл тест!');
      setStarsEarned(res.data.data.stars_earned || 3);
      setNewAchievements(res.data.data.newly_earned || []);
      setIsFinished(true);
    } catch {
      showToast('Ошибка завершения теста', 'error');
    }
  };

  if (loading) return <div className="child-test-passing__loading">Загрузка...</div>;
  if (!test || !currentQuestion) return <div className="child-test-passing__loading">Тест не найден</div>;

  const total = test.questions.length;
  const progress = Math.round(((currentIndex + 1) / total) * 100);
  const isLuscherComplete =
    currentQuestion.type === 'luscher' &&
    currentQuestion.options &&
    selectedColors.length === currentQuestion.options.length;

  return (
    <div className="child-test-passing">
      <button className="child-test-passing__back" onClick={() => navigate('/child')}>
        <ArrowLeft size={16} />
        <span>На главную</span>
      </button>

      <h2 className="child-test-passing__title">{test.title}</h2>

      <div className="child-test-passing__progress">
        <div className="child-test-passing__progress-bar" style={{ width: `${progress}%` }} />
      </div>
      <p className="child-test-passing__counter">
        Вопрос {currentIndex + 1} из {total}
      </p>

      <div className="child-test-passing__question">
        <p className="child-test-passing__question-text">{currentQuestion.question_text}</p>

        {currentQuestion.type === 'single' && Array.isArray(currentQuestion.options) && (
          <div className="child-test-passing__options">
            {currentQuestion.options.map((opt, idx) => {
              const isSelected = answers[currentQuestion.id]?.index === idx;
              return (
                <button
                  key={idx}
                  className={`child-test-passing__option${isSelected ? ' child-test-passing__option--selected' : ''}`}
                  onClick={() => handleSingleSelect(idx, opt)}
                >
                  {opt.text || ''}
                </button>
              );
            })}
          </div>
        )}

        {currentQuestion.type === 'scale' && (
          <div className="child-test-passing__scale">
            <span className="child-test-passing__scale-label">
              {currentQuestion.scale_min_label || '1'}
            </span>
            <input
              type="range"
              min={1}
              max={10}
              value={answers[currentQuestion.id]?.value || 5}
              onChange={(e) => handleScaleChange(Number(e.target.value))}
              className="child-test-passing__scale-input"
            />
            <span className="child-test-passing__scale-label">
              {currentQuestion.scale_max_label || '10'}
            </span>
            <span className="child-test-passing__scale-value">
              {answers[currentQuestion.id]?.value || 5}
            </span>
          </div>
        )}

        {currentQuestion.type === 'luscher' && (
          <div className="child-test-passing__luscher">
            <div className="child-test-passing__luscher-tip">
              <MousePointerClick size={18} />
              <p>
                Нажимайте на цвета в порядке, который тебе больше нравится: от самого приятного
                к наименее приятному. Можно перетаскивать уже выбранные цвета, чтобы поменять порядок.
              </p>
            </div>

            {availableColors.length > 0 && (
              <div className="child-test-passing__luscher-grid">
                {availableColors.map((color) => (
                  <button
                    key={color.value}
                    className="child-test-passing__luscher-card"
                    style={{ backgroundColor: color.hex }}
                    onClick={() => handleColorPick(color)}
                    type="button"
                  >
                    <span className="child-test-passing__luscher-card-label">{color.text}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="child-test-passing__luscher-selected">
              <div className="child-test-passing__luscher-selected-header">
                <span>Ваш выбор (по порядку):</span>
                {selectedColors.length > 0 && (
                  <button
                    className="child-test-passing__luscher-reset"
                    onClick={handleLuscherReset}
                    type="button"
                  >
                    <RotateCcw size={14} />
                    Начать заново
                  </button>
                )}
              </div>

              {selectedColors.length === 0 ? (
                <p className="child-test-passing__luscher-empty">
                  Пока ничего не выбрано. Нажмите на цвет выше.
                </p>
              ) : (
                <ul className="child-test-passing__luscher-picked">
                  {selectedColors.map((color, idx) => (
                    <li
                      key={color.value}
                      className="child-test-passing__luscher-picked-item"
                      style={{ backgroundColor: color.hex }}
                      draggable
                      onDragStart={() => setDraggedIdx(idx)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => {
                        if (draggedIdx !== null && draggedIdx !== idx) {
                          handleLuscherMove(draggedIdx, idx);
                        }
                        setDraggedIdx(null);
                      }}
                      onClick={() => handleColorRemove(idx)}
                    >
                      <span className="child-test-passing__luscher-picked-num">{idx + 1}</span>
                      <span className="child-test-passing__luscher-picked-label">{color.text}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="child-test-passing__nav">
        <button
          className="child-test-passing__nav-btn child-test-passing__nav-btn--prev"
          onClick={goPrev}
          disabled={currentIndex === 0}
        >
          <ArrowLeft size={18} />
          Назад
        </button>

        {currentQuestion.allow_skip && (
          <button
            className="child-test-passing__nav-btn child-test-passing__nav-btn--skip"
            onClick={handleSkip}
          >
            <SkipForward size={18} />
            Пропустить
          </button>
        )}

        <button
          className="child-test-passing__nav-btn child-test-passing__nav-btn--next"
          onClick={goNext}
          disabled={currentQuestion.type === 'luscher' && !isLuscherComplete}
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

      <Modal isOpen={isFinished} onClose={() => navigate('/child')} title="Тест пройден!">
        <div className="child-test-passing__result">
          <p className="child-test-passing__result-text">{motivationText}</p>
          <p className="child-test-passing__result-stars">
            <Star size={20} fill="currentColor" /> +{starsEarned} звезды
          </p>

          {newAchievements.length > 0 && (
            <div className="child-test-passing__result-achievements">
              <p className="child-test-passing__result-achievements-title">Новые достижения:</p>
              {newAchievements.map((ach) => (
                <div key={ach.id} className="child-test-passing__result-achievement">
                  <p>{ach.title}</p>
                  {ach.stars_reward > 0 && (
                    <p>+{ach.stars_reward} звёзд</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {coloringUrl && (
            <button
              className="child-test-passing__result-coloring-btn"
              onClick={() => navigate(`/child/coloring/${testId}`)}
            >
              <Palette size={18} />
              Открыть раскраску
            </button>
          )}

          <button
            className="child-test-passing__result-btn"
            onClick={() => navigate('/child')}
          >
            На главную
          </button>
        </div>
      </Modal>
    </div>
  );
}