import { Organization, PopupType } from "./data";
export type PopupTypeKey = (typeof PopupType)[keyof typeof PopupType];

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

export type PopupData = {
  id: string;
  position: Point;
  image: string; // base64
  organization: keyof typeof Organization;
  type: keyof typeof PopupType;
};

export type Company = {
  image: string; // base64
  organization: OrganizationKey;
  type: PopupTypeKey;
};

export type Polygon = {
  id: string;
  points: Point[];
  title: string;
  image: string; // base64
  companies: Company[];
};
