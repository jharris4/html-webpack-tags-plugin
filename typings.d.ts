import { Compiler } from 'webpack';

export = HtmlWebpackTagsPlugin;

declare class HtmlWebpackTagsPlugin {
  constructor(options?: HtmlWebpackTagsPlugin.Options);

  apply(compiler: Compiler): void;
}

declare namespace HtmlWebpackTagsPlugin {
  type AddHashFunction = (assetPath: string, hash: string) => string;
  type AddPublicPathFunction = (assetPath: string, publicPath: string) => string;
  type TypeString = 'css' | 'js';
  type AttributesObject = { [attributeName: string]: string | boolean | number };

  interface CommonOptions {
    append?: boolean;
    useHash?: boolean;
    addHash?: AddHashFunction
    hash?: boolean | string | AddHashFunction;
    usePublicPath?: boolean;
    addPublicPath?: AddPublicPathFunction
    publicPath?: boolean | string | AddPublicPathFunction;
  }

  interface Options extends CommonOptions {
    append?: boolean;
    prependExternals?: boolean;
    jsExtensions?: string | string[];
    cssExtensions?: string | string[];
    files?: string | string[];
    tags?: string | MaybeLinkTagOptions | MaybeScriptTagOptions | Array<string | MaybeLinkTagOptions | MaybeScriptTagOptions>;
    links?: string | LinkTagOptions | Array<string | LinkTagOptions>;
    scripts?: string | ScriptTagOptions | Array<string | ScriptTagOptions>;
    metas?: string | MetaTagOptions | Array<string | MetaTagOptions>;
  }

  interface ExternalObject {
    packageName: string;
    variableName: string;
  }

  interface BaseTagOptions extends CommonOptions {
    glob?: string;
    globPath?: string;
    globFlatten?: boolean;
    sourcePath?: string;
  }

  interface LinkTagOptions extends BaseTagOptions {
    path: string;
    attributes?: AttributesObject;
  }

  interface ScriptTagOptions extends BaseTagOptions {
    path: string;
    attributes?: AttributesObject;
    external?: ExternalObject
  }

  interface MaybeLinkTagOptions extends LinkTagOptions {
    type?: TypeString;
  }

  interface MaybeScriptTagOptions extends ScriptTagOptions {
    type?: TypeString;
  }

  interface MetaTagOptions extends BaseTagOptions {
    path?: string;
    attributes: AttributesObject;
  }
}
