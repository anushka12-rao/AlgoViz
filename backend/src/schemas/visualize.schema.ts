import { z } from 'zod';

const INT_MIN = -10000;
const INT_MAX = 10000;

export const boundedInt = z
  .number({ message: 'Integer value is required' })
  .int('Must be an integer')
  .min(INT_MIN, `Integer value cannot be less than ${INT_MIN}`)
  .max(INT_MAX, `Integer value cannot be greater than ${INT_MAX}`);

export const optionsSchema = z
  .object({
    mode: z.enum(['auto', 'step'], {
      message: "Option 'mode' must be either 'auto' or 'step'",
    }).optional(),
  })
  .strict()
  .optional();

export const sortingInputSchema = z
  .object({
    array: z
      .array(boundedInt)
      .min(1, 'Array must contain at least 1 element')
      .max(50, 'Array cannot exceed maximum safety limit of 50 elements'),
  })
  .strict();

export const searchingInputSchema = z
  .object({
    array: z
      .array(boundedInt)
      .min(1, 'Array must contain at least 1 element')
      .max(50, 'Array cannot exceed maximum safety limit of 50 elements'),
    target: boundedInt,
  })
  .strict();

export const stackOperationSchema = z.discriminatedUnion('op', [
  z.object({ op: z.literal('push'), val: boundedInt }).strict(),
  z.object({ op: z.literal('pop') }).strict(),
  z.object({ op: z.literal('top') }).strict(),
  z.object({ op: z.literal('empty') }).strict(),
  z.object({ op: z.literal('clear') }).strict(),
]);

export const stackInputSchema = z
  .object({
    elements: z.array(boundedInt).max(50, 'Stack elements cannot exceed 50').optional(),
    operations: z.array(stackOperationSchema).max(50, 'Stack operations cannot exceed 50').optional(),
  })
  .strict();

export const queueOperationSchema = z.discriminatedUnion('op', [
  z.object({ op: z.literal('push'), val: boundedInt }).strict(),
  z.object({ op: z.literal('pop') }).strict(),
  z.object({ op: z.literal('front') }).strict(),
  z.object({ op: z.literal('empty') }).strict(),
  z.object({ op: z.literal('clear') }).strict(),
]);

export const queueInputSchema = z
  .object({
    elements: z.array(boundedInt).max(50, 'Queue elements cannot exceed 50').optional(),
    operations: z.array(queueOperationSchema).max(50, 'Queue operations cannot exceed 50').optional(),
  })
  .strict();

export const linkedListOperationSchema = z.discriminatedUnion('op', [
  z.object({ op: z.literal('push_front'), val: boundedInt }).strict(),
  z.object({ op: z.literal('push_back'), val: boundedInt }).strict(),
  z.object({ op: z.literal('pop_front') }).strict(),
  z.object({ op: z.literal('pop_back') }).strict(),
  z.object({ op: z.literal('search'), val: boundedInt }).strict(),
  z.object({ op: z.literal('clear') }).strict(),
]);

export const linkedListInputSchema = z
  .object({
    elements: z.array(boundedInt).max(50, 'Linked list elements cannot exceed 50').optional(),
    operations: z.array(linkedListOperationSchema).max(50, 'Linked list operations cannot exceed 50').optional(),
  })
  .strict();

export const binaryTreeInsertionSchema = z
  .object({
    parent: boundedInt,
    val: boundedInt,
    side: z.enum(['L', 'R', 'l', 'r']).optional(),
  })
  .strict();

export const binaryTreeOperationSchema = z
  .object({
    op: z.enum(['inorder', 'preorder', 'postorder', 'level_order', 'metrics', 'clear']),
  })
  .strict();

export const binaryTreeInputSchema = z
  .object({
    preorder: z.array(boundedInt).max(63, 'Binary tree preorder tokens cannot exceed 63').optional(),
    insertions: z.array(binaryTreeInsertionSchema).max(63, 'Binary tree insertions cannot exceed 63').optional(),
    operations: z.array(binaryTreeOperationSchema).max(50, 'Binary tree operations cannot exceed 50').optional(),
  })
  .strict();

export const bstOperationSchema = z.discriminatedUnion('op', [
  z.object({ op: z.literal('insert'), val: boundedInt }).strict(),
  z.object({ op: z.literal('search'), val: boundedInt }).strict(),
  z.object({ op: z.literal('delete'), val: boundedInt }).strict(),
  z.object({ op: z.literal('clear') }).strict(),
  z.object({ op: z.literal('sorted') }).strict(),
]);

export const bstInputSchema = z
  .object({
    values: z.array(boundedInt).max(30, 'BST values cannot exceed 30').optional(),
    search_target: boundedInt.optional(),
    delete_target: boundedInt.optional(),
    operations: z.array(bstOperationSchema).max(50, 'BST operations cannot exceed 50').optional(),
  })
  .strict();

export const graphInputSchema = z
  .object({
    vertices: z
      .number({ message: 'Graph requires vertices count' })
      .int('Vertices must be an integer')
      .min(1, 'Graph vertices must be at least 1')
      .max(30, 'Graph vertices cannot exceed 30')
      .optional()
      .default(5),
    edges: z
      .array(
        z.tuple([
          z.number().int('Edge vertex u must be an integer'),
          z.number().int('Edge vertex v must be an integer'),
        ])
      )
      .max(100, 'Graph edges cannot exceed 100')
      .optional()
      .default([]),
    src: z
      .number()
      .int('Source vertex must be an integer')
      .optional()
      .default(0),
  })
  .strict()
  .superRefine((data, ctx) => {
    const v = data.vertices;
    if (data.src < 0 || data.src >= v) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Source vertex 'src' (${data.src}) must be between 0 and ${v - 1}`,
        path: ['src'],
      });
    }
    data.edges.forEach((edge, idx) => {
      const [u, w] = edge;
      if (u < 0 || u >= v) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Edge [${u}, ${w}] at index ${idx} contains endpoint ${u} outside bounds [0, ${v - 1}]`,
          path: ['edges', idx, 0],
        });
      }
      if (w < 0 || w >= v) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Edge [${u}, ${w}] at index ${idx} contains endpoint ${w} outside bounds [0, ${v - 1}]`,
          path: ['edges', idx, 1],
        });
      }
    });
  });

export const requestEnvelopeSchema = z
  .object({
    algorithm: z.string({ message: "Field 'algorithm' is required" }).min(1, 'Algorithm identifier cannot be empty'),
    input: z.record(z.string(), z.any()),
    options: optionsSchema,
  })
  .strict();

export function validateAlgorithmInput(algorithm: string, input: unknown): any {
  switch (algorithm) {
    case 'bubble_sort':
    case 'selection_sort':
    case 'insertion_sort':
    case 'merge_sort':
    case 'quick_sort':
      return sortingInputSchema.parse(input);
    case 'linear_search':
    case 'binary_search':
      return searchingInputSchema.parse(input);
    case 'stack':
      return stackInputSchema.parse(input);
    case 'queue':
      return queueInputSchema.parse(input);
    case 'linked_list':
      return linkedListInputSchema.parse(input);
    case 'binary_tree':
      return binaryTreeInputSchema.parse(input);
    case 'bst':
      return bstInputSchema.parse(input);
    case 'bfs':
    case 'dfs':
      return graphInputSchema.parse(input);
    default:
      throw new Error(`Unsupported algorithm: ${algorithm}`);
  }
}
