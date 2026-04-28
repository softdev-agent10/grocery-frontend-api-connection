import { createAsyncThunk } from '@reduxjs/toolkit';
import { getCategories } from '@/app/services/categories/service.categories';
import { getBrands } from '@/app/services/brand/brand.service';
import { getUnits } from '@/app/services/units/units.service';

/**
 * Fetch all common data (categories, brands, units) in parallel
 */
export const fetchCommonData = createAsyncThunk(
    'common/fetchCommonData',
    async (_, { rejectWithValue }) => {
        try {
            const [categoriesRes, brandsRes, unitsRes] = await Promise.all([
                getCategories(),
                getBrands(),
                getUnits(),
            ]);

            return {
                categories: categoriesRes.data.items,
                brands: brandsRes.data.items,
                units: unitsRes.data.items,
            };
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch common data');
        }
    }
);
