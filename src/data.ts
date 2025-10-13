export const PopupType = {};

type PopupTypeKey = keyof typeof PopupType;

interface OrganizationInfo {
  name: string;
  type: PopupTypeKey;
}

export const Organization: Record<string, OrganizationInfo> = {};
