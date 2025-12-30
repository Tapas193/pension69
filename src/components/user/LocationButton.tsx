import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { MapPin, Loader2, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LocationButtonProps {
  onLocationFound?: (location: { lat: number; lon: number; address: string }) => void;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
}

export function LocationButton({ 
  onLocationFound, 
  size = 'default', 
  variant = 'outline',
  className = ''
}: LocationButtonProps) {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lon: number; address: string } | null>(null);

  const getLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        title: language === 'hi' ? 'त्रुटि' : 'Error',
        description: language === 'hi' 
          ? 'आपका ब्राउज़र लोकेशन का समर्थन नहीं करता' 
          : 'Geolocation is not supported by your browser',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });

      const { latitude, longitude } = position.coords;

      // Reverse geocode to get address
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=${language === 'hi' ? 'hi' : 'en'}`
      );
      const data = await response.json();

      const locationData = {
        lat: latitude,
        lon: longitude,
        address: data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
      };

      setLocation(locationData);
      onLocationFound?.(locationData);

      toast({
        title: language === 'hi' ? 'स्थान मिल गया!' : 'Location Found!',
        description: locationData.address.split(',').slice(0, 3).join(', '),
      });
    } catch (error: any) {
      console.error('Location error:', error);
      toast({
        title: language === 'hi' ? 'त्रुटि' : 'Error',
        description: language === 'hi' 
          ? 'स्थान प्राप्त करने में विफल। कृपया अनुमति दें।' 
          : 'Failed to get location. Please allow location access.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      <Button
        type="button"
        variant={location ? 'default' : variant}
        size={size}
        onClick={getLocation}
        disabled={loading}
        className="gap-2 w-full"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {language === 'hi' ? 'ढूंढ रहा है...' : 'Finding...'}
          </>
        ) : location ? (
          <>
            <CheckCircle className="w-4 h-4" />
            {language === 'hi' ? 'स्थान मिल गया' : 'Location Found'}
          </>
        ) : (
          <>
            <MapPin className="w-4 h-4" />
            {language === 'hi' ? 'मेरा स्थान' : 'My Location'}
          </>
        )}
      </Button>
      {location && (
        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
          📍 {location.address.split(',').slice(0, 3).join(', ')}
        </p>
      )}
    </div>
  );
}
