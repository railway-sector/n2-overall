import{oG as u,r1 as d,d$ as m,Hi as b,Go as x,gW as y,lX as g}from"./index-B_vC5_b-.js";import{e as F}from"./ShaderCompiler-G2XYGDs6.js";import{e as O}from"./ProgramTemplate-CxRijtiP.js";function c(r){const{options:e,value:n}=r;return typeof e[n]=="number"}function $(r){let e="";for(const n in r){const o=r[n];if(typeof o=="boolean")o&&(e+=`#define ${n}
`);else if(typeof o=="number")e+=`#define ${n} ${o.toFixed()}
`;else if(typeof o=="object")if(c(o)){const{value:t,options:f,namespace:i}=o,s=i?`${i}_`:"";for(const a in f)e+=`#define ${s}${a} ${f[a].toFixed()}
`;e+=`#define ${n} ${s}${t}
`}else{const t=o.options;let f=0;for(const i in t)e+=`#define ${t[i]} ${(f++).toFixed()}
`;e+=`#define ${n} ${t[o.value]}
`}}return e}export{u as BufferObject,d as FramebufferObject,m as Program,b as ProgramCache,x as Renderbuffer,F as ShaderCompiler,y as Texture,g as VertexArrayObject,O as createProgram,$ as glslifyDefineMap};
