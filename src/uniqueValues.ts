import Collection from "@arcgis/core/core/Collection";
import ActionButton from "@arcgis/core/support/actions/ActionButton";
import TextSymbol3DLayer from "@arcgis/core/symbols/TextSymbol3DLayer";
import LabelSymbol3D from "@arcgis/core/symbols/LabelSymbol3D";
import LineCallout3D from "@arcgis/core/symbols/callouts/LineCallout3D";
import { ngcp_tagged_structureLayer } from "./layers";
import type { ArcgisScene } from "@arcgis/map-components/components/arcgis-scene";

const arcgisScene = document.querySelector("arcgis-scene") as ArcgisScene;

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

export const labelSymbol3DLine = ({
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
        material: {
          color: materialColor,
        },
        size: fontSize,
        font: {
          family: fontFamily,
          weight: fontWeight,
        },
        halo: {
          color: haloColor,
          size: haloSize,
        },
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
      border: {
        color: calloutBorderColor,
      },
    }),
  });

  return labelSymbol3D;
};

//--- type definitions
export type StatusTypenamesType =
  | "To be Constructed"
  | "Under Construction"
  | "delayed"
  | "Completed";
export type StatusStateType = "comp" | "incomp" | "ongoing" | "delayed";
export type LayerNameType = "utility" | "viaduct" | "others";

export const contractPackage = ["All", "N-01", "N-02", "N-03", "N-04"];

// month
export const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Media parameters
export const image_scales = [1.0, 1.2, 1.4, 1.6, 1.8, 2.0, 2.2, 2.4];
export const img_size = 280;
export const timestamp_field = "timestamp";

// chart width
export const chart_width = "26vw";
export const chart_box_width = 250;

export const construction_status = [
  "To be Constructed",
  "Under Construction",
  "Completed",
];

// chart width
export const chard_width = "26vw";

// Updated Dates
export const updatedDateCategoryNames = [
  "Land Acquisition",
  "Structure",
  "Non Land Owner",
  "Utility Relocation",
  "Trees",
  "Viaduct",
];
export const cutoff_days = 30;

//---------------------------------------------//
//        Land, Structure, & NLO               //
//---------------------------------------------//
export const superUrgentField = "Urgent";
export const querySuperUrgent = `${superUrgentField} = 0`;
export const superurgent_items = ["OFF", "ON"];

export const lotHandOverDateField = "HandOverDate";
export const lotTargetActualField = "TargetActual";
export const lotTargetActualDateField = "TargetActualDate";

export const lotStatusField = "StatusLA";
export const lotIdField = "LotID";
export const percentHandedOverField = "percentHandedOver";
export const municipalityField = "Municipality";
export const barangayField = "Barangay";
export const landOwnerField = "LandOwner";
export const cpField = "CP";
export const landUseField = "LandUse";
export const endorsedField = "Endorsed";
export const lotHandedOverField = "HandedOver";
export const lotHandedOverDateField = "HandedOverDate";
export const lotHandedOverAreaField = "HandedOverArea";
export const affectedAreaField = "AffectedArea";
export const lotStatusLabel = [
  "Paid",
  "For Payment Processing",
  "For Legal Pass",
  "For Offer to Buy",
  "For Notice of Taking",
  "With PTE",
  "For Expropriation",
  "Optimized",
];

export const lotStatusColor = [
  "#00734d",
  "#0070ff",
  "#ffff00",
  "#ffaa00",
  "#FF5733",
  "#70AD47",
  "#FF0000",
  "#B2B2B2",
];

export const lotStatusQuery = lotStatusLabel.map((status, index) => {
  return Object.assign({
    category: status,
    value: index + 1,
    color: lotStatusColor[index],
  });
});

// Chart and chart label color
export const primaryLabelColor = "#9ca3af";
export const valueLabelColor = "#d1d5db";

