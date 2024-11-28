import type { Node, BuiltInNode } from "@xyflow/react";

export type FunctionNode = Node<
  {
    label: string;
    func?: (input: any) => any;
    functionName: string;
  },
  "function-node"
>;
export type AppNode = BuiltInNode | FunctionNode;
