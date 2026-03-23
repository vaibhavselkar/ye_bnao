export const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', script: 'latin', rtl: false, font: 'System', sttCode: 'en-IN' },
  { code: 'hinglish', name: 'Hinglish', nativeName: 'Hinglish', script: 'latin', rtl: false, font: 'System', sttCode: 'hi-IN' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', script: 'devanagari', rtl: false, font: 'NotoSansDevanagari', sttCode: 'hi-IN' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', script: 'bengali', rtl: false, font: 'NotoSansBengali', sttCode: 'bn-IN' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', script: 'devanagari', rtl: false, font: 'NotoSansDevanagari', sttCode: 'mr-IN' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', script: 'tamil', rtl: false, font: 'NotoSansTamil', sttCode: 'ta-IN' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', script: 'telugu', rtl: false, font: 'NotoSansTelugu', sttCode: 'te-IN' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', script: 'kannada', rtl: false, font: 'NotoSansKannada', sttCode: 'kn-IN' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', script: 'gujarati', rtl: false, font: 'NotoSansGujarati', sttCode: 'gu-IN' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', script: 'gurmukhi', rtl: false, font: 'NotoSansGurmukhi', sttCode: 'pa-IN' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', script: 'malayalam', rtl: false, font: 'NotoSansMalayalam', sttCode: 'ml-IN' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', script: 'odia', rtl: false, font: 'NotoSansOriya', sttCode: 'or-IN' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', script: 'bengali', rtl: false, font: 'NotoSansBengali', sttCode: 'as-IN' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', script: 'nastaliq', rtl: true, font: 'NotoNastaliqUrdu', sttCode: 'ur-IN' },
  { code: 'mai', name: 'Maithili', nativeName: 'मैथिली', script: 'devanagari', rtl: false, font: 'NotoSansDevanagari', sttCode: 'hi-IN' },
  { code: 'sat', name: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ', script: 'olchiki', rtl: false, font: 'NotoSansDevanagari', sttCode: 'hi-IN' },
  { code: 'ks', name: 'Kashmiri', nativeName: 'کٲشُر', script: 'nastaliq', rtl: true, font: 'NotoNastaliqUrdu', sttCode: 'ur-IN' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', script: 'devanagari', rtl: false, font: 'NotoSansDevanagari', sttCode: 'ne-IN' },
  { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي', script: 'nastaliq', rtl: true, font: 'NotoNastaliqUrdu', sttCode: 'ur-IN' },
  { code: 'kok', name: 'Konkani', nativeName: 'कोंकणी', script: 'devanagari', rtl: false, font: 'NotoSansDevanagari', sttCode: 'hi-IN' },
  { code: 'doi', name: 'Dogri', nativeName: 'डोगरी', script: 'devanagari', rtl: false, font: 'NotoSansDevanagari', sttCode: 'hi-IN' },
  { code: 'brx', name: 'Bodo', nativeName: 'बड़ो', script: 'devanagari', rtl: false, font: 'NotoSansDevanagari', sttCode: 'hi-IN' },
  { code: 'mni', name: 'Manipuri', nativeName: 'মৈতৈলোন্', script: 'bengali', rtl: false, font: 'NotoSansBengali', sttCode: 'hi-IN' },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्', script: 'devanagari', rtl: false, font: 'NotoSansDevanagari', sttCode: 'hi-IN' },
];

export const RTL_LANGUAGES = ['ur', 'ks', 'sd'];
export const DEFAULT_LANGUAGE = 'en';
export const FALLBACK_LANGUAGE = 'hi';
