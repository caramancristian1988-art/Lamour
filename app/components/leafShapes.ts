// Forme de frunze de toamnă (viewBox 0 0 24 24), pentru AutumnLeaves. `vein` = nervura (linie albă translucidă).
export interface LeafShape {
  name: string;
  body: string;
  vein: string;
  colors: string[];
}

export const LEAF_SHAPES: LeafShape[] = [
  {
    // arțar: 5 lobi ascuțiți
    name: "artar",
    body: "M12 1.5l2.3 4.3 3.3-1.6-.7 4.6 4.6-.9-2.6 3.8 2.6 2.1-4.7 1.1.5 2.1-4.1-.9L12.8 22h-1.6l-.6-4.8-4.1.9.5-2.1-4.7-1.1 2.6-2.1L2.3 8.1l4.6.9-.7-4.6 3.3 1.6z",
    vein: "M12 6v15M12 12l-5-3M12 12l5-3",
    colors: ["#d62f1f", "#e8531a", "#b3261e"],
  },
  {
    // stejar: contur ondulat, lobi rotunjiți
    name: "stejar",
    body: "M12 1.8c1.2.9 1.9 2 1.9 3.2 1.2-.7 2.6-.6 3.2.4.5 1-.1 2-1.3 2.9 1.5-.2 2.8.4 3.1 1.6.3 1.3-.8 2.2-2.2 2.6 1.4.6 2.2 1.9 1.6 3.1-.6 1.2-2.1 1.3-3.4.8.5 1.3.2 2.6-.7 3.5-.8.8-1.5.9-1.9 1.3V22h-.6v-1.1c-.4-.4-1.1-.5-1.9-1.3-.9-.9-1.2-2.2-.7-3.5-1.3.5-2.8.4-3.4-.8-.6-1.2.2-2.5 1.6-3.1-1.4-.4-2.5-1.3-2.2-2.6.3-1.2 1.6-1.8 3.1-1.6-1.2-.9-1.8-1.9-1.3-2.9.6-1 2-1.1 3.2-.4 0-1.2.7-2.3 1.9-3.2z",
    vein: "M12 5v16M12 10l-3-2M12 10l3-2M12 14l-3-2M12 14l3-2",
    colors: ["#a8541a", "#c77d2b", "#8d4a1b"],
  },
  {
    // mesteacăn: ovală cu vârf, margine dințată
    name: "mesteacan",
    body: "M12 1.8l2 2.6 2.2-.4.9 2.6 2.4.6-.4 2.7 1.7 1.8-1.6 2.1.6 2.8-2.7.9-.7 2.7-2.7-.3L12 22.2l-1.7-2.3-2.7.3-.7-2.7-2.7-.9.6-2.8-1.6-2.1 1.7-1.8-.4-2.7 2.4-.6.9-2.6 2.2.4z",
    vein: "M12 4v18M12 9l-3.5-2.5M12 9l3.5-2.5M12 14l-4-3M12 14l4-3",
    colors: ["#f5c518", "#e9a820", "#ffd23f"],
  },
  {
    // ginkgo: evantai cu scobitură
    name: "ginkgo",
    body: "M12 22l-.9-7.4C6.3 14.2 2.6 10.2 2.5 4.2c2.7 1.8 5.4 1.6 7.7 1L12 8.4l1.8-3.2c2.3.6 5 .8 7.7-1-.1 6-3.8 10-8.6 10.4z",
    vein: "M12 22V9M12 14l-5-6M12 14l5-6",
    colors: ["#ffd23f", "#f9c80e", "#f4a81d"],
  },
  {
    // plop / tei: aproape rotundă, cu vârf
    name: "plop",
    body: "M12 2.2c4.4 1.6 8 5 8 9.2 0 5-3.8 8.7-8 10.6-4.2-1.9-8-5.6-8-10.6 0-4.2 3.6-7.6 8-9.2z",
    vein: "M12 3.5V22M12 9l-3-2M12 9l3-2M12 14l-4-3M12 14l4-3",
    colors: ["#e9a820", "#f1b22b", "#ff9d1f"],
  },
  {
    // frunză lanceolată simplă
    name: "simpla",
    body: "M12 1.5C7 6.5 3.8 11 5.8 16.2 7.2 19.8 10.5 22.3 12 22.5c1.5-.2 4.8-2.7 6.2-6.3C20.2 11 17 6.5 12 1.5z",
    vein: "M12 5v17",
    colors: ["#e5381f", "#ff8a1f", "#c4271a"],
  },
];
