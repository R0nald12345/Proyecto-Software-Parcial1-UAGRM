import UmlLink from "./uml-link";

class Composition extends UmlLink {

    defaults() {
      
      return util.defaultsDeep(
        {
          type: "Composition",
          attrs: {
            line: {
              sourceMarker: {
                type: "path",
                fill: COLORS.outlineColor,
                "stroke-width": 2,
                d: "M 10 -4 0 0 10 4 20 0 z"
              }
            }
          }
        },
        super.defaults()
      );
    }
  }

  export default Composition;