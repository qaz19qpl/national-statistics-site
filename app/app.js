/* StatAtlas router and interactions: hash routes, the search box,
   the metric picker buttons and the compare form. Everything runs
   from the files in app/; no network request is ever made. */
'use strict';

var view = document.getElementById('view');
var state = { query: '', metric: 'gdp', sort: 'gdp', dir: 'desc' };

function parseHash() {
  var raw = window.location.hash || '#/';
  var hash = raw.replace(/^#/, '');
  var parts = hash.split('?');
  var path = parts[0].split('/').filter(Boolean);
  var params = {};
  if (parts[1]) {
    parts[1].split('&').forEach(function (pair) {
      var kv = pair.split('=');
      if (kv[0]) params[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || '');
    });
  }
  return { path: path, params: params };
}

function route() {
  var r = parseHash();
  var p = r.path;
  if (p.length === 0) {
    state.query = r.params.q || '';
    state.metric = r.params.metric || state.metric;
    view.innerHTML = renderHome(state.query, state.metric);
  } else if (p[0] === 'country' && p[1]) {
    state.metric = r.params.metric || state.metric;
    view.innerHTML = renderCountry(p[1], state.metric);
  } else if (p[0] === 'compare') {
    var codes = [];
    if (r.params.with) codes = [r.params.with];
    ['c0', 'c1', 'c2'].forEach(function (k) { if (r.params[k]) codes.push(r.params[k]); });
    view.innerHTML = renderCompare(codes, state.metric);
  } else if (p[0] === 'rankings') {
    view.innerHTML = renderRankings(r.params.sort || state.sort, r.params.dir || state.dir);
  } else if (p[0] === 'sources') {
    view.innerHTML = renderSources();
  } else {
    view.innerHTML = renderHome('', state.metric);
  }
  bindView();
  window.scrollTo(0, 0);
}

function bindView() {
  var form = document.getElementById('search-form');
  if (form) {
    var box = document.getElementById('search-box');
    box.addEventListener('input', function () {
      state.query = box.value;
      var grid = document.querySelector('.country-grid');
      if (grid) {
        var html = renderHome(state.query, state.metric);
        var tmp = document.createElement('div');
        tmp.innerHTML = html;
        var fresh = tmp.querySelector('.country-grid');
        if (fresh) grid.innerHTML = fresh.innerHTML;
      }
    });
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      window.location.hash = '#/?q=' + encodeURIComponent(box.value);
    });
  }
  var pickers = document.querySelectorAll('.metric-picker button');
  pickers.forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.metric = btn.getAttribute('data-metric');
      var r = parseHash();
      var base = r.path.length ? '#/' + r.path.join('/') : '#/';
      var query = base === '#/' && state.query ? '?q=' + encodeURIComponent(state.query) : '';
      if (base === '#/') {
        window.location.hash = '#/?q=' + encodeURIComponent(state.query) + '&metric=' + state.metric;
      } else {
        window.location.hash = base + '?metric=' + state.metric + query;
      }
      route();
    });
  });
  var compareForm = document.getElementById('compare-form');
  if (compareForm) {
    compareForm.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var data = new FormData(compareForm);
      var qs = [];
      ['c0', 'c1', 'c2'].forEach(function (k) {
        var v = data.get(k);
        if (v) qs.push(k + '=' + encodeURIComponent(v));
      });
      window.location.hash = '#/compare' + (qs.length ? '?' + qs.join('&') : '');
      route();
    });
  }
}

window.addEventListener('hashchange', route);
route();
