/* StatAtlas views: each page of the site is one function that returns
   HTML for #view. The router in app.js picks the view from the hash,
   so every page is reached by a link and works with the back button. */
'use strict';

var COMPARE_COLORS = ['#1d4ed8', '#c2410c', '#15803d'];

function countryLink(c) {
  return '#/country/' + c.code;
}

function statCard(c, ind) {
  return '<a class="stat-card" href="' + countryLink(c) + '#indicator-' + ind.key + '">'
    + '<span class="stat-label">' + escText(ind.label) + ' &middot; ' + ind.year + '</span>'
    + '<span class="stat-value">' + escText(ind.format(c[ind.key])) + '</span>'
    + '<span class="stat-about">' + escText(ind.about) + '</span>'
    + '<span class="stat-source">Source: ' + escText(ind.source) + '</span></a>';
}

function countryCard(c) {
  return '<article class="country-card"><a href="' + countryLink(c) + '">'
    + '<h3>' + escText(c.name) + '</h3>'
    + '<p class="muted">' + escText(c.region) + ' &middot; capital ' + escText(c.capital) + '</p>'
    + '<dl>'
    + '<div><dt>Population</dt><dd>' + c.population.toFixed(1) + ' m</dd></div>'
    + '<div><dt>GDP</dt><dd>$' + c.gdp.toLocaleString('en-US') + ' bn</dd></div>'
    + '<div><dt>Life expectancy</dt><dd>' + c.life.toFixed(1) + ' yrs</dd></div>'
    + '</dl><span class="card-more">See full profile &rarr;</span></a></article>';
}

/* Home: search, headline league tables, a switchable bar chart and
   the full country grid. */
function renderHome(query, metricKey) {
  var ind = indicatorByKey(metricKey || 'gdp');
  var q = (query || '').trim().toLowerCase();
  var list = COUNTRIES.filter(function (c) {
    return !q || c.name.toLowerCase().indexOf(q) !== -1
      || c.region.toLowerCase().indexOf(q) !== -1
      || c.capital.toLowerCase().indexOf(q) !== -1;
  });
  var sorted = COUNTRIES.slice().sort(function (a, b) { return b[ind.key] - a[ind.key]; });
  var chartItems = sorted.map(function (c) {
    return { label: c.name, value: c[ind.key], href: countryLink(c) };
  });
  var top = sorted.slice(0, 3).map(function (c, i) {
    return '<li><a href="' + countryLink(c) + '"><b>' + escText(c.name) + '</b> '
      + escText(ind.format(c[ind.key])) + '</a></li>';
  }).join('');
  var metricButtons = INDICATORS.map(function (m) {
    return '<button type="button" data-metric="' + m.key + '"'
      + (m.key === ind.key ? ' aria-pressed="true" class="active"' : ' aria-pressed="false"')
      + '>' + escText(m.label) + '</button>';
  }).join('');
  var cards = list.length ? list.map(countryCard).join('')
    : '<p class="empty">No country matches &ldquo;' + escText(query || '') + '&rdquo;. Try a name, a region or a capital.</p>';
  return '<section class="hero"><h1>How big, how rich, how long do we live?</h1>'
    + '<p class="lede">StatAtlas puts the headline numbers of twelve countries side by side &mdash; '
    + 'population, GDP, life expectancy and more &mdash; each figure with its source and year, '
    + 'so you can check it yourself.</p>'
    + '<form class="search" id="search-form" role="search">'
    + '<label for="search-box">Search countries</label>'
    + '<input id="search-box" type="search" name="q" placeholder="Try &ldquo;Asia&rdquo;, &ldquo;Berlin&rdquo; or &ldquo;Brazil&rdquo;" value="' + escText(query || '') + '" autocomplete="off">'
    + '<button type="submit">Search</button></form></section>'
    + '<section class="panel"><h2>Top three by ' + escText(ind.label.toLowerCase()) + '</h2>'
    + '<ol class="top-three">' + top + '</ol></section>'
    + '<section class="panel"><h2>Compare all twelve: ' + escText(ind.label) + ' (' + ind.year + ')</h2>'
    + '<div class="metric-picker" role="group" aria-label="Choose indicator">' + metricButtons + '</div>'
    + hbarChart(chartItems, ind.format, null)
    + '<p class="source-note">Source: ' + escText(ind.source) + ', ' + ind.year + '. Bars link to each country&rsquo;s profile.</p></section>'
    + '<section><h2>All countries</h2><div class="country-grid">'
    + cards + '</div></section>'
    + '<section class="panel"><h2>About the numbers</h2>'
    + '<p>Every figure on this site comes from the World Bank&rsquo;s World Development Indicators, '
    + 'the United Nations World Population Prospects 2024, or the International Labour Organization. '
    + 'Figures are shown as published, with the reference year beside each one. '
    + '<a href="#/sources">Read the full sources and methods note &rarr;</a></p></section>';
}

