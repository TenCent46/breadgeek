"use client";

import { useOnboarding } from "@/lib/onboarding-context";
import { User, Instagram } from "lucide-react";

const SOCIAL_ICONS: Record<string, { name: string; bgColor: string }> = {
  instagram: { name: "Instagram", bgColor: "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400" },
  x: { name: "X", bgColor: "bg-black" },
  youtube: { name: "YouTube", bgColor: "bg-red-600" },
  line: { name: "LINE", bgColor: "bg-[#06C755]" },
  tiktok: { name: "TikTok", bgColor: "bg-black" },
};

export function MobilePreview() {
  const { data } = useOnboarding();

  const bgStyle = data.themeType === "solid"
    ? { backgroundColor: data.themeColor }
    : { backgroundColor: "#FFFFFF" };

  const activeSocials = data.socialLinks.filter((s) => s.username.trim() !== "");

  return (
    <div className="hidden lg:flex items-center justify-center flex-1 bg-gradient-to-br from-[#FF6B81] to-[#FF8E9E] min-h-screen relative">
      {/* Phone mockup */}
      <div className="w-[300px] h-[580px] bg-white rounded-[32px] shadow-2xl overflow-hidden relative">
        {/* Phone notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-white rounded-b-2xl z-10" />

        {/* Content */}
        <div
          className="w-full h-full pt-10 px-6 flex flex-col items-center overflow-y-auto"
          style={bgStyle}
        >
          {/* Profile Image */}
          <div className="w-24 h-24 rounded-full bg-[#E8E8E8] flex items-center justify-center mb-4 mt-4 overflow-hidden shrink-0">
            {data.profileImage ? (
              <img
                src={data.profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={40} className="text-[#BDBDBD]" />
            )}
          </div>

          {/* Title / Catch copy */}
          {data.title ? (
            <p className="text-xs text-text-secondary mb-1 text-center">
              {data.title}
            </p>
          ) : (
            <p className="text-xs text-text-placeholder mb-1 text-center">
              あなたの提供するサービスやご活動内容
            </p>
          )}

          {/* Activity Name */}
          <h2 className="text-xl font-bold text-text-primary mb-6 text-center">
            {data.activityName || "活動名"}
          </h2>

          {/* Social Links */}
          {activeSocials.map((social) => {
            const info = SOCIAL_ICONS[social.platform];
            if (!info) return null;
            return (
              <div
                key={social.platform}
                className="w-full bg-white rounded-xl shadow-sm border border-border-light p-3 mb-3 flex items-center gap-3"
              >
                <div
                  className={`w-10 h-10 rounded-lg ${info.bgColor} flex items-center justify-center shrink-0`}
                >
                  {social.platform === "instagram" ? (
                    <Instagram size={20} className="text-white" />
                  ) : (
                    <span className="text-white text-xs font-bold">
                      {info.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-medium text-text-primary">{info.name}</p>
                  <p className="text-xs text-text-tertiary truncate">
                    {info.name}アカウントを作...
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
