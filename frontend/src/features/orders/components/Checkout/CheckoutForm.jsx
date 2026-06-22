import React from "react";
import { CreditCard, Banknote, Mail, User, Phone, MapPin } from "lucide-react";
import InputField from "@/components/ui/InputField";
import AddressMap from "./AddressMap";
import AddressBookModal from "./AddressBookModal";
import { useTranslation } from "react-i18next";

export default function CheckoutForm({ shippingInfo, setShippingInfo, paymentMethod, setPaymentMethod, userEmail, user, orderStats }) {
  const { t } = useTranslation("checkout");
  const [addressInput, setAddressInput] = React.useState(shippingInfo.address || "");
  const [suggestions, setSuggestions] = React.useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [isUserTyping, setIsUserTyping] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const hasAddresses = user?.addresses?.length > 0;

  const fetchSuggestions = async (text) => {
    if (!text || text.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const apiKey = import.meta.env.VITE_GOONG_API_KEY;
      if (!apiKey) {
        console.warn("Thiếu VITE_GOONG_API_KEY trong .env");
        return;
      }
      const res = await fetch(`https://rsapi.goong.io/Place/AutoComplete?api_key=${apiKey}&input=${encodeURIComponent(text)}`);
      const data = await res.json();
      if (data.predictions) {
        setSuggestions(data.predictions);
      }
    } catch (e) {
      console.error("Geocoding error:", e);
    }
  };

  React.useEffect(() => {
    if (!isUserTyping) return; // Không bắn API nếu không phải user chủ động gõ
    const handler = setTimeout(() => {
      fetchSuggestions(addressInput);
    }, 500);
    return () => clearTimeout(handler);
  }, [addressInput, isUserTyping]);

  // Forward Geocoding 1 lần duy nhất lúc Mount (Trường hợp User có address mà chưa có tọa độ)
  React.useEffect(() => {
    if (shippingInfo.address && shippingInfo.address.length >= 5 && !shippingInfo.coordinates) {
      const fetchInitialCoordinates = async () => {
        try {
          const apiKey = import.meta.env.VITE_GOONG_API_KEY;
          if (!apiKey) return;
          const res = await fetch(`https://rsapi.goong.io/geocode?address=${encodeURIComponent(shippingInfo.address)}&api_key=${apiKey}`);
          const data = await res.json();
          if (data.results && data.results.length > 0) {
            const { lat, lng } = data.results[0].geometry.location;
            const newCoords = { lat, lng };
            setShippingInfo(prev => ({ ...prev, coordinates: newCoords }));
            localStorage.setItem("mkhe_saved_coordinates", JSON.stringify(newCoords));
          }
        } catch (e) {
          console.error("Forward Geocoding error:", e);
        }
      };
      fetchInitialCoordinates();
    }
  }, []);

  const handleSelectAddress = async (place) => {
    setAddressInput(place.description);
    setSuggestions([]);
    setIsDropdownOpen(false);
    
    // Fetch detail
    try {
      const apiKey = import.meta.env.VITE_GOONG_API_KEY;
      const res = await fetch(`https://rsapi.goong.io/Place/Detail?place_id=${place.place_id}&api_key=${apiKey}`);
      const data = await res.json();
      if (data.result && data.result.geometry) {
        const { lat, lng } = data.result.geometry.location;
        const newCoords = { lat, lng };
        setShippingInfo(prev => ({
          ...prev,
          address: place.description,
          coordinates: newCoords
        }));
        localStorage.setItem("mkhe_saved_coordinates", JSON.stringify(newCoords));
        setIsUserTyping(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="w-full lg:w-2/3 space-y-8">
      {/* Shipping Info */}
      <div className="bg-mkhe-border/5 p-6 rounded-lg shadow-sm border border-mkhe-border/10">
        <h2 className="text-xl font-medium mb-4 pb-2 border-b border-mkhe-border/10 text-mkhe-text">{t("shipping_info.title")}</h2>
        
        {hasAddresses ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-mkhe-text">{t("shipping_info.address_title")}</h3>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="text-sm font-medium text-mkhe-primary hover:underline cursor-pointer"
              >
                {t("shipping_info.change_btn")}
              </button>
            </div>
            <div className="p-4 border border-mkhe-primary/30 rounded-lg bg-mkhe-primary/5">
              <div className="flex items-start">
                <div className="mt-1 mr-3 text-mkhe-primary">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-medium text-mkhe-text flex items-center gap-2">
                    {shippingInfo.name} <span className="text-mkhe-text/40">|</span> {shippingInfo.phone}
                    {shippingInfo.isDefault && (
                      <span className="text-[10px] px-2 py-0.5 bg-mkhe-primary text-white rounded-full">{t("address_book.default")}</span>
                    )}
                  </div>
                  <p className="text-mkhe-text/80 text-sm mt-1">{shippingInfo.address}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-mkhe-text/80 mb-1">Email nhận thông báo</label>
              <InputField
                type="text" value={userEmail || ""} readOnly disabled
                rightElement={<Mail className="w-5 h-5" />}
                className="w-full p-3 bg-mkhe-input text-mkhe-text/60 border border-mkhe-border rounded outline-none cursor-not-allowed pr-10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-mkhe-text/80 mb-1">{t("shipping_info.full_name")}</label>
              <InputField
                type="text" name="name" value={shippingInfo.name} onChange={handleInputChange}
                placeholder={t("shipping_info.full_name_placeholder")}
                rightElement={<User className="w-5 h-5 cursor-pointer" />}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-mkhe-text/80 mb-1">{t("shipping_info.phone")}</label>
              <InputField
                type="text" name="phone" value={shippingInfo.phone} onChange={handleInputChange}
                placeholder={t("shipping_info.phone_placeholder")}
                rightElement={<Phone className="w-5 h-5 cursor-pointer" />}
              />
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-mkhe-text/80 mb-1">{t("shipping_info.address")}</label>
              <textarea
                name="address" 
                value={addressInput} 
                onChange={(e) => {
                  setAddressInput(e.target.value);
                  setIsUserTyping(true);
                  setShippingInfo(prev => ({ ...prev, address: e.target.value }));
                  if (!isDropdownOpen) setIsDropdownOpen(true);
                }}
                onFocus={() => { if (suggestions.length > 0) setIsDropdownOpen(true); }}
                onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                className="w-full p-3 border border-mkhe-border/20 rounded-md focus:outline-none focus:ring-1 focus:ring-mkhe-primary min-h-[80px] bg-mkhe-bg text-mkhe-text placeholder-mkhe-text/40 cursor-text"
                placeholder={t("shipping_info.address_placeholder")}
              />
              {isDropdownOpen && suggestions.length > 0 && (
                <ul className="absolute z-50 w-full mt-1 max-h-60 overflow-auto bg-mkhe-bg border border-mkhe-border/20 rounded-md shadow-lg">
                  {suggestions.map((place) => (
                    <li 
                      key={place.place_id} 
                      onClick={() => handleSelectAddress(place)}
                      className="px-4 py-3 hover:bg-mkhe-primary/10 cursor-pointer text-sm text-mkhe-text/90 border-b border-mkhe-border/10 last:border-0"
                    >
                      {place.description}
                    </li>
                  ))}
                </ul>
              )}
              
              {shippingInfo.address && shippingInfo.address.length >= 5 && (
                <AddressMap 
                  address={shippingInfo.address}
                  coordinates={shippingInfo.coordinates}
                  onLocationChange={(coords) => {
                    setShippingInfo(prev => ({ ...prev, coordinates: coords }));
                    localStorage.setItem("mkhe_saved_coordinates", JSON.stringify(coords));
                  }} 
                />
              )}
            </div>
          {/* Checkbox đã bị xóa vì hệ thống tự động lưu mặc định */}
          </div>
        )}
      </div>

      <AddressBookModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={user}
        onAddressSelected={(addr) => {
          setShippingInfo({
            name: addr.receiverName,
            phone: addr.receiverPhone,
            address: addr.addressText,
            coordinates: addr.coordinates,
            isDefault: addr.isDefault
          });
        }}
        onAddressAdded={() => {
          // If the backend returns updated user object, the parent should handle it ideally.
          // But AddressBookModal receives user directly.
        }}
      />

      {/* Payment Method */}
      <div className="bg-mkhe-border/5 p-6 rounded-lg shadow-sm border border-mkhe-border/10">
        <h2 className="text-xl font-medium mb-4 pb-2 border-b border-mkhe-border/10 text-mkhe-text">{t("payment_method.title")}</h2>
        <div className="space-y-3">
          {orderStats?.cancelRate > 0.7 && orderStats?.totalOrders >= 3 ? (
            <div className="relative group">
              <label className="flex items-center p-4 border rounded-lg cursor-not-allowed border-mkhe-border/20 bg-mkhe-border/5 text-mkhe-text/40 opacity-50">
                <input
                  type="radio" disabled
                  className="w-4 h-4 text-mkhe-text/20 bg-mkhe-bg cursor-not-allowed"
                />
                <Banknote className="w-6 h-6 text-mkhe-text/40 mx-3" />
                <span className="font-medium">{t("payment_method.cod")}</span>
              </label>
              <div className="absolute top-full left-0 mt-1 hidden group-hover:block w-full z-10 bg-red-50 text-red-600 text-xs p-2 rounded shadow-sm border border-red-100">
                {t("payment_method.cod_banned", { rate: (orderStats.cancelRate * 100).toFixed(0) })}
              </div>
            </div>
          ) : (
            <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'COD' ? 'border-mkhe-primary bg-mkhe-primary/10 text-mkhe-text' : 'border-mkhe-border/20 hover:bg-mkhe-border/10 text-mkhe-text/80'}`}>
              <input
                type="radio" name="payment" value="COD"
                checked={paymentMethod === "COD"}
                onChange={() => setPaymentMethod("COD")}
                className="w-4 h-4 text-mkhe-primary border-mkhe-border/20 focus:ring-mkhe-primary bg-mkhe-bg cursor-pointer"
              />
              <Banknote className="w-6 h-6 text-mkhe-primary/80 mx-3 cursor-pointer" />
              <span className="font-medium cursor-pointer">{t("payment_method.cod")}</span>
            </label>
          )}
          <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'BANK_TRANSFER' ? 'border-mkhe-primary bg-mkhe-primary/10 text-mkhe-text' : 'border-mkhe-border/20 hover:bg-mkhe-border/10 text-mkhe-text/80'}`}>
            <input
              type="radio" name="payment" value="BANK_TRANSFER"
              checked={paymentMethod === "BANK_TRANSFER"}
              onChange={() => setPaymentMethod("BANK_TRANSFER")}
              className="w-4 h-4 text-mkhe-primary border-mkhe-border/20 focus:ring-mkhe-primary bg-mkhe-bg cursor-pointer"
            />
            <CreditCard className="w-6 h-6 text-mkhe-primary/80 mx-3 cursor-pointer" />
            <span className="font-medium cursor-pointer">{t("payment_method.bank_transfer")}</span>
          </label>
        </div>
      </div>
    </div>
  );
}
