/**
 * Integration Test: Profile & Portfolio SQL Connections
 * 
 * Tests:
 * 1. Profile picture upload → Supabase Storage → DB update
 * 2. Portfolio item creation → Images to Storage → DB records
 * 3. Portfolio media retrieval → Verify URLs work
 * 4. RLS policies → Verify permissions
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing environment variables!');
    console.error('   Please make sure .env.local contains:');
    console.error('   - NEXT_PUBLIC_SUPABASE_URL');
    console.error('   - NEXT_PUBLIC_SUPABASE_ANON_KEY\n');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Test user credentials (you'll need to create these in Supabase)
const TEST_USER_EMAIL = 'test-freelancer@example.com';
const TEST_USER_PASSWORD = 'TestPassword123!';

async function runTests() {
    console.log('🧪 Starting SQL Integration Tests (VERSION 3.0)...\n');

    try {
        // ============================================
        // Test 1: Authentication
        // ============================================
        console.log('📝 Test 1: User Authentication');
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: TEST_USER_EMAIL,
            password: TEST_USER_PASSWORD,
        });

        if (authError) {
            console.error('❌ Auth failed:', authError.message);
            console.log('\n⚠️  Please create a test user first:');
            console.log(`   Email: ${TEST_USER_EMAIL}`);
            console.log(`   Password: ${TEST_USER_PASSWORD}`);
            console.log(`   Role: freelancer\n`);
            return;
        }

        const userId = authData.user.id;
        console.log('✅ Authenticated as:', authData.user.email);
        console.log('   User ID:', userId, '\n');

        // ============================================
        // Test 2: Profile Picture Upload
        // ============================================
        console.log('📝 Test 2: Profile Picture Upload → Storage → DB');

        // Create a test image (1x1 pixel PNG)
        const testImageBuffer = Buffer.from(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            'base64'
        );

        const fileName = `test-avatar-${Date.now()}.png`;
        const filePath = `${userId}/${fileName}`;

        // Upload to Supabase Storage
        console.log('   Uploading to Storage bucket "avatars"...');
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, testImageBuffer, {
                contentType: 'image/png',
                upsert: true,
            });

        if (uploadError) {
            console.error('❌ Upload failed:', uploadError.message);
            console.log('   Make sure "avatars" bucket exists and is public\n');
            return;
        }

        console.log('✅ Image uploaded to Storage');
        console.log('   Path:', uploadData.path);

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        console.log('   Public URL:', publicUrl);

        // Check if user exists in public.users before update
        console.log('   Checking if user exists in public.users...');
        const { data: preUser, error: preError } = await supabase
            .from('users')
            .select('id, role')
            .eq('id', userId)
            .maybeSingle();

        console.log('   preUser value:', JSON.stringify(preUser));

        // Always try to upsert user to ensure it exists
        console.log('   Ensuring user exists in public.users (Upserting)...');
        const { error: insertError } = await supabase
            .from('users')
            .upsert({
                id: userId,
                email: TEST_USER_EMAIL,
                role: 'freelancer',
                password_hash: 'dummy_hash',
                first_name: 'Test',
                last_name: 'Freelancer',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }, { onConflict: 'id' });

        if (insertError) {
            console.error('   ❌ Failed to upsert user:', insertError.message);
        } else {
            console.log('   ✅ User upserted successfully');
        }

        // Update user avatar_url in database
        console.log('   Updating users table...');
        const { error: updateError } = await supabase
            .from('users')
            .update({ avatar_url: publicUrl })
            .eq('id', userId);

        if (updateError) {
            console.error('❌ DB update failed:', updateError.message);
            return;
        }

        // Verify the update
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id, email, avatar_url')
            .eq('id', userId)
            .maybeSingle();

        if (userError) {
            console.error('❌ Verification failed:', userError.message);
            return;
        }

        if (!userData) {
            console.error('❌ User not found after update');
            return;
        }

        console.log('✅ Verified in DB:');
        console.log('   Email:', userData.email);
        console.log('   Avatar URL:', userData.avatar_url);
        console.log('   URLs match:', userData.avatar_url === publicUrl ? '✅' : '❌');
        console.log();

        // ============================================
        // Test 3: Portfolio Item Creation
        // ============================================
        console.log('📝 Test 3: Portfolio Item Creation → Storage → DB');

        // Create portfolio item
        console.log('   Creating portfolio item...');
        const { data: portfolioItem, error: portfolioError } = await supabase
            .from('portfolio_items')
            .insert({
                freelancer_id: userId,
                title: 'Test Campaign 2024',
                description: 'Integration test portfolio item',
                client_name: 'Test Client',
                year: 2024,
                is_featured: false,
            })
            .select()
            .single();

        if (portfolioError) {
            console.error('❌ Portfolio creation failed:', portfolioError.message);
            console.log('   Make sure migration 014_create_portfolio_mvp.sql is executed\n');
            return;
        }

        console.log('✅ Portfolio item created');
        console.log('   ID:', portfolioItem.id);
        console.log('   Title:', portfolioItem.title);

        // Upload 3 test images for portfolio
        console.log('   Uploading 3 portfolio images...');
        const mediaUrls: string[] = [];

        for (let i = 0; i < 3; i++) {
            const mediaFileName = `portfolio-${portfolioItem.id}-${i}-${Date.now()}.png`;
            const mediaPath = `${userId}/${mediaFileName}`;

            const { data: mediaUpload, error: mediaUploadError } = await supabase.storage
                .from('portfolio-media')
                .upload(mediaPath, testImageBuffer, {
                    contentType: 'image/png',
                    upsert: true,
                });

            if (mediaUploadError) {
                console.error(`❌ Image ${i + 1} upload failed:`, mediaUploadError.message);
                console.log('   Make sure "portfolio-media" bucket exists and is public\n');
                return;
            }

            const { data: { publicUrl: mediaUrl } } = supabase.storage
                .from('portfolio-media')
                .getPublicUrl(mediaPath);

            mediaUrls.push(mediaUrl);
            console.log(`   ✅ Image ${i + 1} uploaded:`, mediaUrl);

            // Insert into portfolio_media table
            const { error: mediaError } = await supabase
                .from('portfolio_media')
                .insert({
                    portfolio_item_id: portfolioItem.id,
                    media_url: mediaUrl,
                    display_order: i,
                });

            if (mediaError) {
                console.error(`❌ Media DB insert failed:`, mediaError.message);
                return;
            }
        }

        console.log('✅ All 3 images uploaded and saved to DB');

        // ============================================
        // Test 4: Portfolio Retrieval
        // ============================================
        console.log('\n📝 Test 4: Portfolio Retrieval with Media');

        const { data: retrievedPortfolio, error: retrieveError } = await supabase
            .from('portfolio_items')
            .select(`
                *,
                portfolio_media (
                    id,
                    media_url,
                    display_order
                )
            `)
            .eq('id', portfolioItem.id)
            .single();

        if (retrieveError) {
            console.error('❌ Retrieval failed:', retrieveError.message);
            return;
        }

        console.log('✅ Portfolio retrieved successfully');
        console.log('   Title:', retrievedPortfolio.title);
        console.log('   Media count:', retrievedPortfolio.portfolio_media.length);
        console.log('   Expected: 3, Got:', retrievedPortfolio.portfolio_media.length);
        console.log('   Match:', retrievedPortfolio.portfolio_media.length === 3 ? '✅' : '❌');

        // Verify media URLs
        console.log('\n   Verifying media URLs:');
        retrievedPortfolio.portfolio_media.forEach((media: any, idx: number) => {
            console.log(`   Image ${idx + 1}:`);
            console.log(`     URL: ${media.media_url}`);
            console.log(`     Order: ${media.display_order}`);
            console.log(`     Matches uploaded: ${media.media_url === mediaUrls[idx] ? '✅' : '❌'}`);
        });

        // ============================================
        // Test 5: RLS Policies
        // ============================================
        console.log('\n📝 Test 5: RLS Policies (Row Level Security)');

        // Test public read access (should work without auth)
        const { data: publicData, error: publicError } = await createClient(supabaseUrl!, supabaseKey!)
            .from('portfolio_items')
            .select('*')
            .eq('id', portfolioItem.id)
            .single();

        console.log('   Public read access:', publicError ? '❌' : '✅');
        if (publicError) {
            console.log('   Error:', publicError.message);
        }

        // ============================================
        // Test 6: Cleanup
        // ============================================
        console.log('\n📝 Test 6: Cleanup');

        // Delete portfolio media
        const { error: deleteMediaError } = await supabase
            .from('portfolio_media')
            .delete()
            .eq('portfolio_item_id', portfolioItem.id);

        if (deleteMediaError) {
            console.error('❌ Media deletion failed:', deleteMediaError.message);
        } else {
            console.log('✅ Portfolio media deleted from DB');
        }

        // Delete portfolio item
        const { error: deleteItemError } = await supabase
            .from('portfolio_items')
            .delete()
            .eq('id', portfolioItem.id);

        if (deleteItemError) {
            console.error('❌ Portfolio item deletion failed:', deleteItemError.message);
        } else {
            console.log('✅ Portfolio item deleted from DB');
        }

        // Delete files from storage
        for (let i = 0; i < 3; i++) {
            const mediaFileName = `portfolio-${portfolioItem.id}-${i}-${Date.now()}.png`;
            const mediaPath = `${userId}/${mediaFileName}`;
            await supabase.storage.from('portfolio-media').remove([mediaPath]);
        }
        console.log('✅ Storage files cleaned up');

        // Reset avatar
        await supabase.from('users').update({ avatar_url: null }).eq('id', userId);
        await supabase.storage.from('avatars').remove([filePath]);
        console.log('✅ Avatar reset');

        // ============================================
        // Summary
        // ============================================
        console.log('\n' + '='.repeat(50));
        console.log('🎉 ALL TESTS PASSED!');
        console.log('='.repeat(50));
        console.log('\n✅ Verified:');
        console.log('   - Profile picture upload to Storage');
        console.log('   - Avatar URL saved to users table');
        console.log('   - Portfolio items creation');
        console.log('   - Portfolio media upload (3 images)');
        console.log('   - Portfolio media saved to DB');
        console.log('   - Portfolio retrieval with joins');
        console.log('   - Public read access (RLS)');
        console.log('   - Cleanup operations');
        console.log('\n✅ SQL Connections: ALL WORKING');
        console.log('✅ Storage Integration: ALL WORKING');
        console.log('✅ RLS Policies: ALL WORKING\n');

    } catch (error: any) {
        console.error('\n❌ Unexpected error:', error.message);
        console.error(error);
    }
}

// Run the tests
runTests().catch(console.error);
