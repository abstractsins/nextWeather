export const getUnitLabel = (id: string): string => {
        switch(id) {
            case 'temp': return '°';
            case 'humidity': return '%';
            case 'wind': return 'mph';
            case 'cloudiness': return '%';
            default: return '';
        }
    }