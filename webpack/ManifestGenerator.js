const { createHash } = require('crypto');
const { Compilation } = require('webpack');
const fs = require('fs');
const path = require('path');
const _ = require("lodash");

class ManifestGenerator {

    constructor(options) {
        /*
        {
            manifest_src:
            manifest_dst:
            version:
        }
        */

        this.options = options || {};
    }

    apply(compiler) {
        function get_sha256_hash(source){
            const hash = createHash('sha256').update(source).digest('base64');
            return 'sha256-' + hash;
        }

        compiler.hooks.emit.tapAsync('ManifestGenerator', (compilation, callback) => {
            const script_hashes = [],
                  style_hashes = [];

            // Iterate over all compiled assets
            Object.keys(compilation.assets).forEach((filename) => {
                let source = compilation.assets[filename].source();
                
                if (filename.endsWith('.js')) {
                    script_hashes.push(get_sha256_hash(source));
                } else if(filename.endsWith(".css")){
                    style_hashes.push(get_sha256_hash(source));
                }
            });

            fs.writeFileSync(
                this.options.manifest_dst,
                this.#rewrite_manifest({
                    script_hashes,
                    style_hashes,
                })
            );

            callback();
        });
    }

    #rewrite_manifest({ script_hashes, style_hashes, }){
        let manifest = JSON.parse(
            fs.readFileSync(this.options.manifest_src));
        manifest.version = this.options.version;

        // write csp
        manifest.content_security_policy = {
            extension_pages: this.#generate_csp({
                script_hashes,
                style_hashes,
            })
        };

        return JSON.stringify(manifest, null, 4);
    }

    #generate_csp({ script_hashes, style_hashes }){
        let csp = {
            'base-uri': ["self"],
            'default-src': ['none'],
            'script-src': ['self'].concat(script_hashes),
            'style-src': ['self'].concat(style_hashes),
            'connect-src': ['none'],
            'form-action': ['none'],
            'object-src': ['none'],
            'frame-ancestors': ['none'],
        };

        let result = '';

        _.forEach(csp, (values, key)=>{
            result += key + " ";
            result += values.map(e=>`'${e}'`).join(" ");
            result += ';';
        })
        
        return result;

    }
}

module.exports = ManifestGenerator;
