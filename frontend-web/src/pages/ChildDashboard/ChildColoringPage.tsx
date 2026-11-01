import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Palette, Eraser, RotateCcw, Download, Star } from 'lucide-react';
import apiClient from '../../api/client';
import Modal from '../../components/Modal/Modal';
import '../../styles/pages/ChildDashboard/_child-coloring.scss';

import coloring1 from '../../assets/color/2fNaTwqQX7zGUQdWCqAprE4n56DER5tB3iu29V59.jpg';
import coloring2 from '../../assets/color/4lQocoOYx9ARRvy26UubLeSVMaPZNHXviLzJx9Gv.jpg';
import coloring3 from '../../assets/color/DVfOVkriAIVaHs1NtpaWr01jgrYuRFgMIYIZ97LT.jpg';
import coloring4 from '../../assets/color/GrT4yzX1XJUB5lNLHSkNqtHprue6BIBMVbBbry0c.jpg';
import coloring5 from '../../assets/color/JAu1Q85flnWFaif7YLtQigPfN4IWNH06oIlfQdlR.jpg';
import coloring6 from '../../assets/color/LPMTIzlu5JiE3VV4VsEuinYPlkoibcw1AGXut41p.jpg';
import coloring7 from '../../assets/color/Ty5apOLdd0SbMOQKA6g5MKGulZ9GhCWQ6NblxbCy.jpg';
import coloring8 from '../../assets/color/hW1j5wp2eJsBl4306FvhCATitnh6bbaQO3IGStTv.jpg';
import coloring9 from '../../assets/color/pRJAEZY53GJHfmIyhrBWEmhBA7jCs6WTjU88pHka.jpg';
import coloring10 from '../../assets/color/yBQ7BEFNdoLoRC6A0dx4kKmlqNQqb2J2rDtUqaWo.jpg';

interface Coloring {
  id: number;
  title: string;
  url: string;
}

interface NewAchievement {
  id: number;
  title: string;
  stars_reward: number;
}

const COLORINGS: Coloring[] = [
  { id: 1, title: 'Самостоятельность', url: coloring1 },
  { id: 2, title: 'Эмоционально-волевая сфера', url: coloring2 },
  { id: 3, title: 'Ответственность', url: coloring3 },
  { id: 4, title: 'Креативность', url: coloring4 },
  { id: 5, title: 'Организованность', url: coloring5 },
  { id: 6, title: 'Оценка общительности', url: coloring6 },
  { id: 7, title: 'Тест Люшера', url: coloring7 },
  { id: 8, title: 'Раскраска 8', url: coloring8 },
  { id: 9, title: 'Раскраска 9', url: coloring9 },
  { id: 10, title: 'Раскраска 10', url: coloring10 },
];

const COLORS = [
  '#1c1c1c', '#ffffff', '#e74c3c', '#e67e22', '#f1c40f',
  '#2ecc71', '#1abc9c', '#3498db', '#9b59b6', '#e91e63',
  '#795548', '#95a5a6',
];

export default function ChildColoringPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Coloring | null>(null);
  const [color, setColor] = useState('#1c1c1c');
  const [brushSize, setBrushSize] = useState(5);
  const [isEraser, setIsEraser] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [newAchievements, setNewAchievements] = useState<NewAchievement[]>([]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const coloringSentRef = useRef(false);

  useEffect(() => {
    coloringSentRef.current = false;

    if (!selected) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = selected.url;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctxRef.current = ctx;
    };
  }, [selected]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX: number, clientY: number;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    lastPos.current = getPos(e);

    if (selected && !coloringSentRef.current) {
      coloringSentRef.current = true;
      apiClient.post(`/child/colorings/${selected.id}/use`)
        .then((res) => {
          if (res.data.newly_earned?.length > 0) {
            setNewAchievements(res.data.newly_earned);
          }
        })
        .catch(() => {});
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !ctxRef.current) return;
    e.preventDefault();

    const pos = getPos(e);
    const ctx = ctxRef.current;
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.globalCompositeOperation = isEraser ? 'destination-out' : 'source-over';

    if (lastPos.current) {
      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
    lastPos.current = pos;
  };

  const stopDraw = () => {
    setIsDrawing(false);
    lastPos.current = null;
  };

  const clearCanvas = () => {
    if (!selected || !canvasRef.current || !ctxRef.current) return;
    const canvas = canvasRef.current;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = selected.url;
    img.onload = () => {
      ctxRef.current!.clearRect(0, 0, canvas.width, canvas.height);
      ctxRef.current!.drawImage(img, 0, 0);
    };
  };

  const downloadCanvas = () => {
    if (!canvasRef.current || !selected) return;
    const link = document.createElement('a');
    link.download = `${selected.title}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  if (selected) {
    return (
      <div className="child-coloring">
        <button className="child-coloring__back" onClick={() => setSelected(null)}>
          <ArrowLeft size={16} />
          <span>К списку раскрасок</span>
        </button>

        <h1 className="child-coloring__title">{selected.title}</h1>

        <div className="child-coloring__toolbar">
          <div className="child-coloring__palette">
            {COLORS.map((c) => (
              <button
                key={c}
                className={`child-coloring__color${color === c && !isEraser ? ' child-coloring__color--active' : ''}`}
                style={{ backgroundColor: c }}
                onClick={() => { setColor(c); setIsEraser(false); }}
                title={c}
              />
            ))}
          </div>

          <div className="child-coloring__tools">
            <label className="child-coloring__brush-label">
              Кисть:
              <input
                type="range"
                min={2}
                max={30}
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
              />
            </label>
            <button
              className={`child-coloring__tool-btn${isEraser ? ' child-coloring__tool-btn--active' : ''}`}
              onClick={() => setIsEraser(!isEraser)}
              title="Ластик"
            >
              <Eraser size={18} />
            </button>
            <button className="child-coloring__tool-btn" onClick={clearCanvas} title="Очистить">
              <RotateCcw size={18} />
            </button>
            <button className="child-coloring__tool-btn" onClick={downloadCanvas} title="Скачать">
              <Download size={18} />
            </button>
          </div>
        </div>

        <div className="child-coloring__canvas-wrapper">
          <canvas
            ref={canvasRef}
            className="child-coloring__canvas"
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={stopDraw}
          />
        </div>

        <Modal
          isOpen={newAchievements.length > 0}
          onClose={() => setNewAchievements([])}
          title="Новое достижение!"
        >
          <div className="child-coloring__achievement-modal">
            {newAchievements.map((ach) => (
              <div key={ach.id} className="child-coloring__achievement-item">
                <p className="child-coloring__achievement-title">{ach.title}</p>
                {ach.stars_reward > 0 && (
                  <p className="child-coloring__achievement-stars">
                    <Star size={16} fill="currentColor" /> +{ach.stars_reward} звёзд
                  </p>
                )}
              </div>
            ))}
            <button
              className="child-coloring__achievement-btn"
              onClick={() => setNewAchievements([])}
            >
              Отлично!
            </button>
          </div>
        </Modal>
      </div>
    );
  }

  return (
    <div className="child-coloring">
      <button className="child-coloring__back" onClick={() => navigate('/child')}>
        <ArrowLeft size={16} />
        <span>Назад</span>
      </button>

      <h1 className="child-coloring__title">
        <Palette size={28} />
        Раскраски
      </h1>

      <div className="child-coloring__grid">
        {COLORINGS.map((c) => (
          <button
            key={c.id}
            className="child-coloring__card"
            onClick={() => setSelected(c)}
          >
            <img src={c.url} alt={c.title} className="child-coloring__card-img" />
            <span className="child-coloring__card-title">{c.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}