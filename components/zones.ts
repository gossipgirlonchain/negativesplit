/* Plate geometry for every sponsor position in the drawing, lifted out of
   the SVG markup unchanged. Same coordinates, same order, same rotations.
   It lives as data so a plate can render either its position number or an
   approved sponsor's logo, including on the rotated plates. */

export type Plate = {
  x: number;
  y: number;
  width: number;
  height: number;
  rx: number;
  transform?: string;
};

export type ZoneSpec = {
  code: string;
  plates: Plate[];
  codes: { x: number; y: number }[];
};

/** Draw order, exactly as it was in the single-file version. */
export const ZONE_ORDER = [
  "k-front-up",
  "k-back-up",
  "k-front-lo",
  "k-back-lo",
  "k-sleeves",
  "b-helmet",
  "b-helmet-f",
  "b-dt-low",
  "b-dt-up",
  "b-fork",
  "b-headtube",
] as const;

export const ZONES: Record<string, ZoneSpec> = {
  "k-front-up": {
    code: "01",
    plates: [{ x: 69.9, y: 84.8, width: 102.6, height: 72.2, rx: 9 }],
    codes: [{ x: 121.2, y: 120.9 }],
  },
  "k-back-up": {
    code: "02",
    plates: [{ x: 268, y: 81, width: 106.4, height: 79.8, rx: 9 }],
    codes: [{ x: 321.2, y: 120.9 }],
  },
  "k-front-lo": {
    code: "03",
    plates: [{ x: 68, y: 166.5, width: 106.4, height: 79.8, rx: 9 }],
    codes: [{ x: 121.2, y: 206.4 }],
  },
  "k-back-lo": {
    code: "04",
    plates: [{ x: 268, y: 166.5, width: 106.4, height: 79.8, rx: 9 }],
    codes: [{ x: 321.2, y: 206.4 }],
  },
  "k-sleeves": {
    code: "05",
    plates: [
      {
        x: -21.9,
        y: -16.2,
        width: 43.7,
        height: 32.3,
        rx: 7,
        transform: "translate(43.3,82.9) rotate(-60)",
      },
      {
        x: -21.9,
        y: -16.2,
        width: 43.7,
        height: 32.3,
        rx: 7,
        transform: "translate(197.2,82.9) rotate(60)",
      },
    ],
    codes: [
      { x: 43.3, y: 82.9 },
      { x: 197.2, y: 82.9 },
    ],
  },
  "b-helmet": {
    code: "09",
    plates: [{ x: 482, y: 133.6, width: 54.4, height: 23.8, rx: 7 }],
    codes: [{ x: 509.2, y: 145.5 }],
  },
  "b-helmet-f": {
    code: "10",
    plates: [{ x: 461.6, y: 263.6, width: 49.3, height: 22.1, rx: 7 }],
    codes: [{ x: 486.2, y: 274.6 }],
  },
  "b-dt-low": {
    code: "06",
    plates: [
      {
        x: -42.5,
        y: -16.2,
        width: 85,
        height: 32.3,
        rx: 8,
        transform: "translate(941.1,228.6) rotate(-27.8)",
      },
    ],
    codes: [{ x: 941.1, y: 228.6 }],
  },
  "b-dt-up": {
    code: "07",
    plates: [
      {
        x: -42.5,
        y: -16.2,
        width: 85,
        height: 32.3,
        rx: 8,
        transform: "translate(1028.5,182.5) rotate(-27.8)",
      },
    ],
    codes: [{ x: 1028.5, y: 182.5 }],
  },
  "b-fork": {
    code: "08",
    plates: [
      {
        x: -38.3,
        y: -9.4,
        width: 76.5,
        height: 18.7,
        rx: 6,
        transform: "translate(1101.3,203.1) rotate(86.4)",
      },
    ],
    codes: [{ x: 1101.3, y: 203.1 }],
  },
  "b-headtube": {
    code: "11",
    plates: [
      {
        x: -18.7,
        y: -11.1,
        width: 37.4,
        height: 22.1,
        rx: 6,
        transform: "translate(1086.9,121.5) rotate(72)",
      },
    ],
    codes: [{ x: 1086.9, y: 121.5 }],
  },
};
