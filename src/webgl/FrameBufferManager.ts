/**
 * Copyright (c) 2013-2015 Azeem Arshad
 * See the file license.txt for copying permission.
 **/

import * as _ from 'lodash';
import CopyProgram from './CopyProgram';
import RenderingContext from './RenderingContext';

interface TextureNameMeta {
    refCount: number,
    index: number
};

// FrameBufferManager maintains a set of render targets
// and can switch between them.
export default class FrameBufferManager {
    private rctx: RenderingContext;
    private copier: CopyProgram;
    private initTexCount: number;
    private textureOnly: boolean;
    private framebuffer: WebGLFramebuffer;
    private names: {[key:string]: TextureNameMeta};
    private textures: WebGLTexture[];
    private curTex: number;
    private oldTexture: WebGLTexture;
    private oldFrameBuffer: WebGLFramebuffer;
    private isRenderTarget: boolean;

    constructor(rctx: RenderingContext, copier: CopyProgram, textureOnly: boolean = false, texCount: number = 2) {
        this.rctx = rctx;
        this.copier = copier;
        this.initTexCount = texCount;
        this.textureOnly = textureOnly;
        this.initFrameBuffers();
    }

    private initFrameBuffers() {
        const gl = this.rctx.gl;

        if(!this.textureOnly) {
            this.framebuffer = gl.createFramebuffer();
        }

        this.names = {};
        this.textures = [];
        for(var i = 0;i < this.initTexCount;i++) {
            this.addTexture();
        }
        this.curTex = 0;
        this.isRenderTarget = false;
    }

    addTexture(name?: string): number {
        if(name && name in this.names) {
            this.names[name].refCount++;
            return this.names[name].index;
        }
        const gl = this.rctx.gl;
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.drawingBufferWidth,
                      gl.drawingBufferHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        this.textures.push(texture);
        if(name) {
            this.names[name] = {
                refCount: 1,
                index: this.textures.length-1
            };
        }
        return this.textures.length-1;
    }

    removeTexture(nameOrIndex: string | number) {
        if(_.isString(nameOrIndex) && nameOrIndex in this.names) {
            if(this.names[nameOrIndex].refCount > 1) {
                this.names[nameOrIndex].refCount--;
                return;
            }
        }
        const index = this.findIndex(nameOrIndex);
        if(index == this.curTex && (this.oldTexture || this.oldFrameBuffer)) {
            throw new Error("Cannot remove current texture when set as render target");
        }
        const gl = this.rctx.gl;
        gl.deleteTexture(this.textures[index]);
        this.textures.splice(index, 1);
        if(this.curTex >= this.textures.length) {
            this.curTex = this.textures.length-1;
        }
        if(typeof nameOrIndex === 'string') {
            delete this.names[nameOrIndex];
        }
    }

    // Saves the current render target and sets this
    // as the render target
    setRenderTarget(texName?: string) {
        const gl = this.rctx.gl;
        const curFrameBuffer = gl.getParameter(gl.FRAMEBUFFER_BINDING) as WebGLFramebuffer;
        if(this.textureOnly) {
            if(!curFrameBuffer) {
                throw new Error("Cannot use textureOnly when current rendertarget is the default FrameBuffer");
            }
            this.oldTexture = gl.getFramebufferAttachmentParameter(
                                  gl.FRAMEBUFFER,
                                  gl.COLOR_ATTACHMENT0,
                                  gl.FRAMEBUFFER_ATTACHMENT_OBJECT_NAME);
        } else {
            this.oldFrameBuffer = curFrameBuffer;
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        }
        this.isRenderTarget = true;
        if(!_.isUndefined(texName)) {
            this.switchTexture(texName);
        } else {
            const texture = this.textures[this.curTex];
            gl.framebufferTexture2D(gl.FRAMEBUFFER,
                                    gl.COLOR_ATTACHMENT0,
                                    gl.TEXTURE_2D,
                                    texture, 0);
        }
    }

    // Restores the render target previously saved with
    // a Webvs.FrameBufferManager.setRenderTarget call
    restoreRenderTarget() {
        const gl = this.rctx.gl;
        if(this.textureOnly) {
            gl.framebufferTexture2D(gl.FRAMEBUFFER,
                                    gl.COLOR_ATTACHMENT0,
                                    gl.TEXTURE_2D,
                                    this.oldTexture, 0);
            this.oldTexture = null;
        } else {
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.oldFrameBuffer);
            this.oldFrameBuffer = null;
        }
        this.isRenderTarget = false;
    }

    // Returns the texture that is currently being used
    getCurrentTexture(): WebGLTexture {
        return this.textures[this.curTex];
    }

    getTexture(arg): WebGLTexture {
        var index = this.findIndex(arg);
        return this.textures[index];
    }

    // Copies the previous texture into the current texture
    copyOver() {
        const texCount = this.textures.length;
        const prevTexture = this.textures[(texCount+this.curTex-1)%texCount];
        this.copier.run(null, null, prevTexture);
    }

    // Swaps the current texture
    switchTexture(nameOrIndex: string | number = this.curTex + 1) {
        if(!this.isRenderTarget) {
            throw new Error("Cannot switch texture when not set as rendertarget");
        }
        const gl = this.rctx.gl;
        this.curTex = this.findIndex(nameOrIndex);
        this.curTex %= this.textures.length;
        const texture = this.textures[this.curTex];
        gl.framebufferTexture2D(gl.FRAMEBUFFER,
                                gl.COLOR_ATTACHMENT0,
                                gl.TEXTURE_2D, texture, 0);
    }

    resize() {
        // TODO: investigate chrome warning: INVALID_OPERATION: no texture
        const gl = this.rctx.gl;
        for(let i = 0;i < this.textures.length;i++) {
            gl.bindTexture(gl.TEXTURE_2D, this.textures[i]);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.drawingBufferWidth,
                          gl.drawingBufferHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        }
    }

    // cleans up all webgl resources
    destroy() {
        const gl = this.rctx.gl;
        for(var i = 0;i < this.textures.length;i++) {
            gl.deleteTexture(this.textures[i]);
        }
        if(!this.textureOnly) {
            gl.deleteFramebuffer(this.framebuffer);
        }
    }

    private findIndex(arg: string | number): number {
        let index;
        if(_.isString(arg) && arg in this.names) {
            index = this.names[arg].index;
        } else if(_.isNumber(arg) && arg >=0 && arg < this.textures.length) {
            index = arg;
        } else {
            throw new Error("Unknown texture '" + arg + "'");
        }
        return index;
    }
}