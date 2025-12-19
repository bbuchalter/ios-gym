// Test caret positioning for invalid arguments
const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:3000');

console.log('\n╔═══════════════════════════════════════════════════════════╗');
console.log('║     Testing Caret Position for Invalid Arguments         ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

const tests = [
  { cmd: 'vlan abc', desc: 'Invalid VLAN ID (abc)' },
  { cmd: 'enable extra', desc: 'Extra token after enable' },
  { cmd: 'configure invalid', desc: 'Invalid keyword after configure' }
];

let testIndex = 0;
let step = 0;

ws.on('open', () => {
  console.log('✓ Connected\n');
  ws.send(JSON.stringify({ type: 'command', data: { line: 'enable' }}));
});

ws.on('message', (data) => {
  const msg = JSON.parse(data.toString());
  
  if (msg.type === 'prompt' && step === 1) {
    ws.send(JSON.stringify({ type: 'command', data: { line: 'configure terminal' }}));
    step++;
  } else if (msg.type === 'prompt' && step === 3 && testIndex < tests.length) {
    const test = tests[testIndex];
    console.log(`Test ${testIndex + 1}: ${test.desc}`);
    console.log(`Command: "${test.cmd}"`);
    ws.send(JSON.stringify({ type: 'command', data: { line: test.cmd }}));
    step++;
  } else if (msg.type === 'output' && step === 4) {
    console.log('Output:');
    msg.data.lines.forEach(line => {
      console.log(`  "${line}"`);
    });
    console.log();
    
    testIndex++;
    step = 3;
    
    if (testIndex >= tests.length) {
      console.log('╔═══════════════════════════════════════════════════════════╗');
      console.log('║         ✓ Caret Positioning Tests Complete!              ║');
      console.log('╚═══════════════════════════════════════════════════════════╝\n');
      ws.close();
      process.exit(0);
    }
  } else if (step === 0 || step === 2) {
    step++;
  }
});

ws.on('error', (err) => {
  console.error('✗ Error:', err.message);
  process.exit(1);
});

setTimeout(() => {
  console.log('\n✗ Test timeout');
  process.exit(1);
}, 5000);
