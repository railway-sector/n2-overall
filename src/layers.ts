import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import GroupLayer from "@arcgis/core/layers/GroupLayer";

import {
  treec_renderer,
  treem_renderer,
  tree_popup,
  utilp_renderer,
  utilp2_renderer,
  utilp2_label,
  util_popup,
  utilLineRenderer,
  utill2_line_label,
  via_renderer,
  via_popup,
  ngcpUtiliLineRenderer,
  ngcp_utill_label,
  util_minScale,
} from "./uniqueValues";

import {
  lot_popup,
  lot_label,
  lot_renderer,
  lot_ho_f,
  lot_status_f,
  str_renderer,
  str_popup,
  str_owner_renderer,
  str_occup_renderer,
  str_occup_popup,
  nlo_renderer,
  nlo_popup,
  portalItems,
  lot_ho_renderer,
  lot_endorsed_renderer,
  lot_candidate_renderer,
  lot_access_renderer,
  ngcp_wa_renderer,
  ngcp_tagged_renderer,
  pierhead_renderer,
  pier_access_label,
  label_chainage,
  chainage_renderer,
  stationbox_renderer,
  prow_renderer,
  prow_others_renderer,
  pnr_renderer,
  pnr_popup,
  label_stationp,
  lot_meralco_tss_renderer,
  lot_meralco_tss_lot_renderer,
} from "./uniqueValues";
import SceneLayer from "@arcgis/core/layers/SceneLayer";

//----------------------------------------------//
//            Alignment Layers                  //
//----------------------------------------------//
//--- PIER HEAD & COLUMN LAYER ---//
export const pierHeadColumnLayer = new FeatureLayer({
  portalItem: portalItems("876de8483da9485aac5df737cbef2143"),
  layerId: 4,
  title: "Pile Cap/Column",
  definitionExpression: "Layer <> 'Pier_Head'",
  minScale: 150000,
  maxScale: 0,
  renderer: pierhead_renderer,
  popupEnabled: false,
  elevationInfo: { mode: "on-the-ground" },
});

//--- PIER ACCESS POINT LAYER ---//
export const pierAccessLayer = new FeatureLayer({
  portalItem: portalItems("876de8483da9485aac5df737cbef2143"),
  outFields: ["*"],
  layerId: 6,
  labelingInfo: [pier_access_label], //[pierAccessReadyDateLabel, pierAccessNotYetLabel, pierAccessDateMissingLabel],
  title: "Pier Number", //'Pier with Access Date (as of October 2023)',
  minScale: 150000,
  maxScale: 0,
  elevationInfo: { mode: "on-the-ground" },
});

//--- CHAINAGE LAYER ---//
export const chainageLayer = new FeatureLayer({
  portalItem: portalItems("876de8483da9485aac5df737cbef2143"),
  layerId: 5,
  title: "Chainage",
  elevationInfo: { mode: "relative-to-ground" },
  labelingInfo: [label_chainage],
  minScale: 150000,
  maxScale: 0,
  renderer: chainage_renderer,
  popupEnabled: false,
});

//--- STATION BOX LAYER ---//
export const stationBoxLayer = new FeatureLayer({
  portalItem: portalItems("876de8483da9485aac5df737cbef2143"),
  layerId: 3,
  renderer: stationbox_renderer,
  minScale: 150000,
  maxScale: 0,
  title: "Station Box",
  popupEnabled: false,
  elevationInfo: { mode: "on-the-ground" },
});

//--- PROW LAYER ---//
// ORIGINAL (DEFAULT)
export const prowLayer = new FeatureLayer({
  url: "https://gis.railway-sector.com/server/rest/services/N2_Alignment/FeatureServer/1",
  layerId: 1,
  title: "PROW",
  popupEnabled: false,
  renderer: prow_renderer,
});

// PROW OTHERS
export const prowOthersLayer = new FeatureLayer({
  portalItem: portalItems("d96c5a8d86e54587ae09174b10fc90bd"),
  title: "Additional Area due to Sapang Balen River Training",
  renderer: prow_others_renderer,
  elevationInfo: { mode: "on-the-ground" },
});

//--- PNR ---//
export const pnrLayer = new FeatureLayer({
  portalItem: portalItems("23500954a8d84a46886e76e6e0883a69"),
  layerId: 4,
  title: "Land (Excluded for Acquisition)",
  definitionExpression: "OwnershipType IN (1, 2, 3)",
  elevationInfo: { mode: "on-the-ground" },
  labelsVisible: false,
  renderer: pnr_renderer,
  popupTemplate: pnr_popup,
});

