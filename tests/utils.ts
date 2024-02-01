export async function delay(time = 10) {
  await new Promise((r) => setTimeout(r, time));
}

export function newDeferred<T>(): {
  resolve: (value: T) => void;
  reject: (reason: any) => void;
  promise: Promise<T>;
} {
  const result: any = {};
  result.promise = new Promise(
    (resolve, reject) => ((result.resolve = resolve), (result.reject = reject)),
  );
  return result;
}
