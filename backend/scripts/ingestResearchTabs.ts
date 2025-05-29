import mongoose from 'mongoose';
import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';
import Goal from '../src/models/Goal';

interface ResearchTabRecord {
  title: string;
  link: string;
  summary: string;
  priority: string;
  tier: string;
  domain: string;
  subtopic: string;
  tags: string;
  next_action_date: string;
  action_note: string;
  date_added: string;
}

async function ingestResearchTabs() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mind-map');
    console.log('Connected to MongoDB');

    // Read and parse CSV
    const csvPath = path.join(__dirname, '../../data/prioritized_research_tabs.csv');
    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    }) as ResearchTabRecord[];

    // Delete auto-ingest children of 1.9 (but not 1.9 itself)
    const deleteResult = await Goal.deleteMany({
      hierarchyId: { $regex: '^1\\.9\\.' },  // Starts with "1.9."
      autoIngest: true
    });
    console.log(`Deleted ${deleteResult.deletedCount} auto-ingest goals`);

    // Get remaining children of 1.9
    const remainingChildren = await Goal.find({
      hierarchyId: { $regex: '^1\\.9\\.' }  // Starts with "1.9."
    }).sort({ hierarchyId: 1 });

    // Check if we need to renumber remaining children
    if (remainingChildren.length > 0) {
      const lastChildNumber = parseInt(remainingChildren[remainingChildren.length - 1].hierarchyId.split('.').pop() || '0');
      if (lastChildNumber > remainingChildren.length) {
        // Renumber children sequentially
        for (let i = 0; i < remainingChildren.length; i++) {
          const newHierarchyId = `1.9.${i + 1}`;
          await Goal.updateOne(
            { _id: remainingChildren[i]._id },
            { $set: { hierarchyId: newHierarchyId } }
          );
        }
        console.log(`Renumbered ${remainingChildren.length} remaining children`);
      }
    }

    // Get the next available number for new goals
    const lastGoal = await Goal.findOne({
      hierarchyId: { $regex: '^1\\.9\\.' }
    }).sort({ hierarchyId: -1 });
    
    let nextNumber = 1;
    if (lastGoal) {
      const lastNumber = parseInt(lastGoal.hierarchyId.split('.').pop() || '0');
      nextNumber = lastNumber + 1;
    }

    // Check if all priorities are around 100 to determine if we need to normalize
    const allPrioritiesAround100 = records.every(record => 
      parseFloat(record.priority) >= 80 && parseFloat(record.priority) <= 100
    );
    const priorityDivisor = allPrioritiesAround100 ? 100 : 1;

    // Add new goals
    for (const record of records) {
      const newGoal = new Goal({
        hierarchyId: `1.9.${nextNumber++}`,
        description: record.title,
        goalType: 'Bookmark',
        done: false,
        priority: parseFloat(record.priority) / priorityDivisor,
        score: 0,
        assessment: 0,
        communityValue: 0,
        start: record.next_action_date || '',
        end: '',
        lastSelected: new Date(),
        effectivePriority: 0,
        decayRate: 0.001,
        autoIngest: true,
        link: record.link,
        summary: record.summary,
        tier: record.tier,
        domain: record.domain,
        subtopic: record.subtopic,
        tags: record.tags,
        next_action_date: record.next_action_date,
        action_note: record.action_note,
        date_added: record.date_added
      });

      await newGoal.save();
    }

    console.log(`Added ${records.length} new goals`);
    console.log('Ingestion complete');

  } catch (error) {
    console.error('Error during ingestion:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
ingestResearchTabs(); 