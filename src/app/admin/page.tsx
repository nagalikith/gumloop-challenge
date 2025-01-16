"use client"
import React, { useState, useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  ReactFlowProvider,
  Node,
  Edge,
  Connection,
} from "reactflow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import "reactflow/dist/style.css";

const components = [
  { id: "email", label: "Email Input", required: true },
  { id: "birthdate", label: "Birthdate", required: false },
  { id: "aboutMe", label: "About Me", required: false },
  { id: "address", label: "Address Form", required: false },
];

const initialNodes: Node[] = [
  { id: "page1", type: "default", position: { x: 0, y: 0 }, data: { label: "Page 1" } },
  { id: "page2", type: "default", position: { x: 300, y: 0 }, data: { label: "Page 2" } },
  { id: "page3", type: "default", position: { x: 600, y: 0 }, data: { label: "Page 3" } },
];

const initialEdges: Edge[] = [
  { id: "e1-2", source: "page1", target: "page2", animated: true },
  { id: "e2-3", source: "page2", target: "page3", animated: true },
];

const prepareConfigForSave = (nodes: Node[], edges: Edge[], assignedComponents: Record<string, string[]>) => {
  const cleanedNodes = nodes.map(node => ({
    id: node.id,
    label: node.data.label,
    position: node.position,
    data: {
      label: node.data.label,
      components: assignedComponents[node.id] || []
    }
  }));

  const cleanedEdges = edges.map(edge => ({
    source: edge.source,
    target: edge.target,
  }));

  return {
    name: "Component Flow Configuration 2",
    configuration: {
      nodes: cleanedNodes,
      edges: cleanedEdges,
    }
  };
};

const ComponentAdmin: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [assignedComponents, setAssignedComponents] = useState<Record<string, string[]>>({
    page1: ["email"],
    page2: ["birthdate"],
    page3: ["address"],
  });
  const [isSaving, setIsSaving] = useState(false);

  const onConnect = useCallback(
    (connection: Connection | Edge) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  const onEdgeClick = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      const isConfirmed = window.confirm("Are you sure you want to remove this connection?");
      if (isConfirmed) {
        setEdges((eds) => eds.filter((e) => e.id !== edge.id));
      }
    },
    [setEdges]
  );

  const handleAddComponent = (pageId: string, componentId: string) => {
    setAssignedComponents((prev) => ({
      ...prev,
      [pageId]: [...(prev[pageId] || []), componentId],
    }));
  };

  const handleRemoveComponent = (pageId: string, componentId: string) => {
    setAssignedComponents((prev) => ({
      ...prev,
      [pageId]: prev[pageId].filter((id) => id !== componentId),
    }));
  };

  

  const saveConfiguration = async () => {
    setIsSaving(true);
    const configToSave = prepareConfigForSave(nodes, edges, assignedComponents);

    try {
      const response = await fetch('http://127.0.0.1:8000/save-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(configToSave),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`);
      }

      const data = await response.json();
      console.log('Configuration saved successfully:', data);
      alert('Configuration saved successfully!');
    } catch (error) {
      console.error('Error saving configuration:', error);
      alert(`Error saving configuration: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ReactFlowProvider>
      <div className="h-screen w-full p-4">
        <div className="mb-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Component Configuration 1</h1>
          <Button onClick={saveConfiguration} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4">
          {nodes.map((node) => (
            <Card key={node.id} className="w-full">
              <CardHeader>
                <CardTitle>{node.data.label}</CardTitle>
              </CardHeader>
              <CardContent>
                {assignedComponents[node.id]?.map((compId) => {
                  const component = components.find((c) => c.id === compId);
                  return (
                    <div key={compId} className="flex justify-between items-center bg-slate-100 p-2 rounded">
                      <span>{component?.label}</span>
                      {!component?.required && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveComponent(node.id, compId)}
                          className="h-6 w-6 p-0"
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  );
                })}
                <Select onValueChange={(value) => handleAddComponent(node.id, value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Add component" />
                  </SelectTrigger>
                  <SelectContent>
                    {components
                      .filter((comp) => !assignedComponents[node.id]?.includes(comp.id))
                      .map((comp) => (
                        <SelectItem key={comp.id} value={comp.id}>
                          {comp.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="h-[calc(100%-100px)] border rounded">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onEdgeClick={onEdgeClick}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap nodeStrokeWidth={3} />
          </ReactFlow>
        </div>
      </div>
    </ReactFlowProvider>
  );
};

export default ComponentAdmin;