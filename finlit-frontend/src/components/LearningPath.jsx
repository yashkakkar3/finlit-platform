import { Link } from 'react-router-dom';

// Places each lesson node along a rising exponential curve (y = a * e^(kx)),
// echoing the "Compound Interest" module this whole app is teaching toward.
// Curve is drawn once in SVG; nodes are absolutely positioned on top of it.
export default function LearningPath({ tree }) {
  const width = 720;
  const nodeCount = tree.length;
  const paddingX = 60;
  const paddingY = 40;
  const usableWidth = width - paddingX * 2;
  const rowHeight = 130;
  const height = paddingY * 2 + rowHeight * (nodeCount - 1) + 60;

  // Compute (x, y) for each node along a gentle exponential rise,
  // read bottom-to-top (earliest lesson at the bottom, like a savings
  // balance growing upward over time).
  const points = tree.map((_, i) => {
    const t = i / Math.max(nodeCount - 1, 1);
    const curveX = paddingX + Math.sin(t * Math.PI * 1.4) * (usableWidth * 0.32) + usableWidth * 0.34;
    const y = height - paddingY - i * rowHeight;
    return { x: curveX, y };
  });

  const pathD = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .reduce((acc, seg, i) => {
      if (i === 0) return seg;
      const prev = points[i - 1];
      const curr = points[i];
      const midY = (prev.y + curr.y) / 2;
      return `${acc} C ${prev.x} ${midY}, ${curr.x} ${midY}, ${curr.x} ${curr.y}`;
    }, '');

  return (
    <div className="relative mx-auto" style={{ width, height }}>
      <svg width={width} height={height} className="absolute inset-0">
        <path d={pathD} fill="none" stroke="#2FA88A" strokeOpacity="0.25" strokeWidth="4" strokeLinecap="round" />
      </svg>

      {tree.map((lesson, i) => {
        const { x, y } = points[i];
        const isNewModule = i === 0 || tree[i - 1].module_id !== lesson.module_id;

        return (
          <div key={lesson.lesson_id} className="absolute" style={{ left: x - 34, top: y - 34 }}>
            {isNewModule && (
              <p className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap font-display text-xs font-medium text-ledger/50 tracking-wide">
                {lesson.module_title}
              </p>
            )}
            <NodeButton lesson={lesson} />
          </div>
        );
      })}
    </div>
  );
}

function NodeButton({ lesson }) {
  const { state, lesson_id, xp_reward } = lesson;

  const base = 'w-[68px] h-[68px] rounded-full flex flex-col items-center justify-center font-mono text-xs font-semibold shadow-sm transition-transform';

  if (state === 'locked') {
    return (
      <div
        className={`${base} bg-ledger/10 text-ledger/30 cursor-not-allowed`}
        title="Complete the previous lesson to unlock"
      >
        <span aria-hidden="true">🔒</span>
      </div>
    );
  }

  if (state === 'passed') {
    return (
      <Link
        to={`/lesson/${lesson_id}`}
        className={`${base} bg-gold text-ledger hover:scale-105`}
        title={`${lesson.lesson_title} — passed`}
      >
        <span aria-hidden="true">🪙</span>
        <span>+{xp_reward}</span>
      </Link>
    );
  }

  // unlocked
  return (
    <Link
      to={`/lesson/${lesson_id}`}
      className={`${base} bg-mint text-white hover:scale-105 ring-4 ring-mint/25`}
      title={lesson.lesson_title}
    >
      <span aria-hidden="true">▶</span>
      <span>+{xp_reward}</span>
    </Link>
  );
}
