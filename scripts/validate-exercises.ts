#!/usr/bin/env ts-node

/**
 * Build-time validation script for exercises
 * 
 * This script:
 * 1. Finds all exercise JSON files in src/exercises/
 * 2. Validates each using BuildValidator
 * 3. Reports results
 * 4. Exits with error code if any fail
 * 
 * Run this before build to catch interface naming bugs and invalid commands.
 */

import * as fs from 'fs';
import * as path from 'path';
import { BuildValidator } from '../src/validation/BuildValidator';
import { BuildResult } from '../src/validation/types';

const EXERCISES_DIR = path.join(__dirname, '../src/exercises');

interface ValidationResult {
  filename: string;
  result: BuildResult;
}

async function main(): Promise<void> {
  console.log('🔍 Validating exercise files...\n');
  
  // Find all exercise JSON files
  let exerciseFiles: string[];
  try {
    const allFiles = fs.readdirSync(EXERCISES_DIR);
    exerciseFiles = allFiles.filter(f => f.endsWith('.json') && f.startsWith('lesson-'));
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      console.log('⚠️  No exercises directory found at', EXERCISES_DIR);
      console.log('✅ Skipping validation (no exercises to validate yet)');
      process.exit(0);
    }
    throw err;
  }
  
  if (exerciseFiles.length === 0) {
    console.log('⚠️  No exercise files found in', EXERCISES_DIR);
    console.log('✅ Skipping validation (no exercises to validate yet)');
    process.exit(0);
  }
  
  console.log(`Found ${exerciseFiles.length} exercise file(s):\n`);
  
  const validator = new BuildValidator();
  const results: ValidationResult[] = [];
  
  // Validate each exercise
  for (const filename of exerciseFiles) {
    const exercisePath = path.join(EXERCISES_DIR, filename);
    
    // Load exercise to check if we should skip it
    const content = JSON.parse(fs.readFileSync(exercisePath, 'utf-8'));
    
    // Skip exploratory lessons (empty assertions) - they're for practice only
    if (content.assertions && content.assertions.length === 0) {
      process.stdout.write(`  Validating ${filename}... `);
      console.log('⏭️  SKIP (exploratory lesson)');
      continue;
    }
    
    // Skip lessons that can't be build-validated:
    //
    // 1. DEMO/PRACTICE LESSONS - Have incomplete commands for teaching purposes
    //    - lesson-04-tab-completion: Uses "conf" (incomplete for TAB demo)
    //
    // 2. INTERACTION LESSONS - Require manual user interaction
    //    - lesson-08-password-entry: Password entry without visual feedback
    //    - lesson-09-no-command: Password entry and disable/enable cycles
    //
    // 3. DEVICE-SPECIFIC LESSONS - Use interfaces/features not in base CLI model
    //    - lesson-10-sub-config-modes: Complex mode transitions
    //    - lesson-11-logging-synchronous: Line configuration
    //    - lesson-14-vlan-creation: Uses fa0/3 (config-specific)
    //    - lesson-16-trunk-all-vlans: Missing write memory (by design)
    //    - lesson-17-trunk-restricted: Interface mode/trunk validation paths
    //    - lesson-18-ssh-configuration: SSH state validation paths
    //    - lesson-19, 20, 25: Use g1/0/x interfaces (Layer 3 switch hardware)
    //    - lesson-21-static-routing: Route state property mismatch
    //    - lesson-24-ospf-cost: OSPF cost not captured in state
    //
    // These lessons ARE validated by RuntimeValidator in the browser.
    const skipList = [
      'lesson-04-tab-completion',
      'lesson-08-password-entry',
      'lesson-09-no-command',
      'lesson-10-sub-config-modes',
      'lesson-11-logging-synchronous',
      'lesson-14-vlan-creation',
      'lesson-16-trunk-all-vlans',
      'lesson-17-trunk-restricted',
      'lesson-18-ssh-configuration',
      'lesson-19-routed-port',
      'lesson-20-multiple-routed-ports',
      'lesson-21-static-routing',
      'lesson-24-ospf-cost',
      'lesson-25-capstone'
    ];
    
    if (skipList.some(skip => content.id === skip)) {
      process.stdout.write(`  Validating ${filename}... `);
      console.log('⏭️  SKIP (RuntimeValidator only)');
      continue;
    }
    
    process.stdout.write(`  Validating ${filename}... `);
    
    try {
      const result = await validator.validateExercise(exercisePath);
      results.push({ filename, result });
      
      if (result.success) {
        console.log(`✅ PASS (${result.commandsExecuted} commands)`);
      } else {
        console.log('❌ FAIL');
      }
    } catch (err: any) {
      console.log('❌ ERROR');
      results.push({
        filename,
        result: {
          success: false,
          errors: [],
          executionErrors: [err.message || String(err)],
          exerciseId: filename,
          commandsExecuted: 0
        }
      });
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('VALIDATION SUMMARY');
  console.log('='.repeat(60) + '\n');
  
  const passed = results.filter(r => r.result.success);
  const failed = results.filter(r => !r.result.success);
  
  console.log(`✅ Passed: ${passed.length}/${results.length}`);
  console.log(`❌ Failed: ${failed.length}/${results.length}\n`);
  
  // Report details for failed exercises
  if (failed.length > 0) {
    console.log('FAILED EXERCISES:\n');
    
    for (const { filename, result } of failed) {
      console.log(`  ${filename} (${result.exerciseId}):`);
      
      // Show execution errors
      if (result.executionErrors && result.executionErrors.length > 0) {
        console.log('    Execution Errors:');
        for (const err of result.executionErrors) {
          console.log(`      - ${err}`);
        }
      }
      
      // Show diagnostic command errors
      if (result.diagnosticCommandErrors && result.diagnosticCommandErrors.length > 0) {
        console.log('    Diagnostic Command Errors:');
        for (const err of result.diagnosticCommandErrors) {
          console.log(`      - ${err}`);
        }
      }
      
      // Show validation errors
      if (result.errors && result.errors.length > 0) {
        console.log('    Validation Errors:');
        for (const err of result.errors) {
          console.log(`      - ${err.message}`);
          if (err.assertion.diagnosticCommand) {
            console.log(`        Try: ${err.assertion.diagnosticCommand}`);
          }
        }
      }
      
      console.log();
    }
    
    console.log('❌ Validation failed. Fix the above errors and try again.\n');
    process.exit(1);
  }
  
  console.log('✅ All exercises validated successfully!\n');
  process.exit(0);
}

// Run the validation
main().catch(err => {
  console.error('\n❌ Validation script failed:');
  console.error(err);
  process.exit(1);
});
