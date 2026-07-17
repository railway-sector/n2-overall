import Collection from "@arcgis/core/core/Collection";
import ActionButton from "@arcgis/core/support/actions/ActionButton";
import LineCallout3D from "@arcgis/core/symbols/callouts/LineCallout3D";
import LabelClass from "@arcgis/core/layers/support/LabelClass";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";
import UniqueValueRenderer from "@arcgis/core/renderers/UniqueValueRenderer";
import SimpleRenderer from "@arcgis/core/renderers/SimpleRenderer";
import TextSymbol3DLayer from "@arcgis/core/symbols/TextSymbol3DLayer";
import LabelSymbol3D from "@arcgis/core/symbols/LabelSymbol3D";
import SolidEdges3D from "@arcgis/core/symbols/edges/SolidEdges3D";
import SimpleLineSymbol from "@arcgis/core/symbols/SimpleLineSymbol";
import PolygonSymbol3D from "@arcgis/core/symbols/PolygonSymbol3D";
import ExtrudeSymbol3DLayer from "@arcgis/core/symbols/ExtrudeSymbol3DLayer";
import PointSymbol3D from "@arcgis/core/symbols/PointSymbol3D";
import IconSymbol3DLayer from "@arcgis/core/symbols/IconSymbol3DLayer";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol";
import CustomContent from "@arcgis/core/popup/content/CustomContent";
import PopupTemplate from "@arcgis/core/PopupTemplate";
import LineSymbol3D from "@arcgis/core/symbols/LineSymbol3D.js";
import PathSymbol3DLayer from "@arcgis/core/symbols/PathSymbol3DLayer.js";
import WebStyleSymbol from "@arcgis/core/symbols/WebStyleSymbol.js";
import SizeVariable from "@arcgis/core/renderers/visualVariables/SizeVariable.js";
import ColorVariable from "@arcgis/core/renderers/visualVariables/ColorVariable.js";
import RotationVariable from "@arcgis/core/renderers/visualVariables/RotationVariable.js";
import MeshSymbol3D from "@arcgis/core/symbols/MeshSymbol3D.js";
import FillSymbol3DLayer from "@arcgis/core/symbols/FillSymbol3DLayer.js";
import { highlightLot, toAsofdate, yearMonthDay } from "./query";
import { ngcp_tagged_structureLayer } from "./layers";
import type { ArcgisScene } from "@arcgis/map-components/components/arcgis-scene";

const arcgisScene = document.querySelector("arcgis-scene") as ArcgisScene;

//----------------------------------------------//
//              portalItem                      //
//----------------------------------------------//
const portalItem_url = { url: "https://gis.railway-sector.com/portal" };

export const portalItems = (id: any) => {
  return { id: id, portal: portalItem_url };
};

export const cpackages = ["All", "N-01", "N-02", "N-03", "N-04"];

export const monitorLists = [
  "Land Acquisition",
  "Structure",
  "Non Land Owner",
  "Utility Relocation",
  "Trees",
  "Viaduct",
];

//----------------------------------------------//
//              Chart Parameters                //
//----------------------------------------------//
export const chart_width = "26vw";
export const chart_box_width = 250;

export const construction_status = [
  "To be Constructed",
  "Under Construction",
  "Completed",
];

// Chart and chart label color
export const primaryLabelColor = "#9ca3af";
export const valueLabelColor = "#d1d5db";

//----------------------------------------------//
//          Lot Layer Parameters                //
//----------------------------------------------//
//--- Layer Fields
// Acronym:
// ho: handed over
// hoa: handed-over area
// hod: handed-over date
// pri: priority
// lu: land use
// pho: percent handed-over area
// aa: affected area

export const cp_f = "CP";
export const municipality_f = "Municipality";
export const barangay_f = "Barangay";

export const lot_hod_f = "HandOverDate";
export const lot_hdod_f = "HandedOverDate";
export const lot_id_f = "LotID";
export const lot_pri_f = "Priority1_1";
export const lot_status_f = "StatusLA";
export const lot_lo_f = "LandOwner";
export const lot_lu_f = "LandUse";
export const lot_endorsed_f = "Endorsed";
export const lot_ho_f = "HandedOver";
export const lot_hoa_f = "HandedOverArea";
export const lot_pho_f = "percentHandedOver";
export const lot_aa_f = "AffectedArea";
export const lot_tunnel_f = "TunnelAffected";
export const lot_urgent_f = "Urgent";
export const lot_urgent_q = `${lot_urgent_f} = 0`;
export const lot_urgent_switch = ["OFF", "ON"];

export const lot_endorsed_arr = ["Not Endorsed", "Endorsed", "NA"];

//--- LOT LAYER ---//
//Layer Query
export const lot_status_q = [
  { value: 1, category: "Paid", color: "#00734d" },
  { value: 2, category: "For Payment Processing", color: "#0070ff" },
  { value: 3, category: "For Legal Pass", color: "#ffff00" },
  { value: 4, category: "For Offer to Buy", color: "#ffaa00" },
  { value: 5, category: "For Notice of Taking", color: "#FF5733" },
  { value: 6, category: "With PTE", color: "#70AD47" },
  { value: 7, category: "For Expropriation", color: "#6f0000" },
  { value: 8, category: "Optimized", color: "#B2B2B2" },
];

//--- Layer Labels
export const lot_label = new LabelClass({
  labelExpressionInfo: { expression: "$feature.LotID" },
  symbol: {
    type: "text",
    color: "black",
    haloColor: "white",
    haloSize: 0.5,
    font: {
      size: 11,
      weight: "bold",
    },
  },
});

export const lot_symbol = new SimpleFillSymbol({
  color: [0, 0, 0, 0],
  style: "solid",
  outline: {
    color: [110, 110, 110],
    width: 0.7,
  },
});

export const lot_uniqueV = lot_status_q.map((item: any) => {
  return Object.assign({
    value: item.value,
    label: item.category,
    symbol: new SimpleFillSymbol({
      color: item.color,
    }),
  });
});

export const lot_renderer = new UniqueValueRenderer({
  field: lot_status_f,
  defaultSymbol: lot_symbol, // autocasts as new SimpleFillSymbol()
  uniqueValueInfos: lot_uniqueV,
});

//--- Layer Popup
const highlight = (value: unknown) =>
  `<span style="color: #d9dc00ff; font-weight: bold">${value}</span>`;

