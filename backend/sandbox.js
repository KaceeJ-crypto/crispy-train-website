import vm from 'vm';

export function runBotCode(code, context = {}) {
  const sandbox = { ...context, console };
  const vmContext = vm.createContext(sandbox);

  try {
    const script = new vm.Script(code);
    return script.runInContext(vmContext, { timeout: 2000 });
  } catch (err) {
    console.error('Bot Error:', err.message);
    return null;
  }
}
