import * as joint from "@joint/plus";
import * as appShapes from "../shapes/app-shapes";
import { DirectedGraph } from "@joint/layout-directed-graph";
import { db } from "../../../firebase/config";
import { collection, setDoc, onSnapshot, doc } from "firebase/firestore";

// Definición de la clase KitchenSinkService
// Constructor de la clase
class KitchenSinkService {
  constructor(
    el,
    stencilService,
    toolbarService,
    inspectorService,
    haloService,
    keyboardService
  ) {
    this.el = el;
    const view = new joint.mvc.View({ el });
    view.delegateEvents({
      'mouseup input[type="range"]': (evt) => evt.target.blur(),
    });

    this.stencilService = stencilService;
    this.toolbarService = toolbarService;
    this.inspectorService = inspectorService;
    this.haloService = haloService;
    this.keyboardService = keyboardService;
    this.db = db; // Asigno la instancia de Firestore
  }

  // Método para iniciar Rappid con las configuraciones y servicios necesarios
  startRappid() {
    joint.setTheme("modern");

    this.initializePaper();
    this.initializeStencil();
    this.initializeSelection();
    this.initializeToolsAndInspector();
    this.initializeNavigator();
    this.initializeToolbar();
    this.initializeKeyboardShortcuts();
    this.initializeTooltips();
    this.setupRealtimeListeners(); // Asegúrate de configurar los listeners en tiempo real
  }

  // Método para configurar los listeners en tiempo real
  setupRealtimeListeners() {
    const docRef = collection(this.db, "graphs");

    onSnapshot(
      docRef,
      (snapshot) => {
        console.log("Snapshot received", snapshot);
        this.graph.clear(); // Limpiar el gráfico antes de aplicar los cambios

        snapshot.forEach((doc) => {
          const cellData = doc.data();
          console.log("Doc data", cellData);
          const cell = this.graph.getCell(cellData.id);

          if (cell) {
            cell.set(cellData);
          } else {
            if (cellData.type === "app.Link") {
              this.graph.addCell(new appShapes.app.Link(cellData));
            } else {
              this.graph.addCell(cellData);
            }
          }
        });

        snapshot.docChanges().forEach((change) => {
          console.log("Doc change", change);
          const cellData = change.doc.data();

          if (change.type === "added" || change.type === "modified") {
            let cell = this.graph.getCell(cellData.id);

            if (cell) {
              cell.set(cellData);
            } else {
              if (cellData.type === "app.Link") {
                this.graph.addCell(new appShapes.app.Link(cellData));
              } else {
                this.graph.addCell(cellData);
              }
            }
          }

          if (change.type === "removed") {
            let cell = this.graph.getCell(cellData.id);
            if (cell) {
              cell.remove();
            }
          }
        });
      },
      (error) => {
        console.error("Error receiving snapshot: ", error);
      }
    );
}


  // Método para guardar cambios en Firestore
  async saveGraphToFirestore(cell, opt) {
    if (opt.ignoreSave) return;

    const docRef = doc(collection(this.db, "graphs"), cell.id);

    await setDoc(docRef, {
      id: cell.id,
      ...cell.toJSON(),
    });
  }

  initializePaper() {
    const graph = (this.graph = new joint.dia.Graph({}, { cellNamespace: appShapes }));
    this.commandManager = new joint.dia.CommandManager({ graph });

    const paper = (this.paper = new joint.dia.Paper({
        width: 1000,
        height: 1000,
        gridSize: 10,
        drawGrid: true,
        model: graph,
        cellViewNamespace: appShapes,
        defaultLink: new appShapes.app.Link(),
        defaultConnectionPoint: appShapes.app.Link.connectionPoint,
        interactive: { linkMove: false, vertexAdd: true },
        async: true,
        sorting: joint.dia.Paper.sorting.APPROX,
    }));

    paper.on("change:position change:size change:source change:target", (cell, opt) => {
        console.log("Change detected", cell, opt); // Asegúrate de que esto se está llamando
        this.saveGraphToFirestore(cell, opt);
    });

    this.snaplines = new joint.ui.Snaplines({ paper });
    const paperScroller = (this.paperScroller = new joint.ui.PaperScroller({
        paper,
        autoResizePaper: true,
        scrollWhileDragging: true,
        cursor: "grab",
    }));

    this.renderPlugin(".paper-container", paperScroller);
    paperScroller.render().center();

    paper.on("blank:contextmenu", (evt) => {
        this.renderContextToolbar({ x: evt.clientX, y: evt.clientY });
    });

    paper.on("cell:contextmenu", (cellView, evt) => {
        this.renderContextToolbar({ x: evt.clientX, y: evt.clientY }, [ cellView.model ]);
    });
}