const customContentLot = new CustomContent({
  outFields: ["*"],
  creator: (event: any) => {
    const attrs = event.graphic.attributes;
    const hod = attrs[lot_hod_f];
    const hdod = attrs[lot_hdod_f];
    const hoa = attrs[lot_pho_f];
    const statusV = attrs[lot_status_f];
    const lu = attrs[lot_lu_f];
    const municipal = attrs[municipality_f];
    const barangay = attrs[barangay_f];
    const lo = attrs[lot_lo_f];
    const cp = attrs[cp_f];
    const endorse = attrs[lot_endorsed_f];
    const endorsed = lot_endorsed_arr[endorse];
    const remarks = attrs["Remarks"];
    const note = attrs["note"];

    //--- Hand-Over Date
    let hod1: any;
    if (hod) {
      const { year, month, day } = yearMonthDay(new Date(hod));
      hod1 = `${year}-${month}-${day}`;
    }

    //--- Handed-Over Date
    let hdod1: any;
    if (hdod) {
      const { year, month, day } = yearMonthDay(new Date(hod));
      hdod1 = `${year}-${month}-${day}`;
    }

    //--- Status with label
    const statusLabel =
      lot_status_q.find((f: any) => f.value === statusV)?.category ?? "";
    const lu_label = lu >= 1 ? lot_lu_arr[lu - 1] : "";

    return `
    <div style='color: #eaeaea'>
    <ul><li>Handed-Over Area: ${highlight(`${hoa} %`)}</li>
    <li>Hand-Over Date: ${highlight(hdod1 ?? "")}</li>
    <li>Handed-Over Date: ${highlight(hod1 ?? "")}</li>
    <li>Status:           ${highlight(statusLabel ?? "")}</li>
    <li>Land Use:         ${highlight(lu_label ?? "")}</li>
    <li>Municipality:     ${highlight(municipal ?? "")}</li>
    <li>Barangay:         ${highlight(barangay ?? "")}</li>
    <li>Land Owner:       ${highlight(lo ?? "")}</li>
    <li>CP:               ${highlight(cp ?? "")}</li>
    <li>Endorsed:         ${highlight(endorsed ?? "")}</li>
    <li>Acquisition Status: ${highlight(remarks ?? "")}</li>
    <li>Note: ${highlight(note ?? "")}</li></ul>
    </div>
              `;
  },
});

export const lot_popup = new PopupTemplate({
  title: "<div style='color: #eaeaea'>Lot No.: <b>{LotID}</b></div>",
  lastEditInfoEnabled: false,
  content: [customContentLot],
});

//--- Land use Array
export const lot_lu_arr = [
  "Agricultural",
  "Agricultural & Commercial",
  "Agricultural / Residential",
  "Commercial",
  "Industrial",
  "Irrigation",
  "Residential",
  "Road",
  "Road Lot",
  "Special Exempt",
];

//--- HANDED-OVER LOTS (PUBLIC + PRIATE LOTS) ---//
export const lot_ho_renderer = new UniqueValueRenderer({
  valueExpression:
    "When($feature.HandedOver == 1 && $feature.StatusLA != 8, 'Handed-Over', 'others')",
  uniqueValueInfos: [
    {
      value: "Handed-Over",
      label: "Handed-Over",
      symbol: new SimpleFillSymbol({
        color: [0, 255, 255, 0.3],
        outline: new SimpleLineSymbol({
          color: "#00ffff",
          width: "4px",
        }),
      }),
    },
  ],
});

//--- MERALCO TSS 10 ---//
export const lot_meralco_tss_renderer = new SimpleRenderer({
  symbol: new SimpleFillSymbol({
    color: "#f10861",
    style: "horizontal",
    outline: {
      // autocasts as new SimpleLineSymbol()
      color: primaryLabelColor, //#DF73FF,
      width: "3px",
    },
  }),
});

export const lot_meralco_tss_lot_renderer = new SimpleRenderer({
  symbol: new SimpleLineSymbol({
    color: "#f10861",
    width: "3px",
    style: "short-dash",
  }),
});

//--- ENDORSED LOT LAYER ---//
export const lot_endorsed_q = [
  { value: 0, category: "Not Endorsed", color: "#ff0000" },
  { value: 1, category: "Endorsed", color: "#006eff" },
  { value: 2, category: "NA", color: "#d3d3d3" },
];

const lot_endorsed_uniqueV = lot_endorsed_q.map((item: any) => {
  return {
    value: item.value,
    label: item.category,
    symbol: new SimpleFillSymbol({
      color: item.color,
    }),
  };
});

export const lot_endorsed_renderer = new UniqueValueRenderer({
  field: "Endorsed",
  defaultSymbol: lot_symbol,
  uniqueValueInfos: lot_endorsed_uniqueV,
});

//--- CANDIDIATE LOT LAYER ---//
export const lot_candidate_renderer = new SimpleRenderer({
  symbol: new SimpleFillSymbol({
    color: "#808080",
    style: "horizontal",
    outline: { color: "#808080", width: "6px" },
  }),
});

//--- ACCESSIBLE LOT AREA BY CONTRACTORS ---//
export const lot_access_renderer = new SimpleRenderer({
  symbol: new SimpleFillSymbol({
    color: "purple",
    style: "solid",
    outline: { width: 1, color: "black" },
  }),
});

//----------------------------------------------//
//       Structure Layer Parameters             //
//----------------------------------------------//
//--- STRUCTURE LAYER ---//
export const str_status_f = "StatusStruc";
export const str_id_f = "StrucID";
export const str_pte_f = "PTE";

export const rgb = [
  [0, 197, 255, 0.6],
  [112, 173, 71, 0.6],
  [0, 112, 255, 0.6],
  [255, 255, 0, 0.6],
  [255, 170, 0, 0.6],
  [255, 83, 73, 0.6],
  [178, 190, 181, 0.6],
  [111, 0, 0, 0.6],
];

export const str_status_q = [
  {
    value: 1,
    category: "Demolished",
    color: "#00C5FF",
    colrgb: rgb[0],
  },
  { value: 2, category: "Paid", color: "#70AD47", colrgb: rgb[1] },
  {
    value: 3,
    category: "For Payment Processing",
    color: "#0070FF",
    colrgb: rgb[2],
  },
  { value: 4, category: "For Legal Pass", color: "#FFFF00", colrgb: rgb[3] },
  {
    value: 5,
    category: "For Offer to Compensate",
    color: "#FFAA00",
    colrgb: rgb[4],
  },
  {
    value: 6,
    category: "For Notice of Taking",
    color: "#FF5733",
    colrgb: rgb[5],
  },
  {
    value: 7,
    category: "No Need to Acquire",
    color: "#B2BEB5",
    colrgb: rgb[6],
  },
  {
    value: 8,
    category: "For Expropriation",
    color: "#6f0000",
    colrgb: rgb[7],
  },
];

const height = 5;
const edgeSize = 0.3;

const str_symbol = new PolygonSymbol3D({
  symbolLayers: [
    new ExtrudeSymbol3DLayer({
      size: 5,
      material: {
        color: [0, 0, 0, 0.4],
      },
      edges: new SolidEdges3D({
        color: "#4E4E4E",
        size: edgeSize,
      }),
    }),
  ],
});

