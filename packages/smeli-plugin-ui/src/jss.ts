import { create } from "jss";
import jssPluginNested from "jss-plugin-nested";

const jss = create();
jss.use(jssPluginNested());

export { jss };
