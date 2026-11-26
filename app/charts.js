/* StatAtlas charts: small hand-written SVG builders. No chart library
   is used; every bar and line is drawn from the numbers in data.js,
   so the charts work offline and stay tiny. All functions return an
   SVG string with a title and labelled values for screen readers. */
'use strict';

function escText(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function niceMax(v) {
  var p = Math.pow(10, Math.floor(Math.log10(v)));
  var n = v / p;
  var step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return step * p;
}

/* Horizontal bars: one row per item, label on the left, value at the
   end of the bar. items: [{label, value, href}]. highlight: a label
   whose bar is drawn in the accent colour. */
function hbarChart(items, formatValue, highlight) {
  var max = 0;
  for (var i = 0; i < items.length; i++) max = Math.max(max, items[i].value);
  max = niceMax(max * 1.05);
  var rowH = 34, labelW = 110, valueW = 86, top = 8;
  var width = 640;
  var height = top + items.length * rowH + 8;
  var plotW = width - labelW - valueW;
  var out = [];
  out.push('<svg viewBox="0 0 ' + width + ' ' + height + '" role="img" aria-label="Bar chart" class="chart">');
  for (var j = 0; j < items.length; j++) {
    var it = items[j];
    var y = top + j * rowH;
    var w = Math.max(2, it.value / max * plotW);
    var hot = highlight && it.label === highlight;
    var bar = hot ? '#c2410c' : '#1d4ed8';
    var label = escText(it.label);
    var row = '<text x="' + (labelW - 10) + '" y="' + (y + 19) + '" text-anchor="end" class="chart-label">' + label + '</text>'
      + '<rect x="' + labelW + '" y="' + (y + 5) + '" width="' + w.toFixed(1) + '" height="18" rx="3" fill="' + bar + '">'
      + '<title>' + label + ': ' + escText(formatValue(it.value)) + '</title></rect>'
      + '<text x="' + (labelW + w + 8) + '" y="' + (y + 19) + '" class="chart-value">' + escText(formatValue(it.value)) + '</text>';
    if (it.href) row = '<a href="' + escText(it.href) + '">' + row + '</a>';
    out.push('<g>' + row + '</g>');
  }
  out.push('</svg>');
  return out.join('');
}

/* Vertical bars: one column per item, value on top, label below.
   Used for the five-year population trend of one country. */
function vbarChart(pairs, formatValue, title) {
  var max = 0;
  for (var i = 0; i < pairs.length; i++) max = Math.max(max, pairs[i].value);
  var lo = Math.min.apply(null, pairs.map(function (p) { return p.value; }));
  var base = lo * 0.92;
  var range = max - base;
  var width = 640, height = 260, bottom = 34, top = 30;
  var plotH = height - top - bottom;
  var slot = width / pairs.length;
  var barW = Math.min(64, slot * 0.55);
  var out = [];
  out.push('<svg viewBox="0 0 ' + width + ' ' + height + '" role="img" aria-label="' + escText(title) + '" class="chart">');
  out.push('<text x="8" y="18" class="chart-title">' + escText(title) + '</text>');
  for (var j = 0; j < pairs.length; j++) {
    var p = pairs[j];
    var h = (p.value - base) / range * plotH;
    var x = j * slot + (slot - barW) / 2;
    var y = top + (plotH - h);
    out.push('<g><rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + barW.toFixed(1) + '" height="' + h.toFixed(1) + '" rx="3" fill="#1d4ed8">'
      + '<title>' + escText(p.label) + ': ' + escText(formatValue(p.value)) + '</title></rect>'
      + '<text x="' + (x + barW / 2).toFixed(1) + '" y="' + (y - 6).toFixed(1) + '" text-anchor="middle" class="chart-value">' + escText(formatValue(p.value)) + '</text>'
      + '<text x="' + (x + barW / 2).toFixed(1) + '" y="' + (height - 12) + '" text-anchor="middle" class="chart-label">' + escText(p.label) + '</text></g>');
  }
  out.push('</svg>');
  return out.join('');
}

/* Line chart: several series on shared axes, one colour each, with a
   legend and end labels. series: [{label, values, color}]. */
function lineChart(series, years, formatValue, title) {
  var all = [];
  for (var i = 0; i < series.length; i++) all = all.concat(series[i].values);
  var lo = Math.min.apply(null, all);
  var hi = Math.max.apply(null, all);
  var pad = (hi - lo) * 0.12 || 1;
  lo -= pad; hi += pad;
  var width = 640, height = 300, left = 64, right = 110, top = 34, bottom = 34;
  var plotW = width - left - right, plotH = height - top - bottom;
  function px(k) { return left + k / (years.length - 1) * plotW; }
  function py(v) { return top + (1 - (v - lo) / (hi - lo)) * plotH; }
  var out = [];
  out.push('<svg viewBox="0 0 ' + width + ' ' + height + '" role="img" aria-label="' + escText(title) + '" class="chart">');
  out.push('<text x="8" y="18" class="chart-title">' + escText(title) + '</text>');
  for (var g = 0; g <= 4; g++) {
    var v = lo + (hi - lo) * g / 4;
    var y = py(v);
    out.push('<line x1="' + left + '" y1="' + y.toFixed(1) + '" x2="' + (width - right) + '" y2="' + y.toFixed(1) + '" class="chart-grid"/>'
      + '<text x="' + (left - 8) + '" y="' + (y + 4).toFixed(1) + '" text-anchor="end" class="chart-label">' + escText(formatValue(v)) + '</text>');
  }
  for (var s = 0; s < series.length; s++) {
    var se = series[s];
    var pts = [];
    for (var k = 0; k < se.values.length; k++) pts.push(px(k).toFixed(1) + ',' + py(se.values[k]).toFixed(1));
    out.push('<polyline points="' + pts.join(' ') + '" fill="none" stroke="' + se.color + '" stroke-width="2.5" stroke-linejoin="round"/>');
    for (var m = 0; m < se.values.length; m++) {
      out.push('<circle cx="' + px(m).toFixed(1) + '" cy="' + py(se.values[m]).toFixed(1) + '" r="3.5" fill="' + se.color + '">'
        + '<title>' + escText(se.label) + ' ' + years[m] + ': ' + escText(formatValue(se.values[m])) + '</title></circle>');
    }
  }
  /* End labels, pushed apart so two lines that finish close together
     never print on top of each other. */
  var ends = series.map(function (se) {
    return { label: se.label, color: se.color, y: py(se.values[se.values.length - 1]) };
  }).sort(function (a, b) { return a.y - b.y; });
  for (var e = 1; e < ends.length; e++) {
    if (ends[e].y - ends[e - 1].y < 16) ends[e].y = ends[e - 1].y + 16;
  }
  for (var f = ends.length - 1; f >= 0; f--) {
    if (ends[f].y > top + plotH) ends[f].y = top + plotH;
  }
  for (var g2 = 0; g2 < ends.length; g2++) {
    out.push('<text x="' + (width - right + 8) + '" y="' + (ends[g2].y + 4).toFixed(1) + '" class="chart-legend" fill="' + ends[g2].color + '">' + escText(ends[g2].label) + '</text>');
  }
  for (var x = 0; x < years.length; x++) {
    out.push('<text x="' + px(x).toFixed(1) + '" y="' + (height - 12) + '" text-anchor="middle" class="chart-label">' + years[x] + '</text>');
  }
  out.push('</svg>');
  return out.join('');
}