const str_uniqueV = str_status_q.map((item: any) => {
  return {
    value: item.value,
    symbol: new PolygonSymbol3D({
      symbolLayers: [
        new ExtrudeSymbol3DLayer({
          size: height,
          material: {
            color: item.colrgb,
          },
          edges: new SolidEdges3D({
            color: "#4E4E4E",
            size: edgeSize,
          }),
        }),
      ],
    }),
    label: item.category,
  };
});

export const str_renderer = new UniqueValueRenderer({
  defaultSymbol: str_symbol,
  defaultLabel: "Other",
  field: str_status_f,
  uniqueValueInfos: str_uniqueV,
});

export const str_popup = {
  title: "<div style='color: #eaeaea'>{StrucID}</div>",
  lastEditInfoEnabled: false,
  returnGeometry: true,
  content: [
    {
      type: "fields",
      fieldInfos: [
        {
          fieldName: "StrucOwner",
          label: "Structure Owner",
        },
        {
          fieldName: "Municipality",
        },
        {
          fieldName: "Barangay",
        },
        {
          fieldName: "StatusStruc",
          label: "<p>Status for Structure</p>",
        },
        {
          fieldName: "Name",
        },
        {
          fieldName: "Status",
          label: "Households Ownership (structure) ",
        },
      ],
    },
  ],
};

//--- STRUCUTURE OWNERSHIP LAYER ---//
export const str_owner_status_f = "Status";
const str_owner_q = [
  { value: 1, category: "LO (Land Owner)", color: [128, 128, 128, 1] },
  { value: 2, category: "Households", color: [128, 128, 128, 1] },
];

export const str_uniqueV_owner = str_owner_q.map((item: any) => {
  return {
    value: item.value,
    label: item.category,
    symbol: new SimpleFillSymbol({
      style: "forward-diagonal",
      color: item.color,
      outline: {
        color: "#6E6E6E",
        width: 0.3,
      },
    }),
  };
});

export const str_owner_renderer = new UniqueValueRenderer({
  field: str_owner_status_f,
  uniqueValueInfos: str_uniqueV_owner,
});

//----------------------------------------------//
//       Households Layer Parameters             //
//----------------------------------------------//
//--- NLO LAYER ---//
export const nlo_status_f = "StatusRC";

export const nlo_status_symbol = [
  "https://EijiGorilla.github.io/Symbols/3D_Web_Style/ISF/ISF_Relocated.svg",
  "https://EijiGorilla.github.io/Symbols/3D_Web_Style/ISF/ISF_Paid.svg",
  "https://EijiGorilla.github.io/Symbols/3D_Web_Style/ISF/ISF_PaymentProcess.svg",
  "https://EijiGorilla.github.io/Symbols/3D_Web_Style/ISF/ISF_LegalPass.svg",
  "https://EijiGorilla.github.io/Symbols/3D_Web_Style/ISF/ISF_OtC.svg",
  "https://EijiGorilla.github.io/Symbols/3D_Web_Style/ISF/ISF_LBP.svg",
];

export const nlo_status_q = [
  {
    value: 1,
    category: "Relocated",
    color: "#00C5FF",
    logo: nlo_status_symbol[0],
  },
  { value: 2, category: "Paid", color: "#70AD47", logo: nlo_status_symbol[1] },
  {
    value: 3,
    category: "For Payment Processing",
    color: "#0070FF",
    logo: nlo_status_symbol[2],
  },
  {
    value: 4,
    category: "For Legal Pass",
    color: "#FFFF00",
    logo: nlo_status_symbol[3],
  },
  {
    value: 5,
    category: "For Appraisal/OtC/Requirements for Other Entitlements",
    color: "#FFAA00",
    logo: nlo_status_symbol[4],
  },
  {
    value: 6,
    category: "For Notice of Taking",
    color: "#6f0000",
    logo: nlo_status_symbol[5],
  },
];

const symbolSize = 30;

const nlo_uniqueV = nlo_status_q.map((item: any) => {
  return Object.assign({
    value: item.value,
    label: item.category,
    symbol: new PointSymbol3D({
      symbolLayers: [
        new IconSymbol3DLayer({
          resource: {
            href: item.logo,
          },
          size: symbolSize,
          outline: {
            color: "white",
            size: 2,
          },
        }),
      ],
    }),
  });
});

export const nlo_renderer = new UniqueValueRenderer({
  field: nlo_status_f,
  uniqueValueInfos: nlo_uniqueV,
});

export const nlo_popup = {
  title: "<div style='color: #eaeaea'>{StrucID}</div>",
  lastEditInfoEnabled: false,
  returnGeometry: true,
  content: [
    {
      type: "fields",
      fieldInfos: [
        {
          fieldName: "StrucOwner",
          label: "Structure Owner",
        },
        {
          fieldName: "Municipality",
        },
        {
          fieldName: "Barangay",
        },
        {
          fieldName: "StatusRC",
          label: "<p>Status for Relocation</p>",
        },
        {
          fieldName: "Name",
        },
        {
          fieldName: "Status",
          label: "Households Ownership (structure) ",
        },
      ],
    },
  ],
};

//--- HOUSEHOLDS OCCUPANCY (STATUS OF RELOCATION) ---//
export const str_occup_f = "Occupancy";
export const str_occup_q = [
  {
    value: 0,
    category: "Occupied",
    ref: "https://EijiGorilla.github.io/Symbols/Demolished.png",
  },
  {
    value: 1,
    category: "Relocated",
    ref: "https://EijiGorilla.github.io/Symbols/DemolishComplete_v2.png",
  },
];

const str_occup_offsetV = {
  screenLength: 10,
  maxWorldLength: 10,
  minWorldLength: 10,
};
const occupancyPointSize = 20;

const str_occup_uniqueV = str_occup_q.map((item: any) => {
  return {
    value: item.value,
    label: item.category,
    symbol: new PointSymbol3D({
      symbolLayers: [
        new IconSymbol3DLayer({
          resource: {
            href: item.ref,
          },
          size: occupancyPointSize,
          outline: {
            color: "white",
            size: 2,
          },
        }),
      ],
      verticalOffset: str_occup_offsetV,

      callout: {
        type: "line", // autocasts as new LineCallout3D()
        color: [128, 128, 128, 0.6],
        size: 0.4,
        border: {
          color: "grey",
        },
      },
    }),
  };
});

export const str_occup_renderer = new UniqueValueRenderer({
  field: str_occup_f,
  uniqueValueInfos: str_occup_uniqueV,
});

export const str_occup_popup = {
  title: "<div style='color: #eaeaea'>{StrucID}</div>",
  lastEditInfoEnabled: false,
  returnGeometry: true,
  content: [
    {
      type: "fields",
      fieldInfos: [
        {
          fieldName: "StrucOwner",
          label: "Structure Owner",
        },
        {
          fieldName: "Municipality",
        },
        {
          fieldName: "Barangay",
        },
        {
          fieldName: "Occupancy",
          label: "<p>Status for Relocation(structure)</p>",
        },
        {
          fieldName: "Name",
        },
        {
          fieldName: "Status",
          label: "Households Ownership",
        },
      ],
    },
  ],
};