//--- STATION LAYER ---//
export const stationLayer = new FeatureLayer({
  portalItem: portalItems("876de8483da9485aac5df737cbef2143"),
  layerId: 2,
  title: "N2 Stations",
  labelingInfo: [label_stationp],
  elevationInfo: { mode: "relative-to-ground" },
});
stationLayer.listMode = "hide";

//-----------------------------------------------//
//              Other Layers                     //
//-----------------------------------------------//
//--- DATES FEATURE TABLE ---//
export const dateTable = new FeatureLayer({
  portalItem: portalItems("b2a118b088a44fa0a7a84acbe0844cb2"),
});

//--- NGCP WORKING AREA LAYER ---//
export const ngcp_working_area = new FeatureLayer({
  portalItem: portalItems("ef4460e67411480aa8315e897e9b172d"),
  renderer: ngcp_wa_renderer,
  elevationInfo: { mode: "on-the-ground" },
  definitionExpression: "SiteNo = '2'",
  title: "NGCP Pole Relocation Working Area",
});

//--- NGCP TAGGED STRUCTURES LAYER ---//
export const ngcp_tagged_structureLayer = new FeatureLayer({
  portalItem: portalItems("23500954a8d84a46886e76e6e0883a69"),
  layerId: 3,
  title: "NGCP Pole Relocation Tagged Structures",
  definitionExpression: "NGCP_Affected = 1",
  renderer: ngcp_tagged_renderer,
  elevationInfo: { mode: "on-the-ground" },
  popupEnabled: false,
});

//-----------------------------------------------//
//                Lot, Structure, NLO            //
//-----------------------------------------------//
//--- LOT LAYER ---//
export const lotLayer = new FeatureLayer({
  portalItem: portalItems("23500954a8d84a46886e76e6e0883a69"),
  layerId: 4,
  labelingInfo: [lot_label],
  renderer: lot_renderer,
  popupTemplate: lot_popup,
  title: "Land Acquisition",
  minScale: 150000,
  maxScale: 0,
  elevationInfo: { mode: "on-the-ground" },
});

//--- MERALCO TSS 10 ---//
export const Meralco_tss10_layer = new FeatureLayer({
  portalItem: portalItems("d5c43ca76b9a475e954e9c3d3595e2af"),
  renderer: lot_meralco_tss_lot_renderer,
  title: "Additional Area for MERALCO TSS 10",
  minScale: 150000,
  maxScale: 0,
  elevationInfo: { mode: "on-the-ground" },
});

//--- MERALCO TSS 10 ---//
export const Meralco_tss10_structure = new FeatureLayer({
  portalItem: portalItems("23500954a8d84a46886e76e6e0883a69"),
  layerId: 3,
  definitionExpression: "MERALCO_Affected = 1",
  renderer: lot_meralco_tss_renderer,
  title: "MERALCO TSS 10 Tagged Strcture",
  minScale: 150000,
  maxScale: 0,
  elevationInfo: { mode: "on-the-ground" },
});

//--- CANDIDIATE LOT LAYER ---//
export const candidate_lot_layer = new FeatureLayer({
  portalItem: portalItems("23500954a8d84a46886e76e6e0883a69"),
  layerId: 4,
  definitionExpression: "OptLots = 1",
  labelingInfo: [lot_label],
  renderer: lot_candidate_renderer,
  popupTemplate: lot_popup,
  title: "Candidate Lots of NSCR-Ex Passenger & Freight Line for Optimization",
  minScale: 150000,
  maxScale: 0,
  elevationInfo: { mode: "on-the-ground" },
});

//--- ENDORSED LOT LAYER ---//
export const endorsedLotLayer = new FeatureLayer({
  portalItem: portalItems("23500954a8d84a46886e76e6e0883a69"),
  layerId: 4,
  renderer: lot_endorsed_renderer,
  labelingInfo: [lot_label],
  title: "Land Acquisition (Endorsed Status)",
  minScale: 150000,
  maxScale: 0,
  elevationInfo: { mode: "on-the-ground" },
  popupTemplate: lot_popup,
});

//--- HANDED-OVER LOTS (PUBLIC + PRIATE LOTS) ---//
export const handedOverLotLayer = new FeatureLayer({
  portalItem: portalItems("23500954a8d84a46886e76e6e0883a69"),
  layerId: 4,
  definitionExpression: `${lot_ho_f} = 1 AND ${lot_status_f} <> 8`,
  renderer: lot_ho_renderer,
  popupTemplate: lot_popup,
  title: "Handed-Over (public + private)",
  elevationInfo: { mode: "on-the-ground" },
});

