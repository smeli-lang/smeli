declare module '*.pug' {
  function templateFunction(context: {[key: string]: any}): string;
  export default templateFunction;
}