//----------------------------------------------//
//            Alignment Layers                  //
//----------------------------------------------//
//--- PIER HEAD & COLUMN LAYER ---//
const pHeight = 0;

const pier_column_symbol = new PolygonSymbol3D({
  symbolLayers: [
    new ExtrudeSymbol3DLayer({
      size: pHeight + 10,
      material: {
        color: [78, 78, 78, 0.5],
      },
      edges: new SolidEdges3D({
        color: "#4E4E4E",
        size: 0.3,
      }),
    }),
  ],
});

const pilecap_symbol = new PolygonSymbol3D({
  symbolLayers: [
    new ExtrudeSymbol3DLayer({
      size: pHeight + 3,
      material: {
        color: [200, 200, 200, 0.7],
      },
      edges: new SolidEdges3D({
        color: "#4E4E4E",
        size: 1.0,
      }),
    }),
  ],
});

export const pierhead_renderer = new UniqueValueRenderer({
  // defaultSymbol: new PolygonSymbol3D({
  //   symbolLayers: [
  //     {
  //       type: "extrude",
  //       size: 5, // in meters
  //       material: {
  //         color: "#E1E1E1",
  //       },
  //       edges: new SolidEdges3D({
  //         color: "#4E4E4E",
  //         size: 1.0,
  //       }),
  //     },
  //   ],
  // }),
  // defaultLabel: "Other",
  field: "Layer",
  legendOptions: {
    title: "Pile Cap/Column",
  },
  uniqueValueInfos: [
    {
      value: "Pier_Column",
      symbol: pier_column_symbol,
      label: "Column",
    },
    /*
  {
    value: "Pier_Head",
    symbol: pierHead,
    label: "Pier Head"
  },
  */
    {
      value: "Pile_Cap",
      symbol: pilecap_symbol,
      label: "Pile Cap",
    },
  ],
});

//--- PIER ACCESS POINT LAYER ---//
export const pier_access_label = new LabelClass({
  symbol: new LabelSymbol3D({
    symbolLayers: [
      new TextSymbol3DLayer({
        material: {
          color: valueLabelColor,
        },
        size: 15,
        font: {
          family: "Ubuntu Mono",
          weight: "bold",
        },
      }),
    ],
    verticalOffset: {
      screenLength: 80,
      maxWorldLength: 500,
      minWorldLength: 30,
    },
    callout: {
      type: "line",
      size: 0.5,
      color: [0, 0, 0],
      border: {
        color: [255, 255, 255, 0.7],
      },
    },
  }),
  labelExpressionInfo: {
    expression: "$feature.PierNumber",
    //'DefaultValue($feature.GeoTechName, "no data")'
    //"IIF($feature.Score >= 13, '', '')"
    //value: "{Type}"
  },
  labelPlacement: "above-center",
  // where: 'AccessDate IS NULL',
});

//--- CHAINAGE LAYER ---//
export const label_chainage = new LabelClass({
  labelExpressionInfo: { expression: "$feature.KmSpot" },
  symbol: {
    type: "text",
    color: [85, 255, 0],
    haloColor: "black",
    haloSize: 0.5,
    font: {
      size: 15,
      weight: "bold",
    },
  },
});

export const chainage_renderer = new SimpleRenderer({
  symbol: new SimpleMarkerSymbol({
    size: 5,
    color: [255, 255, 255, 0.9],
    outline: {
      width: 0.2,
      color: "black",
    },
  }),
});

//--- STATION BOX LAYER ---//
export const stationbox_renderer = new UniqueValueRenderer({
  field: "Layer",
  uniqueValueInfos: [
    {
      value: "00_Platform",
      label: "Platform",
      symbol: new SimpleFillSymbol({
        color: [160, 160, 160],
        style: "backward-diagonal",
        outline: {
          width: 1,
          color: "black",
        },
      }),
    },
    {
      value: "00_Platform 10car",
      label: "Platform 10car",
      symbol: new SimpleFillSymbol({
        color: [104, 104, 104],
        style: "cross",
        outline: {
          width: 1,
          color: "black",
          style: "short-dash",
        },
      }),
    },
    {
      value: "00_Station",
      label: "Station Box",
      symbol: new SimpleFillSymbol({
        color: [0, 0, 0, 0],
        outline: {
          width: 2,
          color: [115, 0, 0],
        },
      }),
    },
  ],
});

//--- PROW LAYER ---//
// ORIGINAL (DEFAULT)
export const prow_renderer = new SimpleRenderer({
  symbol: new SimpleLineSymbol({
    color: "#ff0000",
    width: "2px",
  }),
});

// PROW OTHERS
export const prow_others_renderer = new SimpleRenderer({
  symbol: new SimpleLineSymbol({
    color: "red",
    width: "2px",
    style: "dash",
  }),
});

export const pnr_popup = {
  title: "<div style='color: #eaeaea'>{LandOwner} ({LotID})</div>",
  lastEditInfoEnabled: false,
  returnGeometry: true,
  content: [
    {
      type: "fields",
      fieldInfos: [
        {
          fieldName: "OwnershipType",
          label: "Ownership Type",
        },
        {
          fieldName: "HandOverDate",
          label: "Hand-Over Date",
        },
        {
          fieldName: "Municipality",
        },
        {
          fieldName: "Barangay",
        },
        {
          fieldName: "LandOwner",
          label: "Land Owner",
        },
      ],
    },
  ],
};

//--- PNR ---//
export const pnr_renderer = new UniqueValueRenderer({
  field: "OwnershipType",
  uniqueValueInfos: [
    {
      value: 1, // RP
      label: "RP",
      symbol: new SimpleFillSymbol({
        color: [137, 205, 102],
        style: "diagonal-cross",
        outline: {
          width: 0.5,
          color: "black",
        },
      }),
    },
    {
      value: 2, // PNR
      label: "PNR",
      symbol: new SimpleFillSymbol({
        color: [137, 205, 102],
        style: "diagonal-cross",
        outline: {
          width: 0.5,
          color: "black",
        },
      }),
    },
    {
      value: 3, // BCDA
      label: "BCDA",
      symbol: new SimpleFillSymbol({
        color: [137, 205, 102],
        style: "diagonal-cross",
        outline: {
          width: 0.5,
          color: "black",
        },
      }),
    },
  ],
});

//--- STATION LAYER ---//
export const label_stationp = new LabelClass({
  symbol: new LabelSymbol3D({
    symbolLayers: [
      new TextSymbol3DLayer({
        material: {
          color: "#d4ff33",
        },
        size: 15,
        halo: {
          color: "black",
          size: 0.5,
        },
        // font: {
        //   family: 'Ubuntu Mono',
        //   //weight: "bold"
        // },
      }),
    ],
    verticalOffset: {
      screenLength: 100,
      maxWorldLength: 700,
      minWorldLength: 80,
    },

    callout: {
      type: "line", // autocasts as new LineCallout3D()
      color: [128, 128, 128, 0.5],
      size: 0.2,
      border: {
        color: "grey",
      },
    },
  }),
  labelPlacement: "above-center",
  labelExpressionInfo: {
    expression: "$feature.Station",
    //value: "{TEXTSTRING}"
  },
});

