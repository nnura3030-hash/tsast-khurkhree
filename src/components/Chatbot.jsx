import { useEffect } from "react";

const CrispChat = () => {
  useEffect(() => {
    window.$crisp = [];
    // Crisp.chat-аас авсан өөрийн Website ID-г доор оруулна уу
    window.CRISP_WEBSITE_ID = "cd73c1f2-a082-4e06-95cb-e039e7511dd2"; 
    (function() {
      var d = document;
      var s = d.createElement("script");
      s.src = "https://client.crisp.chat/l.js";
      s.async = 1;
      d.getElementsByTagName("head")[0].appendChild(s);
    })();
  }, []);

  return null; // Энэ компонент харагдахгүй, зөвхөн скриптийг ажиллуулна
};

export default CrispChat;