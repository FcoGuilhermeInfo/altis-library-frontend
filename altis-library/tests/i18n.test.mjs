import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRenderer, defineComponent, h, nextTick } from 'vue';
import { parse } from 'vue/compiler-sfc';
import { AxiosError } from 'axios';
import { i18n, isMessageLanguage } from '../src/utils/i18n.ts';
import messages from '../src/i18n/index.ts';
import { formatDate, formatDateTime, toISODate, formatISODate } from '../src/utils/dateUtils.ts';
import { birthDateRule, requiredRule, gmailRule } from '../src/utils/validationRules.ts';
import { getApiErrorKey } from '../src/utils/apiErrors.ts';
import { useLocalizedValidation } from '../src/utils/localizedValidation.ts';
import { notifyLocalized } from '../src/utils/localizedNotify.ts';
import { Notify } from 'quasar';

const locales = Object.keys(messages);
function flatten(object, prefix = '') {
  return Object.fromEntries(
    Object.entries(object).flatMap(([key, value]) => {
      const full = prefix ? `${prefix}.${key}` : key;
      return typeof value === 'string' ? [[full, value]] : Object.entries(flatten(value, full));
    }),
  );
}
const catalogs = Object.fromEntries(locales.map((locale) => [locale, flatten(messages[locale])]));
const keys = Object.keys(catalogs['en-US']).sort();

function files(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(dir, entry.name);
    return entry.isDirectory() ? files(path) : [path];
  });
}

