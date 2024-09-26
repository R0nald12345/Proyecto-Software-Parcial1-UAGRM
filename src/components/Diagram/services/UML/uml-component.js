import Uml from "./uml";

class UmlComponent extends Uml {
    defaults() {
      return {
        ...super.defaults(),
        type: "UMLComponent",
        subComponents: [],
        ports: {
          groups: {
            subComponents: {
              position: {
                name: "bottom"
              }
            }
          }
        }
      };
    }
  
    initialize(...args) {
      super.initialize(...args);
      this.buildShape();
    }
  
    buildShape(opt = {}) {
      const {
        subComponents,
        outlineColor,
        thickness,
        color,
        textColor
      } = this.attributes;
  
      this.removePorts();
  
      if (subComponents.length > 0) {
        subComponents.forEach((subComponent) => {
          const { name, type, subheader } = subComponent;
          this.addPort(
            getPackagePort(name, type, subheader, color, outlineColor, thickness)
          );
        });
      }
  
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
                fill: color
              },
              ...headerAttrs,
              itemLabels: {
                fill: textColor
              },
              itemBody_delimiter: {
                fill: outlineColor
              }
            },
            this.attr()
          )
        },
        opt
      );
    }
  }
  
  
  export default UmlComponent;