  // Método para detener y limpiar Rappid
  stopRappid() {
    this.paper.remove();
    this.paperScroller.remove();
    this.stencilService.stencil.remove();
    this.selection.remove();
    this.toolbarService.toolbar.remove();
    this.keyboardService.keyboard.stopListening();
    this.tooltip.remove();
  }
  // Inicializa el Stencil (panel de componentes)

  initializeStencil() {
    const { stencilService, paperScroller, snaplines } = this;

    stencilService.create(paperScroller, snaplines);

    this.renderPlugin(".stencil-container", stencilService.stencil);

    stencilService.setShapes();

    stencilService.stencil.on("element:drop", (elementView) => {
      this.selection.collection.reset([elementView.model]);
    });
  }

  // Inicializa la selección de elementos
  initializeSelection() {
    this.clipboard = new joint.ui.Clipboard();
    this.selection = new joint.ui.Selection({
      paper: this.paperScroller,
      useModelGeometry: true,
      translateConnectedLinks:
        joint.ui.Selection.ConnectedLinksTranslation.SUBGRAPH,
    });

    this.selection.collection.on(
      "reset add remove",
      this.onSelectionChange.bind(this)
    );

    const keyboard = this.keyboardService.keyboard;

    this.paper.on("blank:pointerdown", (evt, x, y) => {
      if (keyboard.isActive("shift", evt)) {
        this.selection.startSelecting(evt);
      } else {
        this.selection.collection.reset([]);
        this.paperScroller.startPanning(evt);
        this.paper.removeTools();
      }
    });

    this.paper.on(
      "cell:pointerdown element:magnet:pointerdown",
      (cellView, evt) => {
        if (keyboard.isActive("shift", evt)) {
          cellView.preventDefaultInteraction(evt);
          this.selection.startSelecting(evt);
        }
      }
    );

    this.paper.on("element:pointerdown", (elementView, evt) => {
      if (keyboard.isActive("ctrl meta", evt)) {
        this.selection.collection.add(elementView.model);
      }
    });

    this.graph.on("remove", (cell) => {
      if (this.selection.collection.has(cell)) {
        this.selection.collection.reset(
          this.selection.collection.models.filter((c) => c !== cell)
        );
      }
    });

    this.selection.on(
      "selection-box:pointerdown",
      (elementView, evt) => {
        if (keyboard.isActive("ctrl meta", evt)) {
          this.selection.collection.remove(elementView.model);
        }
      },
      this
    );

    this.selection.on(
      "selection-box:pointerup",
      (elementView, evt) => {
        if (evt.button === 2) {
          evt.stopPropagation();
          this.renderContextToolbar(
            { x: evt.clientX, y: evt.clientY },
            this.selection.collection.toArray()
          );
        }
      },
      this
    );
  }

  // Método llamado cuando la selección cambia
  onSelectionChange() {
    const { paper, selection } = this;
    const { collection } = selection;
    paper.removeTools();
    joint.ui.Halo.clear(paper);
    joint.ui.FreeTransform.clear(paper);
    joint.ui.Inspector.close();
    if (collection.length === 1) {
      const primaryCell = collection.first();
      const primaryCellView = paper.findViewByModel(primaryCell);
      selection.destroySelectionBox(primaryCell);
      this.selectPrimaryCell(primaryCellView);
    } else if (collection.length === 2) {
      collection.each(function (cell) {
        selection.createSelectionBox(cell);
      });
    }
  }

  // Selecciona la celda primaria y aplica las herramientas apropiadas
  selectPrimaryCell(cellView) {
    const cell = cellView.model;
    if (cell.isElement()) {
      this.selectPrimaryElement(cellView);
    } else {
      this.selectPrimaryLink(cellView);
    }
    this.inspectorService.create(cell);
  }

  // Aplica las herramientas a un elemento primario
  selectPrimaryElement(elementView) {
    const element = elementView.model;

    new joint.ui.FreeTransform({
      cellView: elementView,
      allowRotation: false,
      preserveAspectRatio: !!element.get("preserveAspectRatio"),
      allowOrthogonalResize: element.get("allowOrthogonalResize") !== false,
    }).render();

    this.haloService.create(elementView); // Asegura que el halo está correctamente configurado
  }

