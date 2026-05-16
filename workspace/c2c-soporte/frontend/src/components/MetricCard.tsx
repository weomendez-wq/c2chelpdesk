type MetricCardTone = "neutral" | "success" | "warning" | "urgent" | "info";

type MetricCardProps = {
  label: string;
  value: string;
  helper?: string;
  tone?: MetricCardTone;
};

export const MetricCard = ({ label, value, helper, tone = "neutral" }: MetricCardProps) => (
  <article className={`metric-card tone-${tone}`}>
    <span>{label}</span>
    <strong>{value}</strong>
    {helper ? <small>{helper}</small> : null}
  </article>
);
