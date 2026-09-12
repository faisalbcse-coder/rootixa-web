const fs = require("fs");
const path = require("path");

const filesToPatch = [
  path.join(__dirname, "../node_modules/html2canvas/dist/html2canvas.js"),
  path.join(__dirname, "../node_modules/html2canvas/dist/html2canvas.esm.js"),
  path.join(__dirname, "../node_modules/html2canvas/dist/lib/css/types/color.js"),
];

const targetPattern = /throw new Error\("Attempting to parse an unsupported color function \\"" \+ value\.name \+ "\\""\);/g;

const patchCode = `try {
                    var dummyCanvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
                    if (dummyCanvas) {
                        var ctx = dummyCanvas.getContext('2d');
                        var valStr = value.name + '(' + (value.values || []).map(function(t) {
                            return t.number !== undefined ? t.number + (t.unit || '') : (t.value || '');
                        }).join(' ') + ')';
                        ctx.fillStyle = '#000000';
                        ctx.fillStyle = valStr;
                        var hexOrRgb = ctx.fillStyle;
                        var packFn = typeof pack !== 'undefined' ? pack : (exports && exports.pack ? exports.pack : function(r,g,b,a){ return ((r&0xff)<<24)|((g&0xff)<<16)|((b&0xff)<<8)|Math.round(a*255); });
                        if (hexOrRgb && hexOrRgb.charAt(0) === '#') {
                            var r = parseInt(hexOrRgb.substring(1, 3), 16);
                            var g = parseInt(hexOrRgb.substring(3, 5), 16);
                            var b = parseInt(hexOrRgb.substring(5, 7), 16);
                            return packFn(r, g, b, 1);
                        } else if (hexOrRgb && hexOrRgb.indexOf('rgba') === 0) {
                            var parts = hexOrRgb.match(/[\\d\\.]+/g);
                            if (parts) {
                                return packFn(parseFloat(parts[0]), parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3]));
                            }
                        } else if (hexOrRgb && hexOrRgb.indexOf('rgb') === 0) {
                            var parts = hexOrRgb.match(/[\\d\\.]+/g);
                            if (parts) {
                                return packFn(parseFloat(parts[0]), parseFloat(parts[1]), parseFloat(parts[2]), 1);
                            }
                        }
                    }
                } catch (e) {}
                return (typeof pack !== 'undefined' ? pack : exports.pack)(0, 0, 0, 1);`;

filesToPatch.forEach((fp) => {
  if (fs.existsSync(fp)) {
    let content = fs.readFileSync(fp, "utf8");
    if (content.includes('Attempting to parse an unsupported color function')) {
      content = content.replace(targetPattern, patchCode);
      fs.writeFileSync(fp, content, "utf8");
      console.log("Successfully patched:", fp);
    }
  }
});
