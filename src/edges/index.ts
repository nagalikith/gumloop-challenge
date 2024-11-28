import type { Edge, EdgeTypes } from '@xyflow/react';

export const initialEdges: Edge[] = [
  { id: 'step1-step2', source: 'step1', target: 'step2', animated: true },
  { id: 'step2-step3', source: 'step2', target: 'step3', animated: true },
];

export const edgeTypes = {
  // Add your custom edge types here!
} satisfies EdgeTypes;
