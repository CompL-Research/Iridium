//
// Add this THIS initialization statements inside functions that can create a THIS lexical scope.
// THIS is initialized to a special CTHIS value, which stands for ContextualThis = CTHIS
// We may be able to reduce functions into arrow function expressions, if the this pointer remains unused...
//

import { IV_Identifier } from "../ALL_AMP/ALL_AMP.ts";
import { ALL_IS } from "../ALL_IS/ALL_IS.ts";
import {
  IS1_AssignmentStmt,
  IS1_DeclarationStmt,
} from "../ALL_IS/IS_VarDecl.ts";
import {
  ISP_ClassMethod,
  ISP_ClassProperty,
  ISP_ObjectMethod,
} from "../ALL_RVal/ALL_ISP.ts";
import { IV_ASSIGNABLE } from "../ALL_RVal/ALL_RVal.ts";
import {
  IV_ArrPatAssn,
  IV_MemberAssn,
  IV_ObjPatAssn,
  IV_SimpleAssn,
  IV_SuperAssn,
  IV_ThisAssn,
} from "../ALL_RVal/IV_Assignment.ts";
import { IV_ClassExpression } from "../ALL_RVal/IV_ClassExpression.ts";
import { IV_FunctionExpression } from "../ALL_RVal/IV_FunctionExpression.ts";
import { IV_CTHIS, IV_STHIS } from "../ALL_RVal/IV_NonLang.ts";
import { IV_ObjectExpression } from "../ALL_RVal/IV_ObjectExpression.ts";
import { IV_This } from "../ALL_RVal/IV_This.ts";
import { BB } from "../BB.ts";
import { traverseInstructionRecDepthFirst } from "../Visitors/traverse.ts";
import { IRIDIUM_FG } from "./PTA/IRIDIUM_FG.ts";

export function addThisInitToFunctionBoundaries(rootFG: IRIDIUM_FG) {
  type ToScope =
    | IV_FunctionExpression
    | IV_ClassExpression
    | IV_ObjectExpression;
  // Find RValues where we might want to add this Init
  const checkRVal = (r: IV_ASSIGNABLE): ToScope => {
    if (r instanceof IV_FunctionExpression) {
      return r;
    } else if (r instanceof IV_ClassExpression) {
      return r;
    } else if (r instanceof IV_ObjectExpression) {
      return r;
    } else if (
      r instanceof IV_ThisAssn ||
      r instanceof IV_SuperAssn ||
      r instanceof IV_ArrPatAssn ||
      r instanceof IV_SimpleAssn ||
      r instanceof IV_MemberAssn ||
      r instanceof IV_ObjPatAssn
    ) {
      return checkRVal(r.RVal);
    }
    return undefined;
  };

  const toUpdate: Set<IRIDIUM_FG> = new Set();
  const toUpdateSThis: Set<IRIDIUM_FG> = new Set();

  traverseInstructionRecDepthFirst(
    rootFG,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (inst: ALL_IS, _bbInQestion: BB, _fgContext: IRIDIUM_FG) => {
      if (
        inst instanceof IS1_DeclarationStmt ||
        inst instanceof IS1_AssignmentStmt
      ) {
        const RVal: ToScope | undefined = checkRVal(inst.RVal);
        //
        // Function Expressions Case
        //
        if (RVal instanceof IV_FunctionExpression) {
          toUpdate.add(RVal.func.funBody);
        }

        //
        // Class Methods/Props
        //
        else if (RVal instanceof IV_ClassExpression) {
          for (const p of RVal.properties) {
            if (p instanceof ISP_ClassMethod) {
              if (!p.isStatic) toUpdate.add(p.funBody);
            } else if (p instanceof ISP_ClassProperty) {
              toUpdateSThis.add(p.value);
            }
          }
        }
        //
        // Object Methods
        //
        else if (RVal instanceof IV_ObjectExpression) {
          for (const p of RVal.properties) {
            if (p instanceof ISP_ObjectMethod) {
              toUpdate.add(p.funBody);
            }
          }
        }
      }
    },
  );

  // Add This Init Statements to a given FG
  const addThisInit = (fg: IRIDIUM_FG) => {
    const thisInit = new IS1_DeclarationStmt(
      fg,
      new IV_Identifier(undefined, IV_This.lookupName()),
      new IV_CTHIS(undefined),
    );
    fg.rootBB.statements = [thisInit, ...fg.rootBB.statements];
  };

  const addSThisInit = (fg: IRIDIUM_FG) => {
    const thisInit = new IS1_DeclarationStmt(
      fg,
      new IV_Identifier(undefined, IV_This.lookupName()),
      new IV_STHIS(undefined),
    );
    fg.rootBB.statements = [thisInit, ...fg.rootBB.statements];
  };
  for (const fg of toUpdate) {
    addThisInit(fg);
  }
  for (const fg of toUpdateSThis) {
    addSThisInit(fg);
  }
}
