import TinySDF from './SDF';

const Cache = {};
const MeasureCache = {};
const SDFInstance = {};

export function getSDFData(text, fontSize) {
  const buffer = fontSize / 8;
  const radius = fontSize / 3;
  const instanceKey = `${fontSize}-${buffer}-${radius}`;

  let sdf = SDFInstance[instanceKey];
  if (!sdf) {
    sdf = SDFInstance[instanceKey] = new TinySDF(fontSize, buffer, radius);
  }

  const sdfData = [];
  for (const char of text) {
    const charKey = `${instanceKey}-${char}`;
    let data = Cache[charKey];
    let measureData = MeasureCache[charKey];

    if (!data) {
      data = Cache[charKey] = sdf.renderToImageData(char);
      measureData = MeasureCache[charKey] = sdf.measureCharacter(char);
    }
    
    sdfData.push([data, ...measureData]);
  }

  return sdfData;
}