//--- ACCESSIBLE LOT AREA BY CONTRACTORS ---//
export const accessibleLotAreaLayer = new FeatureLayer({
  portalItem: portalItems("32c788b35f7f4946b92820e7ae3cb9b3"),
  renderer: lot_access_renderer,
  title: "Handed-Over Area",
  elevationInfo: { mode: "on-the-ground" },
});

//--- STRUCUTURE LAYER ---//
export const structureLayer = new FeatureLayer({
  portalItem: portalItems("23500954a8d84a46886e76e6e0883a69"),
  layerId: 3,
  title: "Structure",
  renderer: str_renderer,
  elevationInfo: { mode: "on-the-ground" },
  popupTemplate: str_popup,
});

//--- STRUCUTURE OWNERSHIP LAYER ---//
export const strucOwnershipLayer = new FeatureLayer({
  portalItem: portalItems("23500954a8d84a46886e76e6e0883a69"),
  renderer: str_owner_renderer,
  layerId: 3,
  title: "Households Ownership (Structure)",
  popupEnabled: false,
  elevationInfo: { mode: "on-the-ground" },
});

//--- NLO LAYER ---//
export const nloLayer = new FeatureLayer({
  portalItem: portalItems("23500954a8d84a46886e76e6e0883a69"),
  layerId: 1,
  renderer: nlo_renderer,
  title: "Households",
  elevationInfo: { mode: "relative-to-scene" },
  minScale: 10000,
  maxScale: 0,
  popupTemplate: nlo_popup,
});

//--- HOUSEHOLDS OCCUPANCY (STATUS OF RELOCATION) ---//
export const occupancyLayer = new FeatureLayer({
  portalItem: portalItems("23500954a8d84a46886e76e6e0883a69"),
  layerId: 2,
  title: "Occupancy (Structure)",
  renderer: str_occup_renderer,
  elevationInfo: { mode: "relative-to-scene" },
  popupTemplate: str_occup_popup,
});

//----------------------------------------------//
//                Group Layers                  //
//----------------------------------------------//
//--- MERALCO TSS 10 ---//
export const meralco_tss10_groupLayer = new GroupLayer({
  title: "MERALCO TSS 10",
  visible: true,
  visibilityMode: "independent",
  layers: [Meralco_tss10_structure, Meralco_tss10_layer],
});

//--- ALIGNMENT LAYERS ---//
export const alignmentGroupLayer = new GroupLayer({
  title: "Alignment",
  visible: true,
  visibilityMode: "independent",
  layers: [
    stationBoxLayer,
    chainageLayer,
    pierHeadColumnLayer,
    prowOthersLayer,
    prowLayer,
  ],
}); //map.add(alignmentGroupLayer, 0);

//--- STRUCTURE/NLO/OCCUPANCY LAYERS ---//
export const nloLoOccupancyGroupLayer = new GroupLayer({
  title: "Households Occupancy",
  visible: true,
  visibilityMode: "independent",
  layers: [occupancyLayer, strucOwnershipLayer, nloLayer],
});

//--- LOT LAYERS ---//
export const lotGroupLayer = new GroupLayer({
  title: "Land",
  visible: true,
  visibilityMode: "independent",
  // layers: [endorsedLotLayer, lotLayer, handedOverLotLayer, superUrgentLotLayer, pnrLayer],
  layers: [
    endorsedLotLayer,
    lotLayer,
    candidate_lot_layer,
    pnrLayer,
    accessibleLotAreaLayer,
    handedOverLotLayer,
  ],
});

//--- NGCP LAYERS ---//
export const ngcp2_groupLayer = new GroupLayer({
  title: "NGCP Site 2",
  visible: false,
  visibilityMode: "independent",
  layers: [ngcp_tagged_structureLayer, ngcp_working_area],
});

//---------------------------------------------//
//        Tree Cutting & Compensation          //
//---------------------------------------------//
//--- TREE CUTTING LAYER ---//
export const treeCuttingLayer = new FeatureLayer({
  portalItem: portalItems("05b19f50364243dbabf06605085b09ce"),
  layerId: 2,
  elevationInfo: { mode: "on-the-ground" },
  title: "Tree Cutting",
  renderer: treec_renderer,
  popupTemplate: tree_popup,
});

//--- TREE COMPENSATION LAYER ---//
export const treeCompensationLayer = new FeatureLayer({
  portalItem: portalItems("05b19f50364243dbabf06605085b09ce"),
  layerId: 2,
  title: "Tree Compensation",
  renderer: treem_renderer,
  popupTemplate: tree_popup,
});

