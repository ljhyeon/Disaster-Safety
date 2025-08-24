// hooks/useSupplyStatistics.js
import { useMemo } from 'react';

export const useSupplyStatistics = (supplies) => {
    return useMemo(() => {
        return supplies.reduce((acc, supply) => {
            acc.total++;
            switch (supply.status) {
                case 'pending':
                acc.pending++;
                break;
                case 'confirmed':
                acc.confirmed++;
                break;
                case 'shipped':
                acc.shipped++;
                break;
                case 'delivered':
                acc.delivered++;
                break;
                case 'cancelled':
                acc.cancelled++;
                break;
            }
            return acc;
        }, { total: 0, pending: 0, confirmed: 0, shipped: 0, delivered: 0, cancelled: 0 });
    }, [supplies]);
};