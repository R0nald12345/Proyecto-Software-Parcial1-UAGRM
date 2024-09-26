import { shapes } from "@joint/plus";

class UmlLink extends shapes.standard.Link {
    defaults() {
      return util.defaultsDeep(
        {
          type: "UMLLink",
          attrs: {
            root: {
              pointerEvents: "none",
            },
            line: {
              stroke: COLORS.outlineColor,
              targetMarker: {
                type: "path",
                fill: "none",
                stroke: COLORS.outlineColor,
                "stroke-width": 2,
                d: "M 7 -4 0 0 7 4",
              },
            },
          },
        },
        super.defaults
      );
    }
  }
  
  
  export default UmlLink;