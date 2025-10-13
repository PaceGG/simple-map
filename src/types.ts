// import { Organization, PopupType } from "./data";
// export type PopupTypeKey = (typeof PopupType)[keyof typeof PopupType];
// export type OrganizationKey = (typeof Organization)[keyof typeof Organization];

export type Point = {
  x: number;
  y: number;
};

export interface OrganizationInfo {
  name: string;
  type: string;
  icon: string;
}

export type Popup = {
  id: string;
  position: Point;
  image: string; // base64
  organization: OrganizationInfo;
  polygonInfo?: Omit<Polygon, "companies">;
};

export type PopupData = {
  id: string;
  position: Point;
  image: string; // base64
  organization: OrganizationInfo;
};

export type Polygon = {
  id: string;
  points: Point[];
  title: string;
  houseNumber: string;
  image: string; // base64
  companies: Popup[];
};

export type PolygonData = {
  id: string;
  points: Point[];
  title: string;
  houseNumber: string;
  image: string; // base64
  companies: PopupData[];
};
