'use client';
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const DAYS    = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS   = ['6am','9am','12pm','3pm','6pm','9pm','12am'];
const HOUR_VALS = [6, 9, 12, 15, 18, 21, 0];

// Generate mock posting heatmap data
function generateHeatmapData() {
  const data: { day: number; hour: number; value: number }[] = [];
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      // Peak times: weekday evenings and weekend afternoons
      const isWeekend    = d >= 5;
      const isEvening    = h >= 18 && h <= 22;
      const isAfternoon  = h >= 12 && h <= 16;
      const isLunchtime  = h >= 11 && h <= 13;

      let base = 10;
      if (isEvening)                    base += 60;
      if (isAfternoon && isWeekend)     base += 40;
      if (isLunchtime && !isWeekend)    base += 30;
      if (h < 6 || h > 23)             base = 2;

      data.push({
        day:   d,
        hour:  h,
        value: Math.max(0, base + Math.random() * 20 - 10),
      });
    }
  }
  return data;
}

export function PostingHeatmap() {
  const ref  = useRef<SVGSVGElement>(null);
  const data = generateHeatmapData();

  useEffect(() => {
    if (!ref.current) return;

    const svg    = d3.select(ref.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 30, left: 36 };
    const width  = ref.current.clientWidth  - margin.left - margin.right;
    const height = ref.current.clientHeight - margin.top  - margin.bottom;

    const cellW  = width  / 24;
    const cellH  = height / 7;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const maxVal = d3.max(data, (d) => d.value) || 100;

    // Color scale using brand purple
    const colorScale = d3.scaleSequential()
      .domain([0, maxVal])
      .interpolator(d3.interpolate('#F4F0F9', '#5E3088'));

    // Draw cells
    g.selectAll('rect')
      .data(data)
      .join('rect')
      .attr('x',      (d) => d.hour * cellW)
      .attr('y',      (d) => d.day  * cellH)
      .attr('width',  cellW - 2)
      .attr('height', cellH - 2)
      .attr('rx',     3)
      .attr('fill',   (d) => colorScale(d.value))
      .append('title')
      .text((d) =>
        `${DAYS[d.day]} ${d.hour}:00 — ${Math.round(d.value)} posts`
      );

    // Day labels (Y axis)
    g.selectAll('.day-label')
      .data(DAYS)
      .join('text')
      .attr('class', 'day-label')
      .attr('x',     -8)
      .attr('y',     (_, i) => i * cellH + cellH / 2)
      .attr('dy',    '0.35em')
      .attr('text-anchor', 'end')
      .attr('font-size',   10)
      .attr('fill',        '#7A6A8A')
      .text((d) => d);

    // Hour labels (X axis) — only show some
    g.selectAll('.hour-label')
      .data(HOURS)
      .join('text')
      .attr('class', 'hour-label')
      .attr('x',     (_, i) => HOUR_VALS[i] * cellW + cellW / 2)
      .attr('y',     height + 20)
      .attr('text-anchor', 'middle')
      .attr('font-size',   10)
      .attr('fill',        '#7A6A8A')
      .text((d) => d);

  }, [data]);

  return (
    <svg
      ref={ref}
      style={{ width: '100%', height: 200 }}
    />
  );
}