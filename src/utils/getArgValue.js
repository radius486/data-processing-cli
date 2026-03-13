export function getArgValue(arg, args) {
  const index = args.indexOf(arg);

  if (index === -1) return null;

  return args[index + 1] ?? null;
}
