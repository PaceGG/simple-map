export const PopupType = {
  Clothes: {
    type: "Магазин одежды",
    icon: "https://gtaundergroundmod.com/resources/media/blips/radar_tshirt.png",
  },
  Store: {
    type: "Магазин продуктов",
    icon: "https://gtaundergroundmod.com/resources/media/blips/radar_generalstore.png",
  },
  House: {
    type: "Жилой дом",
    icon: "https://gtaundergroundmod.com/resources/media/blips/radar_propertyG.png",
  },
  Hotel: {
    type: "Отель",
    icon: "https://gtaundergroundmod.com/resources/media/blips/radar_emp_default.png",
  },
  Church: {
    type: "Церковь",
    icon: "https://gtaundergroundmod.com/resources/media/blips/radar_girlfriend.png",
  },
  Weed: {
    type: "Автомат с травой",
    icon: "https://gtaundergroundmod.com/resources/media/blips/radar_MalibuClub.png",
  },
  Garage: {
    type: "Тюнинг-салон",
    icon: "https://gtaundergroundmod.com/resources/media/blips/radar_modGarage.png",
  },
  Parking: {
    type: "Парковка",
    icon: "https://gtaundergroundmod.com/resources/media/blips/radar_RYDER.png",
  },
  Energy: {
    type: "Автомат с энергетиком",
    icon: "https://gtaundergroundmod.com/resources/media/blips/radar_sunshineAutos.png",
  },
  Melee: {
    type: "Автомат с холодным оружием",
    icon: "https://gtaundergroundmod.com/resources/media/blips/radar_emmetGun.png",
  },
  Bio: {
    type: "Автомат с инъекциями",
    icon: "https://gtaundergroundmod.com/resources/media/blips/radar_gym.png",
  },
  Barber: {
    type: "Парикмахерская",
    icon: "https://gtaundergroundmod.com/resources/media/blips/radar_barbers.png",
  },
  SMI: {
    type: "СМИ",
    icon: "https://gtaundergroundmod.com/resources/media/blips/radar_dateDisco.png",
  },
};
export type PopupTypeKey = (typeof PopupType)[keyof typeof PopupType];

export const Organization = {
  CAP: {
    name: "CAP",
  },
  SNR: {
    name: "Soap & Rope",
  },
  House: {
    name: "Частный жилой дом",
  },
  Apartment: {
    name: "Многоквартирный дом",
  },
  Balls: {
    name: "Отель Balls",
  },
  Spiral: {
    name: "Отель Spiral",
  },
  Church: {
    name: "Церковь",
  },
  Ganja: {
    name: "Ganja Shot",
  },
  Biotrans: {
    name: "Biotrans salon",
  },
  Serivce: {
    name: "Service",
  },
  Parking: {
    name: "Парковка",
  },
  BoohLo: {
    name: "Booh-Lo",
  },
  Melee: {
    name: "Melee weapons",
  },
  StyleMachine: {
    name: "Style Machine",
  },
  BarberMachine: {
    name: "Barber Machine",
  },
  Bio: {
    name: "Biotrans injection",
  },
  MTV: {
    name: "Me TV News",
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
