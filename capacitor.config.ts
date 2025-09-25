import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.bba0d2e80f8a4b00b7836c7ec968a537',
  appName: 'infratelc-suite',
  webDir: 'dist',
  server: {
    url: 'https://bba0d2e8-0f8a-4b00-b783-6c7ec968a537.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Camera: {
      permissions: {
        camera: 'required',
        photos: 'required'
      }
    },
    Geolocation: {
      permissions: {
        location: 'required'
      }
    }
  }
};

export default config;