export const treeGroupLayer = new GroupLayer({
  title: "Tree Cutting & Compensation",
  visible: false,
  visibilityMode: "exclusive",
  layers: [treeCompensationLayer, treeCuttingLayer],
});

//---------------------------------------------//
//           Utility Relocation                //
//---------------------------------------------//
//--- UTILITY POINT LAYER 1 (Point Symbol) ---//
export const utilityPointLayer = new FeatureLayer({
  portalItem: portalItems("7507e625f480470a9af257d60cf67c1c"),
  layerId: 1,
  title: "Point Symbol",
  renderer: utilp_renderer,
  elevationInfo: {
    mode: "relative-to-ground",
    featureExpressionInfo: { expression: "$feature.Height" },
    unit: "meters",
  },
  popupTemplate: util_popup,
  minScale: util_minScale,
});

//--- UTILITY POINT LAYER 2 (Point Status) ---//
export const utilityPointLayer1 = new FeatureLayer({
  portalItem: portalItems("7507e625f480470a9af257d60cf67c1c"),
  layerId: 1,
  title: "Point Status",
  renderer: utilp2_renderer,
  elevationInfo: {
    mode: "relative-to-ground",
    featureExpressionInfo: { expression: "$feature.Height" },
    unit: "meters",
  },
  labelingInfo: [utilp2_label],
  popupTemplate: util_popup,
  minScale: util_minScale,
});

//--- UTILITY LINE LAYER 1 (LINE SYMBOL) ---//
export const utilityLineLayer = new FeatureLayer({
  portalItem: portalItems("7507e625f480470a9af257d60cf67c1c"),
  layerId: 2,
  title: "Line Symbol",
  elevationInfo: {
    mode: "relative-to-ground",
    featureExpressionInfo: { expression: "$feature.height" },
    unit: "meters",
  },
  renderer: utilLineRenderer(),
  popupTemplate: util_popup,
  minScale: util_minScale,
});

//--- UTILITY LINE LAYER 2 (LINE STATUS) ---//
export const utilityLineLayer1 = new FeatureLayer({
  portalItem: portalItems("7507e625f480470a9af257d60cf67c1c"),
  layerId: 2,
  title: "Line Status",
  elevationInfo: {
    mode: "relative-to-ground", // original was "relative-to-scene"
    featureExpressionInfo: { expression: "$feature.height" },
    unit: "meters",
  },
  renderer: utilp2_renderer,
  labelingInfo: [utill2_line_label],
  popupTemplate: util_popup,
  minScale: util_minScale,
});

export const utilityGroupLayer = new GroupLayer({
  title: "Utility Relocation",
  visible: false,
  visibilityMode: "independent",
  layers: [
    utilityLineLayer1,
    utilityLineLayer,
    utilityPointLayer1,
    utilityPointLayer,
  ],
});

//--- NGCP UTILITY LINE LAYER ---//
export const utilityLineNGCP = new FeatureLayer({
  portalItem: portalItems("3dbd0454687a4100905ce7222299e43d"),
  title: "NGCP Line",
  elevationInfo: { mode: "on-the-ground" },
  labelingInfo: [ngcp_utill_label],
  renderer: ngcpUtiliLineRenderer(),
});

export const utilityLayers: any = {
  Point: [utilityPointLayer, utilityPointLayer1],
  Line: [utilityLineLayer, utilityLineLayer1],
};

//----------------------------------------------//
//                Viaduct Layer                 //
//----------------------------------------------//
export const viaductLayer = new SceneLayer({
  portalItem: portalItems("3c112d7fe610486eaf4df3eac07d3ea0"),
  elevationInfo: { mode: "absolute-height" },
  title: "Viaduct",
  labelsVisible: false,
  renderer: via_renderer,
  popupTemplate: via_popup,
});

//----------------------------------------------//
//                Other Parameters              //
//----------------------------------------------//
export const sources: any = [
  {
    layer: lotLayer,
    searchFields: ["LotID"],
    displayField: "LotID",
    exactMatch: false,
    outFields: ["LotID"],
    name: "Lot ID",
    placeholder: "example: 10083",
  },
  {
    layer: structureLayer,
    searchFields: ["StrucID"],
    displayField: "StrucID",
    exactMatch: false,
    outFields: ["StrucID"],
    name: "Structure ID",
    placeholder: "example: NSRP-01-02-ML007",
  },
  {
    layer: pierAccessLayer,
    searchFields: ["PierNumber"],
    displayField: "PierNumber",
    exactMatch: false,
    outFields: ["PierNumber"],
    name: "Pier No",
    zoomScale: 1000,
    placeholder: "example: P-288",
  },
];
