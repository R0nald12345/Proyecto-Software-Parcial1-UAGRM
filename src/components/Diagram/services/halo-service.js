/*! JointJS+ v4.0.1 - HTML5 Diagramming Framework - TRIAL VERSION

Copyright (c) 2024 client IO

 2024-09-10 


This Source Code Form is subject to the terms of the JointJS+ Trial License
, v. 2.0. If a copy of the JointJS+ License was not distributed with this
file, You can obtain one at https://www.jointjs.com/license
 or from the JointJS+ archive as was distributed by client IO. See the LICENSE file.*/

import * as joint from "@joint/plus";
const Position = joint.ui.Halo.HandlePosition;

export class HaloService {
  // Método para crear un halo para una vista de celda dada
  create(cellView) {
    new joint.ui.Halo({
      cellView, // La vista de celda para la que se crea el halo
      handles: this.getHaloConfig(), // Obtiene la configuración de los manejadores del halo
      useModelGeometry: true, // Indica si se debe utilizar la geometría del modelo
    }).render(); // Renderiza el halo en la vista
  }

  // Método para obtener la configuración de los manejadores del halo
  getHaloConfig() {
    return [
      {
        name: "remove",
        position: Position.NW,
        events: { pointerdown: "removeElement" },
        attrs: {
          ".handle": {
            "data-tooltip-class-name": "small",
            "data-tooltip": "Click to remove the object",
            "data-tooltip-position": "right",
            "data-tooltip-padding": 15,
          },
        },
      },
      {
        name: "fork",
        position: Position.NE,
        events: {
          pointerdown: "startForking",
          pointermove: "doFork",
          pointerup: "stopForking",
        },
        attrs: {
          ".handle": {
            "data-tooltip-class-name": "small",
            "data-tooltip":
              "Click and drag to clone and connect the object in one go",
            "data-tooltip-position": "left",
            "data-tooltip-padding": 15,
          },
        },
      },
      {
        name: "clone",
        position: Position.SE,
        events: {
          pointerdown: "startCloning",
          pointermove: "doClone",
          pointerup: "stopCloning",
        },
        attrs: {
          ".handle": {
            "data-tooltip-class-name": "small",
            "data-tooltip": "Click and drag to clone the object",
            "data-tooltip-position": "left",
            "data-tooltip-padding": 15,
          },
        },
      },
      {
        name: "unlink",
        position: Position.W,
        events: { pointerdown: "unlinkElement" },
        attrs: {
          ".handle": {
            "data-tooltip-class-name": "small",
            "data-tooltip": "Click to break all connections to other objects",
            "data-tooltip-position": "right",
            "data-tooltip-padding": 15,
          },
        },
      },
      //  {
      //      name: 'link',
      //      position: Position.E,
      //      events: { pointerdown: 'startLinking', pointermove: 'doLink', pointerup: 'stopLinking' },
      //      attrs: {
      //          '.handle': {
      //              'data-tooltip-class-name': 'small',
      //              'data-tooltip': 'Click and drag to connect the object',
      //              'data-tooltip-position': 'left',
      //              'data-tooltip-padding': 15
      //          }
      //      }
      //  },

      {
        name: "link",
        position: Position.E,
        events: { pointerdown: 'startLinking', pointermove: 'doLink', pointerup: 'stopLinking' },
        attrs: {
          ".handle": {
            "data-tooltip-class-name": "small",
            "data-tooltip": "Click and drag to connect the object",
            "data-tooltip-position": "left",
            "data-tooltip-padding": 15,
          },
        },
      },

      {
        name: "Association",
        position: Position.N,
        events: { pointerdown: 'startLinking', pointermove: 'doLink', pointerup: 'stopLinking' },
        attrs: {
          ".handle": {
            "data-tooltip-class-name": "small",
            "data-tooltip": "Click and drag to connect the object",
            "data-tooltip-position": "left",
            "data-tooltip-padding": 15,
          },
        },
      },
      {
        name: "Aggregation",
        position: Position.S,
        events: { pointerdown: 'startLinking', pointermove: 'doLink', pointerup: 'stopLinking' },
        attrs: {
          ".handle": {
            "data-tooltip-class-name": "small",
            "data-tooltip": "Click and drag to connect the object",
            "data-tooltip-position": "left",
            "data-tooltip-padding": 15,
          },
        },
      },



      {
        name: "rotate",
        position: Position.SW,
        events: {
          pointerdown: "startRotating",
          pointermove: "doRotate",
          pointerup: "stopBatch",
        },
        attrs: {
          ".handle": {
            "data-tooltip-class-name": "small",
            "data-tooltip": "Click and drag to rotate the object",
            "data-tooltip-position": "right",
            "data-tooltip-padding": 15,
          },
        },
      },
    ];
  }



//   showLinkDropdown(evt, cellView) {
//     const dropdown = this.createDropdownMenu();
//     document.body.appendChild(dropdown);

//     dropdown.style.position = "absolute";
//     dropdown.style.left = `${evt.clientX}px`;
//     dropdown.style.top = `${evt.clientY}px`;
//     dropdown.style.zIndex = 1000; // Asegúrate de que el dropdown esté por encima de otros elementos
//     dropdown.style.backgroundColor = "#fff"; // Fondo blanco para visibilidad
//     dropdown.style.border = "1px solid #ccc"; // Borde para visibilidad
//     dropdown.style.padding = "5px"; // Padding para mejor apariencia

//     dropdown.addEventListener("change", (event) => {
//         this.onDropdownChange(event, cellView);
//         document.body.removeChild(dropdown);
//     });

//     // Asegúrate de que el dropdown se enfoque para que el usuario pueda interactuar con él
//     dropdown.focus();
// }

//   createDropdownMenu() {
//     const dropdown = document.createElement("select");
//     const options = [
//       "Agregación",
//       "Composición",
//       "Generalización",
//       "Asociación",
//     ];
//     options.forEach((opt) => {
//       const option = document.createElement("option");
//       option.value = opt;
//       option.text = opt;
//       dropdown.appendChild(option);
//     });

//     return dropdown;
//   }

//   onDropdownChange(event, cellView) {
//     const selectedOption = event.target.value;
//     switch (selectedOption) {
//       case "Agregación":
//         console.log("Crear enlace de Agregación");
//         // Lógica para crear enlace de agregación
//         break;
//       case "Composición":
//         console.log("Crear enlace de Composición");
//         // Lógica para crear enlace de composición
//         break;
//       case "Generalización":
//         console.log("Crear enlace de Generalización");
//         // Lógica para crear enlace de generalización
//         break;
//       case "Asociación":
//         console.log("Crear enlace de Asociación");
//         // Lógica para crear enlace de asociación
//         break;
//     }
//   }
}
