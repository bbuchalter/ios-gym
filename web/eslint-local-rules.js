/**
 * Custom ESLint rules for enforcing Tailwind responsive design standards
 */

module.exports = {
  'no-excessive-breakpoints': {
    meta: {
      type: 'problem',
      docs: {
        description: 'Disallow excessive responsive breakpoints in className attributes',
        category: 'Best Practices',
      },
      messages: {
        tooManyBreakpoints: 'Too many breakpoints for "{{property}}". Use at most 1-2 breakpoints and rely on Tailwind\'s natural responsive behavior.',
        preferNaturalFlow: 'Avoid multiple breakpoints for {{property}}. Let Tailwind\'s rem-based values scale naturally.',
      },
      schema: [],
    },
    create(context) {
      return {
        JSXAttribute(node) {
          if (node.name.name !== 'className') return;
          
          const value = node.value;
          if (!value || value.type !== 'Literal') return;
          
          const classNames = String(value.value).split(/\s+/);
          
          // Group classes by their base property (e.g., "p", "m", "text", "gap")
          const propertyGroups = {};
          
          classNames.forEach(className => {
            // Match pattern like "sm:p-4", "md:text-lg", "p-4", etc.
            const match = className.match(/^(?:(sm|md|lg|xl|2xl):)?(.+?)(?:-|$)/);
            if (!match) return;
            
            const [, breakpoint, baseProperty] = match;
            
            // Focus on spacing, sizing, and typography properties
            const concernedProperties = ['p', 'px', 'py', 'pt', 'pb', 'pl', 'pr', 
                                         'm', 'mx', 'my', 'mt', 'mb', 'ml', 'mr',
                                         'gap', 'space', 'text', 'w', 'h', 'min-w', 'max-w'];
            
            if (!concernedProperties.some(prop => baseProperty.startsWith(prop))) return;
            
            if (!propertyGroups[baseProperty]) {
              propertyGroups[baseProperty] = { total: 0, breakpoints: new Set() };
            }
            
            propertyGroups[baseProperty].total++;
            if (breakpoint) {
              propertyGroups[baseProperty].breakpoints.add(breakpoint);
            }
          });
          
          // Check each property group
          Object.entries(propertyGroups).forEach(([property, data]) => {
            // If we have more than 2 responsive variants of the same property, flag it
            if (data.breakpoints.size > 2) {
              context.report({
                node,
                messageId: 'tooManyBreakpoints',
                data: { property },
              });
            }
            
            // If we have 3+ total declarations (base + variants) for the same property, suggest simplification
            if (data.total > 3) {
              context.report({
                node,
                messageId: 'preferNaturalFlow',
                data: { property },
              });
            }
          });
        },
      };
    },
  },
  
  'prefer-mobile-first': {
    meta: {
      type: 'suggestion',
      docs: {
        description: 'Prefer mobile-first approach with minimal breakpoints',
        category: 'Best Practices',
      },
      messages: {
        avoidMultipleTextSizes: 'Avoid complex responsive text sizing like "text-sm sm:text-base md:text-lg". Use a single size or at most one breakpoint.',
        avoidComplexPadding: 'Avoid complex responsive padding like "p-2 sm:p-4 md:p-6". Use a single value and let rem-based spacing scale naturally.',
      },
      schema: [],
    },
    create(context) {
      return {
        JSXAttribute(node) {
          if (node.name.name !== 'className') return;
          
          const value = node.value;
          if (!value || value.type !== 'Literal') return;
          
          const classString = String(value.value);
          
          // Check for complex text sizing patterns
          const textSizePattern = /text-\w+\s+sm:text-\w+\s+md:text-/;
          if (textSizePattern.test(classString)) {
            context.report({
              node,
              messageId: 'avoidMultipleTextSizes',
            });
          }
          
          // Check for complex padding patterns
          const paddingPattern = /p[xytblr]?-\d+\s+sm:p[xytblr]?-\d+\s+md:p[xytblr]?-\d+/;
          if (paddingPattern.test(classString)) {
            context.report({
              node,
              messageId: 'avoidComplexPadding',
            });
          }
        },
      };
    },
  },
};

