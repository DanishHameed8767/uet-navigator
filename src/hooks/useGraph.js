import { useMemo } from "react";
import { buildGraph } from "../data-structures/graph";

export default function useGraph(nodesJson, edgesJson) {
  const graphBundle = useMemo(() => {
    if (!Array.isArray(nodesJson) || !Array.isArray(edgesJson)) {
      return {
        graph: null,
        render: { nodes: [], edges: [] },
        indexes: {},
        meta: { invalidEdgesCount: 0 },
      };
    }

    return buildGraph(nodesJson, edgesJson);
  }, [nodesJson, edgesJson]);

  return graphBundle;
}
