// Simple test runner for queryParser.js
import { parseQuery } from './queryParser.js';

const runTests = () => {
  console.log("=== Running queryParser Unit Tests ===");

  const testCases = [
    {
      input: "compare Solapur and Nagpur for 2024",
      expected: {
        type: "ai-compare",
        params: {
          district1: "Solapur",
          district2: "Nagpur",
          year: 2024
        }
      }
    },
    {
      input: "compare Pune and Hyderabad for 2023",
      expected: {
        type: "ai-compare",
        params: {
          district1: "Pune",
          district2: "Hyderabad",
          year: 2023
        }
      }
    },
    {
      input: "compare Kolar and Bengaluru",
      expected: {
        type: "ai-compare",
        params: {
          district1: "Kolar",
          district2: "Bengaluru",
          year: 2023 // default fallback year
        }
      }
    }
  ];

  let passed = 0;
  for (const tc of testCases) {
    console.log(`\nTesting Input: "${tc.input}"`);
    const output = parseQuery(tc.input);

    if (!output) {
      console.error(`FAILED: Expected parsed output but got null.`);
      continue;
    }

    const typeMatch = output.type === tc.expected.type;
    const d1Match = output.params.district1 === tc.expected.params.district1;
    const d2Match = output.params.district2 === tc.expected.params.district2;
    const yearMatch = output.params.year === tc.expected.params.year;

    console.log("Parsed Output:", JSON.stringify(output, null, 2));

    if (typeMatch && d1Match && d2Match && yearMatch) {
      console.log("✅ PASSED");
      passed++;
    } else {
      console.error("❌ FAILED");
      if (!typeMatch) console.error(`  Expected Type: "${tc.expected.type}", Got: "${output.type}"`);
      if (!d1Match) console.error(`  Expected District1: "${tc.expected.params.district1}", Got: "${output.params.district1}"`);
      if (!d2Match) console.error(`  Expected District2: "${tc.expected.params.district2}", Got: "${output.params.district2}"`);
      if (!yearMatch) console.error(`  Expected Year: "${tc.expected.params.year}", Got: "${output.params.year}"`);
    }
  }

  console.log(`\n=== Test Summary: Passed ${passed}/${testCases.length} ===`);
  if (passed !== testCases.length) {
    process.exit(1);
  }
};

runTests();
