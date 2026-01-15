// src/components/features/connections/network-graph.tsx
"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

interface NetworkNode {
  id: string;
  name: string;
  email: string;
  connectionCount: number;
}

interface NetworkEdge {
  source: string;
  target: string;
  connectionId: string;
  hasOutcome: boolean;
}

interface NetworkGraphProps {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  className?: string;
}

interface NodePosition {
  id: string;
  name: string;
  x: number;
  y: number;
  connectionCount: number;
  radius: number;
}

export function NetworkGraph({ nodes, edges, className }: NetworkGraphProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Calculate node positions in a circular layout with force-like adjustments
  const { nodePositions, edgeLines } = useMemo(() => {
    if (nodes.length === 0) return { nodePositions: [], edgeLines: [] };

    const width = 600;
    const height = 400;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) / 2 - 50;

    // Sort nodes by connection count (most connected in the center)
    const sortedNodes = [...nodes].sort(
      (a, b) => b.connectionCount - a.connectionCount
    );

    // Calculate positions - most connected nodes closer to center
    const positions: NodePosition[] = sortedNodes.map((node, index) => {
      // Connection-based radius (more connections = closer to center)
      const maxConnections = Math.max(...nodes.map((n) => n.connectionCount));
      const connectionRatio =
        maxConnections > 0 ? node.connectionCount / maxConnections : 0;

      // Place nodes in rings based on connection count
      const ring = Math.floor((1 - connectionRatio) * 3); // 0-3 rings
      const ringRadius = maxRadius * (0.3 + ring * 0.25);

      // Nodes in same ring are distributed evenly
      const nodesInRing = sortedNodes.filter((n, i) => {
        const r =
          maxConnections > 0 ? n.connectionCount / maxConnections : 0;
        return Math.floor((1 - r) * 3) === ring;
      });
      const ringIndex = nodesInRing.findIndex((n) => n.id === node.id);
      const angleOffset = (Math.PI * 2) / nodesInRing.length;
      const angle = ringIndex * angleOffset - Math.PI / 2;

      // Add some jitter for visual interest
      const jitterX = (Math.random() - 0.5) * 20;
      const jitterY = (Math.random() - 0.5) * 20;

      // Node size based on connections
      const nodeRadius = 8 + Math.min(node.connectionCount * 2, 16);

      return {
        id: node.id,
        name: node.name,
        x: centerX + Math.cos(angle) * ringRadius + jitterX,
        y: centerY + Math.sin(angle) * ringRadius + jitterY,
        connectionCount: node.connectionCount,
        radius: nodeRadius,
      };
    });

    // Create edge lines
    const lines = edges.map((edge) => {
      const source = positions.find((p) => p.id === edge.source);
      const target = positions.find((p) => p.id === edge.target);
      if (!source || !target) return null;

      return {
        id: edge.connectionId,
        x1: source.x,
        y1: source.y,
        x2: target.x,
        y2: target.y,
        hasOutcome: edge.hasOutcome,
        sourceId: edge.source,
        targetId: edge.target,
      };
    }).filter(Boolean);

    return { nodePositions: positions, edgeLines: lines };
  }, [nodes, edges]);

  // Get connected nodes for hover highlighting
  const connectedToHovered = useMemo(() => {
    if (!hoveredNode) return new Set<string>();
    const connected = new Set<string>();
    edges.forEach((edge) => {
      if (edge.source === hoveredNode) connected.add(edge.target);
      if (edge.target === hoveredNode) connected.add(edge.source);
    });
    return connected;
  }, [hoveredNode, edges]);

  if (nodes.length === 0) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted/30 rounded-lg",
          className
        )}
        style={{ height: 400 }}
      >
        <p className="text-sm text-muted-foreground">No connections to visualize</p>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <svg
        viewBox="0 0 600 400"
        className="w-full h-auto"
        style={{ maxHeight: 400 }}
      >
        {/* Background */}
        <rect width="600" height="400" fill="transparent" />

        {/* Edges */}
        <g className="edges">
          {edgeLines.map((line) => {
            if (!line) return null;
            const isHighlighted =
              hoveredNode &&
              (line.sourceId === hoveredNode || line.targetId === hoveredNode);
            const isConnectedToSelected =
              selectedNode &&
              (line.sourceId === selectedNode ||
                line.targetId === selectedNode);

            return (
              <line
                key={line.id}
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                className={cn(
                  "transition-all duration-200",
                  isHighlighted || isConnectedToSelected
                    ? line.hasOutcome
                      ? "stroke-green-500"
                      : "stroke-primary"
                    : "stroke-muted-foreground/20"
                )}
                strokeWidth={isHighlighted || isConnectedToSelected ? 2 : 1}
                strokeDasharray={line.hasOutcome ? undefined : "4 2"}
              />
            );
          })}
        </g>

        {/* Nodes */}
        <g className="nodes">
          {nodePositions.map((node) => {
            const isHovered = hoveredNode === node.id;
            const isSelected = selectedNode === node.id;
            const isConnected = connectedToHovered.has(node.id);
            const isActive = isHovered || isSelected || isConnected;

            return (
              <g
                key={node.id}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() =>
                  setSelectedNode(selectedNode === node.id ? null : node.id)
                }
              >
                {/* Node circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.radius}
                  className={cn(
                    "transition-all duration-200",
                    isHovered || isSelected
                      ? "fill-primary stroke-primary"
                      : isConnected
                      ? "fill-primary/50 stroke-primary/50"
                      : "fill-muted stroke-muted-foreground/30"
                  )}
                  strokeWidth={isActive ? 2 : 1}
                />

                {/* Connection count label */}
                <text
                  x={node.x}
                  y={node.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className={cn(
                    "text-xs font-medium pointer-events-none",
                    isHovered || isSelected
                      ? "fill-primary-foreground"
                      : "fill-foreground"
                  )}
                >
                  {node.connectionCount}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Tooltip for selected/hovered node */}
      {(hoveredNode || selectedNode) && (
        <div className="absolute top-2 left-2 bg-background border rounded-lg shadow-lg p-3 text-sm max-w-[200px]">
          {nodePositions
            .filter((n) => n.id === (selectedNode || hoveredNode))
            .map((node) => (
              <div key={node.id}>
                <p className="font-medium truncate">{node.name}</p>
                <p className="text-muted-foreground text-xs">
                  {node.connectionCount} connection
                  {node.connectionCount !== 1 ? "s" : ""}
                </p>
              </div>
            ))}
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur rounded-lg p-2 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-muted-foreground/40" />
            <span className="text-muted-foreground">Connection</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-green-500" />
            <span className="text-muted-foreground">With Outcome</span>
          </div>
        </div>
      </div>
    </div>
  );
}