  // Aplica las herramientas a un enlace primario
  selectPrimaryLink(linkView) {
    const ns = joint.linkTools;
    const toolsView = new joint.dia.ToolsView({
      name: "link-pointerdown",
      tools: [
        new ns.Vertices(), // Herramienta para manejar vértices
        new ns.SourceAnchor(), // Herramienta para el ancla de origen
        new ns.TargetAnchor(), // Herramienta para el ancla de destino
        new ns.SourceArrowhead(), // Herramienta para la flecha de origen
        new ns.TargetArrowhead(), // Herramienta para la flecha de destino
        new ns.Segments(), // Herramienta para manejar segmentos
        new ns.Boundary({ padding: 15 }), // Herramienta para el límite con margen
        new ns.Remove({ offset: -20, distance: 40 }), // Herramienta de eliminación de enlace
      ],
    });

    linkView.addTools(toolsView); // Añade las herramientas al enlace
  }

  // Initialice las herramientas y el inspector
  initializeToolsAndInspector() {
    // Evento para manejar cuando se suelta el clic en una celda
    this.paper.on("cell:pointerup", (cellView) => {
      const cell = cellView.model;
      const { collection } = this.selection;
      if (collection.includes(cell)) {
        return;
      }
      // Reinicia la colección con el nuevo elemento seleccionado
      collection.reset([cell]);
    });

    // Evento cuando el ratón entra en un enlace
    this.paper.on("link:mouseenter", (linkView) => {
      // Sólo abre la herramienta si no hay ninguna ya
      if (linkView.hasTools()) {
        return;
      }

      const ns = joint.linkTools;
      const toolsView = new joint.dia.ToolsView({
        name: "link-hover",
        tools: [
          new ns.Vertices({ vertexAdding: false }),
          new ns.SourceArrowhead(),
          new ns.TargetArrowhead(),
        ],
      });

      linkView.addTools(toolsView);
    });

    // Evento cuando el ratón sale de un enlace
    this.paper.on("link:mouseleave", (linkView) => {
      // Remueve sólo la herramienta de hover, no la de pointerdown
      if (linkView.hasTools("link-hover")) {
        linkView.removeTools();
      }
    });

    // Evento cuando hay cambios en el gráfico
    this.graph.on("change", (cell, opt) => {
      if (!cell.isLink() || !opt.inspector) {
        return;
      }

      const ns = joint.linkTools;
      const toolsView = new joint.dia.ToolsView({
        name: "link-inspected",
        tools: [new ns.Boundary({ padding: 15 })],
      });

      // Renderiza el navegador en el contenedor especificado
      cell.findView(this.paper).addTools(toolsView);
    });
  }

  // Inicializa el navegador
  initializeNavigator() {
    const navigator = (this.navigator = new joint.ui.Navigator({
      width: 240,
      height: 115,
      paperScroller: this.paperScroller,
      zoom: false,
      paperOptions: {
        async: true,
        sorting: joint.dia.Paper.sorting.NONE,
        elementView: appShapes.NavigatorElementView,
        linkView: appShapes.NavigatorLinkView,
        cellViewNamespace: {
          /* no other views are accessible in the navigator */
        },
      },
    }));

    this.renderPlugin(".navigator-container", navigator);
  }

  // Inicializa la barra de herramientas
  initializeToolbar() {
    // Crea la barra de herramientas con servicios necesarios
    this.toolbarService.create(this.commandManager, this.paperScroller);

    // Define eventos específicos para los botones de la barra de herramientas
    this.toolbarService.toolbar.on({
      "svg:pointerclick": this.openAsSVG.bind(this),
      "png:pointerclick": this.openAsPNG.bind(this),
      "to-front:pointerclick": this.applyOnSelection.bind(this, "toFront"),
      "to-back:pointerclick": this.applyOnSelection.bind(this, "toBack"),
      "layout:pointerclick": this.layoutDirectedGraph.bind(this),
      "snapline:change": this.changeSnapLines.bind(this),
      "clear:pointerclick": this.graph.clear.bind(this.graph),
      "print:pointerclick": () =>
        joint.format.print(this.paper, { grid: true }),
      "grid-size:change": this.paper.setGridSize.bind(this.paper),
    });

    // Renderiza la barra de herramientas en el contenedor especificado
    this.renderPlugin(".toolbar-container", this.toolbarService.toolbar);
  }

