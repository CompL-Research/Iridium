import {
  PTAFlowData,
  PTAFlowNode,
  StackNode,
  addStackPTANode,
  addStackEdges,
} from "./PTAFlowData.ts";

// a = [POINTEES]
export const handleSimpleAssignmentStatement = (
  mutableFlowData: PTAFlowData,
  qualifiedStackId: string,
  vs: Array<PTAFlowNode> | Set<PTAFlowNode>,
) => {
  const u = new StackNode(qualifiedStackId);
  addStackPTANode(mutableFlowData, u);
  addStackEdges(mutableFlowData, u, vs);
};
