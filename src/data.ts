export const PopupType = {
  Clothes: {
    type: "Магазин одежды",
    icon: "https://docs.fivem.net/blips/radar_clothes_store.png",
  },
  Store: {
    type: "Магазин продуктов",
    icon: "https://docs.fivem.net/blips/radar_heist.png",
  },
  House: {
    type: "Жилой дом",
    icon: "https://docs.fivem.net/blips/radar_safehouse.png",
  },
  HouseGarage: {
    type: "Жилой дом с гаражом или парковочным местом",
    icon: "https://docs-backend.fivem.net/blips/radar_biker_clubhouse.png",
  },
  Apartments: {
    type: "Многоквартирный дом",
    icon: "https://docs-backend.fivem.net/blips/radar_office.png",
  },
  ApartmentsGarage: {
    type: "Многоквартирный дом с парковочным местом",
    icon: "apartmentsGarage.png",
  },
  Hotel: {
    type: "Отель",
    icon: "https://docs-backend.fivem.net/blips/radar_level_inside.png",
  },
  Church: {
    type: "Церковь",
    icon: "https://docs.fivem.net/blips/radar_horde.png",
  },
  Gunshop: {
    type: "Магазин оружия",
    icon: "https://docs-backend.fivem.net/blips/radar_shootingrange_gunshop.png",
  },
  WeaponMachine: {
    type: "Автомат с оружием",
    icon: "https://docs-backend.fivem.net/blips/radar_gun_shop.png",
  },
  Weed: {
    type: "Автомат с травой",
    icon: "https://docs-backend.fivem.net/blips/radar_weed_stash.png",
  },
  Garage: {
    type: "Тюнинг-салон",
    icon: "https://docs-backend.fivem.net/blips/radar_bennys.png",
  },
  Parking: {
    type: "Парковка",
    icon: "https://docs-backend.fivem.net/blips/radar_property.png",
  },
  Energy: {
    type: "Автомат с энергетиком",
    icon: "https://docs-backend.fivem.net/blips/radar_boost.png",
  },
  Melee: {
    type: "Автомат с холодным оружием",
    icon: "radar_weapon_bat.png",
  },
  Bio: {
    type: "Автомат с инъекциями",
    icon: "https://docs.fivem.net/blips/radar_testosterone.png",
  },
  Barber: {
    type: "Парикмахерская",
    icon: "https://docs-backend.fivem.net/blips/radar_barber.png",
  },
  SMI: {
    type: "СМИ",
    icon: "https://docs-backend.fivem.net/blips/radar_reg_papers.png",
  },
  Station: {
    type: "Станция монорельса",
    icon: "https://docs-backend.fivem.net/blips/radar_train.png",
  },
  MafiaItaly: {
    type: "Итальянская мафия",
    icon: "https://gtaundergroundmod.com/resources/media/blips/radar_gangS2.png",
  },
  Billboard: {
    type: "Билборд",
    icon: "https://docs.fivem.net/blips/radar_golf_flag.png",
  },
  Club: {
    type: "Клуб",
    icon: "https://docs.fivem.net/blips/radar_bat_club_property.png",
  },
  Arcade: {
    type: "Игровой клуб",
    icon: "https://docs.fivem.net/blips/radar_arcade.png",
  },
  Casino: {
    type: "Казино",
    icon: "https://docs.fivem.net/blips/radar_casino_table_games.png",
  },
  Restaurant: {
    type: "Ресторан",
    icon: "restaurant.png",
  },
  Police: {
    type: "Полицейский участок",
    icon: "https://docs.fivem.net/blips/radar_police_station.png",
  },
  Bar: {
    type: "Бар",
    icon: "https://docs.fivem.net/blips/radar_bar.png",
  },
  PNS: {
    type: "Сервис покраски авто",
    icon: "https://docs.fivem.net/blips/radar_car_mod_shop.png",
  },
  DrugStore: {
    type: "Аптека",
    icon: "https://docs-backend.fivem.net/blips/radar_crim_drugs.png",
  },
  Mexican: {
    type: "Мексиканская группировка",
    icon: "https://gtaundergroundmod.com/resources/media/blips/radar_gangY.png",
  },
  Airport: {
    type: "Аэропорт",
    icon: "https://docs.fivem.net/blips/radar_flight_school.png",
  },
  Food: {
    type: "Фастфуд",
    icon: "https://docs.fivem.net/blips/radar_pizza_this.png",
  },
  WeedStore: {
    type: "Магазин травы",
    icon: "https://docs-backend.fivem.net/blips/radar_weed_stash.png",
  },
  Hospital: {
    type: "Госпиталь",
    icon: "https://docs.fivem.net/blips/radar_hospital.png",
  },
};

