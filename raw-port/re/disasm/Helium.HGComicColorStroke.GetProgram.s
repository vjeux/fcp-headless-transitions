__ZN18HGComicColorStroke10GetProgramEP10HGRenderer:
00000000001bca90	pushq	%rbp
00000000001bca91	movq	%rsp, %rbp
00000000001bca94	pushq	%rbx
00000000001bca95	pushq	%rax
00000000001bca96	movq	%rsi, %rbx
00000000001bca99	movq	%rsi, %rdi
00000000001bca9c	movl	$0x60000, %esi                  ## imm = 0x60000
00000000001bcaa1	callq	__ZN10HGRenderer9GetTargetEj    ## HGRenderer::GetTarget(unsigned int)
00000000001bcaa6	cmpl	$0x60b0f, %eax                  ## imm = 0x60B0F
00000000001bcaab	jbe	0x1bcabb
00000000001bcaad	leaq	0x736fb7(%rip), %rax            ## literal pool for: "//Metal1.0     \n//LEN=0000000936\nfragment FragmentOut fragmentFunc(VertexInOut            frag        [[ stage_in ]],\n                                  const constant float4* hg_Params   [[ buffer(0) ]],\n                                  texture2d< float >     hg_Texture0 [[ texture(0) ]],\n                                  sampler                hg_Sampler0 [[ sampler(0) ]],\n                                  texture2d< float >     hg_Texture1 [[ texture(1) ]],\n                                  sampler                hg_Sampler1 [[ sampler(1) ]])\n{\n    // Get the 0'th normal (e0, for an exponent value of 0, so the coeff is 1.0)\n    float2 pointer = static_cast<float2>(hg_Texture1.sample(hg_Sampler1, frag._texCoord1.xy).yz * 2.0f) - 1.0f;\n    float2 pointerRBack = -pointer;\n    \n    float4 acc = hg_Texture0.sample(hg_Sampler0, frag._texCoord0.xy);\n    float3 norma = {0.5f, 0.5f, 0.5f};\n    \n    for (int i {1}; i < 8; ++i)\n    {\n        float coeff = exp(static_cast<float>(-i) / 48.0f);\n        norma += coeff;\n        \n        const float2 uPos0 = frag._texCoord0.xy + pointer;\n        const float2 uNeg0 = frag._texCoord0.xy + pointerRBack;\n        \n        const float2 uPos1 = frag._texCoord1.xy + pointer;\n        const float2 uNeg1 = frag._texCoord1.xy + pointerRBack;\n        \n        float2 acc_ptrTexCoord = uPos0;\n        float2 acc_ptrBackTexCoord = uNeg0;\n        \n        float2 grad_ptrTexCoord = uPos1;\n        float2 grad_ptrBackTexCoord = uNeg1;\n        \n        acc.rgb += coeff * (hg_Texture0.sample(hg_Sampler0, acc_ptrTexCoord).xyz +\n                            hg_Texture0.sample(hg_Sampler0, acc_ptrBackTexCoord).xyz);\n        \n        pointer += static_cast<float2>(hg_Texture1.sample(hg_Sampler1, grad_ptrTexCoord).yz * 2.0f) - 1.0f;\n        pointerRBack -= static_cast<float2>(hg_Texture1.sample(hg_Sampler1, grad_ptrBackTexCoord).yz * 2.0f) - 1.0f;\n    }\n    \n    FragmentOut out {float4(float3(acc.xyz * 0.5f / norma), acc.a)};\n    \n    // Ensure the result is clamped [0..1]; this is the default behavior of the original\n    // comic effect - this was implicit due to non-float, 8-bit, intermediate buffers.\n    out.color0 = clamp(out.color0, 0.0f, 1.0f);\n    \n    return out;\n}\n//MD5=5a5a5057:ba024132:3cb1b893:2b058d5b\n//SIG=00000000:00000000:00000000:00000000:000f:0000:0000:0000:0000:0000:0006:0000:0002:02:0:1:0\n"
00000000001bcab4	addq	$0x8, %rsp
00000000001bcab8	popq	%rbx
00000000001bcab9	popq	%rbp
00000000001bcaba	retq
00000000001bcabb	movq	(%rbx), %rax
00000000001bcabe	movq	%rbx, %rdi
00000000001bcac1	movl	$0x2e, %esi
00000000001bcac6	callq	*0x80(%rax)
00000000001bcacc	movl	%eax, %ecx
00000000001bcace	xorl	%eax, %eax
00000000001bcad0	testl	%ecx, %ecx
00000000001bcad2	leaq	0x7378c9(%rip), %rcx            ## literal pool for: "//GLfs1.0      \n//LEN=000000079c\n#ifndef GL_ES\n#define lowp\n#define mediump\n#define highp\n#define precision\n#define defaultp mediump\n#endif\n\n \nprecision highp float;\nprecision highp int;\n\nuniform defaultp sampler2DRect hg_Texture0;\nuniform defaultp sampler2DRect hg_Texture1;\n\nvoid main (void) \n{\n    float alpha = texture2DRect( hg_Texture0, gl_TexCoord[0].xy ).a;\n    vec3 acc  =  texture2DRect( hg_Texture0, gl_TexCoord[0].xy ).xyz; //L de LAB\n    vec3 norma  =  vec3(0.5,0.5,0.5) ;\n    \n    vec2 gradient = texture2DRect(hg_Texture1, gl_TexCoord[1].xy).yz; //DIRECCIONES\n    vec2 vdire = vec2( gradient.x*2.0-1.0 , gradient.y*2.0-1.0 ) ;\n    vec2 pointer = vec2( vdire.x  , vdire.y  ) ;\n\n    vdire =   vec2( -(gradient.x*2.0-1.0) , -(gradient.y*2.0-1.0) ) ;\n    vec2 pointerRBack =   vec2(  vdire.x  ,  vdire.y  ) ;\n\n    for (float  i=1.0 ;i < 8.0 ;i++)    // direccion normal   1 - 7\n    {\n        float coeff =  exp(  - i / 48.0) ;\n        \n        vec2 uPos0 = gl_TexCoord[0].xy + pointer;\n        vec2 uNeg0 = gl_TexCoord[0].xy + pointerRBack;\n\n        vec2 uPos1 = gl_TexCoord[1].xy + pointer;\n        vec2 uNeg1 = gl_TexCoord[1].xy + pointerRBack;\n\n        acc  +=coeff * (texture2DRect(hg_Texture0, uPos0).xyz +\n                        texture2DRect(hg_Texture0, uNeg0).xyz);\n\n        norma += coeff;\n\n        gradient  = texture2DRect(hg_Texture1, uPos1).yz; //DIRECCIONES\n        vdire =   vec2( gradient.x*2.0-1.0 , gradient.y*2.0-1.0 );\n        pointer +=  vdire  ;\n\n        gradient  = texture2DRect(hg_Texture1, uNeg1).yz; //DIRECCIONES\n        vdire =   vec2(-( gradient.x*2.0-1.0) , -(gradient.y*2.0-1.0) );\n        pointerRBack +=  vdire  ;\n    }\n    \n    // Ensure the result is clamped [0..1]; this is the default behavior of the original\n    // comic effect - this was implicit due to non-float, 8-bit, intermediate buffers.\n    gl_FragColor = clamp(vec4( acc*0.5/norma, alpha), 0.0, 1.0);\n}\n//MD5=3f48c7c9:9fb108b9:ab3c5d18:9729c820\n//SIG=00000000:00000000:00000000:00000000:0032:0000:0000:0000:0000:0000:0000:0000:0002:02:0:1:0\n"
00000000001bcad9	cmovneq	%rcx, %rax
00000000001bcadd	addq	$0x8, %rsp
00000000001bcae1	popq	%rbx
00000000001bcae2	popq	%rbp
00000000001bcae3	retq
00000000001bcae4	nopw	%cs:(%rax,%rax)
