import React from "react";
import {  useState  } from "react";
import { X, User, Phone } from "lucide-react";
import InputField from "@/components/ui/InputField";
import AddressMap from "./AddressMap";
import { userApi } from "@/api/userApi";
import toast from "react-hot-toast";
import { useAuthStore } from "@/stores/useAuthStore";
import { useTranslation } from "react-i18next";

export default function AddressBookModal({ isOpen, onClose, user, onAddressSelected, onAddressAdded, currentAddressId }) {
  const { t } = useTranslation("checkout");
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(
    currentAddressId || user?.addresses?.find((a) => a.isDefault)?._id || user?.addresses?.[0]?._id
  );

  React.useEffect(() => {
    if (isOpen) {
      setSelectedAddressId(currentAddressId || user?.addresses?.find((a) => a.isDefault)?._id || user?.addresses?.[0]?._id);
      setShowAddForm(false);
    }
  }, [isOpen, currentAddressId, user]);
  
  // States for new address form
  const [newAddressInfo, setNewAddressInfo] = useState({
    name: "",
    phone: "",
    address: "",
    coordinates: null
  });
  const [addressInput, setAddressInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // AutoComplete logic for new address
  React.useEffect(() => {
    if (!isUserTyping) return;
    const handler = setTimeout(async () => {
      if (!addressInput || addressInput.length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const apiKey = import.meta.env.VITE_GOONG_API_KEY;
        if (!apiKey) return;
        const res = await fetch(`https://rsapi.goong.io/Place/AutoComplete?api_key=${apiKey}&input=${encodeURIComponent(addressInput)}`);
        const data = await res.json();
        if (data.predictions) setSuggestions(data.predictions);
      } catch (e) {
        console.error("Geocoding error:", e);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [addressInput, isUserTyping]);

  const handleSelectSuggestion = async (place) => {
    setAddressInput(place.description);
    setSuggestions([]);
    setIsDropdownOpen(false);
    try {
      const apiKey = import.meta.env.VITE_GOONG_API_KEY;
      const res = await fetch(`https://rsapi.goong.io/Place/Detail?place_id=${place.place_id}&api_key=${apiKey}`);
      const data = await res.json();
      if (data.result && data.result.geometry) {
        const { lat, lng } = data.result.geometry.location;
        setNewAddressInfo(prev => ({
          ...prev,
          address: place.description,
          coordinates: { lat, lng }
        }));
        setIsUserTyping(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddNewAddress = async () => {
    if (!newAddressInfo.name || !newAddressInfo.phone || !newAddressInfo.address || !newAddressInfo.coordinates) {
      toast.error(t("errors.missing_info"));
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        receiverName: newAddressInfo.name,
        receiverPhone: newAddressInfo.phone,
        addressText: newAddressInfo.address,
        coordinates: newAddressInfo.coordinates,
        isDefault: false // KHÔNG tự động set làm mặc định nữa
      };
      const res = await userApi.addAddress(payload);
      if (res.success) {
        useAuthStore.getState().setUser(res.data);
        toast.success(t("success.address_added"));
        
        // Tìm địa chỉ vừa được thêm (thường nằm cuối mảng)
        const newlyAdded = res.data.addresses[res.data.addresses.length - 1];
        
        if (onAddressAdded) onAddressAdded(newlyAdded);
        
        // Auto select the newly added address for this order (but it's not the default profile address)
        if (newlyAdded && onAddressSelected) {
          onAddressSelected(newlyAdded);
        }

        setShowAddForm(false);
        onClose();
      }
    } catch (e) {
      console.error(e);
      toast.error(t("errors.address_failed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmSelection = async () => {
    if (!selectedAddressId) return;
    const selected = user.addresses.find(a => a._id === selectedAddressId);
    if (!selected) return;

    // CHỈ trả về địa chỉ được chọn cho trang Checkout sử dụng
    // KHÔNG TỰ ĐỘNG gọi API thay đổi Default Address của Profile nữa
    
    if (onAddressSelected) onAddressSelected(selected);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-mkhe-bg rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="p-4 border-b border-mkhe-border/10 flex justify-between items-center bg-mkhe-border/5">
          <h2 className="text-xl font-medium text-mkhe-text">
            {showAddForm ? t("address_book.add_new") : t("address_book.title")}
          </h2>
          <button onClick={onClose} className="text-mkhe-text/60 cursor-pointer p-1 rounded-full hover:bg-mkhe-border/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {!showAddForm ? (
            <div className="space-y-4">
              {user?.addresses?.length > 0 ? (
                user.addresses.map((addr) => (
                  <label key={addr._id} className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${selectedAddressId === addr._id ? 'border-mkhe-primary bg-mkhe-primary/5' : 'border-mkhe-border/20 hover:bg-mkhe-border/5'}`}>
                    <input
                      type="radio"
                      name="selectedAddress"
                      value={addr._id}
                      checked={selectedAddressId === addr._id}
                      onChange={() => setSelectedAddressId(addr._id)}
                      className="mt-1 w-4 h-4 text-mkhe-primary focus:ring-mkhe-primary border-gray-300 cursor-pointer"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center">
                        <span className="font-medium text-mkhe-text">{addr.receiverName}</span>
                        <span className="mx-2 text-mkhe-text/40">|</span>
                        <span className="text-mkhe-text/80 text-sm">{addr.receiverPhone}</span>
                        {addr.isDefault && (
                          <span className="ml-auto text-xs px-2 py-1 bg-mkhe-primary/10 text-mkhe-primary rounded border border-mkhe-primary/20">{t("address_book.default")}</span>
                        )}
                      </div>
                      <p className="text-mkhe-text/70 mt-1 text-sm">{addr.addressText}</p>
                    </div>
                  </label>
                ))
              ) : (
                <div className="text-center py-8 text-mkhe-text/60">{t("address_book.empty")}</div>
              )}
              
              <button 
                onClick={() => setShowAddForm(true)}
                className="w-full py-3 mt-4 border border-mkhe-primary/50 border-dashed rounded-lg text-mkhe-primary hover:bg-mkhe-primary/5 flex items-center justify-center font-medium transition-colors cursor-pointer"
              >
                + {t("address_book.add_new")}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-mkhe-text/80 mb-1">{t("shipping_info.full_name")}</label>
                <InputField
                  type="text" value={newAddressInfo.name} onChange={e => setNewAddressInfo({...newAddressInfo, name: e.target.value})}
                  placeholder={t("shipping_info.full_name_placeholder")} rightElement={<User className="w-5 h-5 cursor-pointer" />}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-mkhe-text/80 mb-1">{t("shipping_info.phone")}</label>
                <InputField
                  type="text" value={newAddressInfo.phone} onChange={e => setNewAddressInfo({...newAddressInfo, phone: e.target.value})}
                  placeholder={t("shipping_info.phone_placeholder")} rightElement={<Phone className="w-5 h-5 cursor-pointer" />}
                />
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-mkhe-text/80 mb-1">{t("shipping_info.address")}</label>
                <textarea
                  value={addressInput} 
                  onChange={(e) => {
                    setAddressInput(e.target.value);
                    setIsUserTyping(true);
                    setNewAddressInfo(prev => ({ ...prev, address: e.target.value }));
                    if (!isDropdownOpen) setIsDropdownOpen(true);
                  }}
                  onFocus={() => { if (suggestions.length > 0) setIsDropdownOpen(true); }}
                  onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                  className="w-full p-3 border border-mkhe-border/20 rounded-md focus:outline-none focus:ring-1 focus:ring-mkhe-primary bg-mkhe-bg"
                  placeholder="Nhập địa chỉ..."
                />
                {isDropdownOpen && suggestions.length > 0 && (
                  <ul className="absolute z-50 w-full mt-1 max-h-60 overflow-auto bg-mkhe-bg border border-mkhe-border/20 rounded-md shadow-lg">
                    {suggestions.map((place) => (
                      <li 
                        key={place.place_id} 
                        onClick={() => handleSelectSuggestion(place)}
                        className="px-4 py-3 hover:bg-mkhe-primary/10 cursor-pointer text-sm border-b border-mkhe-border/10"
                      >
                        {place.description}
                      </li>
                    ))}
                  </ul>
                )}
                
                {newAddressInfo.address && newAddressInfo.address.length >= 5 && (
                  <AddressMap 
                    address={newAddressInfo.address}
                    coordinates={newAddressInfo.coordinates}
                    onLocationChange={(coords) => setNewAddressInfo(prev => ({ ...prev, coordinates: coords }))} 
                  />
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-mkhe-border/10 flex justify-end gap-3 bg-mkhe-border/5">
          {showAddForm ? (
            <>
              <button onClick={() => setShowAddForm(false)} className="px-6 py-2 border border-mkhe-border/30 rounded-md text-mkhe-text hover:bg-mkhe-border/10 cursor-pointer transition-colors">{t("actions.back")}</button>
              <button onClick={handleAddNewAddress} disabled={isSubmitting} className="px-6 py-2 bg-mkhe-primary text-white rounded-md hover:bg-mkhe-primary/90 disabled:opacity-50 cursor-pointer transition-colors">{t("otp.confirm")}</button>
            </>
          ) : (
            <>
              <button onClick={onClose} className="px-6 py-2 border border-mkhe-border/30 rounded-md text-mkhe-text hover:bg-mkhe-border/10 cursor-pointer transition-colors">{t("otp.cancel")}</button>
              <button onClick={handleConfirmSelection} disabled={!selectedAddressId} className="px-6 py-2 bg-mkhe-primary text-white rounded-md hover:bg-mkhe-primary/90 disabled:opacity-50 cursor-pointer transition-colors">{t("otp.confirm")}</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
