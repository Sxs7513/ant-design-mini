import { Resource } from "../..";
import { parse, getCssVar, getDocsRes } from "../../parser"
import { getConentByPath } from "../../utils";
import { TCompResNode } from "../../types";
import { marked } from 'marked'
import { API_PREFIX, PROP_PREIFX, METHOD_PREFIX, CLASS_PREFIX, CSS_VAR_PREFIX, PROP_TABLE_PREFIX, METHOD_TABLE_PREFIX, CLASS_TABLE_PREFIX } from "../const";

// 生成 markdown
const fs = require("fs");
let node: TCompResNode = [];

export async function read(entry = `${process.cwd()}/src`, deep = 1) {
    const exclude = ['_base', '_util', '.umi', 'mixins', 'style', '.umi-production'];
    const filterDir = (fs.readdirSync(entry) as string[]).filter(item => !exclude.includes(item)).map(item => `${entry}/${item}`);

    for (let i = 0; i < filterDir.length; i++) {
        const item = filterDir[i];
        if (!fs.statSync(item).isDirectory()) return

        if (deep === 1) {
            const conent = getConentByPath(`${item}/index.md`)
            genNewMarkdown(conent, node)
            // 重置一下
            node.length = 0
        }

        await read(item, deep + 1);
        const resource = new Resource();
        parse(item, resource);
        await getCssVar(item, resource);
        getDocsRes(item, resource);
        const componentName = item.match(/[^/]+$/)
        if (componentName && componentName[0]) {
            node.unshift({ component: componentName[0], resource })
        }
    }
}



export function genNewMarkdown(oldConent: string | undefined, node: TCompResNode) {
    let prefixConent = ""
    let style = "\n"
    if (oldConent) {
        const { prefixConent: oldPrefixConent, style: oldStyle } = parseOldMarkdown(oldConent);
        prefixConent = oldPrefixConent
        style = oldStyle
    } else {
        // TODO 首次的话要自动生成
        prefixConent = ""
    }

    const autoContent = genAutoContent(node)
    const newContent = prefixConent + autoContent + style;
    console.log(newContent);
    return newContent
}




function genAutoContent(node: TCompResNode) {
    const apiConent = genAPIConent(node)
    const classContent = genClassConent(node)
    const cssVarContent = genCssVarConent(node)
    return apiConent + classContent + cssVarContent
}

function genAPIConent(node: TCompResNode): string {
    let propContent = ""
    let methodContent = ""
    const shouldAddComponentName = node.length > 1

    node.forEach(item => {
        const prefix = `\n\n #### ${item.component}\n\n`;

        if (item.resource.api.prop.length > 0) {
            propContent += item.resource.api.prop.reduce((prev, cur) => {
                prev += `| ${cur.name} | ${cur.types} | - | ${cur.default || '-'} | ${cur.description} |\n`;
                return prev;
            }, shouldAddComponentName ? `${prefix}${PROP_TABLE_PREFIX}` : `${PROP_TABLE_PREFIX}`);
        }

        if (item.resource.api.method.length > 0) {
            methodContent += item.resource.api.method.reduce((prev, cur) => {
                prev += `| ${cur.name} | ${cur.description} | ${cur.types} |\n`;
                return prev;
            }, shouldAddComponentName ? `${prefix}${METHOD_TABLE_PREFIX}` : `${METHOD_TABLE_PREFIX}`);
        }

    })

    return `${API_PREFIX}${propContent}\n${methodContent}\n`;
}

function genClassConent(node: TCompResNode): string {
    let classContent = ""

    const shouldAddComponentName = node.length > 1

    node.forEach(item => {
        const prefix = `\n\n #### ${item.component}\n\n`;

        if (item.resource.class.length > 0) {
            classContent += item.resource.class.reduce((prev, cur) => {
                prev += `| ${cur} | - |\n`;
                return prev;
            }, shouldAddComponentName ? `${prefix}${CLASS_TABLE_PREFIX}` : `${CLASS_TABLE_PREFIX}`);
        }
    })

    return `${CLASS_PREFIX}${classContent}`

}
/**
 * @todo 组件中 css 变量还太少了
 */
function genCssVarConent(node: TCompResNode): string {
    return ""
}

export function parseOldMarkdown(content: string) {
    const token = marked.lexer(content);
    return { prefixConent: getPrefixContent(token), style: getStyleRaw(token) }
}

function getStyleRaw(token: marked.TokensList) {
    return token.filter((item) => item.raw.trim().startsWith("<style>")).reduce((prev, cur) => (prev + cur.raw), "");
}

function getPrefixContent(token: marked.TokensList) {
    const idx = token.findIndex((item) => {
        return item.raw.includes('API')
    });
    if (idx) {
        return token.slice(0, idx).reduce((prev, cur) => (prev + cur.raw), "");
    }
    return "";
}