//----------------------------------------------//
//                Other Layers                  //
//----------------------------------------------//
//--- NGCP WORKING AREA LAYER ---//
export const ngcp_wa_renderer = new SimpleRenderer({
  symbol: new SimpleFillSymbol({
    color: [197, 0, 255],
    style: "backward-diagonal",
    outline: {
      color: "#C500FF",
      width: 0.7,
    },
  }),
});

//--- NGCP TAGGED STRUCTURES LAYER ---//
export const ngcp_tagged_renderer = new SimpleRenderer({
  symbol: new SimpleFillSymbol({
    color: [0, 0, 0, 0],
    outline: {
      color: "#00ffffff",
      width: 1,
    },
  }),
});

//---------------------------------------------//
//        Tree Cutting & Compensation          //
//---------------------------------------------//
export const treec_status_f = "Status";
export const tree_sci_name_f = "ScientificName";
export const tree_com_name_f = "CommonName";
export const municipal_f = "Municipality";

//-- Symbol create helper function
const tree3DSymbol = (name: any) => {
  return new WebStyleSymbol({
    name: name,
    styleName: "EsriThematicTreesStyle",
  });
};

const treeVisualVariable = (
  valueE: any,
  colStops: any,
  type: "cutting" | "compensation",
) => {
  const sizeV = new SizeVariable({
    axis: "height",
    valueExpression: valueE,
    valueUnit: "meters",
  });

  const colorV = new ColorVariable({
    valueExpression:
      type === "cutting" ? `$feature.Status` : `$feature.Compensation`,
    valueExpressionTitle: "Status Color",
    stops: colStops,
    legendOptions: { title: "", showLegend: false },
  });

  return [sizeV, colorV];
};

//--- Popup Template
export const tree_popup = {
  lastEditInfoEnabled: false,
  returnGeometry: true,
  content: [
    {
      type: "fields",
      fieldInfos: [
        { fieldName: "ScientificName", label: "Scientific Name" },
        { fieldName: "CommonName", label: "Common Name" },
        { fieldName: "Province" },
        { fieldName: "Municipality" },
        { fieldName: "TreeNo", label: "Tree No." },
        { fieldName: "CP", label: "<h5>CP</h5>" },
        { fieldName: "Compensation", label: "Status of Tree Compensation" },
      ],
    },
  ],
};

//--- TREE CUTTING LAYER ---//
//--- Status Query
export const treec_status_q = [
  { value: 1, category: "Cut/Earthballed", color: "#71ab48" },
  { value: 2, category: "Permit Acquired", color: "#ffff00" },
  { value: 3, category: "Submitted to DENR", color: "#ffaa00" },
  {
    value: 4,
    category: "Ongoing Acquisition of Application Documents",
    color: "#ff0000",
  },
];

const treec_uniqueV = treec_status_q.map((q: any) => {
  return {
    value: q.value,
    label: q.category,
    symbol: tree3DSymbol("Larix"),
  };
});

const treec_col_stops = treec_status_q.map((q: any) => {
  return {
    value: q.value,
    color: q.color,
  };
});

const treec_qe = "When($feature.Status >= 1, 5, 0)";

export const treec_renderer = new UniqueValueRenderer({
  field: treec_status_f,
  uniqueValueInfos: treec_uniqueV,
  visualVariables: treeVisualVariable(treec_qe, treec_col_stops, "cutting"),
});

//--- TREE COMPENSATION LAYER ---//
export const treem_status_f = "Compensation";
export const treem_status_q = [
  { value: 1, category: "Non-Compensable", color: "#0070ff" },
  { value: 2, category: "For Processing", color: "#ffff00" },
  { value: 3, category: "Compensated", color: "#71ab48" },
];

const treem_uniqueV = treem_status_q.map((q: any) => {
  return {
    value: q.value,
    label: q.category,
    symbol: tree3DSymbol("Larix"),
  };
});

const treem_col_stops = treem_status_q.map((q: any) => {
  return {
    value: q.value,
    color: q.color,
  };
});

const treem_qe = "When($feature.Compensation >= 1, 5, 0)";

export const treem_renderer = new UniqueValueRenderer({
  field: treem_status_f,
  uniqueValueInfos: treem_uniqueV,
  visualVariables: treeVisualVariable(
    treem_qe,
    treem_col_stops,
    "compensation",
  ),
});

//---------------------------------------------//
//             Utility Relocation              //
//---------------------------------------------//
//--- Utility Fields
export const util_status_f = "Status";
export const util_type_f = "UtilType";
export const util_comp_f = "Comp_Agency";
export const util_remark_f = "Remarks";
export const util_id_f = "Id";
export const util_layer_f = "LAYER";
export const util_height_f = "Height";

export const util_type_icons = [
  "https://EijiGorilla.github.io/Symbols/Telecom_Logo2.svg",
  "https://EijiGorilla.github.io/Symbols/Water_Logo2.svg",
  "https://EijiGorilla.github.io/Symbols/Sewage_Logo2.svg",
  "https://EijiGorilla.github.io/Symbols/Power_Logo2.svg",
];

export const util_types = [
  { value: 1, category: "Telecom", icon: util_type_icons[0] },
  { value: 2, category: "Water", icon: util_type_icons[1] },
  { value: 3, category: "Sewage", icon: util_type_icons[2] },
  { value: 4, category: "Power", icon: util_type_icons[3] },
];

export const util_status_q = [
  { value: 0, status: "incomp", color: "#000000" },
  { value: 1, status: "comp", color: "#0070ff" },
];

//--- UtilityType2 parameters
export const utilityType2Field = "UtilType2";

//--- COMMON PARAMETERS ---//
//--- Label definition
interface labelSymbol3DProps {
  materialColor: any;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: "normal" | "bold";
  haloColor?: any;
  haloSize?: number;
  vOffsetScreenLength?: number;
  vOffsetMaxWorldLength?: number;
  vOffsetMinWorldLength?: number;
  calloutType?: number;
  calloutColor?: any;
  calloutSize?: number;
  calloutBorderColor?: any;
}