test('catalogs have identical keys, valid messages and interpolation parameters', () => {
  for (const locale of locales) {
    assert.deepEqual(Object.keys(catalogs[locale]).sort(), keys);
    i18n.global.locale.value = locale;
    for (const key of keys) {
      const message = catalogs[locale][key];
      assert.ok(message.trim(), `${locale}: ${key}`);
      const params = (text) => [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();
      assert.deepEqual(params(message), params(catalogs['en-US'][key]), `${locale}: ${key}`);
      assert.notEqual(i18n.global.t(key, { start: 1, end: 2, total: 2, date: 'date' }, 2), key);
    }
  }
  assert.equal(isMessageLanguage('fr-FR'), false);
  assert.equal(isMessageLanguage('toString'), false);
});

test('all literal translation references exist and templates contain no untranslated copy', () => {
  for (const file of files(fileURLToPath(new URL('../src', import.meta.url))).filter((file) =>
    /\.(vue|ts)$/.test(file),
  )) {
    const source = readFileSync(file, 'utf8');
    for (const match of source.matchAll(/(?:\$?t\(|label:\s*)['"]([\w]+(?:\.[\w]+)+)['"]/g)) {
      assert.ok(keys.includes(match[1]), `${file}: ${match[1]}`);
    }
    if (!file.endsWith('.vue')) continue;
    const { descriptor } = parse(source);
    function visit(node) {
      if (node.type === 2 && /[A-Za-zÀ-ÿ]/.test(node.content)) {
        assert.equal(node.content.trim(), 'LokBooks', `${file}: ${node.content}`);
      }
      if (
        node.type === 6 &&
        ['label', 'placeholder', 'aria-label', 'alt', 'title', 'message', 'hint'].includes(
          node.name,
        )
      ) {
        assert.equal(node.value?.content, 'LokBooks', `${file}: ${node.name}`);
      }
      for (const child of [...(node.children ?? []), ...(node.props ?? [])]) visit(child);
    }
    if (descriptor.template) visit(descriptor.template.ast);
  }
});

test('dates preserve calendar and wall-clock values across locales and host timezones', () => {
  const previousTZ = process.env.TZ;
  try {
    for (const timezone of ['UTC', 'America/Fortaleza', 'Pacific/Auckland']) {
      process.env.TZ = timezone;
      for (const locale of locales) {
        i18n.global.locale.value = locale;
        assert.equal(
          formatDate('2024-02-29T00:05:00'),
          locale === 'en-US' ? '02/29/2024' : '29/02/2024',
        );
        const expected = new Intl.DateTimeFormat(locale, {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'UTC',
        }).format(new Date('2024-02-29T23:05:00Z'));
        assert.equal(formatDateTime('2024-02-29T23:05:00.123456'), expected);
        assert.equal(toISODate(formatISODate('2000-12-31', locale), locale), '2000-12-31');
        assert.equal(birthDateRule(locale === 'en-US' ? '12/31/2000' : '31/12/2000'), true);
        assert.equal(requiredRule(''), i18n.global.t('validation.required'));
        assert.match(gmailRule('a@example.com'), /@gmail\.com/);
      }
    }
  } finally {
    if (previousTZ === undefined) delete process.env.TZ;
    else process.env.TZ = previousTZ;
  }
  assert.equal(formatDate('2023-02-29'), '-');
  assert.equal(formatDateTime('2024-02-29T25:00:00'), '-');
  assert.equal(formatDate(null), '-');
});

test('pagination and dashboard quantities distinguish zero, one and many', () => {
  for (const locale of locales) {
    i18n.global.locale.value = locale;
    for (const count of [0, 1, 12345]) {
      const total = i18n.global.n(count);
      for (const domain of ['users', 'publishers', 'books', 'loans']) {
        const message = i18n.global.t(
          `pagination.${domain}`,
          { start: '0', end: '1', total },
          count,
        );
        assert.ok(message.includes(total));
        const forms = catalogs[locale][`pagination.${domain}`]
          .split('|')
          .map((form) => form.trim());
        const suffix = forms[count === 1 ? 0 : 1].split(' ').at(-1);
        assert.ok(message.endsWith(suffix));
      }
    }
    assert.notEqual(
      i18n.global.t('dashboard.admin.registeredBooks', 1),
      i18n.global.t('dashboard.admin.registeredBooks', 2),
    );
  }
});

test('API errors use HTTP/context, never backend prose or arbitrary codes', () => {
  const error = (status) =>
    new AxiosError(
      'Technical detail',
      'ERR_BAD_RESPONSE',
      undefined,
      undefined,
      status ? { status, data: { message: 'Mensagem do backend', code: 'UNKNOWN' } } : undefined,
    );
  assert.equal(getApiErrorKey(error(401), 'login.error'), 'login.invalidCredentials');
  assert.equal(getApiErrorKey(error(401)), 'errors.unauthorized');
  for (const [status, key] of [
    [403, 'forbidden'],
    [404, 'notFound'],
    [429, 'rateLimit'],
    [503, 'server'],
  ]) {
    assert.equal(getApiErrorKey(error(status)), `errors.${key}`);
  }
  assert.equal(getApiErrorKey(error()), 'errors.network');
  assert.equal(getApiErrorKey(error(409), 'books.deleteError'), 'books.deleteError');
  assert.equal(getApiErrorKey(new Error('detail'), 'register.error'), 'register.error');
});

// A small host renderer exercises actual component reactivity without a browser.
const renderer = createRenderer({
  createElement: (tag) => ({ tag, props: {}, children: [] }),
  createText: (text) => ({ text }),
  createComment: (text) => ({ text }),
  setText: (node, text) => {
    node.text = text;
  },
  setElementText: (node, text) => {
    node.children = [{ text }];
  },
  patchProp: (node, key, _prev, value) => {
    node.props[key] = value;
  },
  insert(node, parent, anchor) {
    if (node.parent) node.parent.children.splice(node.parent.children.indexOf(node), 1);
    node.parent = parent;
    const index = parent.children.indexOf(anchor);
    parent.children.splice(index < 0 ? parent.children.length : index, 0, node);
  },
  remove(node) {
    node.parent?.children.splice(node.parent.children.indexOf(node), 1);
  },
  parentNode: (node) => node.parent,
  nextSibling: (node) => node.parent?.children[node.parent.children.indexOf(node) + 1],
});
function mount(component, props = {}) {
  const root = { children: [] };
  const app = renderer.createApp(component, props);
  app.use(i18n);
  app.config.isCustomElement = (tag) => tag.startsWith('q-');
  app.component(
    'QTable',
    defineComponent({
      setup(_, { attrs, slots }) {
        return () =>
          h('table', { columns: attrs.columns }, [
            ...attrs.columns.map((column) => h('th', column.label)),
            ...attrs.rows.flatMap((row) =>
              Object.entries(slots)
                .filter(([name]) => name.startsWith('body-cell-'))
                .map(([, slot]) => slot({ row })),
            ),
          ]);
      },
    }),
  );
  for (const name of ['QTd', 'QBtn', 'QTooltip', 'QBadge', 'QToggle']) {
    app.component(
      name,
      defineComponent({
        setup(_, { attrs, slots }) {
          return () => h('span', attrs, [attrs.label, slots.default?.()]);
        },
      }),
    );
  }
  app.mount(root);
  return { app, root };
}
function text(node) {
  return node.text ?? (node.children ?? []).map(text).join(' ');
}

test('mounted tables change columns, badges and tooltips without remounting', async () => {
  const cases = [
    [
      'books/BooksTable',
      'books',
      { id: '1', title: 'Example', totalQuantity: 12345 },
      'books.title',
    ],
    [
      'publishers/PublishersTable',
      'publishers',
      { id: '1', name: 'Example', phone: '12345678901' },
      'register.name',
    ],
    [
      'users/UsersTable',
      'users',
      { id: '1', name: 'Example', cpf: '12345678901', phone: '12345678901', active: true },
      'register.name',
    ],
    [
      'loans/LoansTable',
      'loans',
      {
        id: '1',
        status: 'BORROWED',
        borrowedAt: '2024-02-29',
        dueDate: '2024-03-15',
        returnedAt: null,
      },
      'loans.borrower',
    ],
  ];
  for (const [file, prop, row, labelKey] of cases) {
    const component = (await import(`../src/components/${file}.vue`)).default;
    const { app, root } = mount(component, {
      [prop]: [row],
      loading: false,
      page: 1,
      totalElements: 1,
      updatingId: null,
      showActions: true,
    });
    try {
      for (const locale of locales) {
        i18n.global.locale.value = locale;
        await nextTick();
        assert.ok(text(root).includes(i18n.global.t(labelKey)), `${file}: ${locale}`);
        if (prop === 'loans') {
          assert.ok(text(root).includes(i18n.global.t('loans.status.borrowed')));
          assert.ok(text(root).includes(formatDate(row.borrowedAt)));
        }
        if (prop === 'users') assert.ok(text(root).includes(i18n.global.t('users.active')));
      }
    } finally {
      app.unmount();
    }
  }
});

test('language changes revalidate only fields already showing an error', async () => {
  let invalidCalls = 0;
  let untouchedCalls = 0;
  let form;
  const { app } = mount(
    defineComponent({
      setup() {
        form = useLocalizedValidation();
        return () => h('div');
      },
    }),
  );
  form.value = {
    getValidationComponents: () => [
      {
        hasError: true,
        validate: () => {
          invalidCalls++;
        },
      },
      {
        hasError: false,
        validate: () => {
          untouchedCalls++;
        },
      },
    ],
  };
  i18n.global.locale.value = 'pt-BR';
  await nextTick();
  assert.equal(invalidCalls, 1);
  assert.equal(untouchedCalls, 0);
  app.unmount();
});

test('visible notifications update their text and stop watching after dismissal', async () => {
  const originalCreate = Notify.create;
  let options;
  const updates = [];
  Notify.create = (initial) => {
    options = initial;
    return (update) => updates.push(update);
  };
  try {
    i18n.global.locale.value = 'en-US';
    notifyLocalized(() => ({ message: i18n.global.t('books.created') }));
    assert.equal(options.message, 'Book registered successfully!');
    i18n.global.locale.value = 'pt-BR';
    await nextTick();
    assert.equal(updates.at(-1).message, 'Livro cadastrado com sucesso!');
    options.onDismiss();
    i18n.global.locale.value = 'es-ES';
    await nextTick();
    assert.equal(updates.length, 1);
  } finally {
    Notify.create = originalCreate;
  }
});

test('Quasar language packs, document language and saved preference follow the locale', async () => {
  const { Lang } = await import('quasar');
  const boot = (await import('../src/boot/i18n.ts')).default;
  const originalSet = Lang.set;
  const oldDocument = globalThis.document;
  const oldStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  let pack;
  let dispose;
  const storage = new Map([['lokbooks.locale', 'pt-BR']]);
  globalThis.document = { documentElement: { lang: '' } };
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key) => storage.get(key),
      setItem: (key, value) => storage.set(key, value),
    },
  });
  Lang.set = (value) => {
    pack = value;
  };
  try {
    boot({
      app: {
        use() {},
        onUnmount(callback) {
          dispose = callback;
        },
      },
    });
    assert.equal(i18n.global.locale.value, 'pt-BR');
    for (const [locale, isoName, cancel] of [
      ['en-US', 'en-US', 'Cancel'],
      ['pt-BR', 'pt-BR', 'Cancelar'],
      ['es-ES', 'es', 'Cancelar'],
    ]) {
      i18n.global.locale.value = locale;
      await nextTick();
      assert.equal(pack.isoName, isoName);
      assert.equal(pack.label.cancel, cancel);
      assert.ok(pack.date.months.length === 12);
      assert.ok(pack.table.noData.length > 0);
      assert.ok(pack.pagination.next.length > 0);
      assert.equal(document.documentElement.lang, locale);
      assert.equal(storage.get('lokbooks.locale'), locale);
    }
  } finally {
    dispose?.();
    Lang.set = originalSet;
    if (oldDocument === undefined) delete globalThis.document;
    else globalThis.document = oldDocument;
    if (oldStorage) Object.defineProperty(globalThis, 'localStorage', oldStorage);
    else delete globalThis.localStorage;
  }
});