/* Country detail: headline cards, a five-year population chart, a
   ranked bar chart for the chosen indicator, and a facts table. */
function renderCountry(code, metricKey) {
  var c = countryByCode(code);
  if (!c) return '<section class="panel"><h1>Country not found</h1>'
    + '<p>That country is not in this edition of StatAtlas. '
    + '<a href="#/">Back to all countries</a>.</p></section>';
  var ind = indicatorByKey(metricKey || 'gdp');
  var rank = COUNTRIES.slice().sort(function (a, b) { return b[ind.key] - a[ind.key]; })
    .findIndex(function (x) { return x.code === c.code; }) + 1;
  var trendPairs = TREND_YEARS.map(function (y, i) {
    return { label: String(y), value: c.trend[i] };
  });
  var chartItems = COUNTRIES.slice().sort(function (a, b) { return b[ind.key] - a[ind.key]; })
    .map(function (x) { return { label: x.name, value: x[ind.key], href: countryLink(x) }; });
  var metricButtons = INDICATORS.map(function (m) {
    return '<button type="button" data-metric="' + m.key + '"'
      + (m.key === ind.key ? ' aria-pressed="true" class="active"' : ' aria-pressed="false"')
      + '>' + escText(m.label) + '</button>';
  }).join('');
  var cards = INDICATORS.map(function (m) { return statCard(c, m); }).join('');
  return '<section><p class="crumbs"><a href="#/">All countries</a> &rsaquo; ' + escText(c.region) + '</p>'
    + '<h1>' + escText(c.name) + '</h1>'
    + '<p class="lede">' + escText(c.profile) + '</p>'
    + '<p class="muted">Capital: ' + escText(c.capital) + ' &middot; Land area: '
    + c.area.toLocaleString('en-US') + ' km&sup2; &middot; Population density: '
    + Math.round(densityOf(c)).toLocaleString('en-US') + ' people per km&sup2;</p>'
    + '<div class="stat-grid">' + cards + '</div></section>'
    + '<section class="panel"><h2>Population, 2020&ndash;2024</h2>'
    + vbarChart(trendPairs, function (v) { return v.toFixed(1) + ' m'; }, 'Population of ' + c.name + ' (millions)')
    + '<p class="source-note">Source: UN World Population Prospects 2024, mid-year estimates, millions of people.</p></section>'
    + '<section class="panel"><h2>Where ' + escText(c.name) + ' ranks: ' + escText(ind.label) + '</h2>'
    + '<p><strong>' + escText(c.name) + '</strong> ranks <strong>#' + rank + ' of 12</strong> on '
    + escText(ind.label.toLowerCase()) + ' (' + ind.year + '), at ' + escText(ind.format(c[ind.key])) + '.</p>'
    + '<div class="metric-picker" role="group" aria-label="Choose indicator">' + metricButtons + '</div>'
    + hbarChart(chartItems, ind.format, c.name)
    + '<p class="source-note">Source: ' + escText(ind.source) + ', ' + ind.year + '. The orange bar is ' + escText(c.name) + '.</p></section>'
    + '<section class="panel"><h2>Compare ' + escText(c.name) + '</h2>'
    + '<p><a class="button" href="#/compare?with=' + c.code + '">Compare ' + escText(c.name) + ' with other countries &rarr;</a></p>'
    + '<p><a href="#/rankings">See the full rankings table &rarr;</a></p></section>';
}

/* Compare: pick up to three countries and one indicator, see them as
   a line chart over 2020&ndash;2024 and a side-by-side table. */
