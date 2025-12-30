declare module './eslint-local-rules' {
  import { Rule } from 'eslint';
  
  const rules: {
    'no-excessive-breakpoints': Rule.RuleModule;
    'prefer-mobile-first': Rule.RuleModule;
  };
  
  export = rules;
}

