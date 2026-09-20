import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'SENIN_SUPABASE_URL_ADRESIN';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'SENIN_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseKey);

// 1. Kategorileri Çekme
export async function getCategories() {
    const { data, error } = await supabase.from('categories').select('*');
    if (error) { throw error; }
    return data;
}

// 2. Ürünleri Çekme
export async function getProductsByCategory(categoryId) {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', categoryId);
    if (error) { throw error; }
    return data;
}

// 3. SSS (FAQ) Çekme
export async function getFaqs() {
    const { data, error } = await supabase.from('faqs').select('*');
    if (error) { throw error; }
    return data;
}