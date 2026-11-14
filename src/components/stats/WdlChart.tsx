import { Bar, BarChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AXIS_PROPS, Legend, TooltipBox, WDL_COLORS, WDL_INK, fmtPct } from './chartKit';
import type { WdlRow } from './profileStats';

/** Étiquette directe en % dans le segment, seulement s'il est assez large pour la porter. */
const pctLabel = (v: unknown) => {
  const n = Number(v);
  return n >= 12 ? `${Math.round(n)} %` : '';
};

/** Barres horizontales empilées V/N/D en %, une ligne par catégorie. */
export default function WdlChart({ rows, labelWidth = 72 }: { rows: WdlRow[]; labelWidth?: number }) {
  const data = rows.filter((r) => r.total > 0);
  if (data.length === 0) return <p className="muted">Pas de parties.</p>;
  const labelStyle = { fontSize: 12, fontWeight: 700 } as const;
  return (
    <div>
      <Legend
        items={[
          { color: WDL_COLORS.win, label: 'Victoires' },
          { color: WDL_COLORS.draw, label: 'Nulles' },
          { color: WDL_COLORS.loss, label: 'Défaites' },
        ]}
      />
      <ResponsiveContainer width="100%" height={data.length * 44 + 30}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 8, bottom: 0, left: 0 }} barCategoryGap={10}>
          <XAxis type="number" domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(v) => `${v} %`} {...AXIS_PROPS} />
          <YAxis type="category" dataKey="label" width={labelWidth} {...AXIS_PROPS} axisLine={false} />
          <Tooltip
            cursor={{ fill: 'var(--viz-hover)' }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const r = payload[0].payload as WdlRow;
              return (
                <TooltipBox
                  title={`${r.label} · ${r.total} parties`}
                  rows={[
                    { color: WDL_COLORS.win, label: 'Victoires', value: `${r.win} (${fmtPct(r.winPct)})` },
                    { color: WDL_COLORS.draw, label: 'Nulles', value: `${r.draw} (${fmtPct(r.drawPct)})` },
                    { color: WDL_COLORS.loss, label: 'Défaites', value: `${r.loss} (${fmtPct(r.lossPct)})` },
                    { label: 'Score', value: fmtPct(r.score) },
                  ]}
                />
              );
            }}
          />
          <Bar dataKey="winPct" stackId="a" fill={WDL_COLORS.win} stroke="var(--surface)" strokeWidth={2} radius={[4, 0, 0, 4]} isAnimationActive={false}>
            <LabelList dataKey="winPct" position="center" formatter={pctLabel} style={{ ...labelStyle, fill: WDL_INK.win }} />
          </Bar>
          <Bar dataKey="drawPct" stackId="a" fill={WDL_COLORS.draw} stroke="var(--surface)" strokeWidth={2} isAnimationActive={false}>
            <LabelList dataKey="drawPct" position="center" formatter={pctLabel} style={{ ...labelStyle, fill: WDL_INK.draw }} />
          </Bar>
          <Bar dataKey="lossPct" stackId="a" fill={WDL_COLORS.loss} stroke="var(--surface)" strokeWidth={2} radius={[0, 4, 4, 0]} isAnimationActive={false}>
            <LabelList dataKey="lossPct" position="center" formatter={pctLabel} style={{ ...labelStyle, fill: WDL_INK.loss }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
