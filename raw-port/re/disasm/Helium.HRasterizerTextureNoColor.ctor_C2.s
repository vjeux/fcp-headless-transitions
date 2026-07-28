
/tmp/Helium.x86_64:	file format mach-o 64-bit x86-64

Disassembly of section __TEXT,__text:

0000000000055230 <__ZN25HRasterizerTextureNoColorC2Ev>:
   55230: 55                           	pushq	%rbp
   55231: 48 89 e5                     	movq	%rsp, %rbp
   55234: 41 56                        	pushq	%r14
   55236: 53                           	pushq	%rbx
   55237: 48 89 fb                     	movq	%rdi, %rbx
   5523a: e8 51 bb 30 00               	callq	0x360d90 <__ZN27HgcRasterizerTextureNoColorC2Ev>
   5523f: 48 8d 05 9a 28 9b 00         	leaq	0x9b289a(%rip), %rax    ## 0xa07ae0 <__ZTV25HRasterizerTextureNoColor+0x10>
   55246: 48 89 03                     	movq	%rax, (%rbx)
   55249: 0f 28 05 f0 29 37 00         	movaps	0x3729f0(%rip), %xmm0   ## 0x3c7c40 <__ZTS12HGParamField+0x88>
   55250: 0f 11 83 a4 01 00 00         	movups	%xmm0, 0x1a4(%rbx)
   55257: f3 0f 10 05 61 2a 37 00      	movss	0x372a61(%rip), %xmm0   ## 0x3c7cc0 <__ZTS12HGParamField+0x108>
   5525f: 48 89 df                     	movq	%rbx, %rdi
   55262: 31 f6                        	xorl	%esi, %esi
   55264: 0f 28 c8                     	movaps	%xmm0, %xmm1
   55267: 0f 28 d0                     	movaps	%xmm0, %xmm2
   5526a: 0f 28 d8                     	movaps	%xmm0, %xmm3
   5526d: e8 fe bd 30 00               	callq	0x361070 <__ZN27HgcRasterizerTextureNoColor12SetParameterEiffff>
   55272: 5b                           	popq	%rbx
   55273: 41 5e                        	popq	%r14
   55275: 5d                           	popq	%rbp
   55276: c3                           	retq
   55277: 49 89 c6                     	movq	%rax, %r14
   5527a: 48 89 df                     	movq	%rbx, %rdi
   5527d: e8 2e bd 30 00               	callq	0x360fb0 <__ZN27HgcRasterizerTextureNoColorD2Ev>
   55282: 4c 89 f7                     	movq	%r14, %rdi
   55285: e8 78 fb 36 00               	callq	0x3c4e02 <dyld_stub_binder+0x3c4e02>
   5528a: 66 0f 1f 44 00 00            	nopw	(%rax,%rax)