function renderCompare(codes, metricKey) {
  var picked = (codes || []).map(countryByCode).filter(Boolean).slice(0, 3);
  if (picked.length === 0) picked = [countryByCode('usa'), countryByCode('chn')];
  var series = picked.map(function (c, i) {
    return { label: c.name, values: c.trend, color: COMPARE_COLORS[i % 3] };
  });
  var rows = INDICATORS.map(function (m) {
    var cells = picked.map(function (c) {
      return '<td>' + escText(m.format(c[m.key])) + '</td>';
    }).join('');
    return '<tr><th scope="row">' + escText(m.label) + ' <span class="muted">(' + m.year + ')</span></th>' + cells + '</tr>';
  }).join('');
  var heads = picked.map(function (c) {
    return '<th scope="col"><a href="' + countryLink(c) + '">' + escText(c.name) + '</a></th>';
  }).join('');
  var pickers = [0, 1, 2].map(function (i) {
    var sel = picked[i] ? picked[i].code : '';
    var opts = '<option value="">— none —</option>' + COUNTRIES.map(function (c) {
      return '<option value="' + c.code + '"' + (c.code === sel ? ' selected' : '') + '>' + escText(c.name) + '</option>';
    }).join('');
    return '<label>Country ' + (i + 1) + ' <select name="c' + i + '">' + opts + '</select></label>';
  }).join('');
  return '<section><h1>Compare countries</h1>'
    + '<p class="lede">Pick up to three countries and watch their populations grow &mdash; or shrink &mdash; '
    + 'over 2020&ndash;2024, then check every headline indicator side by side.</p>'
    + '<form class="compare-form" id="compare-form"><div class="picker-row">' + pickers + '</div>'
    + '<button type="submit">Compare</button></form></section>'
    + '<section class="panel"><h2>Population, 2020&ndash;2024</h2>'
    + lineChart(series, TREND_YEARS, function (v) { return v.toFixed(0) + ' m'; }, 'Population trend, millions')
    + '<p class="source-note">Source: UN World Population Prospects 2024, mid-year estimates.</p></section>'
    + '<section class="panel"><h2>Headline indicators</h2>'
    + '<table class="data-table"><caption>Headline indicators, latest year available for each</caption>'
    + '<thead><tr><th scope="col">Indicator</th>' + heads + '</tr></thead><tbody>' + rows + '</tbody></table>'
    + '<p class="source-note">Population: UN WPP 2024. GDP and GDP per person: World Bank WDI 2024. '
    + 'Life expectancy: World Bank WDI 2023. Unemployment: ILO 2024. GDP growth: World Bank WDI 2024.</p></section>';
}

/* Rankings: the full sortable table of all twelve countries. */
function renderRankings(sortKey, direction) {
  var key = indicatorByKey(sortKey || 'gdp').key;
  var dir = direction === 'asc' ? 1 : -1;
  var rows = COUNTRIES.slice().sort(function (a, b) { return (a[key] - b[key]) * dir; });
  var heads = INDICATORS.map(function (m) {
    var arrow = m.key === key ? (dir === 1 ? ' ▲' : ' ▼') : '';
    return '<th scope="col"><a href="#/rankings?sort=' + m.key + '&dir='
      + (m.key === key && dir === -1 ? 'asc' : 'desc') + '">' + escText(m.label) + arrow + '</a></th>';
  }).join('');
  var body = rows.map(function (c, i) {
    var cells = INDICATORS.map(function (m) {
      return '<td>' + escText(m.format(c[m.key])) + '</td>';
    }).join('');
    return '<tr><td>' + (i + 1) + '</td><td><a href="' + countryLink(c) + '">' + escText(c.name) + '</a></td>' + cells + '</tr>';
  }).join('');
  return '<section><h1>Rankings</h1>'
    + '<p class="lede">All twelve countries, ranked on any headline indicator. Click a column heading to re-sort the table.</p>'
    + '<table class="data-table"><caption>Rankings of the twelve countries in StatAtlas</caption>'
    + '<thead><tr><th scope="col">#</th><th scope="col">Country</th>' + heads + '</tr></thead>'
    + '<tbody>' + body + '</tbody></table>'
    + '<p class="source-note">Population: UN WPP 2024. GDP and GDP per person: World Bank WDI 2024. '
    + 'Life expectancy: World Bank WDI 2023. Unemployment: ILO 2024. GDP growth: World Bank WDI 2024.</p></section>';
}

/* Sources and methods: what each figure is, where it comes from, and
   what this site does not do. */
function renderSources() {
  var items = INDICATORS.map(function (m) {
    return '<li><strong>' + escText(m.label) + ' (' + m.year + ')</strong> — ' + escText(m.about)
      + '<br><span class="muted">Source: ' + escText(m.source) + ', ' + m.unit + '.</span></li>';
  }).join('');
  return '<section><h1>Sources &amp; methods</h1>'
    + '<p class="lede">StatAtlas is a reference site, not a news site: its figures change only when the '
    + 'statistical agencies publish a new year. Every number on every page carries its source and reference year.</p>'
    + '<h2>Where the numbers come from</h2><ul class="source-list">' + items + '</ul>'
    + '<h2>How to read them</h2>'
    + '<ul><li>GDP is nominal, in current US dollars — it is not adjusted for what money buys in each country.</li>'
    + '<li>Life expectancy is a period measure: it describes death rates in that year, not the lifespan of a child born into it.</li>'
    + '<li>Unemployment counts people without work who are looking for it, as a share of the labour force.</li>'
    + '<li>Population density divides the 2024 population by land area, so lakes and rivers are included in the area.</li></ul>'
    + '<h2>What this site is not</h2>'
    + '<p>StatAtlas republishes official statistics with credit; it does not collect data itself, run forecasts, '
    + 'or track visitors. It works entirely offline: no figure is fetched from another site while you browse.</p>'
    + '<p><a href="#/">Back to the countries &rarr;</a></p></section>';
}