export const utilLabelSymbol3D = ({
  materialColor,
  fontSize,
  fontFamily,
  fontWeight,
  haloColor,
  haloSize,
  vOffsetScreenLength,
  vOffsetMaxWorldLength,
  vOffsetMinWorldLength,
  calloutColor,
  calloutSize,
  calloutBorderColor,
}: labelSymbol3DProps) => {
  const labelSymbol3D = new LabelSymbol3D({
    symbolLayers: [
      new TextSymbol3DLayer({
        material: { color: materialColor },
        size: fontSize,
        font: { family: fontFamily, weight: fontWeight },
        halo: { color: haloColor, size: haloSize },
      }),
    ],
    verticalOffset: {
      screenLength: vOffsetScreenLength,
      maxWorldLength: vOffsetMaxWorldLength,
      minWorldLength: vOffsetMinWorldLength,
    },
    callout: new LineCallout3D({
      color: calloutColor,
      size: calloutSize,
      border: { color: calloutBorderColor },
    }),
  });

  return labelSymbol3D;
};

//-- Utility Status Maps
const util_status_map: UtilityStatusEntry[] = [
  {
    value: "DemolishComplete",
    label: "Demolision Completed",
    status: 1,
    layer: 1,
    iconUrl: "https://EijiGorilla.github.io/Symbols/DemolishComplete_v2.png",
    color: "#D13470",
    size: 25,
  },
  {
    value: "DemolishIncomplete",
    label: "To be Demolished",
    status: 0,
    layer: 1,
    iconUrl: "https://EijiGorilla.github.io/Symbols/Demolished.png",
    color: "#D13470",
    size: 20,
  },
  {
    value: "RelocIncomplete",
    label: "Proposed Relocation",
    status: 0,
    layer: 2,
    iconUrl: "https://EijiGorilla.github.io/Symbols/Relocatd.png",
    color: "#D13470",
    size: 30,
  },
  {
    value: "RelocComplete",
    label: "Relocation Completed",
    status: 1,
    layer: 2,
    iconUrl:
      "https://EijiGorilla.github.io/Symbols/Utility_Relocated_Completed_Symbol.png",
    color: "#D13470",
    size: 30,
  },
  {
    value: "NewlyAdded",
    label: "Add New Utility",
    status: 0,
    layer: 3,
    iconUrl: "https://EijiGorilla.github.io/Symbols/NewlyAdded.png",
    color: "#D13470",
    size: 35,
  },
  {
    value: "NewlyAddedComplete",
    label: "Newly Utility Added",
    status: 1,
    layer: 3,
    iconUrl: "https://EijiGorilla.github.io/Symbols/NewlyAdded_Completed.png",
    color: "#D13470",
    size: 35,
  },
];

//--- Popup
// Point popup
export const util_popup = {
  title: "<div style='color: #eaeaea'>{comp_agency}</div>",
  lastEditInfoEnabled: false,
  returnGeometry: true,
  content: [
    {
      type: "fields",
      fieldInfos: [
        { fieldName: "Id" },
        { fieldName: "UtilType", label: "Utility Type" },
        { fieldName: "UtilType2", label: "Utility Name" },
        { fieldName: "LAYER", label: "<h5>Action</h5>" },
        { fieldName: "Status", label: "<h5>Status</h5>" },
        { fieldName: "CP" },
        { fieldName: "Remarks" },
      ],
    },
  ],
};

//--- UTILITY POINT LAYER 1 (Point Symbol) ---//
//--- Point Symbol
function utilCustomSymbol3D(name: string) {
  return new WebStyleSymbol({
    styleUrl:
      "https://www.maps.arcgis.com/sharing/rest/content/items/c04d4d4145f64f8fa38407dd5331dd1f/data",
    name: name,
  });
}

function utilPtSymbolInfra(name: string) {
  return new WebStyleSymbol({
    name: name,
    styleName: "EsriInfrastructureStyle",
  });
}

function utilPtSymbolStreet(name: string) {
  return new WebStyleSymbol({
    name: name,
    styleName: "EsriRealisticStreetSceneStyle",
  });
}

const util_v_offset = {
  screenLength: 10,
  maxWorldLength: 30,
  minWorldLength: 35,
};

// Utility Point symbol creator
type UtilTypeEntry = {
  code: number;
  label: string;
  symbol?: () => any; // omit if no symbol is defined for this type
};

const utilp_type_map: UtilTypeEntry[] = [
  {
    code: 1,
    label: "Telecom Pole (BTS)",
    symbol: () => utilCustomSymbol3D("3D_Telecom_BTS"),
  },
  {
    code: 2,
    label: "Telecom Pole (CATV)",
    symbol: () => utilCustomSymbol3D("3D_TelecomCATV_Pole"),
  },
  { code: 3, label: "Water Meter" }, // no symbol defined
  { code: 4, label: "Water Valve" }, // no symbol defined
  {
    code: 5,
    label: "Manhole",
    symbol: () => utilPtSymbolStreet("Storm_Drain"),
  },
  { code: 6, label: "Drain Box" }, // no symbol defined
  {
    code: 7,
    label: "Electric Pole",
    symbol: () => utilCustomSymbol3D("3D_Electric_Pole"),
  },
  {
    code: 8,
    label: "Street Light",
    symbol: () =>
      utilPtSymbolStreet("Overhanging_Street_and_Sidewalk_-_Light_on"),
  },
  {
    code: 9,
    label: "Junction Box",
    symbol: () => utilCustomSymbol3D("3D_Drain_Box"),
  },
  {
    code: 10,
    label: "Coupling",
    symbol: () => utilCustomSymbol3D("3D_Drain_Box"),
  },
  {
    code: 11,
    label: "Fitting",
    symbol: () => utilCustomSymbol3D("3D_Drain_Box"),
  },
  {
    code: 12,
    label: "Transformer",
    symbol: () => utilCustomSymbol3D("3D_Drain_Box"),
  },
  {
    code: 13,
    label: "Truss Guy",
    symbol: () => utilCustomSymbol3D("3D_Drain_Box"),
  },
  {
    code: 14,
    label: "Concrete Pedestal",
    symbol: () => utilCustomSymbol3D("Concrete Pedestal"),
  },
  {
    code: 15,
    label: "Ground",
    symbol: () => utilCustomSymbol3D("3D_Drain_Box"),
  },
  {
    code: 16,
    label: "Down Guy",
    symbol: () => utilCustomSymbol3D("3D_Drain_Box"),
  },
  {
    code: 17,
    label: "Entry/Exit Pit",
    symbol: () => utilCustomSymbol3D("3D_Drain_Box"),
  },
  {
    code: 18,
    label: "Handhole",
    symbol: () => utilCustomSymbol3D("3D_Drain_Box"),
  },
  {
    code: 19,
    label: "Transmission Tower",
    symbol: () => utilPtSymbolInfra("Powerline_Pole"),
  },
];

// Build the Arcade expression from the map
const utilp1_condition = utilp_type_map
  .map((entry) => `$feature.UtilType2 == ${entry.code}, '${entry.label}'`)
  .join(", ");

const valueExpression = `When(${utilp1_condition}, $feature.UtilType)`;

// Build uniqueValueInfos only from entries that have a symbol
const utilp_uniqueV = utilp_type_map
  .filter((entry) => entry.symbol)
  .map((entry) => ({ value: entry.label, symbol: entry.symbol!() }));

