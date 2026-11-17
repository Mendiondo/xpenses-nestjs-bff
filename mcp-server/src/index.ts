import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const API_URL = (process.env.XPENSES_API_URL ?? 'http://localhost:3000').replace(
  /\/+$/,
  '',
);

interface ExpenseType {
  id: number;
  name: string;
}

interface ExpenseItem {
  id: number;
  description: string;
  date: string; // yyyy-MM-dd
  value: string;
  expenseTypeId: number | null;
  expenseType: ExpenseType | null;
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { 'content-type': 'application/json', ...init?.headers },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`API ${init?.method ?? 'GET'} ${path} -> ${res.status}: ${text}`);
  }
  return (text ? JSON.parse(text) : null) as T;
}

/** Values are stored as text; accepts "2000", "2000.50" and "1.234,56". */
function parseValue(value: string): number {
  const v = value.trim();
  const n = v.includes(',')
    ? Number(v.replace(/\./g, '').replace(',', '.'))
    : Number(v);
  return Number.isFinite(n) ? n : 0;
}

const round = (n: number) => Math.round(n * 100) / 100;

const json = (data: unknown) => ({
  content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
});

const fail = (error: unknown) => ({
  isError: true,
  content: [
    {
      type: 'text' as const,
      text: error instanceof Error ? error.message : String(error),
    },
  ],
});

const run = async (fn: () => Promise<unknown>) => {
  try {
    return json(await fn());
  } catch (e) {
    return fail(e);
  }
};

const dateStr = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'use yyyy-MM-dd');

const filterShape = {
  text: z
    .string()
    .optional()
    .describe('Case-insensitive substring to look for in the description'),
  expenseTypeId: z.number().int().optional().describe('Only items of this type'),
  uncategorized: z
    .boolean()
    .optional()
    .describe('Only items that have no expense type'),
  dateFrom: dateStr.optional().describe('Inclusive start date (yyyy-MM-dd)'),
  dateTo: dateStr.optional().describe('Inclusive end date (yyyy-MM-dd)'),
  minValue: z.number().optional(),
  maxValue: z.number().optional(),
};
const filterSchema = z.object(filterShape);
type Filters = z.infer<typeof filterSchema>;

function applyFilters(items: ExpenseItem[], f: Filters): ExpenseItem[] {
  const text = f.text?.trim().toLowerCase();
  return items.filter((i) => {
    if (text && !i.description.toLowerCase().includes(text)) return false;
    if (f.expenseTypeId !== undefined && i.expenseTypeId !== f.expenseTypeId)
      return false;
    if (f.uncategorized && i.expenseTypeId != null) return false;
    if (f.dateFrom && i.date < f.dateFrom) return false;
    if (f.dateTo && i.date > f.dateTo) return false;
    const v = parseValue(i.value);
    if (f.minValue !== undefined && v < f.minValue) return false;
    if (f.maxValue !== undefined && v > f.maxValue) return false;
    return true;
  });
}

const server = new McpServer({ name: 'xpenses', version: '0.1.0' });

server.registerTool(
  'list_expense_types',
  {
    description: 'List all expense types (id and name).',
    annotations: { readOnlyHint: true },
  },
  () => run(() => api<ExpenseType[]>('/expense-type')),
);

server.registerTool(
  'query_expense_items',
  {
    description:
      'Search expense items. All filters are optional and combined with AND. ' +
      'Returns the matching page plus the total count and summed value.',
    inputSchema: {
      ...filterShape,
      sortBy: z.enum(['date', 'value', 'description']).default('date'),
      order: z.enum(['asc', 'desc']).default('desc'),
      limit: z.number().int().min(1).max(500).default(50),
      offset: z.number().int().min(0).default(0),
    },
    annotations: { readOnlyHint: true },
  },
  ({ sortBy, order, limit, offset, ...filters }) =>
    run(async () => {
      const items = applyFilters(await api<ExpenseItem[]>('/expense-item'), filters);
      const dir = order === 'asc' ? 1 : -1;
      items.sort((a, b) => {
        if (sortBy === 'value') return (parseValue(a.value) - parseValue(b.value)) * dir;
        return String(a[sortBy]).localeCompare(String(b[sortBy])) * dir;
      });
      return {
        total: items.length,
        totalValue: round(items.reduce((s, i) => s + parseValue(i.value), 0)),
        offset,
        items: items.slice(offset, offset + limit),
      };
    }),
);

server.registerTool(
  'get_expense_item',
  {
    description: 'Get a single expense item by id.',
    inputSchema: { id: z.number().int() },
    annotations: { readOnlyHint: true },
  },
  ({ id }) => run(() => api<ExpenseItem>(`/expense-item/${id}`)),
);

server.registerTool(
  'summarize_expense_items',
  {
    description:
      'Aggregate expense items (count and total value) grouped by expense type, ' +
      'month (yyyy-MM) or normalized description. Accepts the same filters as query_expense_items.',
    inputSchema: {
      ...filterShape,
      groupBy: z.enum(['type', 'month', 'description']).default('type'),
    },
    annotations: { readOnlyHint: true },
  },
  ({ groupBy, ...filters }) =>
    run(async () => {
      const items = applyFilters(await api<ExpenseItem[]>('/expense-item'), filters);
      const groups = new Map<string, { count: number; total: number }>();
      for (const i of items) {
        const key =
          groupBy === 'type'
            ? (i.expenseType?.name ?? '(uncategorized)')
            : groupBy === 'month'
              ? i.date.slice(0, 7)
              : i.description.trim().toLowerCase();
        const g = groups.get(key) ?? { count: 0, total: 0 };
        g.count++;
        g.total += parseValue(i.value);
        groups.set(key, g);
      }
      const rows = [...groups]
        .map(([group, g]) => ({ group, count: g.count, total: round(g.total) }))
        .sort((a, b) =>
          groupBy === 'month' ? a.group.localeCompare(b.group) : b.total - a.total,
        );
      return {
        count: items.length,
        total: round(rows.reduce((s, r) => s + r.total, 0)),
        groups: rows,
      };
    }),
);

server.registerTool(
  'create_expense_item',
  {
    description: 'Create an expense item.',
    inputSchema: {
      description: z.string().min(1),
      date: dateStr,
      value: z.string().min(1).describe('Amount as text, e.g. "49.90"'),
      expenseTypeId: z.number().int(),
    },
  },
  (body) =>
    run(() =>
      api<ExpenseItem>('/expense-item', { method: 'POST', body: JSON.stringify(body) }),
    ),
);

server.registerTool(
  'update_expense_item',
  {
    description: 'Update fields of an expense item; omitted fields are unchanged.',
    inputSchema: {
      id: z.number().int(),
      description: z.string().min(1).optional(),
      date: dateStr.optional(),
      value: z.string().min(1).optional(),
      expenseTypeId: z.number().int().optional(),
    },
    annotations: { idempotentHint: true },
  },
  ({ id, ...body }) =>
    run(() =>
      api<ExpenseItem>(`/expense-item/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    ),
);

server.registerTool(
  'delete_expense_item',
  {
    description: 'Permanently delete an expense item.',
    inputSchema: { id: z.number().int() },
    annotations: { destructiveHint: true },
  },
  ({ id }) => run(() => api<ExpenseItem>(`/expense-item/${id}`, { method: 'DELETE' })),
);

await server.connect(new StdioServerTransport());
console.error(`xpenses MCP server running (API: ${API_URL})`);
