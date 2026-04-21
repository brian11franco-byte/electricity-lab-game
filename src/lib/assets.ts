/**
 * Central asset map. All images live in /public and are referenced by name.
 * Keep filenames identical to the source Canva assets so they can be
 * re-exported without touching code.
 */

export const deviceImages = {
  broom: "/devices/Broom.png",
  ceilingLight: "/devices/Ceiling-Light.png",
  desktopComputer: "/devices/Dekstop-Computer.png",
  digitalCalculator: "/devices/Digital-Calculator.png",
  diningTable: "/devices/Dining-Table.png",
  electricFan: "/devices/Electric-Fan.png",
  flashlight: "/devices/Flashlight.png",
  interactiveWhiteboard: "/devices/Interactive-Whiteboard.png",
  manualPencilSharpener: "/devices/Manual-Pencil-Sharpener.png",
  remote: "/devices/Remote.png",
  scissors: "/devices/Scissors.png",
  smallToyRobot: "/devices/Small-Toy-Robot.png",
  stapler: "/devices/Stapler.png",
  television: "/devices/Television.png",
  whiteboard: "/devices/Whiteboard.png",
} as const;

export const conceptIcons = {
  cells: "/concept-icons/cells.png",
  mains: "/concept-icons/mains.png",
  pressSwitch: "/concept-icons/press-switch.png",
  rockerSwitch: "/concept-icons/rocker-switch.png",
  slideSwitch: "/concept-icons/slide-switch.png",
} as const;

export const generationImages = {
  powerStation: "/generation/Power-Station.png",
  transmissionLines: "/generation/Transmission-Lines.png",
  distributionLines: "/generation/Distribution-Lines.png",
  house: "/generation/House.png",
} as const;

export type DeviceKey = keyof typeof deviceImages;
export type ConceptKey = keyof typeof conceptIcons;
export type GenerationKey = keyof typeof generationImages;
