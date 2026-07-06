export const getArabicCountryName = (country) => {
  if (!country) return "";
  if (typeof country === "string") return country;
  return (
    country.nameAr ||
    country.arabicName ||
    country.name?.ar ||
    (typeof country.name === "string" ? country.name : "") ||
    country.name?.en ||
    country.englishName ||
    ""
  );
};

export const countryOption = (country) => ({
  id: country.id || country._id,
  label: getArabicCountryName(country),
});
