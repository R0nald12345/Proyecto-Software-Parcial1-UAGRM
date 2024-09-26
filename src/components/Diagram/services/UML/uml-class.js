import Uml from "./uml";

class UmlClass extends Uml {
  defaults() {
    return {
      ...super.defaults(),
      type: "UMLClass",
      attributesHeader: "",
      operationsHeader: "",
    };
  }

  initialize(...args) {
    super.initialize(...args);
    this.buildItems();
  }

  buildItems(opt = {}) {
    const {
      attributesHeader,
      operationsHeader,
      color,
      outlineColor,
      textColor,
      attributes = [],
      operations = [],
      thickness,
    } = this.attributes;

    const attributesItems = attributes.map((attribute, index) => {
      const {
        visibility = "+",
        name = "",
        type = "",
        isStatic = false,
      } = attribute;
      return {
        id: `attribute${index}`,
        label: `${name}: ${type}`,
        icon: this.getVisibilityIcon(visibility, textColor),
        group: isStatic ? "static" : null,
      };
    });

    const operationsItems = operations.map((operation, index) => {
      const {
        visibility = "+",
        name = "",
        returnType = "",
        parameters = [],
        isStatic = false,
      } = operation;

      const nameParams = parameters
        ? parameters.map((parameter) => {
            const { name = "", returnType = "" } = parameter;
            return `${name}: ${returnType}`;
          })
        : [];

      return {
        id: `operation${index}`,
        label: `${name}(${nameParams.join(",")}): ${returnType}`,
        icon: this.getVisibilityIcon(visibility, textColor),
        group: isStatic ? "static" : null,
      };
    });

    const items = [];

    if (attributesHeader) {
      items.push({
        id: "attributesHeader",
        label: attributesHeader,
      });
    }

    items.push(...attributesItems);

    if (attributesItems.length > 0 && operationsItems.length > 0) {
      items.push({
        id: "delimiter",
        height: thickness,
        label: "",
      });
    }

    if (operationsHeader) {
      items.push({
        id: "operationsHeader",
        label: operationsHeader,
      });
    }

    items.push(...operationsItems);

    const headerAttrs = this.buildHeader();
    const padding = util.normalizeSides(this.get("padding"));

    this.set(
      {
        padding: { ...padding, top: TYPE_HEIGHT + NAME_HEIGHT },
        attrs: util.defaultsDeep(
          {
            body: {
              stroke: outlineColor,
              strokeWidth: thickness,
              fill: color,
            },
            ...headerAttrs,
            itemLabels: {
              fill: textColor,
            },
            itemBody_delimiter: {
              fill: outlineColor,
            },
          },
          this.attr()
        ),
        items: [items],
      },
      opt
    );
  }
  getVisibilityIcon(visibility, color) {
    const d = {
      "+": "M 8 0 V 16 M 0 8 H 16",
      "-": "M 0 8 H 16",
      "#": "M 5 0 3 16 M 0 5 H 16 M 12 0 10 16 M 0 11 H 16",
      "~": "M 0 8 A 4 4 1 1 1 8 8 A 4 4 1 1 0 16 8",
      "/": "M 12 0 L 4 16",
    }[visibility];
    return `data:image/svg+xml;utf8,${encodeURIComponent(`<svg
                    xmlns='http://www.w3.org/2000/svg'
                    xmlns:xlink='http://www.w3.org/1999/xlink'
                    version='1.1'
                    viewBox='-3 -3 22 22'
                >
                    <path d='${d}' stroke='${color}' stroke-width='2' fill='none'/>
                </svg>`)}`;
  }
}

// Enable UML elements and links to be recreated from JSON
// Test: graph.fromJSON(graph.toJSON())
Object.assign(shapeNamespace, {
  UMLClass,
  UMLComponent,
  Composition,
  Aggregation,
});

export default UmlClass;
