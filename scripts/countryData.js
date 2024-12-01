const donatorsList = [
    "SkyStep",
    "qqwref",
    "c0wmanglr",
    "goodevening",
    "XLII",
    "VanillaGawr"
];

const adminsList = [
    "dphdmn",
    "vovker"
];

//countries list and emoji for users to add flags

const userCountryMap = {
    Australia: 'Australia',
    Belarus: 'Belarus',
    Belgium: 'Belgium',
    Bulgaria: 'Bulgaria',
    Canada: 'Canada',
    China: 'China',
    Columbia: 'Columbia',
    'Czech Republic': 'Czech Republic',
    Finland: 'Finland',
    France: 'France',
    Germany: 'Germany',
    'Hong Kong': 'Hong Kong',
    India: 'India',
    Italy: 'Italy',
    Malaysia: 'Malaysia',
    Mexico: 'Mexico',
    Netherlands: 'Netherlands',
    Philippines: 'Philippines',
    Poland: 'Poland',
    Russia: 'Russia',
    Serbia: 'Serbia',
    Singapore: 'Singapore',
    Taiwan: 'Taiwan',
    'UK': 'UK',
    Japan: 'Japan',
    Ukraine: 'Ukraine',
    USA: 'USA',
    Brazil: 'Brazil',
    Norway: 'Norway',
    'New Zealand': 'New Zealand',

    Tronamo: 'Australia',
    Brendan7625: 'Australia',
    lekh2003: 'Australia',
    Utochka: 'Belarus',
    larsvdb97: 'Belgium',
    luybo: 'Bulgaria',
    ap: 'Canada',
    vcuber13: 'Canada',
    yoshinator879: 'Canada',
    Blueoanaoa: 'China',
    JZE: 'China',
    diudiuhamburger: 'China',
    gwj: 'China',
    XMeng: 'China',
    zyc: 'China',
    Ruan: 'China',
    yzx: 'China',
    chy: 'China',
    mochuannnn: 'China',
    Luisa15: 'Columbia',
    Lunarien: 'Czech Republic',
    asdfghqwerty: 'Finland',
    sq: 'France',
    Nikokas: 'France',
    Ladoly: 'France',
    Asbjorn: 'France',
    Netamma: 'France',
    daanbe: 'Germany',
    XLII: 'Germany',
    Dyslexus: 'Germany',
    RedstoneTim: 'Germany',
    Rouxles: 'Hong Kong',
    HackerTyper492: 'India',
    krjjod: 'India',
    imvelox: 'Italy',
    Nabbissimux: 'Italy',
    DedolCubing: 'Italy',
    thelegendary08: 'Malaysia',
    gottagitgud: 'Mexico',
    Rafael: 'Netherlands',
    JihadCubing: 'Netherlands',
    eff: 'Philippines',
    Dawidluna: 'Poland',
    kiraa96: 'Poland',
    pankubix: 'Poland',
    Verscup: 'Poland',
    Kingstone: 'Poland',
    Dekodzi: 'Poland',
    dphdmn: 'Russia',
    vovker: 'Russia',
    goodevening: 'Russia',
    quing: 'Russia',
    OsipovAleksander: 'Russia',
    GoldenBoy: 'Russia',
    IslamKitiev: 'Russia',
    Wrabbable: 'Russia',
    kv1nk: 'Russia',
    gontod195: 'Russia',
    YanikusGG: 'Russia',
    Antonyme: 'Russia',
    thetskerp: 'Russia',
    VyacheslavPervushin: 'Russia',
    vedroboev: 'Russia',
    dima: 'Russia',
    '1210': 'Russia',
    VanillaGawr: 'Russia',
    jug: 'Serbia',
    andrewtheslider: 'Serbia',
    peaceknight05: 'Singapore',
    SunOceanBeach: 'Taiwan',
    ben1996123: 'UK',
    Tree: 'UK',
    TDM: 'UK',
    Billabob: 'UK',
    sameer: 'UK',
    chbld: 'UK',
    JL586: 'UK',
    Garfologist: 'UK',
    darkanturian: 'UK',
    billzo: 'UK',
    Shadowslice: 'UK',
    Berkmann18: 'UK',
    sam596: 'UK',
    IgorTarasov: 'Ukraine',
    oliynykmax: 'Ukraine',
    faugore: 'Ukraine',
    Magentawolf27YT: 'USA',
    R14: 'USA',
    xsedim: 'USA',
    TheMatsValk: 'USA',
    tnum10: 'USA',
    SkyStep: 'USA',
    soup: 'USA',
    Scyter: 'USA',
    enigma515: 'USA',
    qqwref: 'USA',
    upvoid: 'USA',
    happydays: 'USA',
    LEBaldy: 'USA',
    strakerak: 'USA',
    c0wmanglr: 'USA',
    mAyo: 'USA',
    teri: 'USA',
    ShyGuy1265: 'USA',
    creepycat18: 'USA',
    Ianwubby: 'USA',
    BindeDSA: 'USA',
    Sethamajig: 'USA',
    MLGSheep1: 'USA',
    BrickInAPresent: 'USA',
    Owen: 'USA',
    Dapianokid: 'USA',
    Dreamer: 'USA',
    '105iqengineer': 'USA',
    Alex: 'USA',
    alka: 'USA',
    kleb: 'USA',
    HOGGYSIMP: 'USA',
    amazingpikachu37: 'USA',
    kolunoa: 'France',
    HoHo: 'Japan',
    chaeerin: 'Columbia',
    '0jacky0': 'China',
    Sakinuto: 'Brazil',
    Yiclaw: 'Norway',
    PedroAM: 'Brazil',
    zach: 'USA',
    luca: 'UK',
    OCEshadow: 'Australia',
    boink: 'Australia',
    July2nd: 'USA',
    Corpllwacquirerrichmf: 'Germany',
    erykkas: 'Poland',
    BollnKK: 'Singapore',
    majesticwalrus: 'New Zealand',
    wiserboblouis: 'Australia',
    Arm0nd0: 'Canada',
    allenbot: 'Singapore',
    moceke: 'Russia',
};

const countryEmojis = {
    Australia: '🇦🇺',
    Belarus: '🇧🇾',
    Belgium: '🇧🇪',
    Bulgaria: '🇧🇬',
    Canada: '🇨🇦',
    China: '🇨🇳',
    Columbia: '🇨🇴',
    'Czech Republic': '🇨🇿',
    Finland: '🇫🇮',
    France: '🇫🇷',
    Germany: '🇩🇪',
    'Hong Kong': '🇭🇰',
    India: '🇮🇳',
    Italy: '🇮🇹',
    Malaysia: '🇲🇾',
    Mexico: '🇲🇽',
    Netherlands: '🇳🇱',
    Philippines: '🇵🇭',
    Poland: '🇵🇱',
    Russia: '🇷🇺',
    Serbia: '🇷🇸',
    Singapore: '🇸🇬',
    Taiwan: '🇹🇼',
    'UK': '🇬🇧',
    Japan: '🇯🇵',
    Ukraine: '🇺🇦',
    'USA': '🇺🇸',
    Brazil: '🇧🇷',
    Norway: '🇳🇴',
    'New Zealand': '🇳🇿',
};