// Point symbol renderer
export const utilp_renderer = new UniqueValueRenderer({
  valueExpression,
  uniqueValueInfos: utilp_uniqueV,
  visualVariables: [
    new SizeVariable({ axis: "height", field: "SIZE", valueUnit: "meters" }),
    new RotationVariable({ field: "ROTATION" }),
  ],
});

//--- UTILITY POINT LAYER 2 (Point Status) ---//
// Status Labels
const utilp2_text_symbol = utilLabelSymbol3D({
  materialColor: "white",
  fontSize: 10,
  haloColor: [0, 0, 0, 0.7],
  haloSize: 0.4,
});

export const utilp2_label = new LabelClass({
  labelPlacement: "above-center",
  labelExpressionInfo: {
    //value: "{Company}",
    expression:
      "When($feature.Status >= 0, DomainName($feature, 'Comp_Agency'), '')", //$feature.Comp_Agency
  },
  symbol: utilp2_text_symbol,
});

// Status Symbol
function utilStatusSymbol(name: string, color: any, sizeS: number) {
  return new PointSymbol3D({
    symbolLayers: [
      new IconSymbol3DLayer({
        resource: { href: name },
        size: sizeS,
        outline: { color: color, size: 2 },
      }),
    ],

    verticalOffset: util_v_offset,

    callout: {
      type: "line", // autocasts as new LineCallout3D()
      color: [128, 128, 128, 0.1],
      size: 0.2,
      border: { color: "grey" },
    },
  });
}

type UtilityStatusEntry = {
  value: string;
  label: string;
  status?: number; // omitted for the special "pending" case
  layer?: number;
  iconUrl: string;
  color: string;
  size: number;
};

// Special case: "pending" remarks always maps to NoAction, checked first
const noActionEntry: UtilityStatusEntry = {
  value: "NoAction",
  label: "Require Data Checking",
  iconUrl: "https://EijiGorilla.github.io/Symbols/Unknown_v2.png",
  color: "#D13470",
  size: 35,
};

// Build the Arcade expression: pending check first, then status/layer pairs, fallback to Comp_Agency
const utilp2_con = util_status_map
  .map(
    (entry) =>
      `$feature.Status == ${entry.status} && $feature.LAYER == ${entry.layer}, '${entry.value}'`,
  )
  .join(", ");

const utilp2_qe = `When($feature.Remarks == 'pending', '${noActionEntry.value}', ${utilp2_con}, $feature.Comp_Agency)`;

// Build uniqueValueInfos from the same map, plus the NoAction entry
const utilp2_uniqueV = [...util_status_map, noActionEntry].map((entry) => ({
  value: entry.value,
  label: entry.label,
  symbol: utilStatusSymbol(entry.iconUrl, entry.color, entry.size),
}));

export const utilp2_renderer = new UniqueValueRenderer({
  valueExpression: utilp2_qe,
  uniqueValueInfos: utilp2_uniqueV,
});

//--- UTILITY LINE LAYER 1 (LINE SYMBOL) ---//
const utill_symbol_q = [
  { code: 1, color: [32, 178, 170, 0.5], label: "Telecom Line" },
  { code: 2, color: [112, 128, 144, 0.5], label: "Internet Cable Line" },
  { code: 3, color: [0, 128, 255, 0.5], label: " Water Distribution Pipe" },
  { code: 4, color: [224, 224, 224, 0.5], label: "Sewage" },
  { code: 5, color: [105, 105, 105, 0.5], label: "Drainage" },
  { code: 6, color: [205, 133, 63, 0.5], label: "Canal" },
  { code: 7, color: [139, 69, 19, 0.5], label: "Creek" },
  { code: 8, color: [211, 211, 211, 0.5], label: "Electric Line" },
  { code: 9, color: [0, 128, 255, 0.5], label: "Duct Bank" },
  { code: 10, color: [0, 128, 255, 0.5], label: "Water line" },
  { code: 11, color: [0, 128, 255, 0.5], label: "Gas Line" },
];

function utilLineSizeSymbol(
  profile: "circle" | "quad" | undefined,
  cap: "round" | "none" | "butt" | "square" | undefined,
  join: "round" | "miter" | "bevel" | undefined,
  width: number,
  height: number,
  profileRotation: "heading" | "all" | undefined,
  col: any,
) {
  return new LineSymbol3D({
    symbolLayers: [
      new PathSymbol3DLayer({
        profile: profile,
        material: { color: col },
        width: width,
        height: height,
        join: join,
        cap: cap,
        anchor: "bottom",
        profileRotation: profileRotation,
      }),
    ],
  });
}

export const utilLineRenderer = () => {
  const renderer = new UniqueValueRenderer({
    field: "utiltype2",
  });

  utill_symbol_q.map((item: any) => {
    renderer.addUniqueValueInfo({
      value: item.code,
      symbol: utilLineSizeSymbol(
        "circle",
        "none",
        "miter",
        0.5,
        0.5,
        "all",
        item.color,
      ),
    });
  });
  return renderer;
};

//--- NGCP UTILITY LINE LAYER ---//
export const ngcp_utill_label = new LabelClass({
  symbol: new LabelSymbol3D({
    symbolLayers: [
      new TextSymbol3DLayer({
        material: { color: "#e8ff00ff" },
        size: 16,
        halo: { color: "black", size: 1 },
        font: { family: "Ubuntu Mono", weight: "bold" },
      }),
    ],
    verticalOffset: {
      screenLength: 120,
      maxWorldLength: 700,
      minWorldLength: 25,
    },
    callout: {
      type: "line", // autocasts as new LineCallout3D()
      color: "grey",
      size: 1,
      border: { color: "grey" },
    },
  }),
  labelPlacement: "above-center",
  labelExpressionInfo: { expression: `$feature.Company + " (P178-P229)"` },
});

export const ngcpUtiliLineRenderer = () => {
  const renderer = new UniqueValueRenderer({
    field: "utiltype2",
  });

  renderer.addUniqueValueInfo({
    value: 8,
    label: "P178 - P229",
    symbol: utilLineSizeSymbol(
      "circle",
      "none",
      "miter",
      2.5,
      2.5,
      "all",
      8 - 1,
    ),
  });
  return renderer;
};

//--- UTILITY LINE LAYER 2 (LINE STATUS) ---//
const utill2_text_symbol = utilLabelSymbol3D({
  materialColor: "black",
  fontSize: 10,
  haloColor: [255, 255, 255, 0.7],
  haloSize: 0.7,
});

export const utill2_line_label = new LabelClass({
  labelExpressionInfo: {
    expression:
      "When($feature.Status >= 0, DomainName($feature, 'Comp_Agency'), '')",
  },
  symbol: utill2_text_symbol,
});

//---------------------------------------------//
//                    Viaduct                   //
//---------------------------------------------//
export const via_type_f = "Type";
export const via_status_f = "Status";

