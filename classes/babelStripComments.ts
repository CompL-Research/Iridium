export default function () {
  return {
    visitor: {
      Program(path: any) {
        path.traverse({
          enter(p: any) {
            delete p.node.leadingComments;
            delete p.node.trailingComments;
            delete p.node.innerComments;
          },
        });
      },
    },
  };
};