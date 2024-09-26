

import UmlLink from "./uml-link";

class Aggregation extends UmlLink {
  defaults() {
    return util.defaultsDeep(
      {
        type: "Aggregation",
        attrs: {
          line: {
            sourceMarker: {
              type: "path",
              fill: COLORS.background,
              "stroke-width": 2,
              d: "M 10 -4 0 0 10 4 20 0 z",
            },
          },
        },
      },
      super.defaults()
    );
  }
}


export default Aggregation;