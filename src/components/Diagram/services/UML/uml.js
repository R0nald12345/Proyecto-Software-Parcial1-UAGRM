
import {shapes} from '@joint/plus'


class Uml extends shapes.standard.Record {

    defaults() {
      return util.defaultsDeep(
        {
          thickness: 2,
          headerColor: COLORS.header,
          textColor: COLORS.text,
          outlineColor: COLORS.outline,
          color: COLORS.main,
          itemHeight: 2 * UNIT,
          itemOffset: 5,
          umlName: "",
          umlType: "",
          attrs: {
            root: {
              magnetSelector: "body"
            },
            body: {
              width: "calc(w)",
              height: "calc(h)",
              stroke: "#000000",
              fill: "#FFFFFF",
              rx: RADIUS,
              ry: RADIUS
            },
            header: {
              width: "calc(w)",
              stroke: "#000000",
              fill: "transparent"
            },
            typeNameLabel: {
              x: "calc(0.5 * w)",
              height: "calc(h)",
              textAnchor: "middle",
              textVerticalAnchor: "middle",
              fontSize: 14,
              fill: "none",
              fontFamily: "sans-serif"
            },
            umlNameLabel: {
              x: "calc(0.5 * w)",
              fontFamily: "sans-serif",
              textAnchor: "middle",
              textVerticalAnchor: "middle",
              fontSize: 18,
              fontWeight: "bold",
              fill: COLORS.textColor
            },
            itemLabel_attributesHeader: {
              fontFamily: "sans-serif",
              fontStyle: "italic",
              textAnchor: "middle",
              x: "calc(0.5 * w)",
              fontSize: 12
            },
            itemLabel_operationsHeader: {
              fontFamily: "sans-serif",
              fontStyle: "italic",
              textAnchor: "middle",
              x: "calc(0.5 * w)",
              fontSize: 12
            },
            itemLabels_static: {
              textDecoration: "underline"
            },
            itemLabels: {
              fontFamily: "sans-serif"
            }
          }
        },
        super.defaults
      );
    }
  
    preinitialize(...args) {
      super.preinitialize(...args);
      this.markup = [
        {
          tagName: "rect",
          selector: "body"
        },
        {
          tagName: "rect",
          selector: "header"
        },
        {
          tagName: "text",
          selector: "umlNameLabel"
        },
        {
          tagName: "text",
          selector: "typeNameLabel"
        }
      ];
    }
  
    buildHeader() {
      const {
        umlType,
        umlName,
        textColor,
        outlineColor,
        headerColor,
        thickness
      } = this.attributes;
  
      return {
        header: {
          stroke: outlineColor,
          strokeWidth: thickness,
          height: TYPE_HEIGHT + NAME_HEIGHT,
          fill: headerColor
        },
        typeNameLabel: {
          y: TYPE_HEIGHT,
          text: `<<${umlType}>>`,
          fill: textColor,
          textVerticalAnchor: "bottom"
        },
        umlNameLabel: {
          y: TYPE_HEIGHT + NAME_HEIGHT / 2,
          text: umlName,
          fill: textColor
        }
      };
    }
  }

  export default Uml;