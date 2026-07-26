const fs = require('fs');

const elements = {};
function createMockEl(id, tag) {
  const el = {
    id: id,
    tagName: (tag || 'DIV').toUpperCase(),
    style: {},
    classList: {
      _classes: new Set(),
      add: function(c) { this._classes.add(c); },
      remove: function(c) { this._classes.delete(c); },
      toggle: function(c, v) { if (v === undefined) { if (this._classes.has(c)) this._classes.delete(c); else this._classes.add(c); } else { if (v) this._classes.add(c); else this._classes.delete(c); } },
      contains: function(c) { return this._classes.has(c); }
    },
    children: [],
    appendChild: function(c) { this.children.push(c); return c; },
    insertBefore: function(c) { this.children.unshift(c); return c; },
    querySelector: function(sel) {
      if (sel.startsWith('#')) return elements[sel.slice(1)];
      return createMockEl('mock');
    },
    querySelectorAll: function(sel) { return []; },
    addEventListener: function() {},
    removeEventListener: function() {},
    setAttribute: function(k, v) { this[k] = v; },
    getAttribute: function(k) { return this[k] || null; },
    removeAttribute: function(k) { delete this[k]; },
    options: [],
    value: '',
    textContent: '',
    innerHTML: '',
    remove: function() {}
  };
  if (id) elements[id] = el;
  return el;
}

const window = {
  location: { href: '', search: '', hash: '' },
  localStorage: {
    data: {},
    getItem: function(k) { return this.data[k] || null; },
    setItem: function(k, v) { this.data[k] = String(v); },
    removeItem: function(k) { delete this.data[k]; }
  },
  document: {
    getElementById: function(id) { return elements[id] || createMockEl(id); },
    querySelector: function(sel) {
      if (sel.startsWith('#')) return elements[sel.slice(1)];
      return createMockEl('mock');
    },
    querySelectorAll: function(sel) { return []; },
    createElement: function(tag) { return createMockEl('', tag); },
    body: createMockEl('body'),
    addEventListener: function(evt, fn) {
      if (evt === 'DOMContentLoaded') setTimeout(fn, 10);
    }
  },
  addEventListener: function() {},
  removeEventListener: function() {},
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  alert: console.log,
  confirm: () => true
};

global.window = window;
global.document = window.document;
global.localStorage = window.localStorage;
global.navigator = { userAgent: 'node' };

const renderers = fs.readFileSync('deploy-web/js/question-renderers.js', 'utf8');
const teacherPage = fs.readFileSync('deploy-web/js/teacher-page.js', 'utf8');

try {
  eval(renderers);
  eval(teacherPage);
  console.log('✅ 1. Evaluation: SUCCESS!');
  
  console.log('--- Testing editQbQuestion(0) ---');
  window.editQbQuestion(0);
  console.log('✅ 2. editQbQuestion(0): SUCCESS!');

  console.log('--- Testing switchEditorTab ---');
  ['setup', 'math', 'reading', 'science', 'export'].forEach(tab => {
    window.switchEditorTab(tab);
    console.log('  Tab ' + tab + ': SUCCESS!');
  });
  console.log('✅ 3. switchEditorTab: SUCCESS!');
  
  console.log('--- Testing editQbGroup ---');
  if (typeof window.editQbGroup !== 'function') throw new Error('editQbGroup is not a function');
  window.editQbGroup('g1', 'reading', 2);
  console.log('✅ 4. editQbGroup: SUCCESS!');

  console.log('--- Testing deleteQbGroupQuestion ---');
  if (typeof window.deleteQbGroupQuestion !== 'function') throw new Error('deleteQbGroupQuestion is not a function');
  console.log('✅ 5. deleteQbGroupQuestion: SUCCESS!');

  console.log('--- Testing generateAiExplanation ---');
  if (typeof window.generateAiExplanation !== 'function') throw new Error('generateAiExplanation is not a function');
  console.log('✅ 6. generateAiExplanation: SUCCESS!');
  
} catch (e) {
  console.error('❌ SIMULATION ERROR:', e.stack);
  process.exitCode = 1;
}
