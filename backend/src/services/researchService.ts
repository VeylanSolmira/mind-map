import mongoose from 'mongoose';
import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';
import Goal from '../models/Goal';

// Interface for research tabs from CSV
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

// TODO: Future bookmark processing interface
// interface BookmarkRecord {
//   url: string;
//   title: string;
//   description?: string;
//   tags?: string[];
//   dateAdded: string;
//   folder?: string;
// }

export const ingestBookmarks = async (): Promise<void> => {
  try {
    // Read and parse CSV
    const csvPath = path.join(__dirname, '../../../data/prioritized_research_tabs.csv');
    if (!fs.existsSync(csvPath)) {
      throw new Error(`CSV file not found at path: ${csvPath}`);
    }

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
    
  } catch (error) {
    console.error('Error in ingestBookmarks:', error);
    throw error;
  }
};

// TODO: Future bookmark processing function
// export const processBookmarks = async (bookmarks: BookmarkRecord[]): Promise<void> => {
//   try {
//     // Process bookmarks and create goals
//     for (const bookmark of bookmarks) {
//       const newGoal = new Goal({
//         hierarchyId: `1.9.${nextNumber++}`,
//         description: bookmark.title,
//         goalType: 'Bookmark',
//         done: false,
//         priority: 0,
//         score: 0,
//         assessment: 0,
//         communityValue: 0,
//         start: bookmark.dateAdded,
//         end: '',
//         lastSelected: new Date(),
//         effectivePriority: 0,
//         decayRate: 0.001,
//         autoIngest: true,
//         link: bookmark.url,
//         summary: bookmark.description || '',
//         tags: bookmark.tags?.join(', ') || '',
//         date_added: bookmark.dateAdded
//       });
//       await newGoal.save();
//     }
//   } catch (error) {
//     console.error('Error processing bookmarks:', error);
//     throw error;
//   }
// }; 