//--- VIADUCT TYPES
const via_icons = [
  "https://EijiGorilla.github.io/Symbols/Viaduct_Images/Viaduct_Pile_Logo.svg",
  "https://EijiGorilla.github.io/Symbols/Viaduct_Images/Viaduct_Pilecap_Logo.svg",
  "https://EijiGorilla.github.io/Symbols/Viaduct_Images/Viaduct_Pier_Logo.svg",
  "https://EijiGorilla.github.io/Symbols/Viaduct_Images/Viaduct_Pierhead_Logo.svg",
  "https://EijiGorilla.github.io/Symbols/Viaduct_Images/Viaduct_Precast_Logo.svg",
  "https://EijiGorilla.github.io/Symbols/Viaduct_Images/Viaduct_Precast_Logo.svg",
  "https://EijiGorilla.github.io/Symbols/Viaduct_Images/Viaduct_Precast_Logo.svg",
  "https://EijiGorilla.github.io/Symbols/Viaduct_Images/Viaduct_Precast_Logo.svg",
  "https://EijiGorilla.github.io/Symbols/Viaduct_Images/Viaduct_Precast_Logo.svg",
  "https://EijiGorilla.github.io/Symbols/Viaduct_Images/Viaduct_Precast_Logo.svg",
];

export const viatypes_q = [
  { value: 1, category: "Bored Pile", icon: via_icons[0] },
  { value: 2, category: "Pile Cap", icon: via_icons[1] },
  { value: 3, category: "Pier", icon: via_icons[2] },
  { value: 4, category: "Pier Head", icon: via_icons[3] },
  { value: 5, category: "Precast", icon: via_icons[4] },
];

//--- VIADUCT STATUS
export const viastatus_q: any = [
  {
    value: 1,
    status: "incomp",
    label: "To be Constructed",
    color: "#000000",
    rgb: [225, 225, 225, 0.1],
  },
  {
    value: 2,
    status: "ongoing",
    label: "Under Construction",
    color: "#f7f7f7ff",
    rgb: [211, 211, 211, 0.5],
  },
  {
    value: 3,
    status: "delayed",
    label: "Delayed",
    color: "#FF0000",
    rgb: [255, 0, 0, 0.8],
  },
  {
    value: 4,
    status: "comp",
    label: "Completed",
    color: "#0070ff",
    rgb: [0, 112, 255, 0.8],
  },
];

const via_uniqueV = [1, 2, 4].map((v: any) => {
  return {
    value: v,
    label: viastatus_q.find((f: any) => f.value === v)?.label,
    symbol: new MeshSymbol3D({
      symbolLayers: [
        new FillSymbol3DLayer({
          material: {
            color: viastatus_q.find((f: any) => f.value === v)?.rgb,
            colorMixMode: "replace",
          },
          edges: new SolidEdges3D({ color: [225, 225, 225, 0.3] }),
        }),
      ],
    }),
  };
});

export const via_renderer = new UniqueValueRenderer({
  field: "Status",
  uniqueValueInfos: via_uniqueV,
});

//--- POPUP
const via_customContentLot = new CustomContent({
  outFields: ["*"],
  creator: (event: any) => {
    const attrs = event.graphic.attributes;
    const cps = attrs[cp_f];
    const status = attrs[via_status_f];
    const type = attrs["Types"] ?? attrs["Type"];

    //-- Dates
    const start_date = toAsofdate(new Date(attrs["start_actual"]));
    const end_date = toAsofdate(new Date(attrs["finish_actual"]));
    const typeV = viatypes_q.find((f: any) => f.value === type)?.category;
    const statusL = viastatus_q.filter((f: any) => f.value === status)[0]
      ?.label;

    return `
    <div style='line-height: 1.7'>
        <style>
        .lbl { padding: 2px 8px 2px 3px; font-weight: bold; }
      </style>
    <table style='border-collapse: collapse;'>
        <tr><td class='lbl'>Contract Package:</td><td>${highlight(cps)}</td></tr>
        <tr><td class='lbl'>Types:</td><td>${highlight(typeV)}</td></tr>
        <tr><td class='lbl'>Status:</td><td>${highlight(statusL ?? "")}</td></tr>
        <tr><td class='lbl'>Start Date:</td><td>${highlight(start_date ?? "")}</td></tr>
        <tr><td class='lbl'>End Date:</td><td>${highlight(end_date ?? "")}</td></tr>
      </table>
    </div>
              `;
  },
});

export const via_popup = new PopupTemplate({
  title: "<div style='color: #eaeaea'>Pier Number: <b>{PierNumber}</b></div>",
  lastEditInfoEnabled: false,
  content: [via_customContentLot],
});

//----------------------------------------------//
//                Layer List                    //
//----------------------------------------------//
function zoomToAction(id: string) {
  return new Collection([
    new Collection([
      new ActionButton({
        title: "Zoom to Area",
        icon: "zoom-in-fixed",
        id: id,
      }),
    ]),
  ]);
}

export function defineActions(event: any) {
  const { item } = event;
  if (item.title === "Sapang Balen River Realignment") {
    item.actionsSections = zoomToAction("full-extent-sapangbalenriver");
  }

  if (item.title === "NGCP Line") {
    item.actionsSections = zoomToAction("full-extent-ngcplin");
  }

  if (item.title === "NGCP Pole Relocation Working Area") {
    item.actionsSections = zoomToAction("full-extent-ngcpworkarea");
  }

  if (item.title === "NGCP Pole Relocation Tagged Structures") {
    item.actionsSections = zoomToAction("full-extent-taggedstructure");

    highlightLot(ngcp_tagged_structureLayer, arcgisScene);
  }

  if (item.layer.type !== "group") {
    item.panel = {
      content: "legend",
      open: true,
    };
  }

  item.title === "Chainage" ||
  item.title === "Temporary Fencing" ||
  item.title === "Permanent Fencing" ||
  item.title === "Maintenance Road" ||
  item.title === "Drainage" ||
  item.title === "Provision for Freight Line" ||
  item.title === "Households Occupancy" ||
  item.title === "Households Ownership (Structure)" ||
  item.title === "Occupancy (Structure)" ||
  item.title === "Structure" ||
  item.title === "NGCP Pole Relocation Working Area" ||
  item.title === "NGCP Pole Relocation Tagged Structures" ||
  item.title === "Land Acquisition (Endorsed Status)" ||
  item.title === "Handed-Over Area" ||
  item.title === "Super Urgent Lot" ||
  item.title === "Handed-Over (public + private)" ||
  item.title === "Tree Cutting & Compensation" ||
  item.title === "Utility Relocation" ||
  item.title === "Pier Head/Column" ||
  item.title === "Viaduct" ||
  item.title === "MERALCO TSS 10" ||
  item.title === "Station Structures" ||
  item.title ===
    "Candidate Lots of NSCR-Ex Passenger & Freight Line for Optimization"
    ? (item.visible = false)
    : (item.visible = true);
}
