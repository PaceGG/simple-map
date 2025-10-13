export type Point = {
  x: number;
  y: number;
};

export interface OrganizationInfo {
  id: string;
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
  organizationId: string;
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