type PopupTypeKey = keyof typeof PopupType;

interface OrganizationInfo {
  name: string;
  type: PopupTypeKey;
}

export const Organization: Record<string, OrganizationInfo> = {
  CAP: { name: "CAP", type: "Clothes" },
  SNR: { name: "Soap & Rope", type: "Store" },
  House: { name: "Частный жилой дом", type: "House" },
  Apartment: { name: "Многоквартирный дом", type: "Apartments" },
  Balls: { name: "Отель Balls", type: "Hotel" },
  Spiral: { name: "Отель Spiral", type: "Hotel" },
  Church: { name: "Церковь", type: "Church" },
  Ganja: { name: "Ganja Shot", type: "Weed" },
  Biotrans: { name: "Biotrans salon", type: "Clothes" },
  Serivce: { name: "Service", type: "Garage" },
  Parking: { name: "Parking", type: "Parking" },
  BoohLo: { name: "Booh-Lo", type: "Energy" },
  Melee: { name: "Melee weapons", type: "Melee" },
  StyleMachine: { name: "Style Machine", type: "Clothes" },
  BarberMachine: { name: "Barber Machine", type: "Barber" },
  Bio: { name: "Biotrans injection", type: "Bio" },
  MTV: { name: "Me TV News", type: "SMI" },
  Ammu: { name: "Ammu-Nation", type: "Gunshop" },
  Weapons: { name: "WEAPONS", type: "WeaponMachine" },
  Konopolis: { name: 'Станция "Конополис"', type: "Station" },
  Oasis: { name: "Отель Oasis", type: "Hotel" },
  ItalianMafia: { name: "Итальянская Мафия", type: "MafiaItaly" },
  Billboard: { name: "Билборд", type: "Billboard" },
  Malibu: { name: "Клуб Malibu", type: "Club" },
  Avengers: { name: "Avengers", type: "Casino" },
  Retro: { name: "Retro Games", type: "Arcade" },
  Karaoke: { name: "Karaoke Night", type: "Club" },
  Puta: { name: "Strip Club Puta", type: "Club" },
  MexicanRes: { name: "The Mexican Restaurant", type: "Restaurant" },
  Police: { name: "Policia Nacional radarotama", type: "Police" },
  Barbero: { name: "Barbero", type: "Barber" },
  Phoenix: { name: "Мотель Avocado", type: "Hotel" },
  Sombrero: { name: "Sombrero tequila club", type: "Bar" },
  HolyCow: { name: 'Church "HolyCow"', type: "Church" },
  Bueno: { name: "Bueno Market", type: "Store" },
  Bar: { name: "Bar", type: "Bar" },
  Karaokee: { name: "Karaoke", type: "Club" },
  Ramires: { name: "Отель Рамиреса", type: "Hotel" },
  Binco: { name: "Binco", type: "Clothes" },
  PNS: { name: "Pay'n'Spray", type: "PNS" },
  Motel: { name: "Motel", type: "Hotel" },
  Lolitas: { name: "Lolita's market", type: "Store" },
  Tequila: { name: "Tequila", type: "Bar" },
  TotalOverdose: { name: "Total Overdose", type: "DrugStore" },
  MexicanGang: { name: "Мексиканцы", type: "Mexican" },
  ACAir: { name: "Аэропорт Alien City", type: "Airport" },
  MC: { name: "McMonster's", type: "Food" },
  Liquor: { name: "Liquor", type: "Bar" },
  GoodStuff: { name: "Good Stuff", type: "WeedStore" },
  DrugStore: { name: "Drug Store", type: "DrugStore" },
  MafiaStore: { name: "Mafia Store", type: "Clothes" },
  Sth: { name: "5th Wheel", type: "Store" },
  Paradise: { name: "Отель Paradise", type: "Hotel" },
  ACHospital: { name: "Alien City Medical Center", type: "Hospital" },
  ACMonorail: { name: 'Станция "Алиен Сити"', type: "Station" },
  Lif: { name: "Отель Lif", type: "Hotel" },
};
