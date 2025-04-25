import { isJS3ArrayExpression, isJS3BinaryExpression, isJS3MemberExpression, isJS3ObjectExpression, isJS3PrivateName, JS3ArrayExpression, JS3AssnInit, JS3ObjectExpression } from "../JS3Helpers/JS3Types.ts";
import { IRIDIUMV2 } from "./IRIDIUMV2.ts";
import debugConfig from "#debugConfig";
import { BinopSEXP, BooleanSEXP, EnvReadSEXP, IridiumSEXP, JSArraySEXP, NumberSEXP, StringSEXP } from "./Types.ts";
import { isIdentifier } from "@babel/types";

// Handle RValues | AMP
export const IRIV2_RVAL = (cx: IRIDIUMV2, init: JS3AssnInit) : IridiumSEXP => {


    //
    // AMP
    //
    if (isIdentifier(init)) {
      return new EnvReadSEXP(init.name);
    } else if (isJS3MemberExpression(init)) {
        debugConfig.logger.throwIriError("IRIV2 TODO: MemberExpression");
    }

    //
    // RValues
    //
    // Handle Literals
    if (init.type === "DecimalLiteral") {
        debugConfig.logger.throwIriError("IRIV2 TODO: Decimal Literal");
    } else if (init.type === "BigIntLiteral") {
        debugConfig.logger.throwIriError("IRIV2 TODO: BigInt Literal");
    } else if (init.type === "StringLiteral") {
        return new StringSEXP(init.value);
    } else if (init.type === "NumericLiteral") {
        return new NumberSEXP(init.value);
    } else if (init.type === "NullLiteral") {
        debugConfig.logger.throwIriError("IRIV2 TODO: NULL Literal");
    } else if (init.type === "BooleanLiteral") {
      return new BooleanSEXP(init.value);
    }

    // // JS3RegExp Literal
    // else if (isJS3RegExpLiteral(init)) {
    //   return this.handleJS3RegExpLiteral(init);
    // }

    // // JS3Template Literal
    // else if (isJS3TemplateLiteral(init)) {
    //   return this.handleJS3TemplateLiteral(init);
    // }

    // // JS3TaggedTemplateExpression
    // else if (isJS3TaggedTemplateExpression(init)) {
    //   return this.handleJS3TaggedTemplateExpression(init);
    // }

    // // JS3Meta Property
    // else if (isJS3MetaProperty(init)) {
    //   return this.handleJS3MetaProperty(init);
    // }

    // // JS3YieldExpression / JS3AwaitExpression
    // else if (isJS3YieldExpression(init)) {
    //   return this.handleJS3YieldExpression(init);
    // } else if (isJS3AwaitExpression(init)) {
    //   return this.handleJS3AwaitExpression(init);
    // }

    // // This Expression
    // else if (isThisExpression(init)) {
    //   return this.handleThisExpression(init);
    // }

    // // JS3CallExpression
    // else if (isJS3CallExpression(init)) {
    //   return this.handleJS3CallExpression(init);
    // }

    // // JS3CallExpression
    // else if (isJS3JSXCallExpression(init)) {
    //   return this.handleJS3JSXCallExpression(init);
    // }

    // // JS3ContextualCallExpression
    // else if (isJS3ContextualCallExpression(init)) {
    //   return this.handleJS3ContextualCallExpression(init);
    // }

    // JS3BinaryExpression
    else if (isJS3BinaryExpression(init)) {
      let left: IridiumSEXP;
      if (isJS3PrivateName(init.left)) {
        left = new EnvReadSEXP("#"+init.left.id.name);
      } else left = IRIV2_RVAL(cx, init.left);

      return new BinopSEXP(init.operator, left, IRIV2_RVAL(cx, init.right));
    }

    // // JS3AssignmentExpression
    // else if (isJS3AssignmentExpression(init)) {
    //   return this.handleJS3AssignmentExpression(init);
    // }

    // // JS3ConditionalExpression
    // else if (isJS3ConditionalExpression(init)) {
    //   return this.handleJS3ConditionalExpression(init);
    // }

    // JS3ObjectExpression
    else if (isJS3ObjectExpression(init)) {
      return handleObjectExpression(cx, init);
    }

    // // JS3FunctionExpression
    // else if (isJS3FunctionExpression(init)) {
    //   return this.handleJS3FunctionExpression(init);
    // }

    // // JS3ArrowFunctionExpression
    // else if (isJS3ArrowFunctionExpression(init)) {
    //   return this.handleJS3ArrowFunctionExpression(init);
    // }

    // JS3ArrayExpression
    else if (isJS3ArrayExpression(init)) {
      return handleArrayExpression(cx, init);
    }

    // // JS3NewExpression
    // else if (isJS3NewExpression(init)) {
    //   return this.handleJS3NewExpression(init);
    // }

    // // JS3UnaryExpression
    // else if (isJS3UnaryExpression(init)) {
    //   return this.handleJS3UnaryExpression(init);
    // }

    // // JS3UpdateExpression
    // else if (isJS3UpdateExpression(init)) {
    //   return this.handleJS3UpdateExpression(init);
    // }

    // // JS3ClassExpression
    // else if (isJS3ClassExpression(init)) {
    //   return this.handleJS3ClassExpression(init);
    // }

    // //
    // // Handlers
    // //

    // // OptionalMemberExpression | OptionalCallExpression
    // else if (
    //   isOptionalMemberExpression(init) ||
    //   isOptionalCallExpression(init)
    // ) {
    //   return this.handleOptionalChainExpression(init);
    // }

    // // JS3AnonMemberExpression
    // else if (isJS3AnonMemberExpression(init)) {
    //   return this.handleJS3AnonMemberExpression(init);
    // }

    // // JS3DefaultExportMemberExpression
    // else if (isJS3DefaultExportMemberExpression(init)) {
    //   return this.handleJS3DefaultExportMemberExpression(init);
    // }

    debugConfig.logger.throwIriError(// @ts-ignore
        `IRIDIUM: Unhandled Statement ${init.type}, ${init.js3type ? init.js3type : undefined}`,
    );
    return null;
}

const handleArrayExpression = (cx: IRIDIUMV2, init: JS3ArrayExpression) => {
  const args = init.elements.map((e) => {
    if (isIdentifier(e)) {
      return IRIV2_RVAL(cx, e);
    } else {
      debugConfig.logger.throwIriError("IRIV2 TODO: Array Expression Spread");
    }
  });
  return new JSArraySEXP(args);
}

const handleObjectExpression = (cx: IRIDIUMV2, init: JS3ObjectExpression) => {
  debugConfig.logger.throwIriError("IRIV2 TODO: JS3ObjectExpression");

  return null;
  // const args = init.properties.map((e) => {
  //   if (isJS3MemberExpression(e)) {
  //     return IRIV2_RVAL(cx, e);
  //   } else {
  //     debugConfig.logger.throwIriError("IRIV2 TODO: Object Expression Spread");
  //   }
  // });
  // return new JSObjectSEXP(args);
}