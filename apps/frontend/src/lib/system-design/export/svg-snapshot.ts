// Turns an on-screen diagram <svg> into a standalone image, always in light
// theme (Plan doc Section 6.4). Browser-only.
//
// A serialized SVG loaded as an <img> can't see the page's CSS, so the clone
// is mounted inside a hidden `.sd-light` container first, and every element's
// resolved colours are copied onto it as inline styles.

const INLINED_PROPERTIES = [
  "fill",
  "stroke",
  "color",
  "stop-color",
  "opacity",
  "font-family",
  "font-size",
  "font-weight",
];

function inlineComputedStyles(source: Element, target: Element) {
  const computed = getComputedStyle(source);
  const style = (target as SVGElement).style;
  for (const property of INLINED_PROPERTIES) {
    style.setProperty(property, computed.getPropertyValue(property));
  }
  for (let i = 0; i < source.children.length; i++) {
    inlineComputedStyles(source.children[i], target.children[i]);
  }
}

export async function snapshotSvg(
  svg: SVGSVGElement,
): Promise<HTMLImageElement> {
  const container = document.createElement("div");
  container.className = "sd-light";
  container.style.cssText = "position:fixed;left:-10000px;top:0;";
  const live = svg.cloneNode(true) as SVGSVGElement;
  const { width, height } = svg.viewBox.baseVal;
  live.setAttribute("width", String(width));
  live.setAttribute("height", String(height));
  container.appendChild(live);
  document.body.appendChild(container);

  try {
    const standalone = live.cloneNode(true) as SVGSVGElement;
    inlineComputedStyles(live, standalone);
    standalone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const markup = new XMLSerializer().serializeToString(standalone);
    const url = URL.createObjectURL(
      new Blob([markup], { type: "image/svg+xml" }),
    );
    try {
      const image = new Image();
      image.width = width;
      image.height = height;
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () =>
          reject(new Error("Diagram-টা ছবিতে রূপান্তর করা গেল না।"));
        image.src = url;
      });
      return image;
    } finally {
      // Image is decoded once loaded; the blob URL is no longer needed after drawing.
      setTimeout(() => URL.revokeObjectURL(url), 0);
    }
  } finally {
    container.remove();
  }
}
