/**
 * Script to pre-generate embeddings for all projects and freelancers
 * Run this during off-peak hours to warm up the cache
 */

import { createClient } from '@/lib/supabase';
import { generateProjectEmbedding, generateFreelancerEmbedding } from '@/lib/ai/embeddings';

async function preGenerateEmbeddings() {
    console.log('🚀 Starting embedding pre-generation...\n');

    const supabase = createClient();
    let totalGenerated = 0;
    let totalCached = 0;

    // Pre-generate project embeddings
    console.log('📁 Processing projects...');
    const { data: projects } = await supabase
        .from('projects')
        .select('id, title, description, skills_required, allocated_budget, embedding')
        .is('embedding', null); // Only projects without embeddings

    if (projects && projects.length > 0) {
        console.log(`   Found ${projects.length} projects without embeddings`);

        for (const project of projects) {
            try {
                await generateProjectEmbedding({
                    id: project.id,
                    title: project.title,
                    description: project.description,
                    skills_required: project.skills_required,
                    allocated_budget: project.allocated_budget
                });
                totalGenerated++;
                console.log(`   ✅ Generated embedding for project: ${project.title}`);
            } catch (error) {
                console.error(`   ❌ Failed for project ${project.id}:`, error);
            }
        }
    } else {
        console.log('   ✅ All projects already have embeddings');
        totalCached += await countCachedProjects();
    }

    // Pre-generate freelancer embeddings
    console.log('\n👤 Processing freelancers...');
    const { data: freelancers } = await supabase
        .from('freelancer_profiles')
        .select('id, bio, skills, hourly_rate, total_jobs, rating, embedding')
        .is('embedding', null); // Only freelancers without embeddings

    if (freelancers && freelancers.length > 0) {
        console.log(`   Found ${freelancers.length} freelancers without embeddings`);

        for (const freelancer of freelancers) {
            try {
                await generateFreelancerEmbedding({
                    id: freelancer.id,
                    bio: freelancer.bio || '',
                    skills: freelancer.skills || [],
                    hourly_rate: freelancer.hourly_rate,
                    total_jobs: freelancer.total_jobs,
                    rating: freelancer.rating
                });
                totalGenerated++;
                console.log(`   ✅ Generated embedding for freelancer ${freelancer.id}`);
            } catch (error) {
                console.error(`   ❌ Failed for freelancer ${freelancer.id}:`, error);
            }
        }
    } else {
        console.log('   ✅ All freelancers already have embeddings');
        totalCached += await countCachedFreelancers();
    }

    // Summary
    console.log('\n📊 Summary:');
    console.log(`   🆕 Newly generated: ${totalGenerated}`);
    console.log(`   💾 Already cached: ${totalCached}`);
    console.log(`   ✅ Total embeddings: ${totalGenerated + totalCached}`);

    const estimatedCost = totalGenerated * 0.00002;
    console.log(`   💰 Estimated cost: $${estimatedCost.toFixed(5)}`);
}

async function countCachedProjects(): Promise<number> {
    const supabase = createClient();
    const { count } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .not('embedding', 'is', null);
    return count || 0;
}

async function countCachedFreelancers(): Promise<number> {
    const supabase = createClient();
    const { count } = await supabase
        .from('freelancer_profiles')
        .select('*', { count: 'exact', head: true })
        .not('embedding', 'is', null);
    return count || 0;
}

// Run
preGenerateEmbeddings()
    .then(() => {
        console.log('\n✅ Pre-generation complete!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Pre-generation failed:', error);
        process.exit(1);
    });
