export const PopupType = {
  Clothes: {
    type: "Магазин одежды",
    icon: "https://gtaundergroundmod.com/resources/media/blips/radar_tshirt.png",
  },
};
export type PopupTypeKey = (typeof PopupType)[keyof typeof PopupType];

export const Organization = {
  CAP: {
    name: "CAAP",
    logo: "no",
  },
};
export type OrganizationKey = (typeof Organization)[keyof typeof Organization];

export type Point = {
  x: number;
  y: number;
};

export type Popup = {
  id: string;
  position: Point;
  image: string; // base64
  organization: OrganizationKey;
  type: PopupTypeKey;
};
