import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { Network } from '@capacitor/network';

export interface Position {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

export interface Photo {
  dataUrl?: string;
  webPath?: string;
  format: string;
}

export const useMobile = () => {
  const [isNative, setIsNative] = useState(false);
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline'>('online');

  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform());

    // Monitor network status
    Network.addListener('networkStatusChange', status => {
      setNetworkStatus(status.connected ? 'online' : 'offline');
    });

    return () => {
      Network.removeAllListeners();
    };
  }, []);

  const takePhoto = async (): Promise<Photo> => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      return {
        dataUrl: image.dataUrl,
        webPath: image.webPath,
        format: image.format
      };
    } catch (error) {
      console.error('Error taking photo:', error);
      throw error;
    }
  };

  const getCurrentPosition = async (): Promise<Position> => {
    try {
      const coordinates = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });

      return {
        latitude: coordinates.coords.latitude,
        longitude: coordinates.coords.longitude,
        accuracy: coordinates.coords.accuracy,
        timestamp: coordinates.timestamp
      };
    } catch (error) {
      console.error('Error getting location:', error);
      throw error;
    }
  };

  const watchPosition = (callback: (position: Position) => void) => {
    return Geolocation.watchPosition({
      enableHighAccuracy: true,
      timeout: 30000
    }, (position, err) => {
      if (err) {
        console.error('Error watching position:', err);
        return;
      }
      
      if (position) {
        callback({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        });
      }
    });
  };

  return {
    isNative,
    networkStatus,
    takePhoto,
    getCurrentPosition,
    watchPosition
  };
};

// Keep backward compatibility for sidebar component
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);

    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  return isMobile;
};