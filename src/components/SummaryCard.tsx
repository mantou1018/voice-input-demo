import type { SummaryResult } from '../types/speech';

interface SummaryCardProps {
  isLoading: boolean;
  summary: SummaryResult | null;
}

export function SummaryCard({ isLoading, summary }: SummaryCardProps) {
  if (isLoading) {
    return (
      <section className="panel summary-panel summary-panel--loading">
        <div className="panel__header">
          <p className="panel__eyebrow">Insight Card</p>
          <h2>信息卡片</h2>
        </div>
        <div className="summary-skeleton">
          <span />
          <span />
          <span />
        </div>
      </section>
    );
  }

  if (!summary) {
    return (
      <section className="panel summary-panel summary-panel--empty">
        <div className="panel__header">
          <p className="panel__eyebrow">Insight Card</p>
          <h2>信息卡片</h2>
        </div>
        <p className="summary-empty-text">
          录音结束后，这里会展示摘要、重点信息和建议跟进项。
        </p>
      </section>
    );
  }

  return (
    <section className="panel summary-panel">
      <div className="panel__header">
        <p className="panel__eyebrow">Insight Card</p>
        <h2>信息卡片</h2>
      </div>

      <div className="summary-card">
        <p className="summary-card__summary">{summary.summaryText}</p>

        <div className="summary-card__meta">
          {summary.meta.map((item) => (
            <div className="meta-pill" key={item.label}>
              <span className="meta-pill__label">{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>

        <div className="summary-card__sections">
          {summary.sections.map((section) => (
            <article className="section-card" key={section.id}>
              <h3>{section.title}</h3>
              <ul>
                {section.items.map((item, index) => (
                  <li key={`${section.id}-${index}`}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
