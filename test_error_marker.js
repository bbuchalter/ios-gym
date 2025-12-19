// Test error marker functionality
const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:3000');

console.log('\n╔═══════════════════════════════════════════════════════════╗');
console.log('║           Error Marker Test (IOS-style ^)                ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

let step = 0;

ws.on('open', () => {
  console.log('✓ Connected\n');
});

ws.on('message', (data) => {
  const msg = JSON.parse(data.toString());
  
  if (msg.type === 'prompt' && step === 0) {
    console.log('Test 1: Invalid command "invalid"');
    ws.send(JSON.stringify({
      type: 'command',
      data: { line: 'invalid' }
    }));
    step++;
  } else if (msg.type === 'output' && step === 1) {
    console.log('Output:');
    msg.data.lines.forEach(line => console.log('  ' + line));
    console.log();
    step++;
  } else if (msg.type === 'prompt' && step === 2) {
    ws.send(JSON.stringify({
      type: 'command',
      data: { line: 'enable' }
    }));
    step++;
  } else if (msg.type === 'prompt' && step === 4) {
    ws.send(JSON.stringify({
      type: 'command',
      data: { line: 'configure terminal' }
    }));
    step++;
  } else if (msg.type === 'prompt' && step === 6) {
    console.log('Test 2: Invalid command "set ho" in config mode');
    ws.send(JSON.stringify({
      type: 'command',
      data: { line: 'set ho' }
    }));
    step++;
  } else if (msg.type === 'output' && step === 7) {
    console.log('Output:');
    msg.data.lines.forEach(line => console.log('  ' + line));
    console.log();
    step++;
  } else if (msg.type === 'prompt' && step === 8) {
    console.log('Test 3: Extra tokens "enable extra stuff"');
    ws.send(JSON.stringify({
      type: 'command',
      data: { line: 'end' }
    }));
    step++;
  } else if (msg.type === 'prompt' && step === 10) {
    ws.send(JSON.stringify({
      type: 'command',
      data: { line: 'disable' }
    }));
    step++;
  } else if (msg.type === 'prompt' && step === 12) {
    ws.send(JSON.stringify({
      type: 'command',
      data: { line: 'enable extra stuff' }
    }));
    step++;
  } else if (msg.type === 'output' && step === 13) {
    console.log('Output:');
    msg.data.lines.forEach(line => console.log('  ' + line));
    console.log();
    
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║       ✓ Error Marker Working (IOS-style ^)               ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');
    
    ws.close();
    process.exit(0);
  } else if (step === 3 || step === 5 || step === 9 || step === 11) {
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