  // Renderiza la barra de herramientas contextual
  renderContextToolbar(point, cellsToCopy = []) {
    this.selection.collection.reset(cellsToCopy);
    const contextToolbar = new joint.ui.ContextToolbar({
      target: point,
      root: this.paper.el,
      padding: 0,
      vertical: true,
      anchor: "top-left",
      tools: [
        {
          action: "copy",
          content: "Copy",
          attrs: {
            disabled: cellsToCopy.length === 0,
          },
        },
        {
          action: "paste",
          content: "Paste",
          attrs: {
            disabled: this.clipboard.isEmpty(),
          },
        },
      ],
    });

    // Evento para copiar elementos seleccionados
    contextToolbar.on("action:copy", () => {
      contextToolbar.remove();

      this.clipboard.copyElements(cellsToCopy, this.graph);
    });

    // Evento para pegar elementos desde el portapapeles
    contextToolbar.on("action:paste", () => {
      contextToolbar.remove();
      const pastedCells = this.clipboard.pasteCellsAtPoint(
        this.graph,
        this.paper.clientToLocalPoint(point)
      );

      const elements = pastedCells.filter((cell) => cell.isElement());

      // Asegura que los elementos pegados se seleccionan inmediatamente
      this.selection.collection.reset(elements);
    });
    contextToolbar.render();
  }

  // Aplica una acción sobre la selección actual
  applyOnSelection(method) {
    this.graph.startBatch("selection");
    this.selection.collection.models.forEach(function (model) {
      model[method]();
    });
    this.graph.stopBatch("selection");
  }

  // Activa o desactiva las líneas de ajuste
  changeSnapLines(checked) {
    if (checked) {
      this.snaplines.enable();
    } else {
      this.snaplines.disable();
    }
  }

  // Inicializa los atajos de teclado
  initializeKeyboardShortcuts() {
    this.keyboardService.create(
      this.graph,
      this.clipboard,
      this.selection,
      this.paperScroller,
      this.commandManager
    );
  }

  // Inicializa los tooltips (ayudas visuales emergentes)
  initializeTooltips() {
    this.tooltip = new joint.ui.Tooltip({
      rootTarget: document.body,
      target: "[data-tooltip]",
      direction: joint.ui.Tooltip.TooltipArrowPosition.Auto,
      padding: 10,
    });
  }

  // Abre el lienzo como una imagen SVG
  openAsSVG() {
    this.paper.hideTools(); // Oculta las herramientas del papel
    joint.format.toSVG(
      this.paper, // Convierte el papel a SVG
      (svg) => {
        // Crea y abre un lightbox con la imagen SVG resultante
        new joint.ui.Lightbox({
          image: "data:image/svg+xml," + encodeURIComponent(svg),
          downloadable: true, // Permite descargar la imagen
          fileName: "Rappid", // Nombre predeterminado del archivo descargado
        }).open();
        this.paper.showTools(); // Muestra las herramientas del papel una vez que se ha generado la imagen
      },
      {
        preserveDimensions: true, // Preserva las dimensiones originales del papel
        convertImagesToDataUris: true, // Convierte las imágenes a Data URIs
        useComputedStyles: false, // No usa estilos calculados
        grid: true, // Incluye la cuadrícula en la exportación
      }
    );
  }

  // Abre el lienzo como una imagen PNG
  openAsPNG() {
    this.paper.hideTools(); // Oculta las herramientas del papel
    joint.format.toPNG(
      this.paper, // Convierte el papel a PNG
      (dataURL) => {
        // Crea y abre un lightbox con la imagen PNG resultante
        new joint.ui.Lightbox({
          image: dataURL,
          downloadable: true, // Permite descargar la imagen
          fileName: "Rappid", // Nombre predeterminado del archivo descargado
        }).open();
        this.paper.showTools(); // Muestra las herramientas del papel una vez que se ha generado la imagen
      },
      {
        padding: 10, // Padding alrededor del contenido convertido
        useComputedStyles: false, // No usa estilos calculados
        grid: true, // Incluye la cuadrícula en la exportación
      }
    );
  }
  // Organiza el gráfico usando el algoritmo de gráfico dirigido
  layoutDirectedGraph() {
    DirectedGraph.layout(this.graph, {
      setVertices: true, // Ajusta los vértices
      rankDir: "TB", // Dirección del rank de arriba a abajo (Top to Bottom)
      marginX: 100, // Margen horizontal
      marginY: 100, // Margen vertical
    });

    // Centra el contenido del papel usando la geometría del modelo
    this.paperScroller.centerContent({ useModelGeometry: true });
  }
  // Renderiza un plugin en el selector especificado
  renderPlugin(selector, plugin) {
    // Agrega el elemento del plugin al DOM
    this.el.querySelector(selector).appendChild(plugin.el);
    plugin.render(); // Renderiza el plugin
  }
}

export default KitchenSinkService;