export const lotUseArray = [
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

// Lot Endorsed
export const endorsedStatus = ["Not Endorsed", "Endorsed", "NA"];

// Structure //
export const familyNumberField = "FamilyNumber";

// Structure
export const structureStatusField = "StatusStruc";
export const structureIdField = "StrucID";
export const structureStatusLabel = [
  "Demolished",
  "Paid",
  "For Payment Processing",
  "For Legal Pass",
  "For Offer to Compensate",
  "For Notice of Taking",
  "No Need to Acquire",
];

export const structureStatusColorHex = [
  "#00C5FF",
  "#70AD47",
  "#0070FF",
  "#FFFF00",
  "#FFAA00",
  "#FF5733", //'#FF0000',
  "#B2BEB5",
];

export const structureStatusColorRgb = [
  [0, 197, 255, 0.6],
  [112, 173, 71, 0.6],
  [0, 112, 255, 0.6],
  [255, 255, 0, 0.6],
  [255, 170, 0, 0.6],
  [255, 83, 73, 0.6],
  [178, 190, 181, 0.6],
];

export const structureStatusQuery = structureStatusLabel.map(
  (status, index) => {
    return Object.assign({
      category: status,
      value: index + 1,
      colorLayer: structureStatusColorRgb[index],
      color: structureStatusColorHex[index],
    });
  },
);

// Permit to Enter for structure
export const structurePteField = "PTE";

// NLO
export const occupancyField = "Occupancy";
export const nloLoStatusField = "Status";
export const nloStatusField = "StatusRC";
export const nloStatusLabel = [
  "Relocated",
  "Paid",
  "For Payment Processing",
  "For Legal Pass",
  "For Appraisal/OtC/Requirements for Other Entitlements",
  "For Notice of Taking",
];

export const nloStatusColor = [
  "#00C5FF",
  "#70AD47",
  "#0070FF",
  "#FFFF00",
  "#FFAA00",
  "#FF0000",
];

export const nloStatusSymbolRef = [
  "https://EijiGorilla.github.io/Symbols/3D_Web_Style/ISF/ISF_Relocated.svg",
  "https://EijiGorilla.github.io/Symbols/3D_Web_Style/ISF/ISF_Paid.svg",
  "https://EijiGorilla.github.io/Symbols/3D_Web_Style/ISF/ISF_PaymentProcess.svg",
  "https://EijiGorilla.github.io/Symbols/3D_Web_Style/ISF/ISF_LegalPass.svg",
  "https://EijiGorilla.github.io/Symbols/3D_Web_Style/ISF/ISF_OtC.svg",
  "https://EijiGorilla.github.io/Symbols/3D_Web_Style/ISF/ISF_LBP.svg",
];

export const nloStatusQuery = nloStatusLabel.map((status, index) => {
  return Object.assign({
    category: status,
    value: index + 1,
    color: nloStatusColor[index],
  });
});

// Structure Ownership
// Structure Ownership
export const structureOwnershipStatusField = "Status";
export const structureOwnershipStatusLabel = ["LO (Land Owner)", "Households"];
export const structureOwnershipColor = [
  [128, 128, 128, 1],
  [128, 128, 128, 1],
];

// Structure Occupancy
export const strucOwnerField = "StrucOwner";
export const occupancyNameField = "Name";
export const structureOccupancyStatusField = "Occupancy";
export const structureOccupancyStatusLabel = ["Occupied", "Relocated"];
export const structureOccupancyRef = [
  "https://EijiGorilla.github.io/Symbols/Demolished.png",
  "https://EijiGorilla.github.io/Symbols/DemolishComplete_v2.png",
];

//---------------------------------------------//
//        Tree Cutting & Compensation          //
//---------------------------------------------//
export const treeStatus_field = "Status";

export const treeScientificNameField = "ScientificName";
export const treeCommonNameField = "CommonName";
export const treeMunicipalityField = "Municipality";

//--- Tree Cutting ---//
export const colorsCutting = ["#71ab48", "#ffff00", "#ffaa00", "#ff0000"];
export const statusTreeCutting: string[] = [
  "Cut/Earthballed",
  "Permit Acquired",
  "Submitted to DENR",
  "Ongoing Acquisition of Application Documents",
];

export const statusTreeCuttingChart = [
  {
    category: statusTreeCutting[0],
    value: 1,
    color: colorsCutting[0],
  },
  {
    category: statusTreeCutting[1],
    value: 2,
    color: colorsCutting[1],
  },
  {
    category: statusTreeCutting[2],
    value: 3,
    color: colorsCutting[2],
  },
  {
    category: statusTreeCutting[3],
    value: 4,
    color: colorsCutting[3],
  },
];

//--- Tree Compensation ---//
export const treeCompen_status_field = "Compensation";
export const colorsCompen = ["#0070ff", "#ffff00", "#71ab48"];
export const statusTreeCompensation: string[] = [
  "Non-Compensable",
  "For Processing",
  "Compensated",
];

export const statusTreeCompensationChart = [
  {
    category: statusTreeCompensation[0],
    value: 1,
    color: colorsCompen[0],
  },
  {
    category: statusTreeCompensation[1],
    value: 2,
    color: colorsCompen[1],
  },
  {
    category: statusTreeCompensation[2],
    value: 3,
    color: colorsCompen[2],
  },
];

//---------------------------------------------//
//             Utility Relocation              //
//---------------------------------------------//
export const utility_statusField = "Status";
export const utility_typeField = "UtilType";
export const utilityTypes = ["Telecom", "Water", "Sewage", "Power"];
export const utilityType_domain = [1, 2, 3, 4];
export const utility_point_icons = [
  "https://EijiGorilla.github.io/Symbols/Telecom_Logo2.svg",
  "https://EijiGorilla.github.io/Symbols/Water_Logo2.svg",
  "https://EijiGorilla.github.io/Symbols/Sewage_Logo2.svg",
  "https://EijiGorilla.github.io/Symbols/Power_Logo2.svg",
  "https://EijiGorilla.github.io/Symbols/Power_Logo2.svg",
];

export const utilityTypeChart = utilityTypes.map((type: any, index: any) => {
  return Object.assign({
    category: type,
    value: utilityType_domain[index],
    icon: utility_point_icons[index],
  });
});

export const utilityCompanyField = "Comp_Agency";
export const utilityRemarksField = "Remarks";
export const utilityIdField = "Id";
export const utilityActionField = "LAYER";
export const utilityHeightField = "Height";

//--- UtilityType2 parameters
export const utilityType2Field = "UtilType2";

export const utilType2_values = [
  "Telecom Pole (BTS)",
  "Telecom Pole (CATV)",
  "Water Meter",
  "Water Valve",
  "Manhole",
  "Drain Box",
  "Electric Pole",
  "Street Light",
  "Junction Box",
  "Coupling",
  "Fitting",
  "Transformer",
  "Truss Guy",
  "Concrete Pedestal",
  "Ground",
  "Down Guy",
  "Entry/Exit Pit",
  "Handhole",
  "Transmission Tower",
];

export const customSymbol3D_names = [
  "3D_Telecom_BTS",
  "3D_TelecomCATV_Pole",
  "Storm_Drain",
  "3D_Electric_Pole",
  "Overhanging_Street_and_Sidewalk_-_Light_on",
  "3D_Drain_Box",
  "3D_Drain_Box",
  "3D_Drain_Box",
  "3D_Drain_Box",
  "3D_Drain_Box",
  "Concrete Pedestal",
  "3D_Drain_Box",
  "3D_Drain_Box",
  "3D_Drain_Box",
  "3D_Drain_Box",
  "Powerline_Pole",
];

export const utilityType2SymbolList = [
  {
    utilType2: 1,
    name: "Telecom Pole (BTS)",
  },
  {
    utilType2: 2,
    name: "Telecom Pole (CATV)",
  },
  {
    utilType2: 3,
    name: "Water Meter",
  },
  {
    utilType2: 4,
    name: "Water Valve",
  },
  {
    utilType2: 5,
    name: "Manhole",
  },
  {
    utilType2: 6,
    name: "Drain Box",
  },
  {
    utilType2: 7,
    name: "Electric Pole",
  },
  {
    utilType2: 8,
    name: "Street Light",
  },
  {
    utilType2: 9,
    name: "Junction Box",
  },
  {
    utilType2: 10,
    name: "Coupling",
  },
  {
    utilType2: 11,
    name: "Fitting",
  },
  {
    utilType2: 12,
    name: "Transformer",
  },
  {
    utilType2: 13,
    name: "Truss Guy",
  },
  {
    utilType2: 14,
    name: "Concrete Pedestal",
  },
  {
    utilType2: 15,
    name: "Ground",
  },
  {
    utilType2: 16,
    name: "Down Guy",
  },
  {
    utilType2: 17,
    name: "Entry/Exit Pit",
  },
  {
    utilType2: 18,
    name: "Handhole",
  },
  {
    utilType2: 19,
    name: "Transmission Tower",
  },
];

//---------------------------------------------//
//                    Viaduct                   //
//---------------------------------------------//
//--- field definitions
export const type_field = "Type";
export const status_field = "Status";

//--- Layer types
export const viaductStatusLabel = [
  "To be Constructed",
  "Under Construction",
  "Delayed",
  "Completed",
];

export const viaductStatusColorForChart = [
  "#000000",
  "#f7f7f7ff",
  "#FF0000",
  "#0070ff",
];

export const viaductStatusColorForLayer = [
  [225, 225, 225, 0.1], // To be Constructed (white)
  [211, 211, 211, 0.5], // Under Construction
  [255, 0, 0, 0.8], // Delayed
  [0, 112, 255, 0.8], // Completed
];

//--- Viaduct types
const viaduct_category_label = [
  "Bored Pile",
  "Pile Cap",
  "Pier",
  "Pier Head",
  "Precast",
];

const viaduct_category_value = [1, 2, 3, 4, 5];
const viaduct_category_icon = [
  "https://EijiGorilla.github.io/Symbols/Viaduct_Images/Viaduct_Pile_Logo.svg",
  "https://EijiGorilla.github.io/Symbols/Viaduct_Images/Viaduct_Pilecap_Logo.svg",
  "https://EijiGorilla.github.io/Symbols/Viaduct_Images/Viaduct_Pier_Logo.svg",
  "https://EijiGorilla.github.io/Symbols/Viaduct_Images/Viaduct_Pierhead_Logo.svg",
  "https://EijiGorilla.github.io/Symbols/Viaduct_Images/Viaduct_Precast_Logo.svg",
];

// Generate chart data
export const viatypes = viaduct_category_label.map(
  (category: any, index: any) => {
    return Object.assign({
      category: category,
      value: viaduct_category_value[index],
      icon: viaduct_category_icon[index],
    });
  },
);

// Thousand separators function
export function thousands_separators(num: any) {
  if (num) {
    const num_parts = num.toString().split(".");
    num_parts[0] = num_parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return num_parts.join(".");
  }
}

export function zoomToLayer(layer: any, view: any) {
  return layer.queryExtent().then((response: any) => {
    view
      ?.goTo(response.extent, {
        //response.extent
        speedFactor: 2,
      })
      .catch((error: any) => {
        if (error.name !== "AbortError") {
          console.error(error);
        }
      });
  });
}

let highlight: any;
export function highlightLot(layer: any, view: any) {
  view?.whenLayerView(layer).then((urgentLayerView: any) => {
    const query = layer.createQuery();
    layer.queryFeatures(query).then((results: any) => {
      const length = results.features.length;
      const objID = [];
      for (let i = 0; i < length; i++) {
        const obj = results.features[i].attributes.OBJECTID;
        objID.push(obj);
      }

      if (highlight) {
        highlight.remove();
      }
      highlight = urgentLayerView.highlight(objID);
    });
  });
}

export function highlightRemove() {
  if (highlight) {
    highlight.remove();
  }
}

export function defineActions(event: any) {
  const { item } = event;
  if (item.title === "Sapang Balen River Realignment") {
    item.actionsSections = new Collection([
      new Collection([
        new ActionButton({
          title: "Zoom to Area",
          icon: "zoom-in-fixed",
          id: "full-extent-sapangbalenriver",
        }),
      ]),
    ]);
  }

  if (item.title === "NGCP Line") {
    item.actionsSections = new Collection([
      new Collection([
        new ActionButton({
          title: "Zoom to Area",
          icon: "zoom-in-fixed",
          id: "full-extent-ngcpline",
        }),
      ]),
    ]);
  }

  if (item.title === "NGCP Pole Relocation Working Area") {
    item.actionsSections = new Collection([
      new Collection([
        new ActionButton({
          title: "Zoom to Area",
          icon: "zoom-in-fixed",
          id: "full-extent-ngcpworkarea",
        }),
      ]),
    ]);
  }

  if (item.title === "NGCP Pole Relocation Tagged Structures") {
    item.actionsSections = new Collection([
      new Collection([
        new ActionButton({
          title: "Zoom to Area",
          icon: "zoom-in-fixed",
          id: "full-extent-taggedstructure",
        }),
      ]),
    ]);

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
  item.title === "Households" ||
  item.title === "Households Ownership (Structure)" ||
  item.title === "Occupancy (Structure)" ||
  item.title === "Structure" ||
  item.title === "NGCP Pole Relocation Working Area" ||
  item.title === "NGCP Pole Relocation Tagged Structures" ||
  item.title === "Land Acquisition (Endorsed Status)" ||
  item.title === "Super Urgent Lot" ||
  item.title === "Handed-Over (public + private)" ||
  item.title === "Tree Cutting" ||
  item.title === "Tree Compensation" ||
  item.title === "Point (symbol)" ||
  item.title === "Point (status)" ||
  item.title === "Line (symbol)" ||
  item.title === "Line (status)" ||
  item.title === "Pier Head/Column" ||
  item.title === "Viaduct" ||
  item.title === "MERALCO TSS 10" ||
  item.title === "Station Structures"
    ? (item.visible = false)
    : (item.visible = true);
}
