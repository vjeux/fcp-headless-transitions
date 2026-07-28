__ZN16HgcMultiplyAlpha6GetDODEP10HGRendereri6HGRect:
00000000014691b0	movq	%rcx, %rax
00000000014691b3	cmpl	$0x2, %edx
00000000014691b6	jb	0x14691cb
00000000014691b8	pushq	%rbp
00000000014691b9	movq	%rsp, %rbp
00000000014691bc	movq	0x4810ad(%rip), %rcx            ## literal pool symbol address: _HGRectNull
00000000014691c3	movq	(%rcx), %rax
00000000014691c6	movq	0x8(%rcx), %r8
00000000014691ca	popq	%rbp
00000000014691cb	movq	%r8, %rdx
00000000014691ce	retq
00000000014691cf	nop
