export type ResDTO = {
    suggestions: Suggestion[];
};

export type Suggestion = {
    value: string;
    unrestricted_value: string;
    data: SuggestionData;
};

export type SuggestionData = {
    kpp: string;
    capital: null;
    invalid: null;
    management: Management;
    founders: null;
    managers: null;
    predecessors: null;
    successors: null;
    branch_type: string;
    branch_count: number;
    source: null;
    qc: null;
    hid: string;
    type: string;
    state: State;
    opf: Opf;
    name: Name;
    inn: string;
    ogrn: string;
    okpo: string;
    okato: string;
    oktmo: string;
    okogu: string;
    okfs: string;
    okved: string;
    okveds: null;
    authorities: null;
    documents: null;
    licenses: null;
    finance: Finance | null;
    address: Address;
    phones: null;
    emails: null;
    ogrn_date: number;
    okved_type: string;
    employee_count: null;
};

export type Address = {
    value: string;
    unrestricted_value: string;
    invalidity: null;
    data: AddressData;
};

export type AddressData = {
    postal_code: string;
    country: string;
    country_iso_code: string;
    federal_district: string;
    region_fias_id: string;
    region_kladr_id: string;
    region_iso_code: string;
    region_with_type: string;
    region_type: string;
    region_type_full: string;
    region: string;
    area_fias_id: null;
    area_kladr_id: null;
    area_with_type: null;
    area_type: null;
    area_type_full: null;
    area: null;
    city_fias_id: string;
    city_kladr_id: string;
    city_with_type: string;
    city_type: string;
    city_type_full: string;
    city: string;
    city_area: null;
    city_district_fias_id: null;
    city_district_kladr_id: null;
    city_district_with_type: null | string;
    city_district_type: null | string;
    city_district_type_full: null | string;
    city_district: null | string;
    settlement_fias_id: null;
    settlement_kladr_id: null;
    settlement_with_type: null;
    settlement_type: null;
    settlement_type_full: null;
    settlement: null;
    street_fias_id: string;
    street_kladr_id: string;
    street_with_type: string;
    street_type: string;
    street_type_full: string;
    street: string;
    stead_fias_id: null;
    stead_cadnum: null;
    stead_type: null;
    stead_type_full: null;
    stead: null;
    house_fias_id: string;
    house_kladr_id: string;
    house_cadnum: null | string;
    house_type: string;
    house_type_full: string;
    house: string;
    block_type: null | string;
    block_type_full: null | string;
    block: null | string;
    entrance: null;
    floor: null;
    flat_fias_id: null | string;
    flat_cadnum: null;
    flat_type: string;
    flat_type_full: string;
    flat: string;
    flat_area: null | string;
    square_meter_price: null | string;
    flat_price: null | string;
    room_fias_id: null;
    room_cadnum: null;
    room_type: null;
    room_type_full: null;
    room: null;
    postal_box: null;
    fias_id: string;
    fias_code: string;
    fias_level: string;
    fias_actuality_state: string;
    kladr_id: string;
    geoname_id: string;
    capital_marker: string;
    okato: string;
    oktmo: string;
    tax_office: string;
    tax_office_legal: string;
    timezone: string;
    geo_lat: string;
    geo_lon: string;
    beltway_hit: null | string;
    beltway_distance: null | string;
    metro: Metro[] | null;
    divisions: null;
    qc_geo: string;
    qc_complete: null;
    qc_house: null;
    history_values: null;
    unparsed_parts: null;
    source: string;
    qc: string;
};

export type Metro = {
    name: string;
    line: string;
    distance: number;
};

export type Finance = {
    tax_system: null;
    income: null;
    expense: null;
    revenue: null;
    debt: null;
    penalty: null;
    year: null;
};

export type Management = {
    name: string;
    post: string;
    disqualified: null;
};

export type Name = {
    full_with_opf: string;
    short_with_opf: string;
    latin: null;
    full: string;
    short: string;
};

export type Opf = {
    type: string;
    code: string;
    full: string;
    // short: string;
    short: 'ИП' | 'ООО' | 'АО' | 'ПАО';
};

export type State = {
    status: string;
    code: null;
    actuality_date: number;
    registration_date: number;
    liquidation_date: null;
};
