import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { User, MapPin, Edit2, Check, XCircle } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { userApi } from "@/api/userApi";
import { isValidPhoneInput } from "@/utils/validators";
import EditableField from "@/features/users/components/Admin/EditableField";
import AddressMap from "@/features/orders/components/Checkout/AddressMap";

const GeneralInfoTab = ({ user, isAdminView = false }) => {
  const { t } = useTranslation(["admin", "user"]);
  const { setUser } = useAuthStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [originalEditForm, setOriginalEditForm] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // States for Address Autocomplete
  const [addressInput, setAddressInput] = useState("");
  const [coordinates, setCoordinates] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);

  useEffect(() => {
    if (user) {
      const defaultAddr = user.addresses?.find(a => a.isDefault);
      const initialForm = {
        name: user.name || "",
        phone: user.phone || "",
        bio: user.bio || "",
      };
      setEditForm(initialForm);
      setOriginalEditForm(initialForm);
      
      if (defaultAddr) {
        setAddressInput(defaultAddr.addressText || "");
        setCoordinates(defaultAddr.coordinates || null);
      } else {
        setAddressInput("");
        setCoordinates(null);
      }
      setIsEditing(false);
    }
  }, [user]);

  // Goong Maps Autocomplete effect
  useEffect(() => {
    if (!isUserTyping || !isEditing) return;
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
  }, [addressInput, isUserTyping, isEditing]);

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
        setCoordinates({ lat, lng });
        setIsUserTyping(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;

    if (name === "phone") {
      if (!isValidPhoneInput(finalValue)) return;
    }

    setEditForm((prev) => ({ ...prev, [name]: finalValue }));
  };

  const handleSave = async () => {
    let dataToSave = { 
      ...editForm,
      addressText: addressInput,
      coordinates: coordinates
    };

    setIsSaving(true);

    try {
      const response = await userApi.updateProfile(dataToSave);

      if (response.success) {
        setUser(response.data);
        setOriginalEditForm({ ...editForm, phone: response.data.phone });
        setIsEditing(false);
        toast.success(t("messages.update_success", { ns: "user" }));
      }
    } catch (error) {
      console.error("Lỗi update profile:", error);
      const errorMsg = error.response?.data?.message || "SERVER_ERROR";
      toast.error(t(errorMsg, { ns: "common" }) || t(errorMsg));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditForm(originalEditForm);
    const defaultAddr = user.addresses?.find(a => a.isDefault);
    if (defaultAddr) {
      setAddressInput(defaultAddr.addressText || "");
      setCoordinates(defaultAddr.coordinates || null);
    } else {
      setAddressInput("");
      setCoordinates(null);
    }
    setIsEditing(false);
    setIsUserTyping(false);
    setSuggestions([]);
  };

  const defaultAddress = user?.addresses?.find(a => a.isDefault);

  return (
    <>
      <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">

        <div>
          <h4 className="text-sm font-bold text-mkhe-primary uppercase tracking-widest mb-4 flex items-center gap-2">
            <User className="w-4 h-4" />{" "}
            {t("users.basic_info")}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <EditableField
              label={t("users.fullname")}
              name="name"
              value={editForm.name}
              isEditing={isEditing}
              onChange={handleInputChange}
            />
            <div>
              <label className="text-[10px] uppercase font-bold text-mkhe-text/40 block mb-1 flex items-center gap-1">
                {t("users.email_readonly")}
              </label>
              <p className="text-[var(--color-mkhe-text)] font-semibold border-b border-[var(--color-mkhe-border)]/10 pb-1 h-8 flex items-end opacity-70">
                {user.email}
              </p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold text-mkhe-primary uppercase tracking-widest mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4" />{" "}
            {t("profile.contact_shipping", { ns: "user" })}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-5">
            <EditableField
              label={t("users.phone")}
              name="phone"
              value={editForm.phone}
              isEditing={isEditing}
              onChange={handleInputChange}
              placeholder={t("users.phone_placeholder")}
            />
          </div>

          <div className="mt-4">
            <label className="text-[10px] uppercase font-bold text-mkhe-text/40 block mb-2">
              {t("profile.default_address", { ns: "user" })}
            </label>
            
            {isEditing ? (
              <div className="relative">
                <textarea
                  value={addressInput} 
                  onChange={(e) => {
                    setAddressInput(e.target.value);
                    setIsUserTyping(true);
                    if (!isDropdownOpen) setIsDropdownOpen(true);
                  }}
                  onFocus={() => { if (suggestions.length > 0) setIsDropdownOpen(true); }}
                  onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                  className="w-full p-3 border border-mkhe-border/20 rounded-md focus:outline-none focus:ring-1 focus:ring-mkhe-primary bg-mkhe-bg"
                  placeholder={t("profile.address_placeholder", { ns: "user" })}
                  rows="2"
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
                
                {addressInput && addressInput.length >= 5 && (
                  <AddressMap 
                    address={addressInput}
                    coordinates={coordinates}
                    onLocationChange={(coords) => setCoordinates(coords)} 
                  />
                )}
              </div>
            ) : (
              <div className="p-4 bg-mkhe-primary/5 border border-mkhe-primary/20 rounded-xl text-sm text-mkhe-text/80 min-h-[50px] flex items-center">
                {defaultAddress ? (
                  <span>{defaultAddress.addressText}</span>
                ) : (
                  <span className="italic opacity-60">{t("profile.no_address", { ns: "user" })}</span>
                )}
              </div>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold text-mkhe-primary uppercase tracking-widest mb-4">
            {t("users.bio")}
          </h4>
          {isEditing ? (
            <textarea
              name="bio"
              value={editForm.bio}
              onChange={handleInputChange}
              rows="3"
              className="w-full p-3 bg-[var(--color-mkhe-bg)] text-[var(--color-mkhe-text)] border border-[var(--color-mkhe-primary)]/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-mkhe-primary)]/20 text-sm transition-colors"
              placeholder={
                isAdminView
                  ? t("users.bio_admin_placeholder")
                  : t("users.bio_user_placeholder")
              }
            />
          ) : (
            <div className="p-4 bg-[var(--color-mkhe-input)]/50 rounded-xl border border-[var(--color-mkhe-border)]/90 text-sm text-[var(--color-mkhe-text)]/70 italic leading-relaxed min-h-[80px] transition-colors">
              {editForm.bio ||
                (isAdminView
                  ? t("users.bio_empty_admin")
                  : t("users.bio_empty_user"))}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 flex justify-end items-center bg-[var(--color-mkhe-input)]/30 shrink-0 rounded-br-2xl transition-colors">
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="px-6 py-2.5 bg-[var(--color-mkhe-border)]/40 text-[var(--color-mkhe-text)] font-bold rounded-lg hover:bg-[var(--color-mkhe-border)]/50 transition-all disabled:opacity-50 text-sm cursor-pointer"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-8 py-2.5 bg-mkhe-primary text-white font-bold rounded-xl hover:bg-mkhe-primary/90 transition-all cursor-pointer disabled:opacity-50 text-sm"
              >
                {isSaving
                  ? t("common.saving")
                  : t("common.save_info")}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-8 py-2.5 bg-[var(--color-mkhe-primary)] text-white font-bold rounded-lg shadow-lg hover:shadow-[var(--color-mkhe-primary)]/30 transition-all cursor-pointer"
            >
              <Edit2 className="w-4 h-4" /> {t("common.edit")}
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default GeneralInfoTab;
