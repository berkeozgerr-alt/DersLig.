import { InAppBrowser } from 'react-native-inappbrowser-reborn';

// --- AYARLARINIZI GÜNCELLEYİN ---
// ⚠️ DİKKAT: Backend'inizin çalıştığı **YEREL IP Adresi** ve portu kullanın
const API_BASE_URL = 'http://192.168.1.10:3000'; 
const GITHUB_CLIENT_ID = 'SİZİN_GITHUB_CLIENT_ID_DEĞERİNİZ'; 

// GitHub'dan sonra uygulamanızın yakalayacağı URL şeması (AndroidManifest.xml veya Info.plist'te tanımlanmalıdır)
const REDIRECT_URI = 'com.derslig.app://oauth'; 

/**
 * GitHub ile ücretsiz oturum açma işlemini başlatır.
 */
export const signInWithGitHub = async () => {
  const GITHUB_AUTH_URL = 
    `https://github.com/login/oauth/authorize?` +
    `client_id=${GITHUB_CLIENT_ID}&` +
    `scope=user&` + // Kullanıcı bilgisi izni istiyoruz
    `redirect_uri=${REDIRECT_URI}`;

  try {
    if (await InAppBrowser.isAvailable()) {
      // 1. In-App Tarayıcıyı Aç
      const result = await InAppBrowser.openAuth(GITHUB_AUTH_URL, REDIRECT_URI);

      if (result.type === 'success' && result.url) {
        // 2. Başarılı Yetkilendirmeden gelen kodu al
        const urlParams = new URLSearchParams(result.url.split('?')[1]);
        const code = urlParams.get('code');

        if (code) {
          // 3. Kodu, Access Token almak için arka uca gönder
          const response = await fetch(`${API_BASE_URL}/api/auth/github`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code }),
          });
          
          const data = await response.json();

          if (data.success) {
            return data.user; // Giriş başarılı
          } else {
            console.error('API Giriş Başarısız:', data.message);
            return null;
          }
        }
      }
    }
  } catch (error) {
    console.error('GitHub Giriş Akışı Hatası:', error);
    return null;
  }
};
