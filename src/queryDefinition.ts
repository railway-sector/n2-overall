import FeatureLayer from "@arcgis/core/layers/FeatureLayer";

//---------------------------------------------------------//
//    Definition Expression using queryExpression          //
//---------------------------------------------------------//
interface queryDefinitionExpressionType {
  queryExpression?: any;
  featureLayer?:
    | [FeatureLayer, FeatureLayer?, FeatureLayer?, FeatureLayer?, FeatureLayer?]
    | any;
}

export function queryDefinitionExpression({
  queryExpression,
  featureLayer,
}: queryDefinitionExpressionType) {
  if (!queryExpression || !featureLayer) return;
  const layers = Array.isArray(featureLayer) ? featureLayer : [featureLayer];
  layers.forEach(
    (layer: any) => layer && (layer.definitionExpression = queryExpression),
  );
}
