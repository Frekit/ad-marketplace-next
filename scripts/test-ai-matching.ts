/**
 * Test script for AI Matching with Embedding Cache
 * 
 * This script tests:
 * 1. Cache functionality (first vs subsequent searches)
 * 2. Performance improvements
 * 3. Cost savings
 */

import { createClient } from '@/lib/supabase';
import { findBestMatches } from '@/lib/ai/matching';

async function testAIMatching() {
    console.log('🧪 Starting AI Matching Cache Test\n');

    const supabase = createClient();

    // 1. Get a test project
    console.log('1️⃣ Finding test project...');
    const { data: projects } = await supabase
        .from('projects')
        .select('id, title')
        .limit(1)
        .single();

    if (!projects) {
        console.error('❌ No projects found. Create a project first.');
        return;
    }

    console.log(`   ✅ Found project: "${projects.title}" (${projects.id})\n`);

    // 2. First search (cold cache)
    console.log('2️⃣ First search (COLD CACHE - should generate embeddings)...');
    const start1 = Date.now();
    const matches1 = await findBestMatches(projects.id, 5, 0.5);
    const time1 = Date.now() - start1;
    console.log(`   ⏱️  Time: ${time1}ms`);
    console.log(`   📊 Matches found: ${matches1.length}\n`);

    // 3. Check if embeddings were cached
    console.log('3️⃣ Checking database for cached embeddings...');
    const { data: projectCache } = await supabase
        .from('projects')
        .select('embedding, embedding_updated_at')
        .eq('id', projects.id)
        .single();

    if (projectCache?.embedding) {
        console.log(`   ✅ Project embedding cached at: ${projectCache.embedding_updated_at}`);
    } else {
        console.log('   ⚠️  Project embedding NOT cached');
    }

    const { data: freelancerCache } = await supabase
        .from('freelancer_profiles')
        .select('id, embedding, embedding_updated_at')
        .not('embedding', 'is', null)
        .limit(5);

    console.log(`   ✅ ${freelancerCache?.length || 0} freelancer embeddings cached\n`);

    // 4. Second search (warm cache)
    console.log('4️⃣ Second search (WARM CACHE - should use cached embeddings)...');
    const start2 = Date.now();
    const matches2 = await findBestMatches(projects.id, 5, 0.5);
    const time2 = Date.now() - start2;
    console.log(`   ⏱️  Time: ${time2}ms`);
    console.log(`   📊 Matches found: ${matches2.length}\n`);

    // 5. Performance comparison
    console.log('5️⃣ Performance Analysis:');
    const improvement = ((time1 - time2) / time1 * 100).toFixed(1);
    const speedup = (time1 / time2).toFixed(1);

    console.log(`   📈 First search:  ${time1}ms`);
    console.log(`   📈 Second search: ${time2}ms`);
    console.log(`   ⚡ Improvement: ${improvement}% faster`);
    console.log(`   🚀 Speedup: ${speedup}x\n`);

    // 6. Cost analysis
    console.log('6️⃣ Cost Analysis:');
    const freelancerCount = matches1.length;
    const embeddingCost = 0.00002; // per embedding
    const gptCost = 0.001; // per explanation

    const coldCost = (1 + freelancerCount) * embeddingCost + freelancerCount * gptCost;
    const warmCost = freelancerCount * gptCost; // only GPT, no embeddings

    console.log(`   💰 Cold cache cost: $${coldCost.toFixed(5)}`);
    console.log(`   💰 Warm cache cost: $${warmCost.toFixed(5)}`);
    console.log(`   💵 Savings: $${(coldCost - warmCost).toFixed(5)} (${((1 - warmCost / coldCost) * 100).toFixed(1)}%)\n`);

    // 7. Display sample match
    if (matches1.length > 0) {
        console.log('7️⃣ Sample Match Result:');
        const match = matches1[0];
        console.log(`   👤 Freelancer: ${match.freelancer.first_name} ${match.freelancer.last_name}`);
        console.log(`   📊 Score: ${(match.score * 100).toFixed(1)}%`);
        console.log(`   💬 Explanation: ${match.explanation.substring(0, 100)}...`);
        console.log(`   🔍 Breakdown:`);
        console.log(`      - Semantic: ${(match.breakdown.semantic_similarity * 100).toFixed(1)}%`);
        console.log(`      - Skills: ${(match.breakdown.skills_match * 100).toFixed(1)}%`);
        console.log(`      - Rate: ${(match.breakdown.rate_fit * 100).toFixed(1)}%`);
        console.log(`      - Availability: ${(match.breakdown.availability * 100).toFixed(1)}%\n`);
    }

    console.log('✅ Test completed successfully!\n');

    // Summary
    console.log('📋 SUMMARY:');
    console.log(`   Cache is ${time2 < time1 * 0.5 ? 'WORKING ✅' : 'NOT WORKING ❌'}`);
    console.log(`   Speed improvement: ${improvement}%`);
    console.log(`   Cost savings: ${((1 - warmCost / coldCost) * 100).toFixed(1)}%`);
}

// Run test
testAIMatching()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('❌ Test failed:', error);
        process.exit(1);
    });
