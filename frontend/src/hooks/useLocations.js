import { useState, useEffect } from "react";

// DATA: DANH SÁCH 34 TỈNH THÀNH MỚI CỦA VIỆT NAM
const VIETNAM_PROVINCES = [
  "TP. Hà Nội",
  "TP. Hồ Chí Minh",
  "TP. Hải Phòng",
  "TP. Đà Nẵng",
  "TP. Cần Thơ",
  "TP. Huế",
  "Tuyên Quang",
  "Lào Cai",
  "Lai Châu",
  "Điện Biên",
  "Lạng Sơn",
  "Cao Bằng",
  "Sơn La",
  "Thái Nguyên",
  "Phú Thọ",
  "Quảng Ninh",
  "Bắc Ninh",
  "Hưng Yên",
  "Ninh Bình",
  "Thanh Hóa",
  "Nghệ An",
  "Hà Tĩnh",
  "Quảng Trị",
  "Quảng Ngãi",
  "Gia Lai",
  "Đắk Lắk",
  "Khánh Hòa",
  "Lâm Đồng",
  "Bình Phước",
  "Tây Ninh",
  "Đồng Nai",
  "Đồng Tháp",
  "An Giang",
  "Cà Mau",
];

export const useLocations = (selectedCountry) => {
  const [locationsData, setLocationsData] = useState([]);
  const [countryCodes, setCountryCodes] = useState([]); // Chứa mã vùng (+84, +1...)
  const [countries, setCountries] = useState([]);
  const [availableStates, setAvailableStates] = useState([]);
  const [dialCode, setDialCode] = useState(""); // Mã vùng của nước đang chọn

  // FETCH DATA TỪ API QUỐC TẾ (Chỉ chạy 1 lần)
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        // Gọi song song 2 API để tiết kiệm thời gian (1 lấy Tỉnh bang, 1 lấy Mã vùng)
        const [statesRes, codesRes] = await Promise.all([
          fetch("https://countriesnow.space/api/v0.1/countries/states"),
          fetch("https://countriesnow.space/api/v0.1/countries/codes"),
        ]);

        const statesJson = await statesRes.json();
        const codesJson = await codesRes.json();

        if (!statesJson.error) {
          setLocationsData(statesJson.data);
          setCountries(statesJson.data.map((item) => item.name));
        }
        if (!codesJson.error) {
          setCountryCodes(codesJson.data);
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu quốc gia:", error);
        setCountries(["Vietnam", "United States"]);
      }
    };
    fetchLocations();
  }, []);

  // LOGIC HYBRID & CẬP NHẬT MÃ VÙNG
  useEffect(() => {
    // 1. Cập nhật Tỉnh/Bang
    if (selectedCountry === "Vietnam") {
      setAvailableStates(VIETNAM_PROVINCES);
    } else if (selectedCountry && locationsData.length > 0) {
      const selectedCountryData = locationsData.find(
        (c) => c.name === selectedCountry,
      );
      setAvailableStates(selectedCountryData?.states?.map((s) => s.name) || []);
    } else {
      setAvailableStates([]);
    }

    // 2. Cập nhật Mã vùng (Dial Code)
    if (selectedCountry) {
      // Vì Việt Nam luôn là +84, gán cứng cho lẹ
      if (selectedCountry === "Vietnam") {
        setDialCode("+84");
      } else {
        const codeData = countryCodes.find((c) => c.name === selectedCountry);
        setDialCode(codeData ? codeData.dial_code : "");
      }
    } else {
      setDialCode("");
    }
  }, [selectedCountry, locationsData, countryCodes]);

  return { countries, availableStates, dialCode };
};

export default useLocations;
