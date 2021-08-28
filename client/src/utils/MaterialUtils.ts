export const glsl = (template: TemplateStringsArray, ...args: (string | number)[]) => {
    let str = '';
    for (let i = 0; i < args.length; i++) {
        str += template[i] + String(args[i]);
    }
    return str + template[template.length - 1];
};
